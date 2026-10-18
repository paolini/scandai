import { randomBytes } from 'node:crypto'
import { ObjectId, type WithId } from 'mongodb'
import type { Context } from '../types'
import type { ReportFiltersInput, QueryStatsArgs } from '@/generated/graphql'
import { getCollection, getUserCollection, getSchoolCollection } from '@/lib/mongodb'
import questionary from '@/lib/questionary'
import { canReadReportQuestion } from '@/lib/reportQuestions'
import stats from './stats'

type SavedReport = {
    name: string,
    token: string,
    report: string,
    filters: ReportFiltersInput,
    schoolName?: string,
    createdAt: Date,
    createdBy: ObjectId,
    ownerOnly: boolean,
}

function canShare(user: Context['user']) {
    return !!(user?.isAdmin || user?.isViewer || user?.isTeacher)
}

function reportQuery(filters: ReportFiltersInput): QueryStatsArgs {
    return {
        year: filters.year || null, class: filters.class || null, city: filters.city || null,
        form: filters.form || null, schoolId: filters.schoolId || null,
        schoolType: filters.schoolType || null,
        polls: filters.polls?.length ? filters.polls : null,
        poll: null, adminSecret: null, schoolSecret: null,
    }
}

async function resultForManager(saved: WithId<SavedReport>) {
    const author = await (await getUserCollection()).findOne({ _id: saved.createdBy })
    return {
        ...saved, schoolName: saved.schoolName || null,
        createdBy: author ? { _id: author._id, name: author.name || null, username: author.username || null, email: author.email || null } : null,
    }
}

export async function createSharedReport(_parent: unknown, args: { name: string, filters: ReportFiltersInput, report: string }, context: Context) {
    if (!canShare(context.user)) throw new Error('not authorized')
    const name = args.name.trim()
    if (!name || name.length > 120) throw new Error('Invalid report name')
    if (!Object.hasOwn(questionary.reports, args.report)) throw new Error('Invalid report')
    if (args.filters.form && !Object.hasOwn(questionary.forms, args.filters.form)) throw new Error('Invalid form')
    if (args.filters.year && (args.filters.year < 2023 || args.filters.year > 9999)) throw new Error('Invalid year')
    // Accept only report filters, never credentials or arbitrary database conditions.
    const query = reportQuery(args.filters)
    const filters: ReportFiltersInput = {
        year: query.year, class: query.class, city: query.city, form: query.form,
        schoolId: query.schoolId, schoolType: query.schoolType, polls: query.polls,
    }
    const school = filters.schoolId ? await (await getSchoolCollection()).findOne({ _id: filters.schoolId }) : null
    const saved: SavedReport = {
        name, filters, report: args.report, token: randomBytes(32).toString('hex'),
        createdBy: context.user!._id, createdAt: new Date(),
        ownerOnly: !(context.user!.isAdmin || context.user!.isViewer),
        ...(school ? { schoolName: school.name } : {}),
    }
    const collection = await getCollection<SavedReport>('sharedReports')
    await collection.createIndex({ token: 1 }, { unique: true })
    const { insertedId } = await collection.insertOne(saved)
    return resultForManager({ ...saved, _id: insertedId })
}

export async function sharedReports(_parent: unknown, { all }: { all?: boolean | null }, { user }: Context) {
    if (!user) throw new Error('not authenticated')
    if (all && !user.isAdmin) throw new Error('not authorized')
    const collection = await getCollection<SavedReport>('sharedReports')
    const saved = await collection.find(all ? {} : { createdBy: user._id }).sort({ createdAt: -1 }).toArray()
    return Promise.all(saved.map(resultForManager))
}

export async function revokeSharedReport(_parent: unknown, { _id }: { _id: ObjectId }, { user }: Context) {
    if (!user) throw new Error('not authenticated')
    const collection = await getCollection<SavedReport>('sharedReports')
    const result = await collection.deleteOne(user.isAdmin ? { _id } : { _id, createdBy: user._id })
    return result.deletedCount === 1
}

export async function sharedReport(_parent: unknown, { token }: { token: string }, context: Context) {
    const unavailable = () => new Error('Shared report unavailable')
    if (!/^[a-f0-9]{64}$/.test(token)) throw unavailable()
    const saved = await (await getCollection<SavedReport>('sharedReports')).findOne({ token })
    if (!saved) throw unavailable()
    const author = await (await getUserCollection()).findOne({ _id: saved.createdBy })
    if (!author || !canShare(author)) throw unavailable()
    // Intersect current permissions with the scope granted when the link was created.
    const scopedAuthor = saved.ownerOnly ? { ...author, isAdmin: false, isViewer: false } : author
    const data = await stats(null, reportQuery(saved.filters), { ...context, user: scopedAuthor })
    const schoolFields = (school: { _id: string, name: string, city: string, city_fu: string }) => ({
        _id: school._id, name: school.name, city: school.city, city_fu: school.city_fu,
    })
    // Always use the public view, even when the visitor is an administrator.
    // Explicitly select metadata: source polls and schools also contain secret links.
    return {
        name: saved.name, report: saved.report, filters: saved.filters, schoolName: saved.schoolName || null,
        stats: {
            entriesCount: data.entriesCount, preferredLanguageCount: data.preferredLanguageCount, filters: data.filters,
            questions: Object.fromEntries(Object.entries(data.questions).filter(([, value]) => canReadReportQuestion(value.question, null))),
            schools: data.schools.map(school => ({ ...schoolFields(school), pollCount: school.pollCount })),
            polls: data.polls.map(poll => ({
                _id: poll._id, year: poll.year, class: poll.class, form: poll.form, closed: poll.closed,
                createdAt: poll.createdAt, date: poll.date, entriesCount: poll.entriesCount,
                school: poll.school ? schoolFields(poll.school) : undefined,
            })),
        },
    }
}

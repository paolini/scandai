import { ObjectId } from 'mongodb'
import { assert } from '@/lib/assert'

import Dict from '@/models/Dict'
import questionary, { IQuestion, extractLevels } from '../../../../lib/questionary'
import { schoolYearMatch } from '@/lib/utils'
import { Context } from '../types'
import { getCollection } from '@/lib/mongodb'

export default async function resolver(_parent: any, query: {
    poll?: ObjectId,
    polls?: ObjectId[],
    adminSecret?: string,
    schoolSecret?: string,
    year?: number,
    class?: string,
    city?: string,
    form?: string,
    schoolId?: ObjectId,
}, context: Context) {
        const user = context.user
        const $match: any = {}
        const filters: any = {}

        if (0) $match["poll.closed"] = true // solo i sondaggi chiusi

        if (query.schoolId) {
            $match["poll.school._id"] = query.schoolId
            filters.school = query.schoolId
        }
        if (query.city) {
            $match["poll.school.city"] = query.city
            filters.city = query.city
        }
        if (query.form) {
            $match["poll.form"] = query.form
            filters.form = query.form
        }
        if (query.class) {
            $match["poll.year"] = query.class
            filters.class = query.class
        }
        if (query.year) {
            $match["poll.createdAt"] = schoolYearMatch(query.year)
            filters.year = query.year
        }

        let pipeline: any = [
            {$lookup: {
                from: 'polls',
                // localField: 'pollId',
                // foreignField: '_id',
                as: 'poll',
                let: {pollId: '$pollId'},
                pipeline: [
                    {$match: {$expr: {$eq: ['$_id', '$$pollId']}}},
                    // add school information
                    {$lookup: {
                        from: 'schools',
                        as: 'school',
                        let: {schoolId: '$school_id'},
                        pipeline: [
                            {$match: {$expr: {$eq: ['$_id', '$$schoolId']}}},
                        ]
                    }},
                    {$unwind: {
                        path: '$school',
                        preserveNullAndEmptyArrays: true
                    }},
                ],
            }}, 
            {$match},
            {$unwind: '$poll'},
        ]

        if (query.adminSecret) {
            // se fornisce l'adminSecret anche un utente anonimo
            // può vedere le statistiche di quel sondaggio
            pipeline.push({$match: {'poll.adminSecret': query.adminSecret}})
        } else if (query.schoolSecret) {
            pipeline.push({$match: {'poll.school.reportSecret': query.schoolSecret}})
        } else {
            if (!user) throw new Error('not authenticated')
            if (!(user.isAdmin || user.isViewer)) {
                pipeline.push({$match: {'poll.createdBy': new ObjectId(user._id)}})
            }
        }

        if (query.polls) {
            pipeline.push({$match: {'poll._id': {$in: query.polls }}})
        }

        if (query.poll) {
            pipeline.push({$match: {'poll._id': query.poll}})
        }

        const collection = await getCollection("entries")
        const entries = await collection.aggregate(pipeline).toArray()
        const data: IStats = await aggregate(entries as IEntryWithPoll[], filters)
        return data
}

interface IStatsFilters {
    city?: string,
    school?: string,
    form?: string,
    class?: string,
    year?: number,
}

interface IPostPoll {
    school_id: string,
    class: string,
    year: string,
    form: string,
    closed: boolean, 
}

interface IGetPoll extends IPostPoll {
    _id: string,
    secret: string,
    adminSecret?: string,
    entriesCount: number,
    date: string,
    school?: {
        _id: string,
        name: string,
        city: string,
        city_fu: string,
    }
    createdBy: string,
    createdByUser: {
        _id: string,
        name?: string,
        email?: string,
        image?: string,
        username?: string,
    },
    createdAt: string,
}

interface IPoll {
    _id: ObjectId,
    school_id: ObjectId,
    class: string,
    year: string,
    form: string,
    closed: boolean, 
    secret: string,
    adminSecret?: string,
    createdBy: ObjectId,
    createdAt: string,
}

interface IPostSchool {
    name: string,
    city: string,
    city_fu: string,
    reportSecret?: string,
}

interface IGetSchool extends IPostSchool {
    _id: string,
    pollCount: number,
}

export interface IStats {
    questions: {[key: string]: IQuestionStat},
    polls: IGetPoll[],
    schools: IGetSchool[],
    entriesCount: number,
    preferredLanguageCount: IPreferredLanguageCount,
    filters: IStatsFilters
}

export type IPreferredLanguageCount = {
    [key: string]: number,
    _total: number
}

export type IQuestionStat = 
    IErrorQuestionStat | 
    IChooseLanguageQuestionStat | 
    IMapLanguageToCompetenceQuestionStat |
    IMapLanguageToAgeQuestionStat

interface IErrorQuestionStat {
    question: IQuestion,
    error: string,
    type: 'error',
}

export interface IChooseLanguageQuestionStat {
    question: IQuestion,
    type: 'choose-language',
    count: number, // numero di persone che hanno compilato il questionario
    countPositive: number, // numero di persone che hanno risposto con almeno una lingua
    countAnswers: number, // numero di lingue che sono state scelte
    answers: IChooseLanguageStat,
    singleAnswers: IChooseLanguageStat, // numero di persone che hanno scelto solo questa lingua
    counts: number[], // numero di risposte con 0, 1, 2, 3, 4, 5, 6, 7, 8, 9 o 10 lingue
}

interface IChooseLanguageStat {
    [key: string]: number // quanti hanno indicato questa lingua
}

export interface IMapLanguageToCompetenceQuestionStat {
    question: IQuestion,
    type: 'map-language-to-competence',
    count: number,
    answers: IMapLanguageToCompetenceStat,
}

interface IMapLanguageToCompetenceStat {
    [key: string]:  // language
        ILanguageCompetenceStat
}

interface ILanguageCompetenceStat {
    competence: {
        [key: string]: {// competence 
            level: {
                [key: string]: // level
                    number
            },
            sum: number,
        }
    },
    countValid: number,
}

export interface IMapLanguageToAgeQuestionStat {
    code: string,
    question: IQuestion,
    type: 'map-language-to-age',
    count: number,
    answers: IMapLanguageToAgeStat,
}

interface IMapLanguageToAgeStat {
    [key: string]: { // language
        [key: string]: number // age
    }
}

type QuestionCode = string
type LanguageAnswer = string[]
type MapLanguageToCompetenceAnswer = {[key: string]: {[key: string]: string}}
type MapLanguageToAgeAnswer = {[key: string]: string}
type Answer = LanguageAnswer | MapLanguageToAgeAnswer | MapLanguageToCompetenceAnswer

interface IEntry {
    _id: ObjectId,
    pollId: ObjectId,
    answers: {
        [key: QuestionCode]: Answer
    },
    lang: string,
    IP: string,
    clientTimestamp: number,
}

interface IEntryWithPoll extends IEntry {
    poll: IGetPoll,
}

async function aggregate(entries: IEntryWithPoll[], filters: IStatsFilters): Promise<IStats> {
    const questionsMap = questionary.questions
    let baseLanguages = Object.keys(questionary.languages)

    /*
    // collect all languages used in all answers of all entries
    // and all question codes
    for (const e of entries) {
        for (const [code, answer] of Object.entries(e.answers)) {
            if (!questionsMap[code]) continue
            if (questionsMap[code].type !== 'choose-language') continue
            assert(Array.isArray(answer),'answer is not an array')
            allLanguages.push(...answer)
        }
    }
    */
    const preferredLanguageCount: IPreferredLanguageCount = {_total: 0}
    //const languagesZeroCount = () => Object.fromEntries(Object.keys(questionary.languages).map(language => ([language, 0])))
    const levels = extractLevels(questionary)
    const competencesZero = (): ILanguageCompetenceStat => ({
            competence: Object.fromEntries(questionary.competences.map(
                competence => [competence.code, {
                    level: Object.fromEntries(
                        levels.map(l => [l,0])),
                    sum: 0,
                }])),
            countValid: 0,
        })
    const ages = questionary.ages.map(age => age.code)
    const agesZero = () => Object.fromEntries(
        ages.map(age => [age, 0])
    )

//    const pollIds: string[] = []
//    const polls: IGetPoll[] = []
    const pollDict: {[key: string]: IGetPoll} = {}

    const dict = Object.fromEntries([
        ...Object.entries(questionary.languages).map(([lang, x]) => [lang, x.it]),
        ...(await Dict.aggregate([{$project:{lang:1, map:1}}])).map(d => [d.lang, d.map]),
    ])

    const schoolDict: {[key: string]: IGetSchool} = {}

    function langMap(lang: string) {
        const f = questionary.languages[lang]
        if (f) return f.it // una delle cinque lingue base
        const m = dict[lang.toLowerCase()]
        if (m !== undefined) return m // if m === '' va scartato
        return lang // mantieni
    }


    let questions: {[key: string]: IQuestionStat} = {}
    // populate questions with all aggregate statistics
    for (const e of entries) {
        if (e.poll) {
            const poll_id = e.poll._id.toString()
            if (!pollDict[poll_id]) {
                pollDict[poll_id] = {
                    ...e.poll,
                    entriesCount: 1,
                }
            } else pollDict[poll_id].entriesCount ++
            if (e.poll.school) {
                const school_id = e.poll.school._id.toString()
                if (!schoolDict[school_id]) {
                    schoolDict[school_id] = {
                        ...e.poll.school,
                        pollCount: 1,
                    }
                } else schoolDict[school_id].pollCount ++
            }
        }
        const preferredLanguage = e.lang
        preferredLanguageCount._total ++
        if (preferredLanguage) {
            const count = preferredLanguageCount[preferredLanguage] || 0
            preferredLanguageCount[preferredLanguage] = count + 1
        }
        
        Object.entries(e.answers).forEach(([code, answer]) => {
            const question = questionsMap[code]
            if (!question) return
            if (question.type === 'choose-language') {
                let q = questions[code]
                if (!q) {
                    q = {
                        question,
                        type: question.type,
                        count: 0, // numero di risposte esaminate
                        countPositive: 0, // numero di risposte con almeno una lingua
                        countAnswers: 0, // numero totale di lingue scelte
                        answers: {}, // numero di persone che hanno scelto questa lingua
                        singleAnswers: {}, // numero di persone che hanno scelto solo questa lingua
                        counts: [], // quanti parlano quante lingue
                    }
                    questions[code] = q
                }
                assert(q.type === question.type)
                const answer = e.answers[code]
                if (!answer) {
                    console.error(`cannot find answer for question ${code} in entry ${e._id}`)
                    return
                }
                assert(Array.isArray(answer),'answer is not an array')
                q.count ++
                if (answer.length>0) q.countPositive ++
                const n = Math.min(answer.length,10)
                while (q.counts.length<n+1) {
                    q.counts.push(0)
                }
                q.counts[n] ++ 
                for (const sourceLang of answer) {
                    const lang = langMap(sourceLang)
                    if (!lang) continue // language marked for discard
                    q.countAnswers ++
                    if (lang in q.answers) q.answers[lang]++
                    else q.answers[lang] = 1
                    if (answer.length === 1) {
                        if (lang in q.singleAnswers) q.singleAnswers[lang]++
                        else q.singleAnswers[lang] = 1
                    }
                }
            } else if (question.type === 'map-language-to-competence') {
                let q = questions[code]
                if (!q) {
                    q = {
                        question,
                        type: question.type,
                        count: 0,
                        answers: {},
                    }
                    questions[code] = q
                }
                assert(q.type === question.type)
                const answer = e.answers[code]
                if (!answer) {
                    console.error(`cannot find answer for question ${code} in entry ${e._id}`)
                    return
                }
                assert(!Array.isArray(answer))
                q.count ++
                for (const [sourceLang, langAns] of Object.entries(answer)) {
                    const lang = langMap(sourceLang)
                    if (!lang) continue // discard this language
                    if (!(lang in q.answers)) {
                        q.answers[lang] = competencesZero()
                    }
                    let isValid = false
                    for (const [competence, value] of Object.entries(langAns)) {
                        if (!(competence in q.answers[lang].competence)) {
                            console.error(`competence ${competence} not in answerss`)
                            continue
                        }
                        const valueInt = parseInt(`${value}`)
                        if (valueInt>0) isValid = true
                        q.answers[lang].competence[competence].sum += valueInt
                        const valueKey = `_${value}`
                        if (questionary.competenceValues[valueKey]) {
                            const level = questionary.competenceValues[valueKey].level
                            if (!(level in q.answers[lang].competence[competence].level)) {
                                console.error(`level ${level} not in answers`)
                                continue
                            }
                            if (level) {
                                q.answers[lang].competence[competence].level[level]++
                            }
                        }
                    }
                    if (isValid) q.answers[lang].countValid++
                }
            } else if (question.type === 'map-language-to-age') {
                let q = questions[code]
                if (!q) {
                    q = {
                        code,
                        question,
                        type: question.type,
                        count: 0,
                        answers: {},
                    }
                    questions[code] = q
                }
                assert(q.type === question.type)
                const answer = e.answers[code]
                if (!answer) {
                    console.error(`cannot find answer for question ${code} in entry ${e._id}`)
                    return
                }
                if (Array.isArray(answer)) {
                    console.error(`answer is an array: ${JSON.stringify(answer)} in entry ${e._id}`)
                    return
                }
                q.count ++
                for (const [sourceLang, age] of Object.entries(answer)) {
                    const lang = langMap(sourceLang)
                    if (!lang) continue // language is marked for discard
                    if (typeof(age) !== 'string') {
                        console.error(`answer for lang ${lang} is not a string: ${age}`)
                        continue
                    }
                    if (!(ages.includes(age))) {
                        console.error(`age ${age} not in ages ${JSON.stringify(ages)}}`)
                        continue
                    }
                    if (!(lang in q.answers)) {
                        q.answers[lang] = agesZero()
                    }
                    q.answers[lang][age]++
                }
            } else {
                console.error(`unknown question type ${question.type}`)
            }
        })
    }
    
    // sort counts by numbers
    // reduce counts to 10
    // aggregating all counts > 10 in the last one
    const N = 10
    for (const q of Object.values(questions)) {
        if (q.type === 'choose-language') {
            const entries = Object.entries(q.answers).sort((a,b) => b[1]-a[1])
            if (entries.length > N) {
                const other = entries.slice(N-1).reduce((acc, [lang, count]) => acc + count, 0)
                entries.splice(N-1)
                entries.push(['', other])
            }
            q.answers = Object.fromEntries(entries)
        } 
        if (q.type === 'map-language-to-age') {
            const myCount = (a: {[key:string]:number}) => Object.values(a).reduce((acc, v) => acc + v, 0)
            const entries = Object.entries(q.answers).sort((a,b) => myCount(b[1])-myCount(a[1]))
            if (entries.length > N) entries.splice(N)
            q.answers = Object.fromEntries(entries)
        }
        if (q.type === 'map-language-to-competence') {
            const myCount = (a: ILanguageCompetenceStat) => a.countValid
            const entries = Object.entries(q.answers).sort((a,b) => myCount(b[1])-myCount(a[1]))
            // if (entries.length > N) entries.splice(N)
            q.answers = Object.fromEntries(entries)
        }
    }

    const entriesCount = entries.length
    return { 
        questions,
        polls: Object.values(pollDict),
        entriesCount,
        preferredLanguageCount,
        schools: Object.values(schoolDict),
        filters
    }
}


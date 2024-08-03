import Entry, { IEntry } from '@/models/Entry'
import Dict from '@/models/Dict'
import { IGetPoll } from '@/models/Poll'
import { IGetSchool } from '@/models/School'
import type { NextApiRequest, NextApiResponse } from 'next'
import questionary, { IQuestion, extractLevels } from '../../lib/questionary'
import { assert } from '@/lib/assert'
import { ObjectId } from 'mongodb'

import getSessionUser from '@/lib/getSessionUser'

export function yearMatch(n: number) {
    // l'anno scolastico finisce con l'inizio di luglio
    return {
        $gte: new Date(`${n}-07-01`),
        $lt: new Date(`${n+1}-07-01`),
    }
}

export default async function handler(
    req: NextApiRequest, 
    res: NextApiResponse) {
        const user = await getSessionUser(req)
        const query = req.query
        const $match: any = {}
        const filters: any = {}

        // console.log(JSON.stringify({query}))

        $match["poll.closed"] = true

        if (query.schoolId && !Array.isArray(query.schoolId)) {
            $match["poll.school._id"] = new ObjectId(query.schoolId)
            filters.school = query.schoolId
        }
        if (query.city && !Array.isArray(query.city)) {
            $match["poll.school.city"] = query.city
            filters.city = query.city
        }
        if (query.form && !Array.isArray(query.form)) {
            $match["poll.form"] = query.form
            filters.form = query.form
        }
        if (query.class && !Array.isArray(query.class)) {
            $match["poll.year"] = query.class
            filters.class = query.class
        }
        if (query.year && !Array.isArray(query.year)) {
            const n = parseInt(query.year)
            $match["poll.createdAt"] = yearMatch(n)
            filters.year = n
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

        if (req.query.adminSecret) {
            // se fornisce l'adminSecret anche un utente anonimo
            // può vedere le statistiche di quel sondaggio
            pipeline.push({$match: {'poll.adminSecret': req.query.adminSecret}})
        } else if (req.query.schoolSecret) {
            pipeline.push({$match: {'poll.school.reportSecret': req.query.schoolSecret}})
        } else {
            if (!user) {
                return res.status(401).json({error: 'not authenticated'})
            }
            if (!(user.isAdmin||user.isViewer)) {
                pipeline.push({$match: {'poll.createdBy': new ObjectId(user._id)}})
            }
        }

        if (req.query.poll) {
            let pollIds: ObjectId[]
            if (Array.isArray(req.query.poll)) {
                try {
                    pollIds = req.query.poll.map((id:any) => new ObjectId(id))
                } catch(error) {
                    return res.status(400).json({error: 'invalid poll id'})
                }   
            } else {
                try {   
                    pollIds = req.query.poll.split(',').map((s:string) => new ObjectId(s))
                } catch(error) {    
                    return res.status(400).json({error: `invalid poll ids`})
                }
            }
            // pipeline.push({$match: {'poll._id': new ObjectId(req.query.poll)}})
            pipeline.push({$match: {'poll._id': {$in: pollIds }}})
        }
        if (req.query.school_id) {
            // console.log(`school_id: ${req.query.school_id}`)
            if (Array.isArray(req.query.school_id)) {
                return res.status(400).json({error: 'school_id cannot be an array (not implemented)'})
            } else {
                let school_id: ObjectId
                try {
                    school_id = new ObjectId(req.query.school_id)
                } catch(error) {
                    return res.status(400).json({error: 'invalid school_id'})
                }
                pipeline.push({$match: {'poll.school_id': school_id}})
            }
        }

        // console.log(`pipeline: ${JSON.stringify(pipeline)}`)

        try {
            const entries = await Entry.aggregate(pipeline)
            const data: IStats = await aggregate(entries, filters)
            return res.status(200).json({ data })
        } catch (error) {
            console.error(error)
            console.log(`database error: ${error}`)
            return res.status(400).json({ error })
        }
}

export interface IStatsFilters {
    city?: string,
    school?: string,
    form?: string,
    class?: string,
    year?: number,
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

export interface IErrorQuestionStat {
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
    counts: number[], // numero di risposte con 0, 1, 2, 3, 4, 5, 6, 7, 8, 9 o 10 lingue
}

export interface IChooseLanguageStat {
    [key: string]: number // quanti hanno indicato questa lingua
}

export interface IMapLanguageToCompetenceQuestionStat {
    question: IQuestion,
    type: 'map-language-to-competence',
    count: number,
    answers: IMapLanguageToCompetenceStat,
}

export interface IMapLanguageToCompetenceStat {
    [key: string]:  // language
        ILanguageCompetenceStat
}

export interface ILanguageCompetenceStat {
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

export interface IMapLanguageToAgeStat {
    [key: string]: { // language
        [key: string]: number // age
    }
}

export interface IEntryWithPoll extends IEntry {
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
        console.log(`entry ${e._id} ${e.poll?.school?.name}`)
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
                        count: 0,
                        countPositive: 0,
                        countAnswers: 0,
                        answers: {},
                        counts: [],
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
                //console.log(JSON.stringify(q,null,2))
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
                // console.log(`${e._id} answer: ${JSON.stringify(answer)}`)
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
    
    console.log(`SchoolDict: ${JSON.stringify(schoolDict,null,2)}`)

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


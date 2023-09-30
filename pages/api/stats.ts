import Entry, { IEntry } from '@/models/Entry'
import Dict from '@/models/Dict'
import { IPoll, IGetPoll } from '@/models/Poll'
import type { NextApiRequest, NextApiResponse } from 'next'
import questionary, { IQuestion, extractLevels } from '../../lib/questionary'
import { assert } from '@/lib/assert'
import { ObjectId } from 'mongodb'

import getSessionUser from '@/lib/getSessionUser'
import { count } from 'console'

export default async function handler(
    req: NextApiRequest, 
    res: NextApiResponse) {
        const user = await getSessionUser(req)

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
            if (!user.isAdmin) {
                pipeline.push({$match: {'poll.createdBy': new ObjectId(user._id)}})
            }
        }

        if (req.query.poll) {
            if (Array.isArray(req.query.poll)) {
                let pollIds: ObjectId[]
                try {
                    pollIds = req.query.poll.map((id:any) => new ObjectId(id))
                } catch(error) {
                    return res.status(400).json({error: 'invalid poll id'})
                }   
                pipeline.push({$match: {'poll._id': {$in: pollIds }}})
            } else {
                let pollId: ObjectId
                try {   
                    pollId = new ObjectId(req.query.poll)
                } catch(error) {    
                    return res.status(400).json({error: 'invalid poll id'})
                }
                pipeline.push({$match: {'poll._id': new ObjectId(req.query.poll)}})
            }
        }
        if (req.query.school_id) {
            console.log(`school_id: ${req.query.school_id}`)
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


        try {
            const entries = await Entry.aggregate(pipeline)
            const data: IStats = await aggregate(entries)
            res.status(200).json({ data })
        } catch (error) {
            console.error(error)
            console.log(`database error: ${error}`)
            res.status(400).json({ error })
        }
}

export interface IStats {
    questions: {[key: string]: IQuestionStat},
    polls: IGetPoll[],
    entriesCount: number,
    preferredLanguageCount: IPreferredLanguageCount,
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
    count: number, // numero di persone che hanno risposto
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
    sums: {[key:string]: { // language
        [key:string]: number // competence -> sum of numeric answers
    }}
}

export interface IMapLanguageToCompetenceStat {
    [key: string]: { // language
        [key: string]: { // competence 
            [key: string]: // level
                number
        }
    }
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

async function aggregate(entries: IEntryWithPoll[], ): Promise<IStats> {
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
    const languagesZeroCount = () => Object.fromEntries(Object.keys(questionary.languages).map(language => ([language, 0])))
    const levels = extractLevels(questionary)
    const competencesZero = () => Object.fromEntries(questionary.competences.map(
        competence => [competence.code, 
            Object.fromEntries(
                levels.map(l => [l,0])) ]))
    const sumsZero = () => Object.fromEntries(questionary.competences.map(
        competence => [competence.code, 0]))
    const ages = questionary.ages.map(age => age.code)
    const agesZero = () => Object.fromEntries(
        ages.map(age => [age, 0])
    )

//    const pollIds: string[] = []
//    const polls: IGetPoll[] = []
    const pollDict: {[key: string]: IGetPoll} = {}

    const dict = Object.fromEntries((await Dict.aggregate([{$project:{lang:1, map:1}}])).map(d => [d.lang, d.map]))
    function langMap(lang: string) {
        const m = dict[lang.toLowerCase()]
        if (m===undefined) return lang // mantieni
        return m // if m === '' va scartato
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
                        countAnswers: 0,
                        answers: languagesZeroCount(),
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
                    q= {
                        question,
                        type: question.type,
                        count: 0,
                        answers: Object.fromEntries(
                            baseLanguages.map(lang => [lang,
                                competencesZero()])),
                        sums: Object.fromEntries(
                            baseLanguages.map(lang => [lang,sumsZero()])
                        )
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
                        q.sums[lang] = sumsZero()
                    }
                    for (const [competence, value] of Object.entries(langAns)) {
                        if (!(competence in q.answers[lang])) {
                            console.error(`competence ${competence} not in answers`)
                            continue
                        }
                        q.sums[lang][competence] += parseInt(`${value}`)
                        const valueKey = `_${value}`
                        if (questionary.competenceValues[valueKey]) {
                            const level = questionary.competenceValues[valueKey].level
                            if (!(level in q.answers[lang][competence])) {
                                console.error(`level ${level} not in answers`)
                                continue
                            }
                            if (level) {
                                q.answers[lang][competence][level]++
                            }
                        }
                    }
                }
            } else if (question.type === 'map-language-to-age') {
                let q = questions[code]
                if (!q) {
                    q = {
                        code,
                        question,
                        type: question.type,
                        count: 0,
                        answers: Object.fromEntries(
                            baseLanguages.map(lang => [lang,agesZero()]))
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
    
    // sort counts by numbers
    // reduce counts to 10
    // aggregating all counts > 10 in the last one
    for (const q of Object.values(questions)) {
        if (q.type === 'choose-language') {
            const entries = Object.entries(q.answers).sort((a,b) => b[1]-a[1])
            if (entries.length > 10) {
                const other = entries.slice(9).reduce((acc, [lang, count]) => acc + count, 0)
                entries.splice(9)
                entries.push(['altre', other])
            }
            q.answers = Object.fromEntries(entries)
        } 
        if (q.type === 'map-language-to-age') {
            const myCount = (a: {[key:string]:number}) => Object.values(a).reduce((acc, v) => acc + v, 0)
            const entries = Object.entries(q.answers).sort((a,b) => myCount(b[1])-myCount(a[1]))
            if (entries.length > 10) entries.splice(10)
            q.answers = Object.fromEntries(entries)
        }
    }

    const entriesCount = entries.length
    return { 
        questions,
        polls: Object.values(pollDict),
        entriesCount,
        preferredLanguageCount,
    }
}


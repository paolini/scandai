import Entry, { IEntry } from '@/models/Entry'
import { IPoll } from '@/models/Poll'
import type { NextApiRequest, NextApiResponse } from 'next'
import questionary, { IQuestion, extractLevels } from '../../lib/questionary'
import { assert } from '@/lib/assert'
import { ObjectId } from 'mongodb'

import getSessionUser from '@/lib/getSessionUser'

export default async function handler(
    req: NextApiRequest, 
    res: NextApiResponse) {
        const user = await getSessionUser(req)

        let pipeline: any = [
            {$lookup: {
                from: 'polls',
                localField: 'pollId',
                foreignField: '_id',
                as: 'poll'
            }}, 
            {$unwind: '$poll'},
        ]

        if (!user) {
            return res.status(401).json({error: 'not authenticated'})
        }

        if (!user.isAdmin) {
            pipeline.push({$match: {'poll.createdBy': new ObjectId(user._id)}})
        }

        if (req.query.poll) {
            if (Array.isArray(req.query.poll)) {
                pipeline.push({$match: {'poll._id': {$in: req.query.poll.map(p => new ObjectId(p))}}})
            } else {
                pipeline.push({$match: {'poll._id': new ObjectId(req.query.poll)}})
            }
        }
        try {
            const entries = await Entry.aggregate(pipeline)
            const data: IStats = aggregate(entries)
            res.status(200).json({ data })
        } catch (error) {
            console.error(error)
            console.log(`database error: ${error}`)
            res.status(400).json({ error })
        }
}

export interface IStats {
    questions: {[key: string]: IQuestionStat},
    polls: IPoll[],
    entriesCount: number,
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
    count: number,
    answers: IChooseLanguageStat,
    counts: number[], // numero di risposte con 0, 1, 2, 3, 4, 5, 6, 7, 8, 9 o 10 lingue
}

export interface IChooseLanguageStat {
    [key: string]: number
}

export interface IMapLanguageToCompetenceQuestionStat {
    question: IQuestion,
    type: 'map-language-to-competence',
    count: number,
    answers: IMapLanguageToCompetenceStat,
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
    poll: IPoll,
}

function aggregate(entries: IEntryWithPoll[], ): IStats {
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

    const languagesZeroCount = Object.fromEntries(Object.keys(questionary.languages).map(language => ([language, 0])))
    const levels = extractLevels(questionary)
    const competencesZero = Object.fromEntries(questionary.competences.map(
        competence => [competence.code, 
            Object.fromEntries(
                levels.map(l => [l,0])) ]))
    const ages = questionary.ages.map(age => age.code)
    const agesZero = Object.fromEntries(
        ages.map(age => [age, 0])
    )

    const pollIds: string[] = []
    const polls: IPoll[] = []
            
    let questions: {[key: string]: IQuestionStat} = {}
    // populate questions with all aggregate statistics
    for (const e of entries) {
        if (e.poll) {
            const poll_id = e.poll._id.toString()
            if (!pollIds.includes(poll_id)) {
                pollIds.push(poll_id)
                polls.push(e.poll)
            }    
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
                        answers: {...languagesZeroCount},
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
                for (const lang of answer) {
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
                                {...competencesZero}]))
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
                for (const [lang, langAns] of Object.entries(answer)) {
                    if (!(lang in q.answers)) {
                        q.answers[lang] = {...competencesZero}
                    }
                    for (const [competence, value] of Object.entries(langAns)) {
                        if (!(competence in q.answers[lang])) {
                            console.error(`competence ${competence} not in answers`)
                            continue
                        }
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
                            baseLanguages.map(lang => [lang,{...agesZero}]))
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
                for (const [lang, age] of Object.entries(answer)) {
                    if (typeof(age) !== 'string') {
                        console.error(`answer for lang ${lang} is not a string: ${age}`)
                        continue
                    }
                    if (!(ages.includes(age))) {
                        console.error(`age ${age} not in ages ${JSON.stringify(ages)}}`)
                        continue
                    }
                    if (!(lang in q.answers)) {
                        q.answers[lang] = {...agesZero}
                    }
                    q.answers[lang][age]++
                }
            } else {
                console.error(`unknown question type ${question.type}`)
            }
        })
    }
    
    const entriesCount = entries.length
    return { 
        questions, 
        polls, 
        entriesCount
    }
}


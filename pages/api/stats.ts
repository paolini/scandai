import Entry, { IEntry } from '@/models/Entry'
import { IPoll } from '@/models/Poll'
import type { NextApiRequest, NextApiResponse } from 'next'
import questionary, { IQuestion, extractQuestionCodes, extractLevels } from '../../lib/questionary'
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
    questions: IQuestionStat[],
    polls: IPoll[],
    entriesCount: number,
}

export type IQuestionStat = 
    IErrorQuestionStat | 
    IChooseLanguageQuestionStat | 
    IMapLanguageToCompetenceQuestionStat |
    IMapLanguageToAgeQuestionStat

export interface IErrorQuestionStat {
    code: string,
    question: IQuestion,
    error: string,
    type: 'error',
}

export interface IChooseLanguageQuestionStat {
    code: string,
    question: IQuestion,
    type: 'choose-language',
    answers: IChooseLanguageStat,
    counts: number[],
}

export interface IChooseLanguageStat {
    [key: string]: {
        fraction: number,
        count: number,
    }
}

export interface IMapLanguageToCompetenceQuestionStat {
    code: string,
    question: IQuestion,
    type: 'map-language-to-competence',
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
    answers: IMapLanguageToAgeStat,
}

export interface IMapLanguageToAgeStat {
    [key: string]: { // language
        [key: string]: { // age
            fraction: number,
            count: number,
        }
    }
}

export interface IEntryWithPoll extends IEntry {
    poll: IPoll,
}

function aggregate(entries: IEntryWithPoll[]): IStats {
    const questionsCodes = extractQuestionCodes(questionary)
    const questionsMap = Object.fromEntries(questionsCodes.map(code => [code, questionary.questions[code]]))
    let allLanguages = Object.keys(questionary.languages)

    // collect all languages used in all answers of all entries
    for (const e of entries) {
        for (const [code, answer] of Object.entries(e.answers)) {
            if (!questionsMap[code]) continue
            if (questionsMap[code].type !== 'choose-language') continue
            assert(Array.isArray(answer),'answer is not an array')
            allLanguages.push(...answer)
        }
    }

    const questions: IQuestionStat[] = questionsCodes.map(code => {
        const question = questionary.questions[code]
        if (question.type === 'choose-language') {
            const languagesZeroCount = Object.fromEntries(Object.keys(questionary.languages).map(language => ([language, {fraction: 0, count: 0}])))
            let answers: {[key: string]: {fraction: number, count: number}} = {...languagesZeroCount}
            let languageCount = 0
            let counts: number[] = []
            for (const e of entries) {
                const answer = e.answers[code]
                assert(Array.isArray(answer),'answer is not an array')
                const n = Math.min(answer.length,10)
                while (counts.length<n+1) {
                    counts.push(0)
                }
                counts[n] ++ 
                for (const lang of answer) {
                    if (lang in answers) answers[lang].count++
                    else answers[lang] = {fraction: 0, count: 1}
                    languageCount++
                }
            }
            if (languageCount>0) {
                for (const key of Object.keys(answers)) {
                    answers[key].fraction = answers[key].count / languageCount
                }
            }
            return {code, question, type: question.type, answers, counts}
        } 
        
        if (question.type === 'map-language-to-competence') {
            const levels = extractLevels(questionary)

            const answers: IMapLanguageToCompetenceStat = Object.fromEntries(
                allLanguages.map(lang => [lang,
                    Object.fromEntries(questionary.competences.map(
                        competence => [competence.code, 
                            Object.fromEntries(
                                levels.map(l => [l,0])) ]
                    ))
                ]))

            for (const e of entries) {
                const answer = e.answers[code]
                if (!answer) {
                    console.error(`cannot find answer for question ${code} in entry ${e._id}`)
                    continue
                }
                assert(!Array.isArray(answer))
                for (const [lang, langAns] of Object.entries(answer)) {
                    if (!(lang in answers)) {
                        console.error(`lang ${lang} not in answers`)
                        continue
                    }
                    for (const [competence, value] of Object.entries(langAns)) {
                        if (!(competence in answers[lang])) {
                            console.error(`competence ${competence} not in answers`)
                            continue
                        }
                        const valueKey = `_${value}`
                        if (questionary.competenceValues[valueKey]) {
                            const level = questionary.competenceValues[valueKey].level
                            if (!(level in answers[lang][competence])) {
                                console.error(`level ${level} not in answers`)
                                continue
                            }
                            if (level) {
                                answers[lang][competence][level]++
                            }
                        }
                    }
                }
            }
            return {code, question, type: question.type, answers}
        }

        if (question.type === 'map-language-to-age') {
            const ages = questionary.ages.map(age => age.code)
            const answers: IMapLanguageToAgeStat = Object.fromEntries(
                allLanguages.map(lang => [lang,
                    Object.fromEntries(
                        ages.map(age => [age, {fraction: 0, count: 0}])
                    )
                ]))

            for (const e of entries) {
                const answer = e.answers[code]
                if (!answer) {
                    console.error(`cannot find answer for question ${code} in entry ${e._id}`)
                    continue
                }
                if(Array.isArray(answer)) {
                    console.error(`answer is an array: ${JSON.stringify(answer)} in entry ${e._id}`)
                    continue
                }
                console.log(`${e._id} answer: ${JSON.stringify(answer)}`)
                for (const [lang, age] of Object.entries(answer)) {
                    if (typeof(age) !== 'string') {
                        console.error(`answer for lang ${lang} is not a string: ${age}`)
                        continue
                    }
                    if (!(ages.includes(age))) {
                        console.error(`age ${age} not in ages ${JSON.stringify(ages)}}`)
                        continue
                    }
                    if (!(lang in answers)) {
                        console.error(`lang ${lang} not in answers`)
                        continue
                    }
                    answers[lang][age].count++
                }
            }
            for (const [lang, langAns] of Object.entries(answers)) {
                for (const [age, value] of Object.entries(langAns)) {
                    if (value.count>0) {
                        value.fraction = value.count / entries.length
                    }
                }
            }
            console.log(`answers: ${JSON.stringify(answers)}`)
            return {code, question, type: question.type, answers}
        }

        return {code, question, type: 'error', error: 'unknown question type'}
    })
    const pollIds: string[] = []
    const polls: IPoll[] = []
    for (const e of entries) {
        if (!e.poll) continue
        if (!pollIds.includes(e.poll._id.toString())) {
            pollIds.push(e.poll._id.toString())
            polls.push(e.poll)
        }    }
    const entriesCount = entries.length
    return { questions, polls, entriesCount}
}


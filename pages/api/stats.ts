import dbConnect from '../../lib/mongodb'
import Entry, { IEntry } from '@/models/Entry'
import { IClass } from '@/models/Class'
import type { NextApiRequest, NextApiResponse } from 'next'
import data, { IQuestion, extractQuestions, extractLevels } from '../../lib/questions'
import { assert } from '@/lib/assert'

export interface IStats {
    questions: IQuestionStat[],
    classes: IClass[],
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

export interface IEntryWithClass extends IEntry {
    class: IClass,
}

function aggregate(entries: IEntryWithClass[]): IStats {
    const questionsList = extractQuestions(data)
    const questionsMap = Object.fromEntries(questionsList.map(question => [question.code, question]))
    let allLanguages = Object.keys(data.languages)

    // collect all languages used in all answers of all entries
    for (const e of entries) {
        for (const [code, answer] of Object.entries(e.answers)) {
            if (!questionsMap[code]) continue
            if (questionsMap[code].type !== 'choose-language') continue
            assert(Array.isArray(answer),'answer is not an array')
            allLanguages.push(...answer)
        }
    }

    const questions: IQuestionStat[] = questionsList.map(question => {
        
        if (question.type === 'choose-language') {
            const languagesZeroCount = Object.fromEntries(Object.keys(data.languages).map(language => ([language, {fraction: 0, count: 0}])))
            let answers: {[key: string]: {fraction: number, count: number}} = {...languagesZeroCount}
            let languageCount = 0
            let counts: number[] = []
            for (const e of entries) {
                const answer = e.answers[question.code]
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
            return {question, type: question.type, answers, counts}
        } 
        
        if (question.type === 'map-language-to-competence') {
            const levels = extractLevels(data)

            const answers: IMapLanguageToCompetenceStat = Object.fromEntries(
                allLanguages.map(lang => [lang,
                    Object.fromEntries(data.competences.map(
                        competence => [competence.code, 
                            Object.fromEntries(
                                levels.map(l => [l,0])) ]
                    ))
                ]))

            for (const e of entries) {
                const answer = e.answers[question.code]
                if (!answer) {
                    console.error(`cannot find answer for question ${question.code} in entry ${e._id}`)
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
                        if (data.competenceValues[valueKey]) {
                            const level = data.competenceValues[valueKey].level
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
            return {question, type: question.type, answers}
        }

        if (question.type === 'map-language-to-age') {
            const ages = data.ages.map(age => age.code)
            const answers: IMapLanguageToAgeStat = Object.fromEntries(
                allLanguages.map(lang => [lang,
                    Object.fromEntries(
                        ages.map(age => [age, {fraction: 0, count: 0}])
                    )
                ]))

            for (const e of entries) {
                const answer = e.answers[question.code]
                if (!answer) {
                    console.error(`cannot find answer for question ${question.code} in entry ${e._id}`)
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
            return {question, type: question.type, answers}
        }

        return {question, type: 'error', error: 'unknown question type'}
    })
    const classIds: string[] = []
    const classes: IClass[] = []
    for (const e of entries) {
        if (!classIds.includes(e.class._id.toString())) {
            classIds.push(e.class._id.toString())
            classes.push(e.class)
        }
    }
    const entriesCount = entries.length
    return { questions, classes, entriesCount}
}

export default async function handler(
    req: NextApiRequest, 
    res: NextApiResponse) {
    await dbConnect
    try {
        const entries = await Entry.aggregate([
            {$lookup: {
                from: 'classes',
                localField: 'classId',
                foreignField: '_id',
                as: 'class'
            }}, 
            {$unwind: '$class'}
        ])
        const data: IStats = aggregate(entries)
        res.status(200).json({ data })
    } catch (error) {
        console.error(error)
        console.log(`database error: ${error}`)
        res.status(400).json({ error })
    }
}
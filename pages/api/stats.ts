import dbConnect from '@/lib/mongodb'
import { Types } from 'mongoose'
import Entry, { IEntry } from '@/models/Entry'
import { IClass } from '@/models/Class'
import type { NextApiRequest, NextApiResponse } from 'next'
import data, { IQuestion, extractQuestions } from '../../lib/questions'
import { assert } from '@/lib/assert'

export type IChooseLanguageStat = {
        [key: string]: number
    } | null

export type IQuestionStat = {
    question: IQuestion,
    answers: IChooseLanguageStat,
    counts: number[],
}

export interface IStats {
    questions: IQuestionStat[],
    classes: IClass[],
    entriesCount: number,
}

export interface IEntryWithClass extends IEntry {
    class: IClass,
}

function aggregate(entries: IEntryWithClass[]): IStats {
    const languagesZeroCount = Object.fromEntries(Object.keys(data.languages).map(language => ([language, 0])))
    const questions = extractQuestions(data).map(question => {
        if (question.type === 'choose-language') {
            let answers: {[key: string]: number} = {...languagesZeroCount}
            let languageCount = 0
            let counts: number[] = []
            for (const e of entries) {
                const answer = e.answers[question.code]
                assert(Array.isArray(answer))
                const n = Math.min(answer.length,10)
                while (counts.length<n+1) {
                    counts.push(0)
                }
                counts[n] ++ 
                for (const lang of answer) {
                    if (lang in answers) answers[lang]++
                    else answers[lang] = 1
                    languageCount++
                }
            }
            if (languageCount>0) {
                for (const key of Object.keys(answers)) {
                    answers[key] /= languageCount
                }
            }
            return {question, answers, counts}
        } else return {question, answers: {}, counts: []}
    })
    const classIds: Types.ObjectId[] = []
    const classes: IClass[] = []
    for (const e of entries) {
        console.log('class', e.class)
        if (!classIds.includes(e.class._id)) {
            classIds.push(e.class._id)
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
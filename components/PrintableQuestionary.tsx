import { useState } from 'react'
import questionary, { extractQuestionCodes, extractPages, extractExtraLanguages } from '@/lib/questionary'
import QuestionaryPage from './QuestionaryPage'
import { IAnswers } from './Question'
import Loading from './Loading'
import { State, set } from '@/lib/State'

export default function PrintableQuestionary({ langState, form }: {
    langState: State<string>,
    form: string,
}) {
    const answersState = useState<IAnswers>({})
    const [answers] = answersState
    const [lang] = langState

    const questionCodes = extractQuestionCodes(form)

    // Initialize empty answers for display purposes
    if (Object.keys(answers).length === 0) {
        set(answersState, Object.fromEntries(
            questionCodes.map(code => {
                const answer_code = questionary.questions[code]?.code || code
                return [answer_code, empty_answer(code)]
            })
        ))
        return <Loading />
    }

    const extraLanguages = extractExtraLanguages(questionCodes, answers, questionary.languages)
    const pages = extractPages(form)

    function empty_answer(code: string) {
        const question = questionary.questions[code]
        if (!question) return ''
        
        switch(question.type) {
            case 'map-language-to-competence':
                return {}
            case 'map-language-to-age':
                return {}
            case 'choose-language':
                return []
            case 'choice':
                return ''
            default:
                return ''
        }
    }

    return (
        <div className="printable-questionary">
            <style>
                {`
                @media print {
                    .printable-questionary .question-page {
                        page-break-after: avoid;
                        break-after: avoid;
                    }
                    .printable-questionary .question-page + .question-page {
                        page-break-before: always;
                        break-before: always;
                    }
                    .printable-questionary h3, .printable-questionary h4 {
                        page-break-after: avoid;
                        break-after: avoid;
                    }
                    .printable-questionary .form-group {
                        page-break-inside: avoid;
                        break-inside: avoid;
                    }
                }
                `}
            </style>
            
            {/* Questionnaire title and intro */}
            <div className="questionary-header">
                <h1>{questionary.forms[form].name[lang]}</h1>
                <div className="questionary-intro">
                    {questionary.forms[form].intro[lang]?.split('\n').map((line, i) => (
                        <p key={i}>{line.trim()}</p>
                    ))}
                </div>
            </div>

            {/* Display all pages sequentially */}
            {pages.map((page, pageIndex) => (
                <div key={pageIndex} className="question-page">
                    <QuestionaryPage
                        lang={lang}
                        page={page}
                        answersState={answersState}
                        questionary={questionary}
                        extraLanguages={extraLanguages}
                        showCodes={true}
                    />
                    {pageIndex < pages.length - 1 && <hr className="page-separator" />}
                </div>
            ))}
        </div>
    )
}
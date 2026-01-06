import { useState } from "react"
import { Table } from 'react-bootstrap'
import { assert } from '@/lib/assert'

import { IStats, IQuestionStat} from '@/pages/api/graphql/resolvers/stats'
import questionary, { trans, IReportBlockElement, IReportQuestionElement } from '@/lib/questionary'
import { IReportElement } from '@/lib/questionary'
import Error from '@/components/Error'
import { useTrans } from "@/lib/trans"
import State from "@/lib/State"

import ReportTitle from "./ReportTitle"
import Item from "./Item"
import { ListClasses } from "./StatsFilter"
import PreferredPie from "./PreferredPie"
import GraphChooseLanguageQuestion from "./GraphChooseLanguageQuestion"
import TableChooseLanguageQuestion from "./TableChooseLanguageQuestion"
import GraphChoiceQuestion from "./GraphChoiceQuestion"
import TableChoiceQuestion from "./TableChoiceQuestion"
import GraphChooseLanguageQuestionCounts from "./GraphChooseLanguageQuestionCounts"
import TableChooseLanguageQuestionCounts from "./TableChooseLanguageQuestionCounts"
import GraphMapLanguageToCompetenceQuestion from "./GraphMapLanguageToCompetenceQuestion"
import TableMapLanguageToCompetenceQuestion from "./TableMapLanguageToCompetenceQuestion"
import TableMapLanguageToCompetence from "./TableMapLanguageToComptence"
import GraphMapLanguageToAgeQuestion from "./GraphMapLanguageToAgeQuestion"

type T = (s:string) => string

export default function ReportItem({ stats, item, t, pollIdsState}: {
    stats: IStats,
    item: IReportElement,
    t: T,
    pollIdsState: State<string[]>,
}) {
    const _ = useTrans()
    const item_title = item.title && trans(item.title, _.locale)
    switch(item.element) {
        case 'chart':
        case 'table':
            const [question, ErrorElement] = StatsQuestionOrError(stats, item)
            if (question === null) return ErrorElement // potrebbe essere null
            switch(item.element) {
                case 'chart':
                    return <ReportChart question={question} item={item} t={t}/>
                case 'table':
                    return <ReportTable question={question} item={item} t={t}/>    
            }
        case 'title':
            return <h1>{item_title || _("Risultati aggregati")}</h1>
        case 'info':
            return <ListClasses stats={stats} title={item.title ? trans(item.title,_.locale) : _("Partecipanti")} pollIdsState={pollIdsState}/>
        case 'preferred':
            return <Item title={item_title} avoidBreakInside={true}>
                <PreferredPie showTable={item.table} stats={stats.preferredLanguageCount} title={item_title}/>
            </Item>
        case 'block':
            return <ReportBlockElement item={item} stats={stats} t={t} pollIdsState={pollIdsState}/>
        default:
            return <Error>invalid report item</Error>
    }
}

function ReportBlockElement({item,stats,t,pollIdsState}:{
    item: IReportBlockElement,
    stats: IStats,
    t: T,
    pollIdsState: State<string[]>,
}) {
    const [hide, setHide] = useState<boolean>(true)
    const _ = useTrans() 

//    const elements = item.elements.map((item, i) => <ReportItem key={i} stats={stats} item={item} t={t} pollIdsState={pollIdsState} />)
    // Chiamo ReportItem come funzione per verificare se restituisce null
    const elements = item.elements.map((el, i) => {
        const result = ReportItem({ stats, item: el, t, pollIdsState });
        // Se vuoi mantenere la chiave, puoi usare cloneElement se result è un React element
        if (result && typeof result === 'object' && 'type' in result) {
            return { ...result, key: i };
        }
        return result; // può essere null
    }).filter(e => e !== null)

    if (elements.length === 0) return null

    return <div>
        <ReportTitle title={item.title[_.locale]} hide={hide} bold={item?.bold} setHide={setHide}/>
        <div className={"mb-5 " + (hide?"hideBlock":"")}>
            <div className="mb-5" style={{maxWidth: 640}}>
                {elements}
            </div>
            { !hide && <div className="noPrint" onClick={() => setHide(true)} style={{cursor: "pointer", textAlign: "right"}}><b>△</b></div>}
            <hr />
        </div>
    </div>
}

function StatsQuestionOrError(stats: IStats, item: IReportQuestionElement): [IQuestionStat|null, JSX.Element|null] {
    const _ = useTrans()
    const question = stats.questions[item.question]
    if (!question) {
        return [null, null] // non ci sono statistiche per questa domanda
    }
    if (question.type === 'error') return [null, <Error key={item.question}>
        {_("Errore:")} {question.error}
    </Error>]
    if (question.count === 0) return [null, <Error key={item.question}>
        {_("Nessuna risposta per la domanda")}
    </Error>]
    return [question, null]
}

function CompetenceLegend({title}:{
    title?: string,
}) {
    const _ = useTrans()
    const competences = questionary.competences
    return <Item avoidBreakInside={true} title={title}>
        <b>{_("Legenda")}</b>
        <br/>
        <Table  style={{fontSize: "75%"}}>
            <tbody>
                <tr style={{background: "#ced4da"}}>
                    <th>{_("abilità")}</th>
                    <td>CO<br />{_("comprensione orale")}</td>
                    <td>CS<br />{_("comprensione scritta")}</td>
                    <td>PO<br />{_("produzione orale")}</td>
                    <td>PS<br />{_("produzione scritta")}</td>
                </tr>
                <tr style={{background: "#e9ecef"}}>
                    <th>{_("competenza")}</th>
                    <td>0 {_("nulla")}</td>
                    <td>A {_("iniziale")}</td>
                    <td>B {_("intermedia")}</td>
                    <td>C {_("avanzata")}</td>
                </tr>
                <tr style={{background: "#e9ecef"}}>
                    <th>{_("valore dichiarato")}</th>
                    <td> 0-1-2</td>
                    <td> 3-4-5</td>
                    <td> 6-7</td>
                    <td> 8-9-10</td>
                </tr>
            </tbody>
        </Table>
    </Item>
}

function ReportChart({ question, item, t } : {
        question: IQuestionStat,
        item: IReportElement,
        t: T,
    }) {
    const _ = useTrans()
    const item_title = 
        (item.title && trans(item.title, _.locale)) 
        || question.question.question[_.locale]
    assert(item.element === 'chart')
    // console.log(`ReportChart: ${JSON.stringify({item, question, item_title})}`)
    switch(question.type) {
        case 'choose-language': 
            switch (item.variant) {
                case undefined:
                case 'chart':
                    return <Item avoidBreakInside={true} title={item_title}>
                        <GraphChooseLanguageQuestion item={item} stat={question} count={item?.count || "positive" } t={t}/>
                        <TableChooseLanguageQuestion stat={question} count={item?.count || "positive"} t={t}/>
                    </Item>
                case 'count':
                    return <Item avoidBreakInside={true} small={true} title={item_title || 'yyy'}>
                            <GraphChooseLanguageQuestionCounts item={item} stat={question} />
                            <TableChooseLanguageQuestionCounts item={item} stat={question} />
                    </Item>
            }
        case 'map-language-to-competence': return <Item avoidBreakBefore={true}>
                <CompetenceLegend />
                { Object.keys(questionary.languages).map(lang =>
                    <Item avoidBreakInside={true} key={lang} title={`${item_title || question.question.question.it} - ${questionary.languages[lang][_.locale] || lang}`}>
                        <GraphMapLanguageToCompetenceQuestion 
                            stat={question} 
                            title={_("Competenze linguistiche autovalutate")}
                            language={lang} />
                        <TableMapLanguageToCompetenceQuestion 
                            stat={question} 
                            language={lang} />
                    </Item>)
                }   
            </Item>
        case 'map-language-to-age': return <Item title={item_title || question.question.question.it} avoidBreakInside={true}>
                <GraphMapLanguageToAgeQuestion stat={question} t={t}/>
            </Item>
        case 'choice': return <Item title={item_title || question.question.question.it} avoidBreakInside={true}>
                <GraphChoiceQuestion stat={question} t={t} item={item}/>
                <TableChoiceQuestion stat={question} t={t} />     
            </Item>
        default: return <Item>
            <Error>
            invalid question type {question.type} 
            {} for report item {item.element}
            </Error>
        </Item>
    }
}

function ReportTable({ question, item, t} : {
    question: IQuestionStat,
    item: IReportElement,
    t: T
}) {
    assert(item.element === 'table')
    switch(question.type) {
        case 'choose-language': 
            return <Item>
                <TableChooseLanguageQuestion stat={question} count={item?.count || "questions"} t={t} />
            </Item>

        case 'map-language-to-competence':
            return <Item>
                <TableMapLanguageToCompetence stat={question} item={item} t={t}/>
            </Item>
        default:
            return <Item>
                <Error>
                    invalid question type {question.type} 
                    for report item {item.element}
                </Error>
            </Item>
    }
}


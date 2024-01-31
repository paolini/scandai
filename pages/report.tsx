import { useRef, CSSProperties, ReactNode, useState } from "react"
import { useRouter } from 'next/router'
import { useSearchParams } from "next/navigation"
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    RadialLinearScale,
    BarElement,
    ArcElement,
    PointElement,
    LineElement,
    Filler,
    Title as ChartTitle,
    Tooltip,
    Legend,
    Colors,
  } from 'chart.js';
import { Bar, Doughnut, Radar, } from "react-chartjs-2"
import ChartDataLabels from 'chartjs-plugin-datalabels'
import { Table, Button } from 'react-bootstrap'
import { useReactToPrint } from 'react-to-print'
import { assert } from '@/lib/assert'
import Link from 'next/link'

import { useStats, useProfile, useTranslation, useSchools } from '@/lib/api'
import { 
    IStats, 
    IQuestionStat,
    IChooseLanguageQuestionStat, 
    IMapLanguageToCompetenceQuestionStat, 
    IMapLanguageToAgeQuestionStat,
    IPreferredLanguageCount,
} from '@/pages/api/stats'
import questionary, { extractLevels, trans, IReportChartElement, IReportTableElement, IReportElement, IReportQuestionElement } from '@/lib/questionary'
import Page from '@/components/Page'
import Error from '@/components/Error'
import Loading from "@/components/Loading"
import { useTrans } from "@/lib/trans"
import State, { value, set } from "@/lib/State"
import { IGetTranslation } from "@/models/Translation"
import { IGetSchool } from "@/models/School"

const CHART_WIDTH = 640
const CHART_WIDTH_SMALL = 400

ChartJS.register(
    CategoryScale,
    LinearScale,
    RadialLinearScale,
    BarElement,
    ArcElement,
    PointElement,
    LineElement,
    Filler,
    ChartTitle,
    Tooltip,
    Legend,
    ChartDataLabels,
    Colors,
)

const CHART_TITLE = {
    display: true,
    font: { 
        size: 24,
    // style: 'italic',
    // family: 'Helvetica Neue'    
    },
    color: 'black',
}

const htmlTitleStyle: CSSProperties = {
    fontSize: 24, 
    textAlign: 'left',
}

const itemClass="my-4"

const itemStyle={maxWidth:CHART_WIDTH}

const getPageMargins = () => {
    const marginTop="1cm"
    const marginRight="6cm"
    const marginBottom="1cm"
    const marginLeft="2cm"
    
    return `@page { margin: ${marginTop} ${marginRight} ${marginBottom} ${marginLeft} !important; }`;
};

type T = (s:string) => string

export default function Report() {
    const user = useProfile()
    const router = useRouter()
    const form = router.query.form || "full"
    const schoolsQuery = useSchools()
    const translationQuery = useTranslation()
    const searchParams = useSearchParams()
    const schoolIdState = useState(searchParams.get('school') || '')
    const cityState = useState(searchParams.get('city')|| '')
    const _ = useTrans()

    // console.log(`Report: user: ${JSON.stringify(user)} translation: ${translationQuery.isLoading}, schools: ${schoolsQuery.isLoading})}`)

    if (Array.isArray(form)) return <Error>{_("richiesta non valida")}</Error>

    if (translationQuery.isLoading) return <><Loading/><br/>_</>
    if (schoolsQuery.isLoading) return <><Loading /><br/>__</>
    if (translationQuery.data === undefined || schoolsQuery.data === undefined) return <Error>{_("Errore caricamento")} ({`${translationQuery.error}`})</Error>
    const translations = translationQuery.data.data
    
    return <Page header={!!user}>
        <div className="container noPrint">
            <Filter schoolIdState={schoolIdState} cityState={cityState} schools={schoolsQuery.data.data}/>
        </div>
        <Stats 
            filter={{
                schoolId: value(schoolIdState),
                city: value(cityState),
            }}
            form={form} 
            translations={translations}
        />
    </Page>

}

function Stats({filter, form, translations}:{
    filter: {schoolId: string, city: string},
    form: string,
    translations: IGetTranslation,
}) {
    const user = useProfile()
    const router = useRouter()
    const _ = useTrans()
    const ref = useRef(null)
    const statsQuery = useStats({
        ...router.query,
        ...filter,
    })
    const print = useReactToPrint({
        content: () => ref.current,
    })

    if (statsQuery.isLoading) return <Loading />
    if (!statsQuery.data) return <Error>{_("Errore caricamento")} ({`${statsQuery.error}`})</Error>

    const stats = {
        ...statsQuery.data.data,
    }    

    if (stats.entriesCount === 0) return <Error>
        {_("Impossibile fare il report: nessun questionario compilato")}
    </Error>

    return <>
        {/*JSON.stringify({filter})*/}
        <div className="container noPrint">
            <Button onClick={print} style={{float:"right"}}>
                {_("stampa")}
            </Button>
            <Link className="btn btn-primary mx-1" href={`/p/fake?form=${form}`} style={{float:"right"}} target="_blank">{_("visualizza questionario")}</Link>
        </div>
        <div ref={ref}>
            <style>
                {getPageMargins()}
            </style>
            { questionary.forms[form].report.map(
                (item, i) => <ReportItem key={i} stats={stats} item={item} t={t}/>
            )}
        </div>
    </>

    /**
     * traduci i nomi delle lingue
     * @param source nome della lingua
     * @returns nome tradotto
     */
        function t(source:string) {
            const d = translations[source]
            if (!d) return source
            return d[_.locale] || source
        }    
}

function Filter({schoolIdState, cityState, schools}:{
    schoolIdState: State<string>,
    cityState: State<string>,
    schools: IGetSchool[]
}) {
    const city = value(cityState)
    const cities = Array.from(new Set(schools.map(school=>school.city))).sort()
    const selectedSchools = (city 
        ? schools.filter(school => school.city===city)
        : schools).sort((a,b) => b.pollCount-a.pollCount)
    const _ = useTrans()
    return <>
        { //JSON.stringify({schools,cities})
        }
        {_("Filtra")}: <select onChange={evt => {
            set(schoolIdState,'')
            set(cityState,evt.target.value)
        }}>
            <option value=''>{_("tutte le città")}</option>
            {cities.map(city => <option key={city} value={city}>{city}</option>)}
        </select> {}
        <select onChange={evt => set(schoolIdState,evt.target.value)}>
            <option value=''>{_("tutte le scuole")}</option>
            {selectedSchools.map(school => <option key={school._id} value={school._id}>{school.name}</option>)}
        </select>
    </>
}

function ReportItem({ stats, item, t }: {
    stats: IStats,
    item: IReportElement,
    t: T,
}) {
    const _ = useTrans()
    const item_title = item.title && trans(item.title, _.locale)
    switch(item.element) {
        case 'chart':
        case 'table':
            const [question, ErrorElement] = StatsQuestionOrError(stats, item) 
            if (question === null) return ErrorElement
            switch(item.element) {
                case 'chart':
                    return <ReportChart question={question} item={item} t={t}/>
                case 'table':
                    return <ReportTable question={question} item={item} t={t}/>    
            }
        case 'title':
            return <h1>{item_title || _("Risultati aggregati")}</h1>
        case 'info':
            return <ListClasses stats={stats} title={item.title ? trans(item.title,_.locale) : _("Partecipanti")}/>
        case 'preferred':
            if (item.table) return <PreferredTable stats={stats.preferredLanguageCount} title={item_title}/>
            else return <Item title={item_title}>
                <PreferredPie stats={stats.preferredLanguageCount} title={item_title}/>
            </Item>
        default:
            return <Error>invalid report item</Error>
    }
}

function StatsQuestionOrError(stats: IStats, item: IReportQuestionElement): [IQuestionStat|null, JSX.Element|null] {
    const _ = useTrans()
    const question = stats.questions[item.question]
    if (!question) return [null, <Error key={item.question}>
        {_("Domanda non trovata")} &lt;{item.question}&gt;
    </Error>]
    if (question.type === 'error') return [null, <Error key={item.question}>
        {_("Errore:")} {question.error}
    </Error>]
    if (question.count === 0) return [null, <Error key={item.question}>
        {_("Nessuna risposta per la domanda")}
    </Error>]
    return [question, null]
}

function Title({title}:{
    title?:string
}) {
    if (!title) return null
    return <h3 style={htmlTitleStyle}>{title}</h3>
}

function Item({title, small, children}: {
    title?: string,
    small?: boolean,
    children: ReactNode,
    }) {    
    return <div>
        <Title title={title} />
        <div className="my-4" style={{maxWidth: small ? 400 : 640}}>
        { children }
        </div>
    </div>
}

function CompetenceLegend({title}:{
    title?: string,
}) {
    const _ = useTrans()
    const competences = questionary.competences
    return <Item title={title}>
        <b>{_("Legenda")}</b>
        <br/>
        <i>{_("abilità")}:</i>
        <ul>
            {competences.map(c =>
                <li key={c.code}>{c.code}: {c[_.locale]}</li>)}                
        </ul>
    </Item>
}

function ListClasses({ stats, title }: {
    stats: IStats,
    title?: string,
}) {
    const _ = useTrans()
    const router = useRouter()
    const searchParams = useSearchParams()
    const isShort = stats.polls.length <= 5
    const [isOpen, setOpen] = useState<boolean>(isShort)

    if (!isOpen) return <Item title={title}>
        {_("classi")}: <b>{stats.polls.length}</b>, {}
        {_("partecipanti")}: <b>{stats.entriesCount}</b> {}
        <span className="noPrint">
            <Button onClick={() => setOpen(true)}>{_("espandi")}</Button>
        </span>
    </Item>

    return <Item title={title}>
        { !isShort && 
        <div className="noPrint">
            <Button className="noPrint" onClick={() => setOpen(false)}>{_("nascondi")}</Button>
        </div>
        }
        <Table className="table" hover>
            <thead>
                <tr>
                    <th>{_("scuola")}</th>
                    <th>{_("città")}</th>
                    <th>{_("classe")}</th>
                    <th>{_("partecipanti")}</th>
                </tr>
            </thead>
            <tbody>
        { 
            stats.polls.map(c => 
            <tr key={c._id.toString()} onClick={() => router.push(composeURL(c._id))}>
                <td>
                    {c?.school?.name} 
                </td>
                <td>
                    {c?.school?.city}
                </td>
                <td>
                     {c?.year}&nbsp;{c.class}
                </td>
                <td>
                {c?.entriesCount}
                </td>
            </tr>)
        }   
        </tbody>
        <thead>
        {   stats.polls.length > 1 &&
            <tr>
                <th colSpan={2}>{_("totale")}</th>
                <th>{stats.polls.length}</th>
                <th>{stats.entriesCount}</th>
            </tr>
        }
        </thead>
        </Table>
    </Item>

    function composeURL(poll: string) {
        const query = new URLSearchParams(searchParams.toString())
        query.set('poll', poll)
        return `${window.location.origin}${window.location.pathname}?${query.toString()}`
    }
}

function questionary_language(k: string, locale: string) {
    const s = questionary.languages[k]
    return (s ? s[locale] : k) || k
}

function PreferredPie({ stats, title} : {
    stats: IPreferredLanguageCount,
    title?: string,
}) {
    const _ = useTrans()
    const total = stats._total
    let items = Object.entries(stats).filter(([k ,v]) => k!=='_total')
    let sum = items.reduce((n, [k,v]) => n+v, 0)
    if (sum < total) items.push(['', total-sum])
    return <Item>
        <Doughnut
            options={{
                responsive: true,
                plugins: {
                    legend: {
                        display: true,
                        position: 'top' as const,
                    },
                    datalabels: {
                        anchor: 'center',
                        formatter: (value,context) => `${Math.round(value*100/total)}%`,
                    },
//                    title: {
//                        ...CHART_TITLE,
//                        text: title,
//                    },
                },
            }} 
            data={{
                labels: items.map(([k,v]) => questionary_language(k,_.locale) || undefined),
                datasets: [
                    {
                    data: items.map(([k,v])=>v),
                // backgroundColor: 'orange',
                    },
                ],
            }} 
        />
    </Item>
}

function PreferredTable({ stats, title} : {
    stats: IPreferredLanguageCount,
    title?: string,
}) {
    const _ = useTrans()
    const total = stats._total
    let items = Object.entries(stats).filter(([k ,v]) => k!=='_total')
    let sum = items.reduce((n, [k,v]) => n+v, 0)
    if (sum < total) items.push(['', total-sum])
    return <Item title={title}>
        <Table>
            <thead>
                <tr>
                    <th></th>
                    <th>{_("conteggio")}</th>
                    <th>{_("percentuale")}</th>
                </tr>
            </thead>
            <tbody>
                {items.map(([k,v]) => 
                    <tr key={k}>
                        <th>{questionary_language(k,_.locale) || _("non specificato")}</th>
                        <td>{v}</td>
                        <td>{Math.round(v*100/total)}%</td>
                    </tr>
                )}
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
    switch(question.type) {
        case 'choose-language': 
            switch (item.variant) {
                case undefined:
                case 'chart':
                    return <Item title={item_title}>
                        <GraphChooseLanguageQuestion item={item} stat={question} count={item?.count || "questions" } t={t}/>
                        <TableChooseLanguageQuestion stat={question} count={item?.count || "questions"} t={t}/>
                    </Item>
                case 'count':
                    return <Item small={true} title={item_title || 'yyy'}>
                            <GraphChooseLanguageQuestionCounts item={item} stat={question} />
                            <TableChooseLanguageQuestionCounts item={item} stat={question} />
                    </Item>
            }
        case 'map-language-to-competence': return <Item>
                <CompetenceLegend />
                { Object.keys(questionary.languages).map(lang =>
                    <Item key={lang} title={`${item_title || question.question.question.it} - ${questionary.languages[lang][_.locale] || lang}`}>
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
        case 'map-language-to-age': return <Item title={item_title || question.question.question.it}>
                <GraphMapLanguageToAgeQuestion stat={question} t={t}/>
            </Item>
        default: return <Item>
            <Error>
            invalid question type {question.type} 
            for report item {item.element}
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

function GraphChooseLanguageQuestion({item, stat, count, t} : {
        item: IReportElement,
        stat: IChooseLanguageQuestionStat,
        count: "answers" | "questions",
        t: T,
    }) {
    const _ = useTrans()
    const languages = questionary.languages
    if (!stat.answers) return <div>invalid answers</div>
    assert(item.element === 'chart')
    const total = count === 'answers' ? stat.countAnswers : stat.count 
    return <Bar 
        options={{
            responsive: true,
            plugins: {
                legend: {
                    display: false,
                    position: 'top' as const,
                },
                datalabels: {
                    anchor: 'center',
                    align: 'center',
                    formatter: value => `${Math.round(value*100)}%`
                },
//                title: {
//                    ...CHART_TITLE,
//                    text: item_title || stat.question.question.it,
//                },
            },
            scales: {
                y: {
                    min: 0,
                    max: 1,
                    ticks: {
                        precision: 1,
                        format: {
                            style: 'percent',
                        },
                        callback: value => typeof(value)==='number'?`${Math.round(value*100)}%`:'???',
                    },
                }
            }
        }} 
        data={{
            labels: Object.keys(stat.answers).map(id => id===''?_("altre"):t(id)),
            datasets: [
                {
                data: Object.entries(stat.answers).map(([key, val])=> (total ? val / total : 0) ),
                // backgroundColor: 'orange',
                },
            ],
            }} 
    />
}

function TableChooseLanguageQuestion({stat, count, t}: {
    stat: IChooseLanguageQuestionStat,
    count: "answers" | "questions" | "both",
    t: T,
}) {
    const _ = useTrans()
    const languages = questionary.languages
    if (!stat.answers) return <div>invalid answers</div>

    return <Table>
        <thead>
            <tr>
                <td></td>
                    {Object.keys(stat.answers).map(id => 
                <td key={id}>
                    {t(id)}
                </td>)}
            </tr>
        </thead>
        <tbody>
            <tr>
                <th>{_("conteggio")}</th>
                    {Object.entries(stat.answers).map(([key, val])=>
                <td key={key}>
                    {val}
                </td>)}
            </tr>
            { (count === 'answers' || count === 'both' ) &&
            <tr>
                <th>{count === 'both' ? _("per lingua") : _("percentuale") }</th>
                    {Object.entries(stat.answers).map(([key, val])=>
                <td key={key}>
                    { stat.countAnswers && `${Math.round(val*100/stat.countAnswers)}%` }
                </td>)}
            </tr>
            }
            { (count === 'questions' || count === 'both') &&
            <tr>
                <th>{count === 'both' ? _("per persona") : _("percentuale") }</th>
                    {Object.entries(stat.answers).map(([key, val])=>
                <td key={key}>
                    {stat.count && `${Math.round(val*100/stat.count)}%`}
                </td>)}
            </tr>}
        </tbody>
    </Table>
}

function GraphChooseLanguageQuestionCounts({item,stat}: {
        item: IReportElement,
        stat: IChooseLanguageQuestionStat}) {
    const _ = useTrans()
//    const item_title = item.title && trans(item.title, _.locale)

    function nLanguages(count: number) {
        if (count===0) return _("Nessuna lingua")
        if (count===1) return _("Una lingua")
        return _("% lingue", count)
    }
    assert(stat.counts)
    assert(item.element === 'chart')
    const data = stat.counts
        .map((v,i)=>[v,i])
        .filter(([v,i])=>v>0)

    const total = data.reduce((acc, [v,i])=>acc+v, 0)

    return <Doughnut
        options={{
            responsive: true,
            plugins: {
                legend: {
                    display: false,
                    position: 'top' as const,
                },
                datalabels: {
                    anchor: 'center',
                    formatter: (value,context) => value>0.01*total ? `${Math.round(value*100/total)}% ${nLanguages(data[context.dataIndex][1])}`:null,
                },
//                title: {
//                    ...CHART_TITLE,
//                    text: item_title || stat.question.question.it,
//                },
            },
        }} 
        data={{
            labels: data.map(([v,i])=>nLanguages(i)),
            datasets: [
                {
                data: data.map(([v,i])=>v),
               // backgroundColor: 'orange',
                },
            ],
        }} 
    />
}

function TableChooseLanguageQuestionCounts({item,stat}: {
    item: IReportElement,
    stat: IChooseLanguageQuestionStat}) {
    const _ = useTrans()
    //    const item_title = item.title && trans(item.title, _.locale)

    function nLanguages(count: number) {
        if (count===0) return _("Nessuna lingua")
        if (count===1) return _("Una lingua")
        return _("% lingue", count)
    }
    assert(stat.counts)
    assert(item.element === 'chart')
    const data = stat.counts
        .map((v,i)=>[v,i])
        .filter(([v,i])=>v>0)

    const total = data.reduce((acc, [v,i])=>acc+v, 0)

    return <Table>
        <thead>
            <tr>
                <td></td>
                { data.map(([v,i])=><th key={i}>{nLanguages(i)}</th>) }
            </tr>
        </thead>    
        <tbody>
            <tr>
                <th>{_("conteggio")}</th>
                { data.map(([v,i])=><td key={i}>{v}</td>) }
            </tr>
            <tr>
                <th>{_("percentuale")}</th>
                { data.map(([v,i])=><td key={i}>{Math.round(v*100/total)}%</td>) }
            </tr>
        </tbody>        
    </Table>

    return <Doughnut
        options={{
            responsive: true,
            plugins: {
                legend: {
                    display: false,
                    position: 'top' as const,
                },
                datalabels: {
                    anchor: 'center',
                    formatter: (value,context) => value>0.01*total ? `${Math.round(value*100/total)}% ${nLanguages(data[context.dataIndex][1])}`:null,
                },
    //                title: {
    //                    ...CHART_TITLE,
    //                    text: item_title || stat.question.question.it,
    //                },
            },
        }} 
        data={{
            labels: data.map(([v,i])=>nLanguages(i)),
            datasets: [
                {
                data: data.map(([v,i])=>v),
            // backgroundColor: 'orange',
                },
            ],
        }} 
    />
}

function GraphMapLanguageToCompetenceQuestion({stat, title, language}
    : {
        stat: IMapLanguageToCompetenceQuestionStat,
        language: string,
        title?: string,
    }) {
    // console.log(`GraphMapLanguageToCompetenceQuestion: ${JSON.stringify({stat, language})}`)
    const localizedLanguage = questionary.languages[language].it || language
    const stats = stat.answers[localizedLanguage]
    const levels = extractLevels(questionary)
    // const chart_title = `${title || stat.question.question.it} - ${localizedLanguage}`
    if (!stats) return <div>No stats for language {language}</div>

    function computeDataset(stat: {[key: string]: number}) {
        const total = Object.values(stat).reduce((sum,x) => sum+x,0)
        if (total === 0) return levels.map(level => 0)
        return levels.map(level => (stat[level] || 0) / total)
    }

    return <Bar 
        options={{
            responsive: true,
            plugins: {
                legend: {
                    display: true,
                    position: 'top' as const,
                },
                datalabels: {
                    anchor: 'end',
                    align: 'start',
                    formatter: value => (value>0?`${Math.round(value*100)}%`:null),
                },
//                title: {
//                    ...CHART_TITLE,
//                    text: char_title,
//                },
            },
            scales: {
                y: {
                    min: 0,
                    max: 1,
                    ticks: {
                        precision: 1,
                        format: {
                            style: 'percent',
                        },
                        callback: value => typeof(value)==='number'?`${Math.round(value*100)}%`:'???',
                    },
                }
            }
        }} 
        data={{
            labels: levels,
            datasets: Object.entries(stats.competence).map(([competence, x]) => 
                ({
                    data: computeDataset(x.level),
                    label: competence,
                })) 
        }}
    />
}

function TableMapLanguageToCompetenceQuestion({stat, title, language}
    : {
        stat: IMapLanguageToCompetenceQuestionStat,
        language: string,
        title?: string,
    }) {
    const _ = useTrans()
    const localizedLanguage = questionary.languages[language].it || language
    const stats = stat.answers[localizedLanguage]
    const levels = extractLevels(questionary)
    if (!stats) return <div>{_("No stats for language %", language)}</div>

    function computeDataset(stat: {[key: string]: number}) {
        const total = Object.values(stat).reduce((sum,x) => sum+x,0)
        if (total === 0) return levels.map(level => 0)
        return levels.map(level => (stat[level] || 0) / total)
    }

    return <Table>
        <thead>
            <tr>
                <th></th>
                {levels.map(level => <th key={level}>{level}</th>)}
            </tr>
        </thead>
        <tbody>
            {
                Object.entries(stats.competence).map(([competence, x]) => 
                    <tr key={competence}>
                        <th>{competence}</th>
                        {computeDataset(x.level).map((n,i)=>
                            <td key={i}>{Math.round(n*100)}%</td>)}
                    </tr>
                )
            }
        </tbody>
    </Table>
}

function TableMapLanguageToCompetence({stat, item, t} : {
        stat: IMapLanguageToCompetenceQuestionStat,
        item: IReportTableElement,
        t: T,
    }) {
    const _ = useTrans()
    const item_title = item.title && trans(item.title, _.locale)
    const competences = questionary.competences.map(c => c.code)
    const entries = Object.entries(stat.answers).slice(0,10)
    return <Item>
        { item.title && <h3 style={htmlTitleStyle}>{item_title}</h3> }
        <p>{_("Media delle competenze autovalutate sul campione che non dichiara competenze nulle")}</p>
        <Table>
            <thead>
                <tr>
                    <th></th>
                    <th>{_("campione")}</th>
                    {competences.map(c => <th key={c}>{c}</th>)}
                </tr>
            </thead>
            <tbody>
                {
                    Object.entries(stat.answers)
                        .filter(([lang, s]) => s.countValid > 0.005*stat.count)
                        .map(([lang, s]) => 
                        <tr key={lang}>
                            <th>{t(lang)}</th>
                            <td>{stat.count ? Math.round(100*s.countValid / stat.count) : "??"}%</td>
                            {Object.entries(s.competence).map(([c,cstat])=>
                                <td key={c}>{s.countValid?Math.round(100*cstat.sum/s.countValid)/100:_("n.a.")}</td>)}
                        </tr>
                    )
                }
            </tbody>
        </Table>
        <Radar
          data = {{
            labels: questionary.competences.map(c => c.code),
            datasets: entries.map(([lang, s]) => 
                ({
                    label: t(lang),
                    data: Object.entries(s.competence).map(([c,n])=> (stat.count?n.sum/stat.count:0)),
                    fill: false,
                    pointRadius: 3,
                }))
            }}
          options = {{
            elements: {
                line: {
                    borderWidth: 3
                }
            },
            plugins: {
                  datalabels: {
                      display: false
                      },
                  },
            }}
        />
    </Item>
}

function GraphMapLanguageToAgeQuestion({stat, t} : {
        stat: IMapLanguageToAgeQuestionStat,
        t: T,
    }) {
    const _ = useTrans()
    const stats = stat.answers
    const ages = questionary.ages.map(x => x.code)
//    const title = _("Età di apprendimento lingua")
    const languages = Object.keys(stat.answers)

    const datasets = ages.map(age => 
        ({
            data: languages.map(lang => (stat.count ? (stats[lang]?.[age] || 0)/stat.count:0)),
            label: age || _("mai"),
        }))

    const labels = languages.map(lang => t(lang))

    return <Bar
        options={{
            responsive: true,
            plugins: {
                legend: {
                    display: true,
                    position: 'top' as const,
                },
                datalabels: {
                    display: false,
                    anchor: 'center',
                    align: 'top',
                    formatter: value => (value>0?`${Math.round(value*100)}%`:null),
                },
//                title: {
//                    ...CHART_TITLE,
//                    text: `${title || stat.question.question.it}`,
//                },
            },
            scales: {
                y: {
                    min: 0,
                    max: 1,
                    ticks: {
                        precision: 1,
                        format: {
                            style: 'percent',
                        },
                        callback: value => typeof(value)==='number'?`${Math.round(value*100)}%`:'???',
                    },
                }
            }
        }} 
        data={{
            labels,
            datasets
        }}
    />
}
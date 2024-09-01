import { useRef, CSSProperties, ReactNode, useState, ReactElement } from "react"
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
import { formatDate } from '@/lib/utils'

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
import State, { value, set, update } from "@/lib/State"
import { IGetTranslation } from "@/models/Translation"
import { IGetSchool } from "@/models/School"
import { IGetUser } from "@/models/User"

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

type Filter = {
    schoolId: string,
    city: string,
    form: string,
}

function requireSingle(value: undefined|string|string[], default_value: string=''):string {
    if (value === undefined) return default_value
    if (Array.isArray(value)) return default_value
    return value
}

function requireArray(value: undefined|string|string[], default_value: string[] = []):string[] {
    if (value === undefined) return default_value
    if (Array.isArray(value)) return value
    return [value]
}

export default function Report() {
    const user = useProfile()
    const router = useRouter()
    const year = requireSingle(router.query.year)
    const report = requireSingle(router.query.report, "full")
    const pollIds = requireArray(router.query.poll)
    const schoolId = requireSingle(router.query.school_id)
    const schoolSecret = requireSingle(router.query.schoolSecret)
    const adminSecret = requireSingle(router.query.adminSecret)
    const showFilter = !(router.query.poll || router.query.school_id)

    if (!router.isReady) return <Loading />
    return <ReportInner 
        showFilter={showFilter}
        user={user} 
        year={year} 
        report={report} 
        pollIds={pollIds} 
        schoolId={schoolId}
        schoolSecret={schoolSecret}
        adminSecret={adminSecret}
    />
}

export function ReportInner({showFilter, user, year, report, pollIds, schoolId, schoolSecret, adminSecret}:{
    showFilter: boolean,
    user: IGetUser|undefined,
    year: string,
    report: string,
    pollIds: string[],
    schoolId: string,
    schoolSecret: string,
    adminSecret: string,
}) {
    const translationQuery = useTranslation()
    const _ = useTrans()
    const yearState = useState(year)
    const schoolsQuery = useSchools(value(yearState), showFilter)
    const pollIdsState = useState<string[]>(pollIds)

    // console.log(`Report: ${JSON.stringify({user, translation: translationQuery.isLoading, schools: schoolsQuery.isLoading, trans: [_]})}`)

    if (translationQuery.isLoading) return <><Loading/><br/>_</>
    if (translationQuery.data === undefined || schoolsQuery.data === undefined) return <Error>{_("Errore caricamento")} ({`${translationQuery.error}`})</Error>
    const translations = translationQuery.data.data
    if (schoolsQuery.isLoading) return <><Loading /><br/>_ _</>
    
    return <Page header={!!user}>
        <div className="container noPrint">
        </div>
        <Stats 
            showFilter={showFilter}
            pollIdsState={pollIdsState}
            report={report} 
            schoolId={schoolId}
            schoolSecret={schoolSecret}
            adminSecret={adminSecret}
            translations={translations}
            schools={schoolsQuery.data.data}
            yearState={yearState}
        />
    </Page>

}

function Stats({showFilter, report, schoolId, schoolSecret, adminSecret, translations, pollIdsState, schools, yearState}:{
    showFilter: boolean,
    report: string,
    schoolId: string,
    schoolSecret: string,
    adminSecret: string,
    translations: IGetTranslation,
    pollIdsState: State<string[]>,
    schools: IGetSchool[],
    yearState: State<string>,
}) {
    const schoolIdState = useState(schoolId)
    const cityState = useState('')
    const formState = useState('')
    const classState = useState('')
    const _ = useTrans()
    const ref = useRef(null)
    const pollIds = value(pollIdsState)
    const pollQuery = pollIds.length==0 ? {} : {poll: pollIds.join(',')}
    const statsQuery = useStats({
        schoolId: value(schoolIdState),
        schoolSecret: schoolSecret,
        adminSecret: adminSecret,
        city: value(cityState),
        form: value(formState),
        class: value(classState),
        year: value(yearState),
        ...pollQuery,
    })
    const print = useReactToPrint({
        content: () => ref.current,
    })
    const form="full" // questionario visualizzato dal pulsante "visualizza questionario"

    if (statsQuery.isLoading) return <Loading />
    if (!statsQuery.data) return <Error>{_("Errore caricamento")} ({`${statsQuery.error}`})</Error>

    const stats = {
        ...statsQuery.data.data,
    }    

    const classes = true ? ['1','2','3','4','5'] : stats.polls
        .map(p => p.year)
        .filter((v,i,a) => a.indexOf(v)===i)
        .filter(c=> c)
        .sort()

    return <>
        { /*JSON.stringify({stats_schools: stats.schools})*/ }
        { showFilter && <div style={{
            paddingBottom:"1em",
            paddingTop:"1em",
        }}>
            <Filter 
                schoolIdState={schoolIdState} 
                cityState={cityState} 
                formState={formState} 
                classState={classState}
                yearState={yearState}
                schools={schools}
                classes={classes}
                /></div> }
        <div className="container noPrint">
            <Button onClick={print} style={{float:"right"}}>
                {_("stampa")}
            </Button>
            <Link className="btn btn-primary mx-1" href={`/p/fake?form=${form}`} style={{float:"right"}} target="_blank">
                {_("visualizza questionario")}
            </Link>
        </div>
        { stats.entriesCount === 0 
        ? <Error>{_("Impossibile fare il report: nessun questionario compilato")}</Error>
        : <div ref={ref}>
            <style>
                {getPageMargins()}
            </style>
            { questionary.reports[report].elements.map(
                (item, i) => <ReportItem key={i} stats={stats} item={item} t={t} pollIdsState={pollIdsState}/>
            )}
        </div> }
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

function Filter({schoolIdState, cityState, formState, classState, yearState, schools, classes}:{
    schoolIdState: State<string>,
    cityState: State<string>,
    formState: State<string>,
    classState: State<string>,
    yearState: State<string>,
    schools: IGetSchool[],
    classes: string[],
}) {
    const city = value(cityState)
    const map_city_fu = Object.fromEntries(schools.map(school => [school.city, school.city_fu]))
    const citiesInfo = Object.keys(map_city_fu).map(city => {
        let pollCount = 0
        for (const school of schools.filter(school => school.city===city)) {
            pollCount += school.pollCount
        }
        return {pollCount, city}
    }).sort((a,b) => b.pollCount-a.pollCount)
    const selectedSchools = (city 
        ? schools.filter(school => school.city===city)
        : schools).sort((a,b) => b.pollCount-a.pollCount)
    const _ = useTrans()
    return <>
        { /*JSON.stringify({schools,citiesInfo})*/ }
        {_("Filtra")}: {}
        <select value={value(yearState)} onChange={evt => set(yearState,evt.target.value)}>
            <option value=''>{_("tutti gli anni")}</option>
            {[2023,2024].map(y => <option key={y} value={y}>{y}-{y+1}</option>)}
        </select> {}
        <select value={value(cityState)} onChange={evt => {
            set(schoolIdState,'')
            set(cityState,evt.target.value)
        }}>
            <option value=''>{_("tutte le città")}</option>
            {citiesInfo.map(info => <option key={info.city} value={info.city}>{_.locale === 'fu' ? (map_city_fu[info.city] || info.city) : info.city}</option>)}
        </select> {}
        <select value={value(schoolIdState)} onChange={evt => set(schoolIdState,evt.target.value)}>
            <option value=''>{_("tutte le scuole")}</option>
            {selectedSchools.map(school => <option key={school._id} value={school._id}>{school.name}</option>)}
        </select> {}
        <select value={value(classState)} onChange={evt => set(classState,evt.target.value)}>
            <option value=''>{_("tutte le classi")}</option>
            {classes.map(c => <option key={c} value={c}>{{
                '1': _("classi prime"), 
                '2': _("classi seconde"), 
                '3': _("classi terze"),
                '4': _("classi quarte"),
                '5': _("classi quinte") }[c]}</option>)}
        </select> {}
        <select value={value(formState)} onChange={evt => set(formState,evt.target.value)}>
            <option value=''>{_("tutti i questionari")}</option>
            {Object.keys(questionary.forms).map(form => <option key={form} value={form}>{questionary.forms[form].namePlural[_.locale||'it']}</option>)}
        </select> {}
    </>
}

function ReportItem({ stats, item, t, pollIdsState}: {
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
            return <ListClasses stats={stats} title={item.title ? trans(item.title,_.locale) : _("Partecipanti")} pollIdsState={pollIdsState}/>
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
    if (!question) {
        return [null, <></>] // non ci sono statistiche per questa domanda
    }
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
        <div className="mb-5" style={{maxWidth: small ? 400 : 640}}>
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

function ListFilters({stats}:{
    stats: IStats,
}) {
    const _ = useTrans()
    const filters = stats?.filters
    const entries: [string, ReactElement][] = []
    if (!filters) return null

    if (filters.year) entries.push(["year", <>{_("anno scolastico")}: <b>{filters.year}/{filters.year + 1}</b></>])
    if (filters.city) entries.push(["city", <>{_("città")}: <b>{filters.city}</b></>])
    if (filters.school) entries.push(["school", <>{_("scuola")}: <b>{stats.schools.filter(school => school._id === filters.school)[0].name}</b></>])
    if (filters.class) entries.push(["class", <>{_("classe")}: <b>{filters.class}</b></>])
    if (filters.form) entries.push(["form", <>{_("fotografia")}: <b>{questionary.forms[filters.form].name[_.locale]}</b></>])
    return <div className="indent">
        {entries.map(([key,elem],i) => <div key={key}>{elem}</div>)}
    </div>
}

function ListClasses({ stats, title, pollIdsState}: {
    stats: IStats,
    title?: string,
    pollIdsState: State<string[]>,
}) {
    const _ = useTrans()
    const router = useRouter()
    const searchParams = useSearchParams()
    const isShort = stats.polls.length <= 5
    const isLong = stats.polls.length > 20
    const [isOpen, setOpen] = useState<boolean>(isShort)
    const selectedPollIdsState = useState<string[]>([])

    if (!isOpen) return <Item title={title}>
        <ListFilters stats={stats}/>
        <br />
        {_("classi")}: <b>{stats.polls.length}</b>, {}
        {_("partecipanti")}: <b>{stats.entriesCount}</b> {}
        <span className="noPrint">
            <Button onClick={() => setOpen(true)}>
                {_("espandi")}
            </Button>
        </span>
    </Item>

    return <Item title={title}>
        <ListFilters stats={stats}/>
        <div className="noPrint">
        { !isShort && 
            <Button className="noPrint" onClick={() => setOpen(false)}>
                {_("nascondi")}
            </Button>
        }
        <FilterButtons/>
        </div>
        <Table className="table" hover>
            <thead>
                <tr>
                    <th>{_("scuola")}</th>
                    <th>{_("città")}</th>
                    <th>{_("classe")}</th>
                    <th>{_("partecipanti")}</th>
                    <th>{_("variante")}</th>
                    <th>{_("data")}</th>
                </tr>
            </thead>
            <tbody>
        { 
            stats.polls.map(c => {
                const selected = value(selectedPollIdsState).includes(c._id)?"bg-warning":""
                return <tr key={c._id.toString()} onClick={() => true ? toggle(c._id) : router.push(composeURL(c._id))}>
                    <td className={selected}>
                        {c?.school?.name} 
                    </td>
                    <td className={selected}>
                        {(_.locale==='fu' && c?.school?.city_fu) || c?.school?.city}
                    </td>
                    <td className={selected}>
                        {c?.year}&nbsp;{c.class}
                    </td>
                    <td className={selected}>
                        {c?.entriesCount}
                    </td>
                    <td className={selected}>
                        { questionary.forms[c?.form]?.name[_.locale] }
                    </td>
                    <td className={selected}>
                        {formatDate(c?.date)}
                    </td>
                </tr>})
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
        { isLong &&
        <div className="noPrint">
            <FilterButtons/>
        </div>
        }
    </Item>

    function FilterButtons() {
        return <>
            { value(selectedPollIdsState).length > 0 &&
                <Button className="noPrint mx-1" onClick={() => {set(selectedPollIdsState,[]);set(pollIdsState,[...value(selectedPollIdsState)])}}>
                    {_("filtra selezionate")}
                </Button>
            } 
            { value(pollIdsState).length > 0 &&
                <Button className="noPrint mx-1" onClick={() => set(pollIdsState,[])}>
                    {_("annulla filtro")}
                </Button>
            }
        </> 
    }

    function composeURL(poll: string) {
        const query = new URLSearchParams(searchParams.toString())
        query.set('poll', poll)
        return `${window.location.origin}${window.location.pathname}?${query.toString()}`
    }

    function toggle(poll_id: string) {
        update(selectedPollIdsState, selected => {
            if (selected.includes(poll_id)) return selected.filter(x => x !== poll_id)
            return [...selected, poll_id]
        })
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
                        <GraphChooseLanguageQuestion item={item} stat={question} count={item?.count || "positive" } t={t}/>
                        <TableChooseLanguageQuestion stat={question} count={item?.count || "positive"} t={t}/>
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
        count: "answers" | "questions" | "positive",
        t: T,
    }) {
    const _ = useTrans()
    const languages = questionary.languages
    if (!stat.answers) return <div>invalid answers</div>
    assert(item.element === 'chart')
    const total = count === 'answers' ? stat.countAnswers : count === 'positive' ? stat.countPositive : stat.count
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
    count: "answers" | "questions" | "positive" | "both",
    t: T,
}) {
    const _ = useTrans()
    const languages = questionary.languages
    if (!stat.answers) return <div>invalid answers</div>

    return <><Table className="my-0">
        <thead>
            <tr>
                <td></td>
                    {Object.keys(stat.answers).map(id => 
                <td key={id}>
                    {id===''?_("altre"):t(id)}
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
            { (count === 'positive' || count === 'both') &&
            <tr>
                <th>{count === 'both' ? _("su positivi") : _("percentuale") }</th>
                    {Object.entries(stat.answers).map(([key, val])=>
                <td key={key}>
                    {stat.count && `${Math.round(val*100/stat.countPositive)}%`}
                </td>)}
            </tr>}
        </tbody>
    </Table>
    <p className="mx-2" style={{fontSize:"smaller"}}>
        {_("questionari")}: {stat.count}, {}
        {_("non risponde")}: {stat.count-stat.countPositive}, {}
        {_("risponde")}: {stat.countPositive}, {}
        {_("numero risposte")}: {stat.countAnswers}
    </p>
    </>
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
    const _ = useTrans()
    // const chart_title = `${title || stat.question.question.it} - ${localizedLanguage}`
    if (!stats) return <div>{_("No stats for language %", language)}</div>

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
        if (total === 0) return levels.map(level => ({ratio: 0, count: 0}))
        return levels.map(level => ({ratio: (stat[level] || 0) / total, count: stat[level] || 0}))
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
                        {computeDataset(x.level).map(({ratio, count},i)=>
                            <td key={i}>
                                {Math.round(ratio*100)}%
                                {} <span style={{fontSize: "70%"}}>({count})</span>
                            </td>)}
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
                colors: {
                    forceOverride: true,
                }
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
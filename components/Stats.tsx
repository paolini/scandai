import { useRef, useState } from "react"
import { useRouter } from 'next/router'
import { useQuery, gql } from '@apollo/client'
import { Button } from 'react-bootstrap'
import { useReactToPrint } from 'react-to-print'
import Link from 'next/link'

import { IStats } from '@/pages/api/graphql/resolvers/stats'
import questionary from '@/lib/questionary'
import Error from '@/components/Error'
import Loading from "@/components/Loading"
import { useTrans } from "@/lib/trans"
import State, { value } from "@/lib/State"
import { School, Translation } from "@/generated/graphql"
import StatsFilter from "./StatsFilter"
import ReportItem from "./ReportItem"
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
import ChartDataLabels from 'chartjs-plugin-datalabels'

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

const getPageMargins = () => {
    const marginTop="1cm"
    const marginRight="6cm"
    const marginBottom="1cm"
    const marginLeft="2cm"
    
    return `@page { margin: ${marginTop} ${marginRight} ${marginBottom} ${marginLeft} !important; }`;
};

const StatsQuery = gql`
    query Stats($schoolId: ObjectId, $schoolSecret: String, $adminSecret: String, 
        $city: String, $form: String, $class: String, $year: Int, $poll: ObjectId, $polls: [ObjectId]) {
        stats(schoolId: $schoolId, schoolSecret: $schoolSecret, adminSecret: $adminSecret, city: $city, form: $form, class: $class, year: $year, poll: $poll, polls: $polls)
        }   
`

export default function Stats({showFilter, report, schoolId, schoolSecret, adminSecret, translations, pollIdsState, schools, yearState}:{
    showFilter: string[],
    report: string,
    schoolId: string,
    schoolSecret: string,
    adminSecret: string,
    translations: Translation[],
    pollIdsState: State<string[]>,
    schools: School[],
    yearState: State<string>,
}) {
    const schoolIdState = useState(schoolId)
    const router = useRouter()
    const cityState = useState(typeof router.query.city === 'string' ? router.query.city : '')
    const formState = useState(typeof router.query.form === 'string' ? router.query.form : '')
    const classState = useState(typeof router.query.class === 'string' ? router.query.class : '')
    const _ = useTrans()
    const ref = useRef(null)
    const pollIds = value(pollIdsState)
    const statsQuery = useQuery(StatsQuery, {variables: {
        schoolId:  value(schoolIdState) || null,
        schoolSecret,
        adminSecret,
        city: value(cityState),
        form: value(formState),
        class: value(classState),
        year: value(yearState) ? parseInt(value(yearState)) : null,
        polls: pollIds.length>0 ? pollIds : null, // empty means all
    }})
    const [downloadingPDF, setDownloadingPDF] = useState<boolean>(false)
    const print = useReactToPrint({
        content: () => ref.current,
    })
    const form="full" // questionario visualizzato dal pulsante "visualizza questionario"

    if (statsQuery.loading) return <Loading />
    if (!statsQuery.data) return <Error>{_("Errore caricamento")} ({`${statsQuery.error}`} [sq])</Error>

    const stats = {
        ...statsQuery.data.stats,
    } as IStats

    // console.log(`Stats: ${JSON.stringify({stats, showFilter, schoolId, schoolSecret, adminSecret, translations})}`)

    const classes = true ? ['1','2','3','4','5'] : stats.polls
        .map(p => p.year)
        .filter((v,i,a) => a.indexOf(v)===i)
        .filter(c=> c)
        .sort()

    const translationsDict = Object.fromEntries(translations.map(t => [t.source, t.map]))

    return <>
        { /*JSON.stringify({stats_schools: stats.schools})*/ }
        { showFilter.length>0 && <div className="noPrint" style={{
            paddingBottom:"1em",
            paddingTop:"1em",
        }}>
            <StatsFilter 
                fields={showFilter}
                schoolIdState={schoolIdState} 
                cityState={cityState} 
                formState={formState} 
                classState={classState}
                yearState={yearState}
                schools={schools}
                classes={classes}
                /></div> }
        <div className="container noPrint">
            {/* <Button onClick={print} style={{float:"right"}}>
                {_("stampa")}
            </Button> */}
            <Button onClick={downloadPDF} style={{float:"right"}} disabled={downloadingPDF}>
                {_("stampa report")}
            </Button>
            <Button onClick={downloadQuestionaryPDF} style={{float:"right", marginRight: "10px"}} disabled={downloadingPDF}>
                {_("stampa questionario")}
            </Button>
            <Link className="btn btn-primary mx-1" href={`/p/fake?form=${form}`} style={{float:"right"}} target="_blank">
                {_("visualizza questionario")}
            </Link>
        </div>
        {downloadingPDF && <Loading />}
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
        const d = translationsDict[source]
        if (!d) return source
        return d[_.locale] || source
    }    

    function downloadPDF() {
        setDownloadingPDF(true);
        const pathWithQuery = window.location.pathname + window.location.search
        fetch(`/api/pdf?path=${encodeURIComponent(pathWithQuery)}`)
            .then(async res => {
                if (!res.ok) {
                    const ErrorComponent = require('@/components/Error').default;
                    const errorDiv = document.createElement('div');
                    errorDiv.innerHTML = ErrorComponent({ children: 'PDF download failed' });
                    document.body.appendChild(errorDiv);
                    setTimeout(() => document.body.removeChild(errorDiv), 3000);
                    throw new window.Error('PDF download failed');
                }
                const blob = await res.blob()
                const link = document.createElement('a')
                link.href = window.URL.createObjectURL(blob)
                link.download = 'report.pdf'
                document.body.appendChild(link)
                link.click()
                document.body.removeChild(link)
            })
            .catch(err => alert('Errore download PDF: ' + err))
            .finally(() => setDownloadingPDF(false));
    }

    function downloadQuestionaryPDF() {
        setDownloadingPDF(true);
        const questionaryPath = `/p/print?form=${form}`
        fetch(`/api/pdf?path=${encodeURIComponent(questionaryPath)}`)
            .then(async res => {
                if (!res.ok) {
                    const ErrorComponent = require('@/components/Error').default;
                    const errorDiv = document.createElement('div');
                    errorDiv.innerHTML = ErrorComponent({ children: 'PDF questionary download failed' });
                    document.body.appendChild(errorDiv);
                    setTimeout(() => document.body.removeChild(errorDiv), 3000);
                    throw new window.Error('PDF questionary download failed');
                }
                const blob = await res.blob()
                const link = document.createElement('a')
                link.href = window.URL.createObjectURL(blob)
                link.download = 'questionario.pdf'
                document.body.appendChild(link)
                link.click()
                document.body.removeChild(link)
            })
            .catch(err => alert('Errore download PDF questionario: ' + err))
            .finally(() => setDownloadingPDF(false));
    }    
}


import { useRouter } from 'next/router'
import { gql, useQuery } from '@apollo/client'
import Link from 'next/link'
import Page from '@/components/Page'
import Error from '@/components/Error'
import Loading from '@/components/Loading'
import Stats from '@/components/Stats'
import ReportFilterSummary from '@/components/ReportFilterSummary'
import { TranslationsQuery } from '@/lib/api'
import { useTrans } from '@/lib/trans'

const Shared = gql`query SharedReport($token: String!) { sharedReport(token: $token) }`

export default function SharedReportPage() {
    return <Page header={false}><PublicReport /></Page>
}

function PublicReport() {
    const router = useRouter()
    const _ = useTrans()
    const token = typeof router.query.token === 'string' ? router.query.token : ''
    const query = useQuery(Shared, { variables: { token }, skip: !router.isReady || !token, fetchPolicy: 'network-only' })
    const translations = useQuery(TranslationsQuery)
    if (!router.isReady || query.loading || translations.loading) return <Loading />
    if (query.error || !query.data?.sharedReport) return <Error>{_("Report non disponibile o revocato")}</Error>
    if (translations.error || !translations.data) return <Error>{_("Errore caricamento")}</Error>
    const shared = query.data.sharedReport
    return <>
        <div className="noPrint">
            {['it', 'en', 'fu'].map(locale => <Link className="mx-2" key={locale} href={`/report/shared/${token}`} locale={locale}>{locale.toUpperCase()}</Link>)}
        </div>
        <h1>{shared.name}</h1>
        <p><ReportFilterSummary filters={shared.filters} schoolName={shared.schoolName} /></p>
        <p>{_("Il report si aggiorna con le nuove compilazioni che rispettano i filtri salvati.")}</p>
        <Stats showFilter={[]} report={shared.report} schoolSecret="" adminSecret="" schools={[]}
            translations={translations.data.translations} sharedStats={shared.stats} />
    </>
}

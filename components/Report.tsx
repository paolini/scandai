import { useRouter } from 'next/router'
import { useQuery, gql } from '@apollo/client'

import { ProfileQuery, TranslationsQuery } from '@/lib/api'
import { PageWithoutProvider } from '@/components/Page'
import Error from '@/components/Error'
import Loading from "@/components/Loading"
import { useTrans } from "@/lib/trans"
import { requireSingle } from "@/lib/utils"
import useReportFilters from '@/lib/useReportFilters'
import { Profile } from "@/generated/graphql";

import Stats from './Stats'

export default function Report() {
    const profileQuery = useQuery(ProfileQuery)
    const router = useRouter()
    const report = requireSingle(router.query.report, "full")
    const schoolSecret = requireSingle(router.query.schoolSecret)
    const adminSecret = requireSingle(router.query.adminSecret)
    const showFilter = 
        router.query.poll ? [] : 
        router.query.school_id ? ["year","class","form"]
        : ["city","school","year","class","form"]
    const _ = useTrans()

    // console.log(`Report: ${JSON.stringify({user, isReady: router.isReady, showFilter})}`)

    if (profileQuery.loading || !profileQuery.data) return <Loading /> 
    const user = profileQuery.data.profile
    if (!user && !schoolSecret && !adminSecret) return <Error>{_("Accesso non autorizzato")}</Error>

    if (!router.isReady) return <Loading />

    return <ReportInner 
        showFilter={showFilter}
        user={user} 
        report={report} 
        schoolSecret={schoolSecret}
        adminSecret={adminSecret}
    />
}

const SchoolsQuery = gql`
    query SchoolQuery($year: Int) {
        schools(year: $year) {
            _id
            name
            city
            city_fu
            pollCount
        }
    }
`

export function ReportInner({showFilter, user, report, schoolSecret, adminSecret}:{
    showFilter: string[],
    user: Profile|null,
    report: string,
    schoolSecret: string,
    adminSecret: string,
}) {
    const translationsQuery = useQuery(TranslationsQuery)
    const _ = useTrans()
    const { year, pollIdsState } = useReportFilters()
    const schoolsQuery = useQuery(SchoolsQuery, { variables: {
        year: year?parseInt(year):null},
        skip: !showFilter.includes("school")})
    const router = useRouter()
    const locale = router.locale || 'it'
    const isAuthenticated = !!user

//    console.log(`ReportInner: ${JSON.stringify({user, t_loading: TranslationsQuery.isLoading, 
//        t_data: TranslationsQuery.data!==undefined,
//        s_loading: schoolsQuery.isLoading, s_data: schoolsQuery.data!==undefined,
//        trans: [_]
//    })}`)

    
    if (translationsQuery.error) return <Error>{_("Errore caricamento")} ({`${translationsQuery.error}`} [tq])</Error>
    if (schoolsQuery.error) return <Error>{_("Errore caricamento")} ({`${schoolsQuery.error}`} [sq])</Error>
    if (translationsQuery.loading) return <><Loading/><br/>_</>
    if (schoolsQuery.loading) return <><Loading /><br/>_ _</>
    if (translationsQuery.data === undefined) return <Error>{_("undefined ")} (tq)</Error>
    if (schoolsQuery.data === undefined) {
        // può succedere se la query è disabilitata
    }

    const translations = translationsQuery.data.translations
    
    return <PageWithoutProvider header={!!user}>
        { !isAuthenticated &&
        <>
                {_("Lingua")}: {}
                {locale == 'fu' ? <b style={{color: "blue"}}>{_("friulano")}</b> :
                    <a href="#" onClick={() => changeLocale('fu')}>{_("friulano")}</a>} {}
                {locale == 'it' ? <b style={{color: "blue"}}>{_("italiano")}</b> :
                    <a href="#" onClick={() => changeLocale('it')}>{_("italiano")}</a>} {}
                {locale == 'en' ? <b style={{color: "blue"}}>{_("inglese")}</b> :
                    <a href="#" onClick={() => changeLocale('en')}>{_("inglese")}</a>} 
        </> 
        }
            <div className="container noPrint">
        </div>
        <Stats 
            canShare={!!(user?.isAdmin || user?.isViewer || user?.isTeacher) && !schoolSecret && !adminSecret}
            showFilter={showFilter}
            pollIdsState={pollIdsState}
            report={report} 
            schoolSecret={schoolSecret}
            adminSecret={adminSecret}
            translations={translations}
            schools={schoolsQuery.data?.schools || []}
        />
    </PageWithoutProvider>

    function changeLocale(locale: 'it' | 'en' | 'fu') {
        router.push(router.asPath, undefined, { locale })
    }
}

import { Button, Table } from "react-bootstrap"
import { FaCirclePlus } from "react-icons/fa6"
import { useRouter } from "next/router"

import { useAddMessage } from '@/components/Messages'
import Page from '@/components/Page'
import Loading from '@/components/Loading'
import { useTrans } from '@/lib/trans'
import { gql, useQuery } from '@apollo/client'
import { schoolType } from "@/lib/questionary"
import { SchoolTypeString } from "@/lib/mongodb"

const SchoolsQuery = gql`
query SchoolsQuery {
    schools {
        _id
        name
        city
        city_fu
        type
        pollCount
    }
}`

export default function SchoolsPage() {
    return <Page>
        <Schools />
    </Page>
}

function Schools() {
    const _ = useTrans()
    const router = useRouter()
    const schoolsQuery = useQuery(SchoolsQuery)
    const schools = schoolsQuery?.data?.schools

    if (schoolsQuery.loading) return <Loading />
    if (!schools) return <div>{`${schoolsQuery.error}`}</div>

    return <>
        <h2>{_("Scuole")}</h2>
        <Button onClick={() => router.push('/school/__new__')}>
            <FaCirclePlus className="m-1 bg-blue-300"/>
            {_("aggiungi scuola")}
        </Button>
        <Table hover>
            <thead>
                <tr>
                    <th>{_("nome")}</th>
                    <th>{_("città (in italiano)")}</th>
                    <th>{_("città (in friulano)")}</th>
                    <th>{_("grado")}</th>
                    <th>{_("questionari")}</th>
                </tr>
            </thead>
            <tbody>
                { [...schools].sort((a,b)=>(b.pollCount-a.pollCount)).map((school) => 
                <tr key={school._id} onClick={() => router.push(`/school/${school._id}`)}>
                    <td>{school.name}</td>
                    <td>{school.city}</td>
                    <td>{school.city_fu}</td>
                    <td>{schoolType[school.type as SchoolTypeString][_.locale]}</td>
                    <td>{school.pollCount}</td>
                </tr>)}
            </tbody>
        </Table>
    </>
}
import { Button, Table } from "react-bootstrap"
import { FaCirclePlus } from "react-icons/fa6"
import { useRouter } from "next/router"

import { useSchools } from '@/lib/api'
import { useAddMessage } from '@/components/Messages'
import useSessionUser from '@/lib/useSessionUser'
import Page from '@/components/Page'
import Loading from '@/components/Loading'
import { useTrans } from '@/lib/trans'

export default function Schools() {
    const _ = useTrans()
    const router = useRouter()
    const sessionUser = useSessionUser()
    const schoolsQuery = useSchools()
    const addMessage = useAddMessage()

    if (schoolsQuery.isLoading) return <Loading />
    if (!schoolsQuery.data) return <div>{schoolsQuery.error.message}</div>
    const schools = schoolsQuery.data.data

    return <Page>
        <h2>{_("Scuole")}</h2>
        <Button onClick={() => router.push('/school/__new__')}>
            <FaCirclePlus className="m-1 bg-blue-300"/>
            {_("aggiungi scuola")}
        </Button>
        <Table hover>
            <thead>
                <tr>
                    <th>{_("nome")}</th>
                    <th>{_("città")}</th>
                    <th>{_("questionari")}</th>
                </tr>
            </thead>
            <tbody>
                { schools.sort((a,b)=>(b.pollCount-a.pollCount)).map((school) => 
                <tr key={school._id} onClick={() => router.push(`/school/${school._id}`)}>
                    <td>{school.name}</td>
                    <td>{school.city}</td>
                    <td>{school.pollCount}</td>
                </tr>)}
            </tbody>
        </Table>
    </Page>
}
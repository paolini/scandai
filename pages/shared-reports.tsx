import { useState } from 'react'
import { gql, useMutation, useQuery } from '@apollo/client'
import { Button, Form, Table } from 'react-bootstrap'
import Link from 'next/link'
import copyToClipboard from 'copy-to-clipboard'
import Page from '@/components/Page'
import Loading from '@/components/Loading'
import Error from '@/components/Error'
import ReportFilterSummary from '@/components/ReportFilterSummary'
import { useAddMessage } from '@/components/Messages'
import { ProfileQuery } from '@/lib/api'
import { useTrans } from '@/lib/trans'
import { formatDate } from '@/lib/utils'
import type { SharedReport } from '@/generated/graphql'

const Reports = gql`
    query SharedReports($all: Boolean) {
        sharedReports(all: $all) { _id name token report filters schoolName createdAt createdBy { _id name username email } }
    }
`
const Revoke = gql`mutation RevokeSharedReport($_id: ObjectId!) { revokeSharedReport(_id: $_id) }`

export default function SharedReportsPage() {
    return <Page><SharedReportsList /></Page>
}

function SharedReportsList() {
    const _ = useTrans()
    const addMessage = useAddMessage()
    const profile = useQuery(ProfileQuery)
    const [all, setAll] = useState(false)
    const reports = useQuery<{ sharedReports: SharedReport[] }>(Reports, {
        variables: { all }, skip: !profile.data?.profile, fetchPolicy: 'network-only',
    })
    const [revoke, { loading: revoking, error }] = useMutation(Revoke)
    if (profile.loading) return <Loading />
    if (!profile.data?.profile) return <Error>{_("Accesso non autorizzato")}</Error>
    async function remove(_id: string) {
        try {
            await revoke({ variables: { _id } })
            await reports.refetch()
        } catch { /* The mutation error is displayed below. */ }
    }
    return <>
        <h1>{_("I miei report condivisi")}</h1>
        <p>{_("Il report si aggiorna con le nuove compilazioni che rispettano i filtri salvati.")}</p>
        {profile.data.profile.isAdmin && <Form.Check id="shared-reports-all" label={_("Mostra anche i report condivisi dagli altri utenti")} checked={all} onChange={event => setAll(event.target.checked)} />}
        {(error || reports.error) && <Error>{_("Impossibile aggiornare i report condivisi")}</Error>}
        {reports.loading ? <Loading /> : reports.data?.sharedReports.length ? <Table responsive>
            <thead><tr><th>{_("Nome del report")}</th><th>{_("Filtra")}</th><th>{_("Data di creazione")}</th>{all && <th>{_("Autore")}</th>}<th>{_("Azioni")}</th></tr></thead>
            <tbody>{reports.data.sharedReports.map(report => {
                const path = `/${_.locale}/report/shared/${report.token}`
                return <tr key={report._id}>
                    <td>{report.name}</td>
                    <td><ReportFilterSummary filters={report.filters} schoolName={report.schoolName} /></td>
                    <td>{formatDate(report.createdAt)}</td>
                    {all && <td>{report.createdBy?.name || report.createdBy?.username || report.createdBy?.email || '—'}</td>}
                    <td>
                        <Link className="btn btn-primary m-1" href={path} target="_blank">{_("Apri")}</Link>
                        <Button className="m-1" onClick={() => {
                            const copied = copyToClipboard(window.location.origin + path)
                            addMessage(copied ? 'success' : 'error', _(copied ? 'Link copiato' : 'Impossibile copiare il link'))
                        }}>{_("Copia link")}</Button>
                        <Button className="m-1" variant="danger" disabled={revoking} onClick={() => remove(report._id)}>{_("Revoca")}</Button>
                    </td>
                </tr>
            })}</tbody>
        </Table> : <p>{_("Non hai report condivisi")}</p>}
    </>
}

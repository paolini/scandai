import { useState, type FormEvent } from 'react'
import { useMutation, gql } from '@apollo/client'
import { Button, Modal, Form } from 'react-bootstrap'
import Link from 'next/link'
import copyToClipboard from 'copy-to-clipboard'
import useReportFilters from '@/lib/useReportFilters'
import { value } from '@/lib/State'
import { useTrans } from '@/lib/trans'
import { useAddMessage } from './Messages'
import ReportFilterSummary from './ReportFilterSummary'

const Create = gql`
    mutation CreateSharedReport($name: String!, $filters: ReportFiltersInput!, $report: String!) {
        createSharedReport(name: $name, filters: $filters, report: $report) { _id token }
    }
`

export default function ShareReportButton({ report, schoolName }: { report: string, schoolName?: string }) {
    const _ = useTrans()
    const addMessage = useAddMessage()
    const [open, setOpen] = useState(false)
    const [name, setName] = useState('')
    const [url, setUrl] = useState('')
    const [create, { loading, error, reset }] = useMutation(Create)
    const { year, city, schoolId, schoolType, className, form, pollIdsState } = useReportFilters()
    const filters = {
        year: year ? Number(year) : null, city: city || null, schoolId: schoolId || null,
        schoolType, class: className || null, form: form || null, polls: value(pollIdsState),
    }
    async function submit(event: FormEvent) {
        event.preventDefault()
        try {
            const result = await create({ variables: { name: name.trim(), filters, report } })
            setUrl(`${window.location.origin}/${_.locale}/report/shared/${result.data.createSharedReport.token}`)
        } catch { /* Apollo displays the mutation error below. */ }
    }
    return <>
        <Button className="mx-1" onClick={() => { reset(); setName(''); setUrl(''); setOpen(true) }}>
            {_("Condividi questo report")}
        </Button>
        <Modal show={open} onHide={() => !loading && setOpen(false)}>
            <Modal.Header closeButton><Modal.Title>{_("Condividi questo report")}</Modal.Title></Modal.Header>
            <Modal.Body>
                {url ? <>
                    <p>{_("Report condiviso creato")}</p>
                    <Form.Label htmlFor="shared-report-url">{_("Link pubblico")}</Form.Label>
                    <Form.Control id="shared-report-url" value={url} readOnly />
                    <Button className="my-2" onClick={() => {
                        const copied = copyToClipboard(url)
                        addMessage(copied ? 'success' : 'error', _(copied ? 'Link copiato' : 'Impossibile copiare il link'))
                    }}>{_("Copia link")}</Button>
                    <p><Link href={`/${_.locale}/shared-reports`}>{_("I miei report condivisi")}</Link></p>
                </> : <Form onSubmit={submit}>
                    <p>{_("Chiunque abbia il link potrà leggere questo report senza accedere. I filtri resteranno bloccati e i dettagli riservati saranno esclusi.")}</p>
                    <p>{_("Il report si aggiorna con le nuove compilazioni che rispettano i filtri salvati.")}</p>
                    <p><ReportFilterSummary filters={filters} schoolName={schoolName} /></p>
                    <Form.Label htmlFor="shared-report-name">{_("Nome del report")}</Form.Label>
                    <Form.Control id="shared-report-name" maxLength={120} required autoFocus value={name} onChange={event => setName(event.target.value)} />
                    {error && <p role="alert">{_("Impossibile condividere il report")}</p>}
                    <Button className="mt-3" type="submit" disabled={loading || !name.trim()}>{_("Crea link pubblico")}</Button>
                </Form>}
            </Modal.Body>
        </Modal>
    </>
}

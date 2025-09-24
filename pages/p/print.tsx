import { useState } from 'react'
import { useRouter } from 'next/router'
import Page from '@/components/Page'
import PrintableQuestionary from '@/components/PrintableQuestionary'

export default function PrintQuestionary() {
    const router = useRouter()
    const form = (router.query.form as string) || 'full'
    const langState = useState('it')

    return (
        <Page header={false}>
            <PrintableQuestionary
                langState={langState}
                form={form}
            />
        </Page>
    )
}
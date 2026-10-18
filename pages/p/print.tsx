import { useRouter } from 'next/router'
import Page from '@/components/Page'
import PrintableQuestionary from '@/components/PrintableQuestionary'
import Loading from '@/components/Loading'

export default function PrintQuestionary() {
    const router = useRouter()
    const form = (router.query.form as string) || 'full'
    if (!router.isReady) return <Loading />

    return (
        <Page header={false}>
            <PrintableQuestionary
                lang={router.locale || 'it'}
                form={form}
            />
        </Page>
    )
}

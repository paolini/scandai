import { useState } from 'react'
import { useRouter } from 'next/router'

import Page from '@/components/Page'
import { IAnswers } from '@/components/Question'
import { useTrans } from '@/lib/trans'
import Questionary from '@/components/Questionary'

export default function PollFake({}) {
    const _ = useTrans()
    const router = useRouter()
    const form = router.query.form as string

    const langState = useState('it')
    const answersState = useState<IAnswers>({})
    const [timestamp, setTimestamp] = useState(Date.now())

    return <Page header={false}>
        <Questionary
            poll={null}
            form={form}
            langState={langState}
            answersState={answersState}
            timestamp={timestamp}
            mutate={null}
            />
    </Page>}

import {Table} from 'react-bootstrap'

import Page from '@/components/Page'
import Loading from '@/components/Loading'
import {useDict} from '@/lib/api'

export default function Dict() {
    const missing = useDict()

    if (missing.isLoading) return <Loading/>
    if (!missing.data) return <Loading />

    const data = missing.data.data

    return <Page title="Mappatura Lingue">
        <Table hover>
            <thead>
                <tr>
                    <th>lingua</th>
                    <th>mappatura</th>
                </tr>
            </thead>
            <tbody>
                {data.map(([lang,to])=>
                    <tr onClick={()=>null}>
                        <td>{lang}</td>
                        <td>{to}</td>
                    </tr>
                )}
            </tbody>
        </Table>
    </Page>
}
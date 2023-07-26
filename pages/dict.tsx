import {Table, Button} from 'react-bootstrap'
import { FaCirclePlus, FaTrashCan } from 'react-icons/fa6'
import {useState} from 'react'

import Page from '@/components/Page'
import Loading from '@/components/Loading'
import {useDict} from '@/lib/api'
import {set, value} from '@/lib/State'
import Input from '@/components/Input'
import {useAddMessage} from '@/components/Messages' 
import {postDict} from '@/lib/api'

export default function Dict() {
    const missing = useDict()
    const [editLang, setEditLang] = useState<string>('') 
    const editState = useState<string>('')
    const addMessage = useAddMessage()

    console.log(`editLang: ${editLang}, edit: ${value(editState)}`)

    if (missing.isLoading) return <Loading/>
    if (!missing.data) return <Loading />

    const data = missing.data.data

    async function submit(lang: string, map: string) {
        try {
            await postDict({lang, map})
            missing.mutate()
        } catch(err) {
            addMessage('error', `errore nella creazione del sondaggio: ${err}`)
        }
        setEditLang('')
        set(editState,'')
    }

    return <Page title="Mappatura Lingue">
        <Table hover>
            <thead>
                <tr>
                    <th>lingua</th>
                    <th>mappatura</th>
                </tr>
            </thead>
            <tbody>
                {data.map(({lang, variants, map})=>
                    <tr key={lang} onClick={()=>{setEditLang(lang);set(editState,map||'')}}>
                        <td>{variants.join(", ")}</td>
                        <td>{lang===editLang 
                            ? <div className="d-flex">
                                <Input state={editState}></Input>
                                <Button className="mx-1" size="lg"  onClick={()=>{
                                    submit(lang,value(editState)) 
                                }}>
                                    <FaCirclePlus className="m-1 bg-blue-300"/>
                                </Button>
                            </div>
                            : (map===''?<b className="text-danger">scarta</b>:map===undefined?<b className="text-success">mantieni</b>:map)}
                        </td>
                    </tr>
                )}
            </tbody>
        </Table>
    </Page>
}
import {Table, Button} from 'react-bootstrap'
import {FaCirclePlus} from 'react-icons/fa6'
import {useState} from 'react'
import {useQuery, useApolloClient} from '@apollo/client'

import Page from '@/components/Page'    
import Loading from '@/components/Loading'
import {postTranslation, TranslationsQuery} from '@/lib/api'
import {set, value} from '@/lib/State'
import Input from '@/components/Input'
import {useAddMessage} from '@/components/Messages' 
import {useTrans} from '@/lib/trans'

export default function TranslationContainer() {
    const _ = useTrans()
    return <Page title={_("Traduzioni lingue")}>
        <Translation/>
    </Page>
}

function Translation() {
    const translations = useQuery(TranslationsQuery)
    const [editLang, setEditLang] = useState<[string,string]>(['','']) 
    const editState = useState<string>('')
    const addMessage = useAddMessage()
    const [focus, setFocus] = useState<number>(1)
    const _ = useTrans()
    const client = useApolloClient()

//    console.log(`editLang: ${editLang}, edit: ${value(editState)}`)

    if (translations.loading) return <Loading/>
    if (!translations.data) return <Loading />

    const data = Object.fromEntries(Object.entries(translations.data.translations)
        .sort(([s1,d1],[s2,d2]) => s1.localeCompare(s2)))

    const sources:("en"|"fu")[] = ["en", "fu"]

    return <Table>
        <thead>
            <tr>
                <th>{_("lingua")}</th>
                <th>en</th>
                <th>fu</th>
            </tr>
        </thead>
        <tbody>
            {Object.entries(data).map(([source, d]) =>
                <tr key={source} /*onClick={()=>{setEditLang(lang);set(editState,map||'')}}*/>
                    <td>{source}</td>
                    {sources.map((lang:("en"|"fu")) =>
                        editLang[0] === source && editLang[1] === lang 
                        ? <td key={source}>
                            <div className="d-flex">
                                <Input state={editState} focus={focus} enter={()=>submit(source,lang,value(editState))}/>
                                <Button className="mx-1" size="lg" onClick={()=>{
                                    submit(source,lang,value(editState)) 
                                    }}>
                                    <FaCirclePlus className="m-1 bg-blue-300"/>
                                </Button>
                            </div>
                        </td>
                        : <td 
                            key={lang} 
                            onClick={()=>{
                                set(editState,d[lang]||"")
                                setEditLang([source,lang])
                                setFocus(_ => _ + 1)
                            }}
                            style={{cursor:"pointer"}}
                            >
                            {d[lang] || '---'}
                        </td>
                    )}
                    {/*
                    <td>{lang===editLang 
                        ? 
                        : (map===''?<b className="text-danger">scarta</b>:map===undefined?<b className="text-success">mantieni</b>:map)}
                    </td>
                    */}
                </tr>
            )}
        </tbody>
    </Table>

    async function submit(source: string, lang: "en"|"fu", map: string) {
        try {
            await postTranslation({[source]: {[lang]: map}})
            client.refetchQueries({ include: [TranslationsQuery] })
        } catch(err) {
            addMessage('error', `errore: ${err}`)
        }
        setEditLang(['',''])
        set(editState,'')
    }
}
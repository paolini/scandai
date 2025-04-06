import {Table, Button} from 'react-bootstrap'
import {FaCirclePlus} from 'react-icons/fa6'
import {useState} from 'react'
import {useQuery, useMutation, useApolloClient, gql} from '@apollo/client'

import Page from '@/components/Page'    
import Loading from '@/components/Loading'
import {TranslationsQuery} from '@/lib/api'
import {set, value} from '@/lib/State'
import Input from '@/components/Input'
import Error from '@/components/Error'
import {useTrans} from '@/lib/trans'

export default function TranslationContainer() {
    const _ = useTrans()
    return <Page title={_("Traduzioni lingue")}>
        <Translation/>
    </Page>
}

const TranslationMutation = gql`
    mutation PostTranslation($source: String!, $map: LocalizedStringInput!) {
        postTranslation(source: $source, map: $map) {
            source
            map {
                it
                en
                fu
            }
        }
    }
`

function Translation() {
    const translations = useQuery(TranslationsQuery)
    const [postTranslation, {loading,error}] = useMutation(TranslationMutation, {
        refetchQueries: [TranslationsQuery],
    })
    const [editLang, setEditLang] = useState<[string,string]>(['','']) 
    const editState = useState<string>('')
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
                                { error && <Error>{`${error}`}</Error>}
                                <Input state={editState} focus={focus} enter={()=>submit(source,lang,value(editState))}/>
                                <Button className="mx-1" size="lg" disabled={loading} onClick={()=>{
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
                </tr>
            )}
        </tbody>
    </Table>

    async function submit(source: string, lang: "en"|"fu", map: string) {
        await postTranslation({variables: {
            source, 
            map: {[lang]: map}}})            
        setEditLang(['',''])
        set(editState,'')
    }
}
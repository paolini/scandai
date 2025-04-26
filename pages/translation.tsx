import {Button, Table} from 'react-bootstrap'
import {FaCirclePlus} from 'react-icons/fa6'
import {useState} from 'react'
import {useQuery, gql, useMutation} from '@apollo/client'

import Page from '@/components/Page'    
import Loading from '@/components/Loading'
import {TranslationsQuery} from '@/lib/api'
import State, {set, value} from '@/lib/State'
import Input from '@/components/Input'
import {useTrans} from '@/lib/trans'
import { Translation } from '@/generated/graphql'

export default function TranslationContainer() {
    const _ = useTrans()
    return <Page title={_("Traduzioni lingue")}>
        <TranslationPage/>
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

function TranslationPage() {
    const translations = useQuery(TranslationsQuery)
    const [editLang, setEditLang] = useState<[string,string]>(['','']) 
    const editState = useState<string>('')
    const [focus, setFocus] = useState<number>(1)
    const _ = useTrans()

    if (translations.loading) return <Loading/>
    if (!translations.data) return <Loading />

    const data = sort(translations.data.translations)

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
            {data.map((t) =>
                <tr key={t.source}>
                    <td>{t.source}</td>
                    {sources.map((lang:("en"|"fu")) =>
                        editLang[0] === t.source && editLang[1] === lang 
                        ? <td key={t.source}>
                            <Cell editState={editState} setEditLang={setEditLang} source={t.source} lang={lang} focus={focus}/>
                        </td>
                        : <td 
                            key={lang} 
                            onClick={()=>{
                                set(editState,t.map[lang]||"")
                                setEditLang([t.source,lang])
                                setFocus(_ => _ + 1)
                            }}
                            style={{cursor:"pointer"}}
                            >
                            {t.map[lang] || '---'}
                        </td>
                    )}
                </tr>
            )}
        </tbody>
    </Table>

    function sort(data: Translation[]):Translation[] {
        return [...data].sort((t1:Translation,t2:Translation) => {
            return t1.source?.localeCompare(t2.source)
        // return Object.entries(data).sort(([s1,d1],[s2,d2]) => s1.localeCompare(s2))
    })}
}

function Cell({editState, setEditLang, source, lang, focus}:{
    editState: State<string>,
    setEditLang: (l:[string,string])=>void,
    source: string,
    lang: string,
    focus: number
}) {
    const _ = useTrans()
    const [mutate, {loading,error}] = useMutation(TranslationMutation, {
        variables: {source, map: {[lang]: value(editState)}},
        refetchQueries: [TranslationsQuery],
        onCompleted: () => {
            setEditLang(['','']);
            set(editState,'')
        }
    })
    return <div className="d-flex">
        <Input state={editState} focus={focus} enter={()=>mutate()}/>
        <Button className="mx-1" size="lg">
            <FaCirclePlus className="m-1 bg-blue-300"/>
        </Button>
    </div>
}
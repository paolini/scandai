import {Table} from 'react-bootstrap'
import { FaCirclePlus, FaCircleMinus } from 'react-icons/fa6'
import {useState} from 'react'
import {gql,useQuery} from '@apollo/client'

import Page from '@/components/Page'
import Loading from '@/components/Loading'
import {set, value} from '@/lib/State'
import Input from '@/components/Input'
import { useTrans } from '@/lib/trans'
import MutationButton from '@/components/MutationButton'
import { Dict } from '@/generated/graphql'

export default function DictContainer() {
    const _ = useTrans()
    return <Page title={_("Mappatura Lingue")}>
        <DictPage />
    </Page>
}

const DictQuery = gql`
    query DictQuery {
        dict {
            lang
            map
            variants
        }
    }`

const AddDictMutation = gql`mutation($lang:String!,$map:String!) {addDict(lang:$lang,map:$map)}`

function DictPage() {
    const missing = useQuery(DictQuery)
    const [editLang, setEditLang] = useState<string>('') 
    const editState = useState<string>('')
    const _ = useTrans()
    const addDictOptions = {
        refetchQueries:[DictQuery],
        onCompleted: () => {
            setEditLang('')
            set(editState,'')                                    
        }
    }

    if (missing.loading) return <Loading/>
    if (!missing.data) return <Loading />

    function sortKey(x: Dict) {
        return x.map==='' ? `Z${x.lang}` : `A${x.lang}`
    }

    const data = [...missing.data.dict].sort((a,b) => {
        const ka = sortKey(a)
        const kb = sortKey(b)
        if (ka < kb) return -1
        if (ka > kb) return 1
        return 0
    })

    return <Table hover>
        <thead>
            <tr>
                <th>{_("lingua")}</th>
                <th>{_("mappatura")}</th>
            </tr>
        </thead>
        <tbody>
            {data.map(({lang, variants, map})=>
                <tr key={lang} onClick={()=>{setEditLang(lang);set(editState,map||toTitleCase(lang))}}>
                    <td>{variants.join(", ")}</td>
                    <td>{lang===editLang 
                        ? <div className="d-flex">
                            <Input state={editState}></Input>
                            <MutationButton 
                                className="mx-1" size="lg" 
                                query={AddDictMutation} 
                                options={{...addDictOptions, variables:{lang,map: value(editState)}}} 
                            >
                                <FaCirclePlus className="m-1"/>
                            </MutationButton>
                            <MutationButton className="mx-1 bg-danger" size="lg"  
                                query={AddDictMutation}
                                options={{...addDictOptions, variables:{lang,map:''}}}
                            >
                                <FaCircleMinus className="m-1 bg-red-300"/>
                                scarta
                            </MutationButton>
                        </div>
                        : (map===''?<b className="text-danger">
                            {_("scarta")}
                        </b>:map===null?<b>
                            {_("da mappare")}
                        </b>:map)}
                    </td>
                </tr>
            )}
        </tbody>
    </Table>
}

function toTitleCase(str: string) {
    return str.replace(
      /\w\S*/g,
      function(txt) {
        return txt.charAt(0).toUpperCase() + txt.substring(1).toLowerCase();
      }
    );
  }
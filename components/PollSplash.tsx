import {Button} from "react-bootstrap"
import { FaShareAlt } from "react-icons/fa"
import QRCode from "react-qr-code"
import copyToClipboard from 'copy-to-clipboard'
import { useEffect, useState } from "react"

import { IGetPoll } from "@/models/Poll"
import Page from "@/components/Page"
import { useAddMessage } from "@/components/Messages"
import Error from "@/components/Error"
import Loading from "@/components/Loading"
import questions, { getPhrase } from "@/lib/questionary"
import { value, State, set } from "@/lib/State"
import questionary, { trans } from "@/lib/questionary"

export default function PollSplash({poll, form, langState, start}:{
    poll: IGetPoll|null,
    form: string, // se non c'è poll, usa questa form
    langState: State<string>,
    start: () => void,
}) {
    const [myUrl, setMyUrl] = useState('')
    const addMessage = useAddMessage()

    useEffect(() => {
        setMyUrl(window.location.href)
        // force Client-side-only code
    })

    if (!form) return <Error>form is undefined</Error>
    if (!myUrl) return <Loading />

    function phrase(s: keyof typeof questions.phrases) {
        return getPhrase(s, value(langState) || 'it')
    }

    return <Page header={false}>
            <h1>{phrase('title')}</h1>
            <div className="d-flex flex-column">
                { poll && <>
                    <div className="my-1"><b>{ phrase('school') }:</b> { poll?.school?.name} - {poll?.school?.city} </div>
                    <div className="my-1"><b>{ phrase('class') } :</b> { poll?.year}&nbsp;{ poll?.class}</div>
                </>}
                <ChooseLanguage langState={langState}/>
                { value(langState) && ((poll && poll.closed) 
                    ? <Error>{phrase('isClosed')}.</Error>
                    : <>
                        <div className="flex my-4">
                        { trans(questionary.forms[form].intro, value(langState)) }
                        </div>
                        <Button className="flex my-4" variant="success" size="lg" onClick={start}>
                            {phrase('compileButton')}
                        </Button>
                        { poll && <>
                            <Button className="flex my-4" onClick={() => {copyToClipboard(myUrl);addMessage('success', 'indirizzo (url) copiato')}}>
                                <FaShareAlt /> {phrase('shareButton')}
                            </Button>
                            <QRCode className="flex my-4 w-100" value={myUrl} />
                        </>}
                    </>)
                }
            </div>
        </Page>
}

function ChooseLanguage({langState}:{
    langState: State<string>
}) {
    return <div className="flex my-4">
        {Object.entries(questions.phrases.chooseLanguage).map(([lang, message], i) => 
            <div className={value(langState)===lang?"bg-warning":""} key={lang}>
                <label>
                    <input 
                        type="radio" 
                        name="lang" 
                        checked={value(langState)===lang} 
                        value={lang} 
                        onClick={()=>set(langState,lang)}
                    />
                    {} {message}
                </label>
            </div>
        )} 
    </div>
}
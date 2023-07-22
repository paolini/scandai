import {Button, Form} from "react-bootstrap"
import { FaShareAlt } from "react-icons/fa"
import QRCode from "react-qr-code"
import copyToClipboard from 'copy-to-clipboard'

import { IGetPoll } from "@/models/Poll"
import Page from "@/components/Page"
import { useAddMessage } from "@/components/Messages"
import Error from "@/components/Error"
import questions, { getPhrase } from "@/lib/questionary"
import { value, State, onChange } from "@/lib/State"
import useSessionUser from "@/lib/useSessionUser"
import questionary, { trans } from "@/lib/questionary"

export default function PollSplash({poll, langState, mutate, start}:{
    poll: IGetPoll,
    langState: State<string>,
    mutate: () => void,
    start: () => void,
}) {
    const user = useSessionUser()
    const myUrl = window.location.href
    const addMessage = useAddMessage()

    function phrase(s: keyof typeof questions.phrases) {
        return getPhrase(s, value(langState))
    }

    return <Page header={false}>
            <h1>{phrase('title')}</h1>
            <div className="d-flex flex-column">
                <div className="my-1"><b>{ phrase('school') }:</b> { poll.school }</div>
                <div className="my-1"><b>{ phrase('class') } :</b> { poll.class }</div>
                { user?.isAdmin && <a href={`/poll/${poll._id}`} className="my-4">[pagina amministrazione]</a> }
                <ChooseLanguage langState={langState}/>
                { poll.closed 
                    ? <Error>{phrase('isClosed')}.</Error>
                    : <>
                        <div className="flex my-4">
                        { trans(questionary.forms[poll.form].intro, value(langState)) }
                        </div>
                        <Button className="flex my-4" variant="success" size="lg" onClick={start}>
                            {phrase('compileButton')}
                        </Button>
                        <Button className="flex my-4" onClick={() => {copyToClipboard(myUrl);addMessage('success', 'indirizzo (url) copiato')}}>
                            <FaShareAlt /> {phrase('shareButton')}
                        </Button>
                        <QRCode className="flex my-4 w-100" value={myUrl} />
                    </>
                }
            </div>
        </Page>
}

function ChooseLanguage({langState}:{
    langState: State<string>
}) {
    return <div className="flex my-4">
        <Form.Select className="bg-warning" onChange={onChange(langState)}>
        {Object.entries(questions.phrases.chooseLanguage).map(([lang, message], i) => 
            <option key={i} value={lang}>{message}</option>)}
        </Form.Select>
    </div>
}
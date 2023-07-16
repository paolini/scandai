import {Button} from "react-bootstrap"
import { FaShareAlt } from "react-icons/fa"
import QRCode from "react-qr-code"
import copyToClipboard from 'copy-to-clipboard'

import { IGetPoll } from "@/models/Poll"
import Page from "@/components/Page"
import PollAdmin from "@/components/PollAdmin"
import { useAddMessage } from "@/components/Messages"
import Error from "@/components/Error"
import questions from "@/lib/questions"
import { value, State, onChange } from "@/lib/State"


export default function Poll({poll, langState, mutate, start}:{
    poll: IGetPoll,
    langState: State<string>,
    mutate: () => void,
    start: () => void,
}) {
    const myUrl = window.location.href
    const addMessage = useAddMessage()

    function phrase(s: keyof typeof questions.phrases) {
        return questions.phrases[s][value(langState)] || `${value(langState)}: ${questions.phrases[s]['it']}`
    }

    return <Page>
            <h1>{phrase('title')}</h1>
            <div className="d-flex flex-column">
                <div className="mx-4"><b>{ phrase('school') }:</b> { poll.school }</div>
                <div className="mx-4"><b>{ phrase('class') } :</b> { poll.class }</div>
                <PollAdmin poll={poll} mutate={mutate}/>
                <ChooseLanguage langState={langState}/>
                { poll.closed 
                    ? <Error>{phrase('isClosed')}.</Error>
                    : <>
                        <Button className="flex m-4" variant="success" size="lg" onClick={start}>
                            {phrase('compileButton')}
                        </Button>
                        <Button className="flex m-4" onClick={() => {copyToClipboard(myUrl);addMessage('success', 'indirizzo (url) copiato')}}>
                            <FaShareAlt /> {phrase('shareButton')}
                        </Button>
                        <QRCode className="flex m-4 w-100" value={myUrl} />
                    </>
                }
            </div>
        </Page>
}

function ChooseLanguage({langState}:{
    langState: State<string>
}) {
    return <div className="flex m-4">
        <select onChange={onChange(langState)}>
        {Object.entries(questions.phrases.chooseLanguage).map(([lang, message], i) => 
            <option key={i} value={lang}>{message}</option>)}
        </select>
    </div>
}
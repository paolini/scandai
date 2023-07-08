import {Button} from "react-bootstrap"
import { FaShareAlt } from "react-icons/fa"
import QRCode from "react-qr-code"
import copyToClipboard from 'copy-to-clipboard'

import { IGetPoll } from "@/models/Poll"
import Page from "@/components/Page"
import PollAdmin from "@/components/PollAdmin"
import { set } from "@/lib/State"
import { useAddMessage } from "@/components/Messages"
import Error from "@/components/Error"

export default function Poll({poll, mutate, start}:{
    poll: IGetPoll,
    mutate: () => void,
    start: () => void,
}) {
    const myUrl = window.location.href
    const addMessage = useAddMessage()

    return <Page>
            <h1>Fotografia linguistica</h1>
            <div className="d-flex flex-column">
                <div className="mx-4"><b>Scuola:</b> { poll.school }</div>
                <div className="mx-4"><b>Classe:</b> { poll.class }</div>
                <PollAdmin poll={poll} mutate={mutate}/>
                { poll.closed 
                    ? <Error>Il questionario è chiuso.</Error>
                    : <>
                        <Button className="flex m-4" variant="success" size="lg" onClick={start}>
                            compila il questionario
                        </Button>
                        <Button className="flex m-4" onClick={() => {copyToClipboard(myUrl);addMessage('success', 'indirizzo (url) copiato')}}>
                            <FaShareAlt /> copia l&apos;indirizzo del questionario
                        </Button>
                        <QRCode className="flex m-4 w-100" value={myUrl} />
                    </>
                }
            </div>
        </Page>
}
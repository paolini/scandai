import { FaCirclePlus } from 'react-icons/fa6'
import { useState } from 'react'
import { Button, ButtonGroup, Card, Table } from 'react-bootstrap'
import { useRouter } from 'next/router'
import { useQuery, useMutation } from '@apollo/client'
import { ObjectId } from 'mongodb'
 
import { post, NewPollMutation, PollsQuery, useSchools } from '@/lib/api'
import { useAddMessage } from '@/components/Messages'
import Loading from '@/components/Loading'
import Error from '@/components/Error'
import { value, set, get, onChange, State } from '@/lib/State'
import { ProfileQuery } from '@/lib/api'
import { currentSchoolYear, formatDate } from '@/lib/utils'
import Input from '@/components/Input'
import questionary from '@/lib/questionary'
import {useTrans} from '@/lib/trans'
import { User, Poll } from '@/pages/api/graphql/types'

const formTypes = Object.keys(questionary.forms)

export default function Polls({}) {
    const profileQuery = useQuery(ProfileQuery)
    const currentYear = currentSchoolYear()
    const [year, setYear] = useState(currentYear)
    const years = Array.from({length: currentYear-2022}, (_,i) => currentYear - i)
    const pollsQuery = useQuery(PollsQuery, { variables: {year}})
    const router = useRouter()
    const _ = useTrans()
    const newForm = router.query.new || null  
    const addMessage = useAddMessage()

    if (Array.isArray(newForm) || ![null, "", ...formTypes].includes(newForm)) return <Error>
        invalid form type: {JSON.stringify(newForm)}
    </Error>
    if (profileQuery.loading || pollsQuery.loading) return <Loading />
    if (pollsQuery.error) return <Error>{`${pollsQuery.error}`}</Error>
    if (!profileQuery.data) return <Error>{`${profileQuery.error}`}</Error>

    const profile = profileQuery.data.profile

    const polls = pollsQuery.data?.polls || []
    let openPolls = polls
        .filter(poll => !poll.closed)
        .sort((a,b) => a.createdAt > b.createdAt ? -1 : 1)
    let closedPolls = polls
        .filter(poll => poll.closed)
        .sort((a,b) => a.date  > b.date ? -1 : 1)

    return <>
        { newForm !== null
            ? <NewPoll form={newForm} done={(poll) => {
                if (poll) router.push(`/poll/${poll._id}`)
                else router.push('/')
            }}/>
            : <NewPollButtons form={newForm} />
        }
        <br />
        {_("anno scolastico")}: {}
        <select value={year} onChange={e => setYear(parseInt(e.target.value))}>
            <option value="0">tutti gli anni</option>
            { years.map(year => <option key={year} value={year}>{year}/{year+1}</option>) }
        </select>
        { openPolls.length > 0 && <Card className="my-2 table-responsive">
            <Card.Header>
                <b>{_("questionari aperti")}</b>
            </Card.Header>
            <Card.Body>
                <PollsTable user={profile} polls={openPolls} />
            </Card.Body>
        </Card>
        }
        { closedPolls.length > 0 && 
            <Card className="my-2 table-responsive">
                <Card.Header>
                    <b>{_("questionari chiusi")}</b>
                </Card.Header>
                <Card.Body>
                    <PollsTable user={profile} polls={closedPolls} />
            </Card.Body>
        </Card>
        }
        { profile?.isSuper && 
            <Card>
                <Card.Header>
                    {_("super amministratori")}
                </Card.Header>
                <Card.Body>
                    <Button variant="danger" onClick={eraseAdminLinks}>
                        {_("elimina tutti i link di amministrazione")}
                        {year ? ` ${year}/${year+1}` : ""}
                    </Button>
                </Card.Body>
            </Card>
        }
    </>

    async function eraseAdminLinks() {
        try {
            const res = await post("polls/eraseSecrets",{year})
            addMessage("warning", _("rimossi % link amministrazione", res.count))
            pollsQuery.refetch()
        } catch(error) {
            addMessage("error", `${error}`)
        }
        window.scrollTo(0,0)
    }
}

function PollsTable({user, polls}:{
    user?: User|null,
    polls: Poll[],
}) {
    const router = useRouter()
    const _ = useTrans()

    function navigateToPoll(
        evt: any, 
        poll: Poll) {
        evt.preventDefault()
        router.push(`/poll/${poll._id}`)
    }

    return <Table hover>
        <thead>
            <tr>
                { user?.isAdmin && <th>{_("utente")}</th> }
                <th>{_("tipo")}</th>
                <th>{_("data")}</th>
                <th>{_("scuola")}</th>
                <th>{_("classe")}</th>
                <th>{_("conteggio")}</th>
                <th>{_("link")}</th>
            </tr>
        </thead>
        <tbody>
            {polls.map(poll => 
            <tr key={poll._id.toString()}
                onClick={(e) => navigateToPoll(e, poll) }>
                { user?.isAdmin && <td>
                    { poll.createdBy?.name 
                        || poll.createdBy?.username || '???'}
                    {} &lt;{ poll.createdBy?.email || '???' }&gt;
                </td>}
                <td>
                    {questionary.forms[poll.form]?.name[_.locale]}
                </td>
                <td>
                    {formatDate(poll.date)}
                </td>
                <td>
                    {poll?.school?.name} {poll?.school?.city && ` - ${poll?.school?.city}`}
                </td>
                <td>
                    {poll.class} ({poll.year})
                </td>
                <td>
                    {poll.entriesCount}
                </td>
                <td>
                    {poll.adminSecret?"•":""}
                </td>
            </tr>)}
        </tbody>
    </Table>    
}            

function NewPollButtons({ form }:{
    form?: string|null,
}) {
    const router = useRouter()
    const _ = useTrans()

    if (form) {
        return MyButton(form)
    } else {
        return <>
            {formTypes.map(f => MyButton(f))}
        </>
    }
    
    function MyButton (form: string) {
        return <Button key={form} className="my-2 mx-2" variant="primary" size="lg" onClick={() => router.push(`?new=${form}`)}>
            <FaCirclePlus className="m-1 bg-blue-300" /> 
            {_("nuovo questionario")}
            {form && ` ${questionary.forms[form].name[_.locale]}`}
        </Button>
}
}

function NewPoll({ form, done }:{
    form?: string|null,
    done?: (poll: ObjectId|null) => void
}) {
    const pollState = useState({school: '', class: '', year: '', form: (form || 'full')})
    const addMessage = useAddMessage()
    const _ = useTrans()
    const [newPollMutation, {loading, error}] = useMutation(NewPollMutation)

    return <Card>
        <Card.Header>
            {_("nuovo sondaggio")} {form && ` ${questionary.forms[form].name[_.locale]}`}
        </Card.Header>
        <Card.Body>
            <form>
                { !form && <SelectForm formState={get(pollState, 'form')} />}
                <SelectSchool schoolState={get(pollState, 'school')} />
                <div className="form-group">
                    <label htmlFor="year">
                        {_("anno di corso")}
                    </label>
                    <select className="form-control" id="year" value={value(pollState).year} 
                        onChange={evt => {
                            set(get(pollState, 'year'), evt.target.value)
                        }}>
                        <option value="" disabled={true}>scegli</option>
                        {
                            [   ["1",_("primo")],
                                ["2",_("secondo")],
                                ["3",_("terzo")],
                                ["4",_("quarto")],
                                ["5",_("quinto")]].map(([year,label]) =>
                                    <option key={year} value={year}>{label}</option>)
                        }
                    </select>
                </div>
                <div className="form-group">
                    <label htmlFor="class">
                        {_("nome della classe")}
                    </label>
                    <Input id="class" state={get(pollState, 'class')} placeholder={_("sezione")} />
                </div>
            </form>                                
        </Card.Body>
        <Card.Footer>
            { error && <Error>{`${error}`}</Error>}
            <ButtonGroup>
                <Button variant="primary" size="lg" disabled={!isValid() || loading} onClick={submit}>
                    {_("crea")}
                </Button>
                <Button variant="warning" size="lg" onClick={() => (done?done(null):null)}>
                    {_("annulla")}
                </Button>
            </ButtonGroup>
        </Card.Footer>
    </Card>

    function isValid() {
        const poll = value(pollState)
        return poll && poll.school && poll.class
    }

    async function submit() {
        const result = await newPollMutation({
            variables: value(pollState),
        });
        if (result.errors || !result.data) {
            addMessage('error', `${result.errors}`)
        } else {
            if (done) done(result.data.newPoll)
        }
    }
}

function SelectForm({ formState }: {
    formState: State<string>
}) {
    const _ = useTrans()

    return <div className="form-group">
        <label htmlFor="form">
        {_("tipo di questionario")}
        </label>
        <select id="form" className="form-control" value={value(formState)} onChange={onChange(formState)}>
            {
                Object.entries(questionary.forms).map(([key, value]) =>
                <option key={key} value={key}>{value.name[_.locale]}</option>)
            }
        </select>
    </div>
}

function SelectSchool({ schoolState }: {
    schoolState: State<string>
}) {
    const schoolsQuery = useSchools()
    const _ = useTrans()

    if (schoolsQuery.isLoading) return <Loading />
    if (!schoolsQuery.data) return <Error>{schoolsQuery.error.message}</Error>

    const schools = schoolsQuery.data.data

    return <div className="form-grup">
        <label htmlFor="school">
            {_("scuola")} 
        </label>
        <select id="school" className="form-control" value={value(schoolState)} onChange={onChange(schoolState)}>
            <option value="" disabled={true}>{_("scegli")}</option>
            {
                schools.map(school =>
                    <option key={school._id} value={school._id}>{school.name} - {school.city}</option>)
            }
        </select>
        { /*<Input id="school" state={get(pollState, 'school')} placeholder="scuola" /> */ }
    </div>
}
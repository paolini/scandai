import { Table } from 'react-bootstrap'
import { IChoiceQuestionStat } from '@/pages/api/graphql/resolvers/stats'
import { useTrans } from "@/lib/trans"

type T = (s:string) => string

export default function TableChoiceQuestion({stat, t}: {
    stat: IChoiceQuestionStat,
    t: T,
}) {
    const _ = useTrans()
    const labels = Object.fromEntries(stat.question.choices?.map(c => [c.value, c.label[_.locale] || c.label.it || c.value]) || [])
    if (!stat.answers) return <div>invalid answers</div>

    return <><Table className="my-0">
        <thead>
            <tr>
                <td></td>
                    {Object.keys(stat.answers).map(id => 
                <td key={id}>
                    {id===''?_("altre"):labels[id]}
                </td>)}
            </tr>
        </thead>
        <tbody>
            <tr>
                <th>{_("conteggio")}</th>
                    {Object.entries(stat.answers).map(([key, val])=>
                <td key={key}>
                    {val}
                </td>)}
            </tr>
        </tbody>
    </Table>
    <p className="mx-2" style={{fontSize:"smaller"}}>
        {_("questionari")}: {stat.count}, {}
        {_("numero risposte")}: {stat.countPositive}
    </p>
    </>
}


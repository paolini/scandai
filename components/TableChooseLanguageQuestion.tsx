import { Table } from 'react-bootstrap'

import { 
    IChooseLanguageQuestionStat, 
} from '@/pages/api/graphql/resolvers/stats'
import questionary from '@/lib/questionary'
import { useTrans } from "@/lib/trans"

type T = (s:string) => string

export default function TableChooseLanguageQuestion({stat, count, t}: {
    stat: IChooseLanguageQuestionStat,
    count: "answers" | "questions" | "positive" | "both",
    t: T,
}) {
    const _ = useTrans()
    const languages = questionary.languages
    if (!stat.answers) return <div>invalid answers</div>

    return <><Table className="my-0">
        <thead>
            <tr>
                <td></td>
                    {Object.keys(stat.answers).map(id => 
                <td key={id}>
                    {id===''?_("altre"):t(id)}
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
            { (count === 'answers' || count === 'both' ) &&
            <tr>
                <th>{count === 'both' ? _("per lingua") : _("percentuale") }</th>
                    {Object.entries(stat.answers).map(([key, val])=>
                <td key={key}>
                    { stat.countAnswers && `${Math.round(val*100/stat.countAnswers)}%` }
                </td>)}
            </tr>
            }
            { (count === 'questions' || count === 'both') &&
            <tr>
                <th>{count === 'both' ? _("per persona") : _("percentuale") }</th>
                    {Object.entries(stat.answers).map(([key, val])=>
                <td key={key}>
                    {stat.count && `${Math.round(val*100/stat.count)}%`}
                </td>)}
            </tr>}
            { (count === 'positive' || count === 'both') &&
            <tr>
                <th>{count === 'both' ? _("su positivi") : "%" }</th>
                    {Object.entries(stat.answers).map(([key, val])=>
                <td key={key}>
                    {stat.count && `${Math.round(val*100/stat.countPositive)}%`}
                </td>)}
            </tr>}
            <tr className="uso-esclusivo">
                <td>{_("uso esclusivo")}</td>
                {Object.entries(stat.answers).map(([key,val]) =>
                    <td key={key}>
                        { stat.singleAnswers[key] || ""}
                    </td>)}
            </tr>
            <tr className="uso-esclusivo">
                <td>%</td>
                {Object.entries(stat.answers).map(([key,val]) =>
                    <td key={key}>
                        { stat.singleAnswers[key] && `${Math.round(stat.singleAnswers[key]*100/stat.countPositive)}%` || ""}
                    </td>)}
            </tr>
        </tbody>
    </Table>
    <p className="mx-2" style={{fontSize:"smaller"}}>
        {_("questionari")}: {stat.count}, {}
        {_("non risponde")}: {stat.count-stat.countPositive}, {}
        {_("risponde")}: {stat.countPositive}, {}
        {_("numero risposte")}: {stat.countAnswers}
    </p>
    </>
}


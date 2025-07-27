import { useState, ReactElement } from "react"
import { useRouter } from 'next/router'
import { useSearchParams } from "next/navigation"
import questionary from '@/lib/questionary'
import { useTrans } from "@/lib/trans"
import State, { value, set, update } from "@/lib/State"
import { School } from "@/generated/graphql"
import Item from "./Item"

import { Table, Button } from 'react-bootstrap'
import { formatDate } from '@/lib/utils'

import { IStats } from '@/pages/api/graphql/resolvers/stats'

export default function StatsFilter({fields, schoolIdState, cityState, formState, classState, yearState, schools, classes}:{
    fields: string[],
    schoolIdState: State<string>,
    cityState: State<string>,
    formState: State<string>,
    classState: State<string>,
    yearState: State<string>,
    schools: School[],
    classes: string[],
}) {    
    const city = value(cityState)
    const map_city_fu = Object.fromEntries(schools.map(school => [school.city, school.city_fu]))
    const citiesInfo = Object.keys(map_city_fu).map(city => {
        let pollCount = 0
        for (const school of schools.filter(school => school.city===city)) {
            pollCount += school.pollCount || 0
        }
        return {pollCount, city}
    }).sort((a,b) => b.pollCount-a.pollCount)
    const selectedSchools = (city 
        ? schools.filter(school => school.city===city)
        : [...schools]).sort((a,b) => (b.pollCount || 0)-(a.pollCount || 0))
    const _ = useTrans()
    const router = useRouter();

    // Calcolo dinamico degli anni scolastici
    const now = new Date()
    const currentYear = now.getMonth() >= 6 ? now.getFullYear() : now.getFullYear() - 1
    const years = []
    for (let y = 2023; y <= currentYear; ++y) years.push(y)

    return <>
        { /*JSON.stringify({schools,citiesInfo})*/ }
        {_("Filtra")}: {fields.includes("year") &&
        <select value={value(yearState)} onChange={evt => {
            const year = evt.target.value
            set(yearState, year);
            // Aggiorna la query string nell'URL
            const query: Record<string,string> = { ...router.query, year };
            if (!year && 'year' in query) delete query.year;
            router.replace({ pathname: router.pathname, query }, undefined, { shallow: true });
        }}>
            <option value=''>{_("tutti gli anni")}</option>
            {years.map(y => <option key={y} value={y}>{y}-{y+1}</option>)}
        </select>} {}
        {fields.includes("city") &&
        <select value={value(cityState)} onChange={evt => {
            const city = evt.target.value;
            set(schoolIdState,'')
            set(cityState,city)
            // Aggiorna la query string nell'URL
            const query: Record<string,string> = { ...router.query, city };
            if (!city && 'city' in query) delete query.city;
            // Quando cambio città, azzero anche la scuola
            if ('school_id' in query) delete query.school_id;
            router.replace({ pathname: router.pathname, query }, undefined, { shallow: true });
        }}>
            <option value=''>{_("tutte le città")}</option>
            {citiesInfo.map(info => <option key={info.city} value={info.city}>{_.locale === 'fu' ? (map_city_fu[info.city] || info.city) : info.city}</option>)}
        </select>} {}
        { fields.includes("school") &&
        <select value={value(schoolIdState)} onChange={evt => {
            const school_id = evt.target.value;
            set(schoolIdState,school_id);
            // Aggiorna la query string nell'URL
            const query: Record<string,string> = { ...router.query, school_id };
            if (!school_id && 'school_id' in query) delete query.school_id;
            router.replace({ pathname: router.pathname, query }, undefined, { shallow: true });
        }}>
            <option value=''>{_("tutte le scuole")}</option>
            {selectedSchools.map(school => <option key={school._id} value={school._id}>{school.name}</option>)}
        </select>} {}
        { fields.includes("class") && 
        <select value={value(classState)} onChange={evt => {
            const classValue = evt.target.value;
            set(classState,classValue);
            // Aggiorna la query string nell'URL
            const query: Record<string,string> = { ...router.query, class: classValue };
            if (!classValue && 'class' in query) delete query.class;
            router.replace({ pathname: router.pathname, query }, undefined, { shallow: true });
        }}>
            <option value=''>{_("tutte le classi")}</option>
            {classes.map(c => <option key={c} value={c}>{{
                '1': _("classi prime"), 
                '2': _("classi seconde"), 
                '3': _("classi terze"),
                '4': _("classi quarte"),
                '5': _("classi quinte") }[c]}</option>)}
        </select>} {}
        { fields.includes("form") &&
        <select value={value(formState)} onChange={evt => {
            const form = evt.target.value;
            set(formState,form);
            // Aggiorna la query string nell'URL
            const query: Record<string,string> = { ...router.query, form };
            if (!form && 'form' in query) delete query.form;
            router.replace({ pathname: router.pathname, query }, undefined, { shallow: true });
        }}>
            <option value=''>{_("tutti i questionari")}</option>
            {Object.keys(questionary.forms).map(form => <option key={form} value={form}>{questionary.forms[form].namePlural[_.locale||'it']}</option>)}
        </select>} {}
    </>
}

function ListFilters({stats}:{
    stats: IStats,
}) {
    const _ = useTrans()
    const filters = stats?.filters
    const entries: [string, ReactElement][] = []
    if (!filters) return null

    if (filters.year) entries.push(["year", <>{_("anno scolastico")}: <b>{filters.year}/{filters.year + 1}</b></>])
    if (filters.city) entries.push(["city", <>{_("città")}: <b>{filters.city}</b></>])
    if (filters.school) entries.push(["school", <>{_("scuola")}: <b>{stats.schools.filter(school => school._id === filters.school)[0].name}</b></>])
    if (filters.class) entries.push(["class", <>{_("classe")}: <b>{filters.class}</b></>])
    if (filters.form) entries.push(["form", <>{_("fotografia")}: <b>{questionary.forms[filters.form].name[_.locale]}</b></>])
    return <div className="indent">
        {entries.map(([key,elem],i) => <div key={key}>{elem}</div>)}
    </div>
}

export function ListClasses({ stats, title, pollIdsState}: {
    stats: IStats,
    title?: string,
    pollIdsState: State<string[]>,
}) {
    const _ = useTrans()
    const router = useRouter()
    const searchParams = useSearchParams()
    const isShort = stats.polls.length <= 5
    const isLong = stats.polls.length > 20
    const [isOpen, setOpen] = useState<boolean>(isShort)
    const selectedPollIdsState = useState<string[]>([])

    if (!isOpen) return <Item title={title}>
        <ListFilters stats={stats}/>
        <br />
        {_("classi")}: <b>{stats.polls.length}</b>, {}
        {_("partecipanti")}: <b>{stats.entriesCount}</b> {}
        <span className="noPrint">
            <Button onClick={() => setOpen(true)}>
                {_("espandi")}
            </Button>
        </span>
    </Item>

    return <Item title={title}>
        <ListFilters stats={stats}/>
        <div className="noPrint">
        { !isShort && 
            <Button className="noPrint" onClick={() => setOpen(false)}>
                {_("nascondi")}
            </Button>
        }
        <FilterButtons/>
        </div>
        <Table className="table" hover>
            <thead>
                <tr>
                    <th>{_("scuola")}</th>
                    <th>{_("città")}</th>
                    <th>{_("classe")}</th>
                    <th>{_("partecipanti")}</th>
                    <th>{_("variante")}</th>
                    <th>{_("data")}</th>
                </tr>
            </thead>
            <tbody>
        { 
            stats.polls.map(c => {
                const selected = value(selectedPollIdsState).includes(c._id)?"bg-warning":""
                return <tr key={c._id.toString()} onClick={() => true ? toggle(c._id) : router.push(composeURL(c._id))}>
                    <td className={selected}>
                        {c?.school?.name} 
                    </td>
                    <td className={selected}>
                        {(_.locale==='fu' && c?.school?.city_fu) || c?.school?.city}
                    </td>
                    <td className={selected}>
                        {c?.year}&nbsp;{c.class}
                    </td>
                    <td className={selected}>
                        {c?.entriesCount}
                    </td>
                    <td className={selected}>
                        { questionary.forms[c?.form]?.name[_.locale] }
                    </td>
                    <td className={selected}>
                        {formatDate(c?.date)}
                    </td>
                </tr>})
        }   
        </tbody>
        <thead>
        {   stats.polls.length > 1 &&
            <tr>
                <th colSpan={2}>{_("totale")}</th>
                <th>{stats.polls.length}</th>
                <th>{stats.entriesCount}</th>
            </tr>
        }
        </thead>
        </Table>
        { isLong &&
        <div className="noPrint">
            <FilterButtons/>
        </div>
        }
    </Item>

    function FilterButtons() {
        return <>
            { value(selectedPollIdsState).length > 0 &&
                <Button className="noPrint mx-1" onClick={() => {set(selectedPollIdsState,[]);set(pollIdsState,[...value(selectedPollIdsState)])}}>
                    {_("filtra selezionate")}
                </Button>
            } 
            { value(pollIdsState).length > 0 &&
                <Button className="noPrint mx-1" onClick={() => set(pollIdsState,[])}>
                    {_("annulla filtro")}
                </Button>
            }
        </> 
    }

    function composeURL(poll: string) {
        const query = new URLSearchParams(searchParams.toString())
        query.set('poll', poll)
        return `${window.location.origin}${window.location.pathname}?${query.toString()}`
    }

    function toggle(poll_id: string) {
        update(selectedPollIdsState, selected => {
            if (selected.includes(poll_id)) return selected.filter(x => x !== poll_id)
            return [...selected, poll_id]
        })
    }
}


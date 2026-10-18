import { useTrans } from '@/lib/trans'

export default function ReportFilterSummary({ filters, schoolName }: { filters: any, schoolName?: string | null }) {
    const _ = useTrans()
    const parts = []
    if (filters.year) parts.push(`${_("anno scolastico")}: ${filters.year}/${filters.year + 1}`)
    if (filters.city) parts.push(`${_("città")}: ${filters.city}`)
    if (filters.schoolId) parts.push(`${_("scuola")}: ${schoolName || _("scuola selezionata")}`)
    if (filters.schoolType) parts.push(_({ first: 'tutte le scuole di primo grado', second: 'tutte le scuole di secondo grado', primary: 'scuola primaria' }[filters.schoolType as 'first' | 'second' | 'primary']))
    if (filters.class) parts.push(`${_("classe")}: ${filters.class}`)
    if (filters.form) parts.push(_(filters.form === 'short' ? 'questionario breve' : 'questionario completo'))
    if (filters.polls?.length) parts.push(_('% classi selezionate', filters.polls.length))
    return <span>{parts.join(' · ') || _("Tutti i dati accessibili all'autore")}</span>
}

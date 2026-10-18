import type { IStats } from '@/pages/api/graphql/resolvers/stats'

function filenamePart(value: string) {
    return value.normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
}

export function reportFilename(stats: Pick<IStats, 'polls'>, locale: string) {
    const fallback = `report-${locale}.pdf`
    if (stats.polls.length !== 1) return fallback

    const [poll] = stats.polls
    const school = filenamePart(poll.school?.name || '')
    const className = filenamePart(`${poll.year || ''}${poll.class || ''}`)
    if (!school || !poll.year || !poll.class || !className) return fallback

    return `report-${school}-${className}-${locale}.pdf`
}

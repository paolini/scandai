import { useRouter } from 'next/router'
import type { ParsedUrlQuery } from 'querystring'
import type { State } from './State'
import { requireArray, requireSingle } from './utils'

export default function useReportFilters() {
    const router = useRouter()
    const schoolType = requireSingle(router.query.school_type)
    const pollIds = requireArray(router.query.poll)

    function updateFilters(updates: ParsedUrlQuery) {
        const query = { ...router.query, ...updates }
        for (const key of Object.keys(query)) {
            if (query[key] === '' || query[key] === undefined || query[key]?.length === 0) delete query[key]
        }
        return router.replace({ pathname: router.pathname, query }, undefined, { shallow: true, scroll: false })
    }

    const pollIdsState: State<string[]> = [pollIds, updater => {
        void updateFilters({ poll: updater(pollIds) })
    }]

    return {
        year: requireSingle(router.query.year),
        schoolId: requireSingle(router.query.school_id),
        schoolType: schoolType === 'first' || schoolType === 'second' ? schoolType : null,
        city: requireSingle(router.query.city),
        form: requireSingle(router.query.form),
        className: requireSingle(router.query.class),
        pollIdsState,
        updateFilters,
    }
}

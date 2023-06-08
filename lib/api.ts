import useSWR from 'swr'

import { IClass } from '@/models/Class'
import { IEntry } from '@/models/Entry'
import { IStats } from '@/pages/api/stats'

const fetcher = (...args: [any]) => fetch(...args).then(res => res.json())

interface Data<T> {
    data: T
}

export function useApi<T>(url: string) {
    return useSWR<Data<T>>(`/api/${url}`, fetcher)
}

export function useClasses() {
    return useApi<IClass[]>('classes')
}

export function useEntries() {
    return useApi<IEntry[]>('entries')
}

export function useStats() {
    return useApi<IStats>('stats')
}
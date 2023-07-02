import useSWR from 'swr'

import { IClass } from '@/models/Class'
import { IEntry } from '@/models/Entry'
import { IStats } from '@/pages/api/stats'
import { IUser } from '@/models/User'

// const fetcher = (...args: [any]) => fetch(...args).then(res => res.json())

async function fetcher(...args: [any]) {
    const res = await fetch(...args)
    if (!res.ok) throw new Error(`${res.statusText} (${res.status})`)
    const json = await res.json()
    return json 
}

export interface Data<T> {
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

export function useUsers() {
    return useApi<IUser[]>('users')
}

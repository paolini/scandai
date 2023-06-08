import useSWR from 'swr'

import { IQuestions } from '@/pages/api/questions'
import { IClass } from '@/models/Class'
import { IEntry } from '@/models/Entry'

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

export function useQuestions() {
    return useApi<IQuestions>('questions')
}

export function useEntries() {
    return useApi<IEntry[]>('entries')
}
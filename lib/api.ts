import useSWR from 'swr'

import { IGetPoll, IPostPoll } from '@/models/Poll'
import { IPostUser, IGetUser } from '@/models/User'
import { IPostSchool, IGetSchool } from '@/models/School'
import { IGetEntry } from '@/models/Entry'
import { IStats } from '@/pages/api/stats'
import { IDictElement, IPostDict } from '@/models/Dict'
import { IGetTranslation, IPostTranslation } from '@/models/Translation'

async function fetcher([url, query]: [url:URL|RequestInfo, query?: any], init?: RequestInit) {
    if (query) {
        const params = new URLSearchParams(query)
        url = `${url}?${params}`
    }
    const res = await fetch(url, init)
    if (!res.ok) {
        throw new Error(`fetch error: ${res.status}`)
    }
    const json = await res.json()
    return json 
}

export interface Data<T> {
    data: T
}

export function useIndex<T>(url: string, query?: any, enabled=true) {
    return useSWR<Data<T>>([enabled ? `/api/${url}` : null, query], fetcher)
}

export function useGet<T>(url: string, id_: string | null) {
    // use id_=null to disable the query
    return useSWR<T>(id_ !== null ? [`/api/${url}/${id_}`] : null, fetcher)
}

export async function post<T>(url: string, data: T) {
    const res = await fetcher([`/api/${url}`], {
        method: 'POST',
        body: JSON.stringify(data)
    })
    return res
}

interface WithId {
    _id: string
}

export async function remove(url: string, obj: WithId) {
    return await fetcher([`/api/${url}/${obj._id}`], {
        method: 'DELETE',
    })
}

export async function patch(url: string, obj: WithId, querystring: string = '') {
    const res = await fetcher([`/api/${url}/${obj._id}?${querystring}`], {
        method: 'PATCH',
        body: JSON.stringify(obj)
    })
    return res
}

export async function deleteEntry(obj: WithId) {
    return remove('entries', obj)
}

export function usePolls(filter?: any, enabled=true) {
    return useIndex<IGetPoll[]>('polls', filter, enabled)
}

export async function postPoll(poll: IPostPoll): Promise<{data: IGetPoll}> {
    return await post<IPostPoll>('polls', poll)
}

export async function patchPoll(poll: any, adminSecret:string='') {
    return await patch('polls', poll, adminSecret ? `secret=${adminSecret}` : '')
}

export async function deletePoll(poll: IGetPoll) {
    await remove('polls', poll)
}

export function useEntries(query?: any) {
    return useIndex<IGetEntry[]>('entries', query)
}

export function useStats(query?: any) {
    return useIndex<IStats>('stats', query)
}

export function useUsers() {
    return useIndex<IGetUser[]>('users')
}

export async function patchUser(user: any) {
    return await patch('users', user)
}

export function useProfileQuery() {
    return useGet<IGetUser>('profile', '')
}

/**
 * @returns {IGetUser} the current user if logged in
 * @returns {null} if not logged in
 * @returns {undefined} if loading
 */
export function useProfile() {
    return useProfileQuery().data
}

export async function patchProfile(user: any) {
    return await patch('profile', {...user, _id: ''})
}

export async function postUser(user: IPostUser): Promise<{data: IGetUser, password: string}> {
    return await post<IPostUser>('users', user)
}

export async function deleteUser(user: IGetUser) {
    return await remove('users', user)
}

export function useSchools() {
    return useIndex<IGetSchool[]>('schools')
}

export function useSchool(id_: string | null) {
    // use null to disable
    return useGet<IGetSchool>('schools', id_)
}

export async function patchSchool(school: any) {
    return await patch('schools', school)
}

export async function postSchool(school: IPostSchool): Promise<{data: IGetSchool}> {
    return await post<IPostSchool>('schools', school)
}

export async function deleteSchool(school: IGetSchool) {
    return await remove('schools', school)
}

export function useDict() {
    return useIndex<IDictElement[]>('dict')
}    

export async function postDict(dict: IPostDict): Promise<{data: IDictElement}> {
    return await post<IPostDict>('dict', dict)
}

export function useTranslation() {
    return useIndex<IGetTranslation>('translation')
}

export async function postTranslation(translation: IPostTranslation) {
    return await post<IPostTranslation>('translation', translation)
}
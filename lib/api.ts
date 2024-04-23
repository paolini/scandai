import useSWR, { SWRResponse } from 'swr'

import { IGetPoll, IPostPoll } from '@/models/Poll'
import { IPostUser, IGetUser } from '@/models/User'
import { IPostSchool, IGetSchool } from '@/models/School'
import { IGetEntry } from '@/models/Entry'
import { IStats } from '@/pages/api/stats'
import { IDictElement, IPostDict } from '@/models/Dict'
import { IGetTranslation, IPostTranslation } from '@/models/Translation'
import Config, {IGetConfig} from '@/models/Config'

async function fetcher(keyArray: null|false|any[], options?: RequestInit) {
    if (!keyArray) return null
    let url = `/api`
    for (const key of keyArray) {
        if (typeof key === 'string') {
            url += '/' + key
        } else {
            url += '?' + new URLSearchParams(key)
        }
    }
    const res = await fetch(url, options)
    if (!res.ok) {
        throw new Error(`fetch error: ${res.status}`)
    }
    const json = await res.json()
    return json 
}

export interface IndexData<T> {
    data: T,
}


export function useIndex<T>(url: string, query?: any, enabled=true): SWRResponse<IndexData<T>> {
    return useSWR(enabled && [url, query], fetcher)
}

export function useGet<T>(url: string, id_: string | null): SWRResponse<T> {
    // use id_=null to disable the query
    return useSWR(id_ !== null && [url,id_], fetcher)
}

export async function post<T>(url: string, data: T) {
    const res = await fetcher([url], {
        method: 'POST',
        body: JSON.stringify(data)
    })
    return res
}

interface WithId {
    _id: string
}

export async function remove(url: string, obj: WithId) {
    return await fetcher([url,obj._id], {
        method: 'DELETE',
    })
}

export async function patch(url: string, obj: WithId, query?: any) {
    const res = await fetcher([url, obj._id, query || {}], {
        method: 'PATCH',
        body: JSON.stringify(obj)
    })
    return res
}

export function useConfig(): SWRResponse<IGetConfig> {
    return useSWR(['config'], fetcher)
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
    return await patch('polls', poll, adminSecret ? {secret: adminSecret } : {})
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
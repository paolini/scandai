import Switch from "react-switch"
import { Button, ButtonGroup, Card, Table } from "react-bootstrap"
import { FaCirclePlus, FaTrash } from "react-icons/fa6"
import { useState } from "react"
import { Router, useRouter } from "next/router"

import { useSchools, postSchool, deleteSchool, patchSchool } from '@/lib/api'
import { IGetSchool, IPostSchool } from '@/models/School'
import { useAddMessage } from '@/components/Messages'
import useSessionUser from '@/lib/useSessionUser'
import { value, set, get } from '@/lib/State'
import Input from '@/components/Input'
import Page from '@/components/Page'
import Loading from '@/components/Loading'

export default function Schools() {
    const router = useRouter()
    const sessionUser = useSessionUser()
    const schoolsQuery = useSchools()
    const addMessage = useAddMessage()

    if (schoolsQuery.isLoading) return <Loading />
    if (!schoolsQuery.data) return <div>{schoolsQuery.error.message}</div>
    const schools = schoolsQuery.data.data

    return <Page>
        <h2>Scuole</h2>
        <Button onClick={() => router.push('/school/__new__')}>
            <FaCirclePlus className="m-1 bg-blue-300"/>
            aggiungi scuola
        </Button>
        <Table hover>
            <thead>
                <tr>
                    <th>nome</th>
                    <th>città</th>
                    <th>questionari</th>
                </tr>
            </thead>
            <tbody>
                { schools.map((school) => 
                <tr key={school._id} onClick={() => router.push(`/school/${school._id}`)}>
                    <td>{school.name}</td>
                    <td>{school.city}</td>
                    <td>{school.pollCount}</td>
                </tr>)}
            </tbody>
        </Table>
    </Page>
}
import Switch from "react-switch"

import { useUsers } from '@/lib/api'
import Headers from '@/components/Header'
import { IUser } from '@/models/User'
import { useAddMessage } from '@/components/Messages'
import { Data } from '@/lib/api'
import useSessionUser from '@/lib/useSessionUser'

export default function Users() {
    const sessionUser = useSessionUser()
    const usersQuery = useUsers()
    const addMessage = useAddMessage()
    if (usersQuery.isLoading) return <div>Loading...</div>
    if (!usersQuery.data) return <div>{usersQuery.error.message}</div>
    const users = usersQuery.data.data

    const setAdmin = async (user: IUser, isAdmin: boolean) => {
        if (user.isAdmin === isAdmin) return
        try {
            const res = await fetch(`/api/user/${user._id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({isAdmin})
              })

            if (!res.ok) {
                addMessage(`error updating user ${user._id}, ${res.status} ${res.statusText}`)
                return
            }
            const newData: Data<IUser> = await res.json()
            usersQuery.mutate()
        } catch(e) {
            console.error(e)
        }
    }

    return <>
        <Headers />
        <h2>Users</h2>
        <table className="table">
            <thead>
                <tr>
                    <td>email</td>
                    <td>name</td>
                    <td>admin</td>
                </tr>
            </thead>
            <tbody>
                { users.map((user) => <tr key={user._id.toString()}>
                    <td>{user.email}</td>
                    <td>{user.name || user.username}</td>
                    <td><Switch
                            disabled={user._id === sessionUser?._id}
                            checked={user.isAdmin}
                            onChange={(checked) => {setAdmin(user, checked)}} />
                    </td>
                </tr>)}
            </tbody>
        </table>

    </>
}
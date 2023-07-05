import Switch from "react-switch"

import { useUsers } from '@/lib/api'
import Headers from '@/components/Header'
import { IGetUser } from '@/models/User'
import { useAddMessage } from '@/components/Messages'
import { patchUser } from '@/lib/api'
import useSessionUser from '@/lib/useSessionUser'

export default function Users() {
    const sessionUser = useSessionUser()
    const usersQuery = useUsers()
    const addMessage = useAddMessage()
    if (usersQuery.isLoading) return <div>Loading...</div>
    if (!usersQuery.data) return <div>{usersQuery.error.message}</div>
    const users = usersQuery.data.data

    const setAdmin = async (user: IGetUser, isAdmin: boolean) => {
        if (user.isAdmin === isAdmin) return
        try {
            const newData = await patchUser({_id: user._id, isAdmin }) 
            usersQuery.mutate()
        } catch(e) {
            addMessage('error', `error updating user: ${e}`)
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
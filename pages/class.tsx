import {useClasses} from '@/lib/api'
import {useSession} from 'next-auth/react'

import Headers from '@/components/Header'

export default function Class({}) {
    const classesQuery = useClasses()
    const {data: session, status} = useSession()

    if (classesQuery.isLoading) return <div>Loading...</div>
    if (!classesQuery.data) return <div>Failed to load</div>

    return <>
        <Headers />
        status: {status}, session: {JSON.stringify(session)}
        <h2>Classi</h2>
        <table className="table">
            <thead>
                <tr>
                    <th>Codice</th>
                    <th>Scuola</th>
                    <th>Classe</th>
                </tr>
            </thead>
            <tbody>
            { classesQuery.data.data.map(c =>
                
                <tr key={c._id.toString()}>
                    <td>{c.slug}</td>
                    <td>{c.school}</td>
                    <td>{c.class}</td>
                    </tr>
                    )
                    }
            </tbody>
        </table>
    </>
}
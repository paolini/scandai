import { useSession } from 'next-auth/react'

export default function useSessionUser() {
    const { data, status } = useSession()
    if (status === 'loading') return null
    if (data && data.dbUser) return data.dbUser
    return null
}
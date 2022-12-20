import { useState, useEffect, useCallback } from 'react'

export const useAuth = () => { 

    const [session, setSession] = useState(null)
    const [userId, setUserId] = useState(null)
    const [isReady, setIsReady] = useState(false)
    const [isAdmin, setIsAdmin] = useState(false)

    const login = useCallback((session, id, isAdmin, userName) => {
        setSession(session)
        setUserId(id)
        setIsAdmin(isAdmin)
        localStorage.setItem('user', JSON.stringify({
            userId: id,
            session: session,
            isAdmin: isAdmin,
            userName: userName
        }))
    }, [])

    const logout = () => {
        setSession(null)
        setUserId(null)
        setIsAdmin(false)
        localStorage.removeItem('user')
    }

    const getCurrentUser = () => {
        return JSON.parse(localStorage.getItem('user'))
    }

    const getUser = (userId) => {
        return new Promise( async (resolve, reject) => {
            const response = await fetch('/api/auth/user?' + new URLSearchParams({ _id : userId }))
            const data = await response.json();
            resolve(data.user)
        })
    }

    useEffect(() => { 
        const data = JSON.parse(localStorage.getItem('user'))

        if(data && data.session){
            login(data.session, data.userId, data.isAdmin, data.userName)
        }
        setIsReady(true)

    }, [ login ])

    return { session, userId, isAdmin, isReady, login, logout, getCurrentUser, getUser }

}
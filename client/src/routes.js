import React from 'react'
import { Routes, Route } from 'react-router-dom'

import Login from './pages/Login/Login'
import Admin from './pages/Admin/Admin'
import GoogleRoutes from './pages/Routes/Routes'

export const useRoutes = (isLogin, isAdmin) => { 

    console.log('isLogin : ', isLogin)
    console.log('isAdmin : ', isAdmin)

    return (
        <Routes>
            <Route path="/" element={ isLogin ? <GoogleRoutes /> : <Login/>  }/>
            <Route path="/account" element={ isLogin ? ( isAdmin ? <Admin /> : <GoogleRoutes /> ) : <Login/> }/>
            <Route path="/login" element={ <Login/> }/>
        </Routes>
    )
}
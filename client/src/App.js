
import 'rsuite/dist/rsuite.min.css'

import { BrowserRouter as Router } from 'react-router-dom'

import { AuthContext } from './contexts/AuthContext'
import { DataContext } from './contexts/DataContext'

import { useAuth } from './hooks/auth.hook'
import { useData } from './hooks/data.hook'

import { useRoutes } from './routes'

import Navigation from './components/Navigation/Navigation'

function App() {

  const { session, userId, isAdmin, isReady, login, logout, getCurrentUser, getUser } = useAuth()

  const isLogin = !!session

  const routes = useRoutes(isLogin, isAdmin)

  const { record, records, drivers, groutes, googleRouteOptions, isNew, loading, getAllRecords, getDrivers, getRoutes, setRecord, setRecords, setIsNew, setIsReady, upsertRecord, deleteRecord, cloneRecord, uploadPhoto, notifyAdmin, getFiles } = useData()

  return (
    <AuthContext.Provider value={{ session, userId, isAdmin, isReady, isLogin, login, logout, getCurrentUser, getUser }}>
      <DataContext.Provider value={{ record, records, drivers, groutes, googleRouteOptions, isNew, loading, getAllRecords, getDrivers, getRoutes, setRecord, setRecords, setIsNew, setIsReady, upsertRecord, deleteRecord, cloneRecord, uploadPhoto, notifyAdmin, getFiles }}>
        <Router>
          <Navigation />
          { routes }
        </Router>
      </DataContext.Provider>
    </AuthContext.Provider>
  );
}

export default App;

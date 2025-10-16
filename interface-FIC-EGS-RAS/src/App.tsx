import { Route, Routes, Navigate } from 'react-router-dom'
import Header from '@/pages/Header/Header'
import Footer from '@/pages/Footer/Footer'
import InfoPage from '@pages/InfoPage/InfoPage.tsx'
import StationsPage from '@pages/StationsPage/StationsPage.tsx'
import AccessPage from '@pages/AccessPage/AccessPage.tsx'
import Login from '@pages/Authorization/Login/Login.tsx'
import Registration from '@pages/Authorization/Registration/Registration.tsx'
import ProtectedRoute from '@components/ProtectedRoute/ProtectedRoute'
import { AuthProvider } from '@contexts/AuthContext'
import '@pages/Authorization/Authorization.scss'

function App() {
  return (
    <AuthProvider>
      <div className="page__container">
        <Header />
        <Routes>
          <Route path='/' element={<Navigate to='/Information' replace />} />
          <Route path='/Information' element={<InfoPage />} />
          <Route path='/Stations' element={<StationsPage />} />
          <Route 
            path='/Access' 
            element={
              <ProtectedRoute>
                <AccessPage />
              </ProtectedRoute>
            } 
          />
          <Route path='/Login' element={<Login />} />
          <Route path='/Registration' element={<Registration />} />
        </Routes>
        <Footer />
      </div>
    </AuthProvider>
  );
}

export default App;

import '@pages/Authorization/Authorization.scss';
import { Route, Routes, Navigate } from 'react-router-dom';
import Header from '@/pages/Header/Header.tsx';
import Footer from '@/pages/Footer/Footer.tsx';
import MapPage from '@/pages/MapPage/MapPage.tsx';
import ReportsPage from '@pages/ReportsPage/ReportsPage.tsx';
import StationPage from '@/pages/StationPage/StationPage/StationPage.tsx';
import StationsPage from '@pages/StationPage/StationsPage.tsx';
import Login from '@pages/Authorization/Login/Login.tsx';
import Registration from '@pages/Authorization/Registration/Registration.tsx';
import AccessPage from '@pages/AccessPage/AccessPage.tsx';
import ResetPassword from '@pages/Authorization/ResetPassword/ResetPassword.tsx';
import ProtectedRoute from '@components/ProtectedRoute/ProtectedRoute.tsx';
import UserProfile from '@pages/Authorization/UserProfile/UserProfile.tsx';

function App() {
  return (
    <div className='page'>
      <div className='page__container'>
        <Header />
        <Routes>
          <Route path='/' element={<Navigate to='/Map' replace />} />
          <Route path='/Map' element={<MapPage />} />
          <Route path='/Reports' element={<ReportsPage />} />
          <Route path='/Stations' element={<StationsPage />} />
          <Route path='/Stations/:stationName' element={<StationPage />} />
          <Route
            path='/Access'
            element={
              <ProtectedRoute>
                <AccessPage />
              </ProtectedRoute>
            }
          />
          <Route
            path='/UserProfile'
            element={
              <ProtectedRoute>
                <UserProfile />
              </ProtectedRoute>
            }
          />
          <Route path='/Login' element={<Login />} />
          <Route path='/Registration' element={<Registration />} />

          {/* Маршрут для ссылок из письма (в формате /reset-password-confirm/uid/token/) */}
          <Route path='/reset-password-confirm/:uid/:token' element={<ResetPassword />} />

          {/* Общий маршрут для страницы восстановления (без параметров) */}
          <Route path='/ResetPassword' element={<ResetPassword />} />

          {/* Альтернативный маршрут с параметрами (если ссылка в другом формате) */}
          <Route path='/ResetPassword/:uid/:token' element={<ResetPassword />} />
        </Routes>
        <Footer />
      </div>
    </div>
  );
}

export default App;

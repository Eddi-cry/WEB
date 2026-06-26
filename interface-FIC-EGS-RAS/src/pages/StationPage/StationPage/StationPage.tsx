import './StationPage.scss';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import LeftPanel from '@pages/StationPage/LeftPanel/LeftPanel.tsx';
import { Station } from '@constants/constants.ts';

function StationPage() {
  const { stationName } = useParams<{ stationName: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const stationData = location.state?.stationData as Station | undefined;

  useEffect(() => {
    if (!stationName) {
      navigate('/Map');
    }
  }, [stationName, navigate]);

  return (
    <section className='station-page'>
      <div className='station-page__container'>
        <h1 className='station-page__title'>Паспорт станции {stationName?.toUpperCase()}</h1>
        <button
          type='button'
          className='station-page__back-button'
          onClick={() => navigate('/Stations')}
        >
          ← К списку станций
        </button>
        <div className='station-page__content'>
          <LeftPanel station={stationData} />
        </div>
      </div>
    </section>
  );
}

export default StationPage;

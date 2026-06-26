import './StationsPage.scss';
import { activeStations, caucasusStations } from '@constants/constants.ts';
import { useStation } from '@context/StationContext.tsx';

function StationsPage() {
  const { stations, handleRedirect } = useStation();

  return (
    <section className='stations-page'>
      <div className='stations-page__container'>
        <h1 className='stations-page__title'>Станции ФИЦ ЕГС РАН</h1>

        <div className='stations-page__lists'>
          <div className='stations-page__list'>
            <h2 className='stations-page__subtitle'>Опорная сеть</h2>
            <ul className='stations-page__items'>
              {stations
                .filter((station) =>
                  activeStations.some((activeStation) => activeStation.Name === station.Name),
                )
                .map((station) => (
                  <li
                    key={station.Name}
                    className='stations-page__item'
                    onClick={() => handleRedirect(station)}
                  >
                    <span className='stations-page__item-name'>{station.Name?.toUpperCase()}</span>
                    {station.Region && (
                      <span className='stations-page__item-region'>{station.Region}</span>
                    )}
                  </li>
                ))}
            </ul>
          </div>

          <div className='stations-page__list'>
            <h2 className='stations-page__subtitle'>Региональная сеть</h2>
            <ul className='stations-page__items'>
              {stations
                .filter((station) =>
                  caucasusStations.some((caucasusStation) => caucasusStation.Name === station.Name),
                )
                .map((station) => (
                  <li
                    key={station.Name}
                    className='stations-page__item'
                    onClick={() => handleRedirect(station)}
                  >
                    <span className='stations-page__item-name'>{station.Name?.toUpperCase()}</span>
                    {station.Region && (
                      <span className='stations-page__item-region'>{station.Region}</span>
                    )}
                  </li>
                ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

export default StationsPage;

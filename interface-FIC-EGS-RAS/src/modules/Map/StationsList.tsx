import { Station } from '@constants/constants.ts';

type StationsListProps = {
  title: string;
  stations: Station[];
  allowedNames: Set<string>;
  selectedStation: Station | null;
  onStationClick: (station: Station) => void;
};

function StationsList({
  title,
  stations,
  allowedNames,
  selectedStation,
  onStationClick,
}: StationsListProps) {
  return (
    <ul className='cards__map-info-list'>
      <span className='cards__map-info-item-title'>{title}</span>
      {stations
        .filter((station) => allowedNames.has(station.Name))
        .map((station) => {
          const isSelected = selectedStation?.Name === station.Name;
          return (
            <li
              className={`cards__map-info-item ${isSelected ? 'cards__map-info-item--selected' : ''}`}
              key={station.Name}
              onClick={() => onStationClick(station)}
            >
              <span className='cards__map-info-item-title'>{station.Name.toUpperCase()}</span>
            </li>
          );
        })}
    </ul>
  );
}

export default StationsList;

import 'leaflet/dist/leaflet.css';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import markers from '@components/CustomMarker/CustomMarker.tsx';
import { Station } from '@constants/constants.ts';

const DEFAULT_ZOOM = 12;
const { customGreenMarkerIcon } = markers;

// Исправляем пути к иконкам по умолчанию для Leaflet
const iconDefaultProto = L.Icon.Default.prototype as unknown as { _getIconUrl?: unknown };
delete iconDefaultProto._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

function StationParamsMap({ station }: { station: Station | undefined }) {
  if (!station || !station.Latitude || !station.Longitude) {
    return null;
  }

  const lat = Number(station.Latitude);
  const lng = Number(station.Longitude);

  if (Number.isNaN(lat) || Number.isNaN(lng)) {
    return null;
  }

  const center: [number, number] = [lat, lng];

  return (
    <div className='station-page__map-container'>
      <MapContainer
        center={center}
        zoom={DEFAULT_ZOOM}
        style={{ height: '70%', width: '60%' }}
        attributionControl={false}
        scrollWheelZoom
      >
        <TileLayer
          // attribution='&copy; <a href="https://carto.com/">CARTO</a>'
          url='https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png'
          // url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
        />
        <Marker position={center} icon={customGreenMarkerIcon}>
          <Popup className='station-page__map-popup' offset={[-8, 15]}>
            <strong>{station.Name?.toUpperCase()}</strong>
            <p>
              Широта: {station.Latitude}, Долгота: {station.Longitude}
            </p>
          </Popup>
        </Marker>
      </MapContainer>
    </div>
  );
}

export default StationParamsMap;

import './Map.scss';
import 'leaflet/dist/leaflet.css';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, GeoJSON, Tooltip, useMap } from 'react-leaflet';
import type L from 'leaflet';
import type { GeoJsonObject } from 'geojson';
import russianBorder from '@constants/russian.json';
import markers from '@components/CustomMarker/CustomMarker.tsx';
import MapInfo from './MapInfo.tsx';
import {
  position,
  Station,
  activeStations,
  activeStationsNames,
  caucasusStationsNames,
} from '@constants/constants.ts';
import StationsList from './StationsList.tsx';
import { useStation } from '@context/StationContext.tsx';

type StationsByCoords = Record<string, Station[]>;
type GeoJSONFeatureLike = { geometry?: { coordinates?: unknown } };
type GeoJSONCollectionLike = { features?: GeoJSONFeatureLike[] };

const { customGreenMarkerIcon, customOrangeMarkerIcon } = markers;

// Сшивает Россию по 180 меридиану
function fixCoords(coords: unknown): unknown {
  if (!Array.isArray(coords)) return coords;

  if (coords.length === 2 && typeof coords[0] === 'number' && typeof coords[1] === 'number') {
    let lng = coords[0];
    const lat = coords[1];
    if (lng < 0) lng += 360; // Переносим отрицательные долготы
    return [lng, lat];
  }

  return coords.map((c) => fixCoords(c));
}

function fixGeoJSONCoordinates(geojson: GeoJsonObject): GeoJsonObject {
  const fixed = JSON.parse(JSON.stringify(geojson)) as GeoJSONCollectionLike;
  if (!fixed || typeof fixed !== 'object' || !Array.isArray(fixed.features)) return geojson;

  fixed.features.forEach((feature) => {
    if (feature.geometry) {
      feature.geometry.coordinates = fixCoords(feature.geometry.coordinates);
    }
  });

  return fixed as unknown as GeoJsonObject;
}

function Map() {
  const { stations, handleRedirect } = useStation();
  const [selectedStation, setSelectedStation] = useState<Station | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<Record<string, L.Marker | null>>({});

  function MapRefSetter({ onMap }: { onMap: (map: L.Map) => void }) {
    const map = useMap();
    useEffect(() => {
      onMap(map as unknown as L.Map);
    }, [map, onMap]);
    return null;
  }

  const stationsByCoords: StationsByCoords = stations.reduce((acc, station) => {
    const key = station.Latitude + ',' + station.Longitude;
    if (!acc[key]) acc[key] = [];
    acc[key].push(station);
    return acc;
  }, {} as StationsByCoords);

  const handleClick = useCallback(
    (station: Station): void => {
      if (selectedStation && selectedStation.Name === station.Name) {
        setSelectedStation(null);
      } else {
        const confirmation = confirm('Хотите перейти на подробный паспорт станции?');
        if (!confirmation) return;
        handleRedirect(station);
        setSelectedStation(station);
      }
    },
    [handleRedirect, selectedStation],
  );

  const activeNamesSet = useMemo(() => new Set(activeStationsNames), []);
  const caucasusNamesSet = useMemo(() => new Set(caucasusStationsNames), []);

  const handleStationListClick = useCallback(
    (station: Station) => {
      handleClick(station);

      const key = `${station.Latitude},${station.Longitude}`;
      markersRef.current[key]?.openPopup();

      const map = mapRef.current;
      if (map) {
        map.setView(
          [Number(station.Latitude), Number(station.Longitude)] as L.LatLngExpression,
          Math.max(map.getZoom(), 5),
        );
      }
    },
    [handleClick],
  );

  return (
    <section className='cards'>
      <div className='cards__container'>
        <h2 className='cards__title'>Сеть станций ФИЦ ЕГС РАН</h2>
        <div className='cards__map-container'>
          <div className='cards__map'>
            <MapContainer
              center={position}
              zoom={2}
              style={{ height: '100%', width: '100%' }}
              attributionControl={false}
            >
              <MapRefSetter
                onMap={(map) => {
                  mapRef.current = map;
                }}
              />
              <TileLayer
                // attribution='&copy; <a href="https://carto.com/">CARTO</a>'
                url='https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png'
                // url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
              />
              <GeoJSON
                data={fixGeoJSONCoordinates(russianBorder as unknown as GeoJsonObject)} // фиксируем границы
                style={{ color: 'gray', weight: 1.25, fill: true }}
              />
              {Object.entries(stationsByCoords).map(([coordsStr, stationsGroup]) => {
                const coords = coordsStr.split(',').map(Number);
                const isActive = stationsGroup.some((groupStation) =>
                  activeStations.some((activeStation) => activeStation.Name === groupStation.Name),
                );
                return (
                  <Marker
                    key={coordsStr}
                    position={[coords[0], coords[1]] as [number, number]}
                    icon={isActive ? customGreenMarkerIcon : customOrangeMarkerIcon}
                    ref={(marker) => {
                      markersRef.current[coordsStr] = marker as unknown as L.Marker | null;
                    }}
                    eventHandlers={{
                      click: () => {
                        handleClick(stationsGroup[0]);
                      },
                    }}
                  >
                    <Tooltip
                      permanent
                      direction='top'
                      offset={[-6, -7]}
                      className='cards__map-label'
                      interactive
                      eventHandlers={{
                        click: () => {
                          handleClick(stationsGroup[0]);
                        },
                      }}
                    >
                      {stationsGroup[0]?.Name?.toUpperCase()}
                    </Tooltip>
                    <Popup className='cards__map-popup' offset={[0, 20]}>
                      {stationsGroup.map((station: Station) => (
                        <div key={station.Name}>
                          <h3
                            className='cards__map-popup__title'
                            onClick={() => setSelectedStation(station)}
                          >
                            <strong>{station.Name.toUpperCase()}</strong>
                          </h3>
                          <p className='cards__map-popup__description'>
                            <strong>Местоположение</strong>: {station.Region}
                          </p>
                          <p className='cards__map-popup__description'>
                            <strong>Координаты:</strong>{' '}
                            {station.Latitude + ', ' + station.Longitude}
                          </p>
                          {station.Receiver && (
                            <p className='cards__map-popup__description'>
                              <strong>Приемник:</strong> {station.Receiver.Name}
                            </p>
                          )}
                          {station.Receiver && (
                            <p className='cards__map-popup__description'>
                              <strong>Спутниковая система:</strong>{' '}
                              {station.Receiver.SatelliteSystem}
                            </p>
                          )}
                        </div>
                      ))}
                    </Popup>
                  </Marker>
                );
              })}
            </MapContainer>
          </div>
          <div className='cards__map-info'>
            <StationsList
              title='Опорная сеть:'
              stations={stations}
              allowedNames={activeNamesSet}
              selectedStation={selectedStation}
              onStationClick={handleStationListClick}
            />
            <StationsList
              title='Региональная сеть:'
              stations={stations}
              allowedNames={caucasusNamesSet}
              selectedStation={selectedStation}
              onStationClick={handleStationListClick}
            />
          </div>
          <MapInfo />
        </div>
      </div>
    </section>
  );
}

export default Map;

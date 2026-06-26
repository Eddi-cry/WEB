import { createContext, useContext, useState, useEffect } from 'react';
import type { Dispatch, ReactNode, SetStateAction } from 'react';
import { useNavigate } from 'react-router-dom';
import { getDataIGS } from '@services/dataService.ts';
import { Station, activeStations, caucasusStations } from '@constants/constants.ts';
import { IGSStation } from '../types/types.ts';

type IGSData = Record<string, IGSStation>;

interface StationContextType {
  stations: Station[];
  setStations: Dispatch<SetStateAction<Station[]>>;
  handleRedirect: (station: Station) => void;
}

const StationContext = createContext<StationContextType | undefined>(undefined);

export const StationProvider = ({ children }: { children: ReactNode }) => {
  const navigate = useNavigate();
  const [stations, setStations] = useState<Station[]>([]);

  useEffect(() => {
    const dataIGS = () => {
      const jsonIGS: IGSData = getDataIGS() as unknown as IGSData;

      const allStations = [...activeStations, ...caucasusStations];

      const filteredStations = allStations.map((station) => {
        if (station.Name) {
          const stationName: string = station.Name.toUpperCase() + '00RUS';
          const igsData = jsonIGS[stationName];
          if (igsData) {
            return {
              ...station,
              ...igsData,
            };
          }
          return station;
        }
        throw new Error('Station name not found');
      });
      setStations(filteredStations);
    };

    dataIGS();
  }, []);

  const handleRedirect = (station: Station): void => {
    const stationData = {
      ...station,
    };

    navigate(`/Stations/${station.Name.toLowerCase()}`, {
      state: { stationData },
    });
  };

  const value = {
    stations,
    setStations,
    handleRedirect,
  };

  return <StationContext.Provider value={value}>{children}</StationContext.Provider>;
};

export const useStation = () => {
  const context = useContext(StationContext);

  if (!context) {
    throw new Error('useAuth must be used within an StationProvider');
  }

  return context;
};

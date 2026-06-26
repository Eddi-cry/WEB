// IGS Station Data Types
export type IGSReceiver = {
  Name?: string;
  SatelliteSystem?: string;
  SerialNumber?: string;
  FirmwareVersion?: string;
  ElevCutoff?: string;
  DateInstalled?: string;
};

export type IGSAntenna = {
  Name?: string;
  Radome?: string;
  SerialNumber?: string;
  ARP?: string;
  MarkerUp?: string;
  MarkerNorth?: string;
  MarkerEast?: string;
  DateInstalled?: string;
};

export type IGSClock = {
  Type?: string;
  InputFrequency?: string;
  EffectiveDates?: string;
};

export type IGSStation = {
  X?: number;
  Y?: number;
  Z?: number;
  Latitude?: string;
  Longitude?: string;
  Height?: string;
  Receiver?: IGSReceiver;
  Antenna?: IGSAntenna;
  Clock?: IGSClock;
};

// Archive Access Types
export type ArchiveDownload = {
  success: boolean;
  download_url?: string;
  file_count: number;
  archive_name: string;
  stations: string[];
  period: string;
  structure: string;
};

export type ArchiveFile = {
  id: string;
  filename: string;
  date: string;
  path: string;
  fullness: number;
  staid_info: {
    staid: number;
    staname: string;
  };
};

export type ArchiveError = {
  error: string;
};

export type ArchiveFiles = Record<string, ArchiveFile[] | ArchiveError>;

export type ArchiveFilesByStation = Record<string, ArchiveFile[]>;

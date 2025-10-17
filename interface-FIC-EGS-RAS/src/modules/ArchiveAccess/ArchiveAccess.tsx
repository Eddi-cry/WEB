import './ArchiveAccess.scss'
import { allStationNames } from '@constants/constants.ts'
import { useState } from 'react'
import Checkbox from '@components/CustomInput/Checkbox.tsx'
import Button from '@components/Button/Button.tsx'
import http from '@services/http.ts'
import ArchiveError from './ArchiveError.tsx'
import ArchiveDownloadInfo from './ArchiveDownloadInfo.tsx'
import ArchiveResults from './ArchiveResults.tsx'
import { ArchiveDownload, ArchiveFilesByStation } from '@/types/types.ts'
import { useAuth } from '@contexts/AuthContext'

function Stations() {
  const { isAuthenticated } = useAuth();
  const [selectedStations, setSelectedStations] = useState<string[]>([]);
  const allSelected: boolean = selectedStations.length === allStationNames.length;
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isDownloading, setIsDownloading] = useState<boolean>(false);
  const [results, setResults] = useState<ArchiveFilesByStation | null>(null);
  const [downloadInfo, setDownloadInfo] = useState<ArchiveDownload | null>(null);
  const [error, setError] = useState<string | null>(null);

  function handleStationChange(station: string) {
    setSelectedStations(prev =>
      prev.includes(station)
        ? prev.filter(s => s !== station)
        : [...prev, station]
    );
  }

  function handleSelectAll() {
    setSelectedStations(allSelected ? [] : allStationNames);
  }

  async function sendRequest(url: string) {
    return await http.post(url, { stations: selectedStations, startDate, endDate });
  }

  async function handleDownload() {
    if (!isAuthenticated) {
      setError('Для скачивания архива необходимо войти в систему. Перейдите на страницу входа.');
      return;
    }

    if (selectedStations.length === 0) {
      setError('Выберите хотя бы одну станцию');
      return;
    }

    setIsDownloading(true);
    setError(null);

    try {
      const response = await sendRequest('/api/download/');
      const data = response.data;

      // Автоматическое скачивание
      const link = document.createElement('a');
      if (!data.download_url) {
        setError('Нет данных за выбранный период');
        return;
      }
      link.href = data.download_url;
      link.download = data.archive_name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setDownloadInfo(data);
    } catch (error: unknown) {
      if (error && typeof error === 'object' && 'response' in error) {
        const anyErr = error as { response?: { data?: { message?: string }, status?: number }, message?: string };
        // Обработка 401 ошибки (неавторизован)
        if (anyErr.response?.status === 401) {
          setError('Сессия истекла. Пожалуйста, войдите в систему заново.');
        } else {
          setError(anyErr.response?.data?.message || anyErr.message || 'Ошибка запроса');
        }
      } else if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('Unknown error occurred');
      }
    } finally {
      setIsDownloading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if(selectedStations.length === 0) {
      setError('Выберите хотя бы одну станцию');
      return;
    }

    setIsLoading(true);
    setError(null);
    setResults(null);

    try {
      console.log('Sending request to /api/stations/');
      const response = await sendRequest('/api/stations/');
      console.log('Response status:', response.status);
      console.log('Response data:', response.data);
      const data = response.data;
      setResults(data);
      console.log('Results set to:', data);
    } catch (error: unknown) {
      if (error && typeof error === 'object' && 'response' in error) {
        const anyErr = error as { response?: { data?: { message?: string } }, message?: string };
        setError(anyErr.response?.data?.message || anyErr.message || 'Ошибка запроса');
      } else if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('Unknown error occurred');
      }
    } finally {
      setIsLoading(false);
    }
  }

  function handleReset() {
    setSelectedStations([]);
    setStartDate('');
    setEndDate('');
    setResults(null);
    setDownloadInfo(null);
    setError(null);
  }

  return(
    <>
      <section className='stations'>
        <form onSubmit={handleSubmit} onReset={handleReset}>
          <div className='stations__container'>
            <h2 className='stations__title'>Доступ к архиву данных ГНСС-наблюдений</h2>
            <div className='stations__list'>
              <h3 className='stations__list-title'>Список станций</h3>
              <div className='stations__list-radio'>
                {
                  allStationNames.map(station => {
                    return <Checkbox
                      key={station}
                      checked={selectedStations.includes(station)}
                      onChange={() => handleStationChange(station)}
                      content={station.toUpperCase()}
                    />
                  })
                }
                <Checkbox checked={allSelected} onChange={handleSelectAll} content={'Выбрать все'}/>
              </div>
            </div>
            <div className='stations__criteria-time'>
              <h3 className='stations__criteria-title'>Временной запрос</h3>
              <div className='stations__criteria-inputs'>
                <label className='stations__criteria-label'>
                  <input
                    type='date'
                    value={startDate}
                    onChange={e => setStartDate(e.target.value)}
                    className='stations__criteria-input'
                    required
                  />
                </label>
                <label className='stations__criteria-label'>
                  –
                  <input
                    type='date'
                    value={endDate}
                    onChange={e => setEndDate(e.target.value)}
                    className='stations__criteria-input'
                    required
                  />
                </label>
              </div>
            </div>
            <div className='stations__buttons'>
              <Button
                onClick={() => handleDownload()}
                aim={!isAuthenticated ? 'stations__download-btn--disabled' : 'stations__download'}
                disabled={isDownloading || !isAuthenticated}
                content={
                  !isAuthenticated 
                    ? 'Скачать архив (требуется вход)' 
                    : isDownloading 
                      ? 'Создание архива...' 
                      : 'Скачать архив'
                }
              />
              <Button
                type="submit"
                aim="stations"
                disabled={isLoading}
                content={isLoading ? 'Загрузка...' : 'Посмотреть данные'}
              />
              <Button type="reset" aim="stations" content={'Очистить'} />
            </div>
          </div>
        </form>

        {error && <ArchiveError error={error} />}
        {downloadInfo && <ArchiveDownloadInfo {...downloadInfo} />}
        {results && <ArchiveResults results={results} />}
      </section>
    </>
  );
}

export default Stations;

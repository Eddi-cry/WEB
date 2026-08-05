import './ArchiveAccess.scss';
import { activeStationsNames } from '@constants/constants.ts';
import React, { useState } from 'react';
import Checkbox from '@components/CustomInput/Checkbox.tsx';
import Button from '@components/Button/Button.tsx';
import DateRangePicker from '@components/DateRangePicker/DateRangePicker.tsx';
import http from '@services/http.ts';
import ArchiveError from './ArchiveError.tsx';
import ArchiveDownloadInfo from './ArchiveDownloadInfo.tsx';
import ArchiveResults from './ArchiveResults.tsx';
import { ArchiveDownload, ArchiveFilesByStation } from '@/types/types.ts';

type DateMode = 'single' | 'range';

function ArchiveAccess() {
  const [selectedStations, setSelectedStations] = useState<string[]>([]);
  const allSelected: boolean = selectedStations.length === activeStationsNames.length;
  const [dateMode, setDateMode] = useState<DateMode>('range');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [singleDate, setSingleDate] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isDownloading, setIsDownloading] = useState<boolean>(false);
  const [results, setResults] = useState<ArchiveFilesByStation | null>(null);
  const [downloadInfo, setDownloadInfo] = useState<ArchiveDownload | null>(null);
  const [error, setError] = useState<string | null>(null);

  function handleStationChange(station: string) {
    setSelectedStations((prev) =>
      prev.includes(station) ? prev.filter((s) => s !== station) : [...prev, station]
    );
  }

  function handleSelectAll() {
    setSelectedStations(allSelected ? [] : activeStationsNames);
  }

  function getDatePayload() {
    if (dateMode === 'single') {
      return { startDate: singleDate, endDate: singleDate };
    }
    return { startDate, endDate };
  }

  function validateDates(): string | null {
    if (dateMode === 'single') {
      if (!singleDate) return 'Выберите дату';
      return null;
    }
    if (!startDate || !endDate) return 'Укажите начало и конец периода';
    if (endDate < startDate) return 'Дата окончания не может быть раньше даты начала';
    
    // Проверка на разницу в 1 год уже есть в DateRangePicker, но добавим на всякий случай
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays > 365) {
      return 'Разница между датами не может превышать 1 год';
    }
    
    return null;
  }

  async function sendRequest(url: string) {
    const dates = getDatePayload();
    return await http.post(url, { stations: selectedStations, ...dates });
  }

  async function handleDownload() {
    if (selectedStations.length === 0) {
      setError('Выберите хотя бы одну станцию');
      return;
    }

    const dateError = validateDates();
    if (dateError) {
      setError(dateError);
      return;
    }

    setIsDownloading(true);
    setError(null);

    try {
      const response = await sendRequest('/api/download/');
      const data = response.data;

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
        const anyErr = error as { response?: { data?: { message?: string } }; message?: string };
        setError(anyErr.response?.data?.message || anyErr.message || 'Ошибка запроса');
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

    if (selectedStations.length === 0) {
      setError('Выберите хотя бы одну станцию');
      return;
    }

    const dateError = validateDates();
    if (dateError) {
      setError(dateError);
      return;
    }

    setIsLoading(true);
    setError(null);
    setResults(null);

    try {
      const response = await sendRequest('/api/stations/');
      setResults(response.data);
    } catch (error: unknown) {
      if (error && typeof error === 'object' && 'response' in error) {
        const anyErr = error as { response?: { data?: { message?: string } }; message?: string };
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
    setDateMode('range');
    setStartDate('');
    setEndDate('');
    setSingleDate('');
    setResults(null);
    setDownloadInfo(null);
    setError(null);
  }

  function handleDateModeChange(mode: DateMode) {
    setDateMode(mode);
    setStartDate('');
    setEndDate('');
    setSingleDate('');
    setError(null);
  }

  return (
    <section className='stations'>
      <form onSubmit={handleSubmit} onReset={handleReset}>
        <div className='stations__container'>
          <h2 className='stations__title'>Доступ к архиву данных ГНСС-наблюдений</h2>
          
          <div className='stations__list'>
            <h3 className='stations__list-title'>Список станций</h3>
            <div className='stations__list-radio'>
              {activeStationsNames.map((station) => (
                <Checkbox
                  key={station}
                  checked={selectedStations.includes(station)}
                  onChange={() => handleStationChange(station)}
                  content={station.toUpperCase()}
                />
              ))}
              <Checkbox checked={allSelected} onChange={handleSelectAll} content={'Выбрать все'} />
            </div>
          </div>
          
          <div className='stations__criteria-time'>
            <h3 className='stations__criteria-title'>Временной запрос (макс. 1 год)</h3>
            <DateRangePicker
              dateMode={dateMode}
              onDateModeChange={handleDateModeChange}
              startDate={startDate}
              endDate={endDate}
              singleDate={singleDate}
              onStartDateChange={setStartDate}
              onEndDateChange={setEndDate}
              onSingleDateChange={setSingleDate}
              error={error}
              onErrorChange={setError}
            />
          </div>
          
          <div className='stations__buttons'>
            <Button
              onClick={() => handleDownload()}
              aim='stations__download'
              disabled={isDownloading}
              content={isDownloading ? 'Создание архива............' : 'Скачать архив'}
            />
            <Button
              type='submit'
              aim='stations'
              disabled={isLoading}
              content={isLoading ? 'Загрузка...' : 'Посмотреть данные'}
            />
            <Button type='reset' aim='stations' content={'Очистить'} />
          </div>
        </div>
      </form>
      
      <div className='stations__results__container'>
        {error && <ArchiveError error={error} />}
        {downloadInfo && <ArchiveDownloadInfo {...downloadInfo} />}
        {results && <ArchiveResults results={results} />}
      </div>
    </section>
  );
}

export default ArchiveAccess;
// components/DateRangePicker/DateRangePicker.tsx
import React from 'react';

type DateMode = 'single' | 'range';

interface DateRangePickerProps {
  dateMode: DateMode;
  onDateModeChange: (mode: DateMode) => void;
  startDate: string;
  endDate: string;
  singleDate: string;
  onStartDateChange: (date: string) => void;
  onEndDateChange: (date: string) => void;
  onSingleDateChange: (date: string) => void;
  error?: string | null;
  onErrorChange?: (error: string | null) => void;
}

function DateRangePicker({
  dateMode,
  onDateModeChange,
  startDate,
  endDate,
  singleDate,
  onStartDateChange,
  onEndDateChange,
  onSingleDateChange,
  error,
  onErrorChange,
}: DateRangePickerProps) {
  const setError = (err: string | null) => {
    if (onErrorChange) {
      onErrorChange(err);
    }
  };

  // Расчет разницы в днях
  const calculateDateDiff = (start: string, end: string): number | null => {
    if (!start || !end) return null;
    const startDate = new Date(start);
    const endDate = new Date(end);
    return Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  };

  // Получение ограничений для конечной даты (от начальной)
  const getEndDateLimits = (start: string) => {
    if (!start) return { min: '', max: '' };
    
    const startDate = new Date(start);
    const minDate = new Date(startDate);
    minDate.setFullYear(minDate.getFullYear() - 1);
    const maxDate = new Date(startDate);
    maxDate.setFullYear(maxDate.getFullYear() + 1);
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return {
      min: minDate.toISOString().split('T')[0],
      max: maxDate > today ? today.toISOString().split('T')[0] : maxDate.toISOString().split('T')[0]
    };
  };

  // Получение ограничений для начальной даты (от конечной)
  const getStartDateLimits = (end: string) => {
    if (!end) return { min: '', max: '' };
    
    const endDate = new Date(end);
    const minDate = new Date(endDate);
    minDate.setFullYear(minDate.getFullYear() - 1);
    const maxDate = new Date(endDate);
    maxDate.setFullYear(maxDate.getFullYear() + 1);
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return {
      min: minDate.toISOString().split('T')[0],
      max: maxDate > today ? today.toISOString().split('T')[0] : maxDate.toISOString().split('T')[0]
    };
  };

  // Форматирование длительности
  const formatDuration = (days: number): string => {
    const absDays = Math.abs(days);
    if (absDays === 0) return '0 дней';
    if (absDays === 1) return '1 день';
    if (absDays >= 2 && absDays <= 4) return `${absDays} дня`;
    return `${absDays} дней`;
  };

  // Обработчик изменения начальной даты
  const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newStart = e.target.value;
    onStartDateChange(newStart);
    setError(null);

    // Если есть конечная дата, проверяем разницу
    if (newStart && endDate) {
      const diff = calculateDateDiff(newStart, endDate);
      if (diff !== null && Math.abs(diff) > 365) {
        // Если разница больше года - корректируем конечную дату
        const limits = getEndDateLimits(newStart);
        if (endDate > limits.max) {
          onEndDateChange(limits.max);
        } else if (endDate < limits.min) {
          onEndDateChange(limits.min);
        }
      }
    }
  };

  // Обработчик изменения конечной даты
  const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newEnd = e.target.value;
    onEndDateChange(newEnd);
    setError(null);

    // Если есть начальная дата, проверяем разницу
    if (startDate && newEnd) {
      const diff = calculateDateDiff(startDate, newEnd);
      if (diff !== null && Math.abs(diff) > 365) {
        // Если разница больше года - корректируем начальную дату
        const limits = getStartDateLimits(newEnd);
        if (startDate < limits.min) {
          onStartDateChange(limits.min);
        } else if (startDate > limits.max) {
          onStartDateChange(limits.max);
        }
      }
    }
  };

  const endLimits = getEndDateLimits(startDate);
  const startLimits = getStartDateLimits(endDate);
  const duration = startDate && endDate ? calculateDateDiff(startDate, endDate) : null;

  return (
    <>
      <div className='stations__date-mode'>
        <label className='stations__date-mode-option'>
          <input
            type='radio'
            name='dateMode'
            value='single'
            checked={dateMode === 'single'}
            onChange={() => onDateModeChange('single')}
          />
          Один день
        </label>
        <label className='stations__date-mode-option'>
          <input
            type='radio'
            name='dateMode'
            value='range'
            checked={dateMode === 'range'}
            onChange={() => onDateModeChange('range')}
          />
          Период
        </label>
      </div>

      {dateMode === 'single' ? (
        <div className='stations__criteria-inputs'>
          <label className='stations__criteria-label'>
            Дата
            <input
              type='date'
              value={singleDate}
              onChange={(e) => onSingleDateChange(e.target.value)}
              className='stations__criteria-input'
              required
            />
          </label>
        </div>
      ) : (
        <div>
          <div className='stations__criteria-inputs'>
            <label className='stations__criteria-label'>
              <input
                type='date'
                value={startDate}
                onChange={handleStartDateChange}
                className='stations__criteria-input'
                min={startLimits.min || ''}
                max={startLimits.max || ''}
                required
              />
            </label>
            <label className='stations__criteria-label'>
              –
              <input
                type='date'
                value={endDate}
                onChange={handleEndDateChange}
                className='stations__criteria-input'
                min={endLimits.min || ''}
                max={endLimits.max || ''}
                required
              />
            </label>
          </div>

          {/* Информация о длительности и ограничении */}
          <div style={{ 
            marginTop: '8px', 
            fontSize: '13px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '8px'
          }}>
            <span style={{ color: '#666' }}>
              ⚠️ Максимальный период: 1 год
            </span>
            {startDate && endDate && duration !== null && (
              <span style={{ 
                color: Math.abs(duration) > 365 ? '#f44336' : '#4CAF50',
                fontWeight: '500'
              }}>
                Длительность: {formatDuration(duration)}
              </span>
            )}
          </div>

          {error && <div style={{ color: '#f44336', fontSize: '14px', marginTop: '8px' }}>{error}</div>}
        </div>
      )}
    </>
  );
}

export default DateRangePicker;
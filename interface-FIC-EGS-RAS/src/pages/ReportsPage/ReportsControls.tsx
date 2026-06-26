import Select, { SingleValue } from 'react-select';
import iconDownload from '/icon-download.svg';

export type YearOption = { value: number; label: string };

type ReportsControlsProps = {
  yearsOptions: YearOption[];
  selectedYear: YearOption;
  onYearChange: (option: SingleValue<YearOption>) => void;
  onDownload: () => void;
};

function ReportsControls({
  yearsOptions,
  selectedYear,
  onYearChange,
  onDownload,
}: ReportsControlsProps) {
  return (
    <div className='reports-page__select-container'>
      <Select
        options={yearsOptions}
        value={selectedYear}
        onChange={onYearChange}
        className='reports-page__select'
      />
      <img
        className='reports-page__download'
        src={iconDownload}
        alt='Скачать отчет'
        width='30'
        height='30'
        onClick={onDownload}
      />
    </div>
  );
}

export default ReportsControls;

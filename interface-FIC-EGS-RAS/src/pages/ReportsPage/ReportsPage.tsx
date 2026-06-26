import './ReportsPage.scss';
import { useState } from 'react';
import type { SingleValue } from 'react-select';
import ReportsControls, { YearOption } from './ReportsControls.tsx';
import ReportsViewer from './ReportsViewer.tsx';

function isLeapYear(year: number) {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

function getReportUrl(year: number) {
  return `/reports/completeness_report_${year}_001_${isLeapYear(year) ? 366 : 365}.html`;
}

function ReportsPage() {
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: currentYear - 1998 + 1 }, (_, i) => 1998 + i).reverse();
  const yearsOptions: YearOption[] = years.map((year) => ({
    value: year,
    label: String(year),
  }));
  const [selectedYear, setSelectedYear] = useState<YearOption>(yearsOptions[0]);

  function handleYearChange(option: SingleValue<YearOption>) {
    if (option) {
      setSelectedYear(option);
    }
  }

  function downloadReport() {
    const link = document.createElement('a');
    const url = getReportUrl(selectedYear.value);
    link.href = url;
    link.download = `completeness_report_${selectedYear.value}_001_${isLeapYear(selectedYear.value) ? 366 : 365}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  return (
    <section className='reports-page'>
      <div className='reports-page__container'>
        <h1 className='reports-page__title'>Годовые отчеты о полноте RINEX-файлов</h1>
        <ReportsControls
          yearsOptions={yearsOptions}
          selectedYear={selectedYear}
          onYearChange={handleYearChange}
          onDownload={downloadReport}
        />
        <ReportsViewer src={getReportUrl(selectedYear.value)} />
      </div>
    </section>
  );
}

export default ReportsPage;

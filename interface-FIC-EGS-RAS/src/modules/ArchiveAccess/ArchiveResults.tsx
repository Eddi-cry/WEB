import './ArchiveAccess.scss';
import { ArchiveFilesByStation } from '@/types/types.ts';

function ArchiveResults({ results }: { results: ArchiveFilesByStation }) {
  const rows = Object.entries(results).flatMap(([station, files]) =>
    files.map((file) => ({
      station,
      ...file,
    }))
  );

  return (
    <div className='stations__results'>
      <h3>Найденные данные:</h3>

      <table className='results-table'>
        <thead>
          <tr>
            <th>Станция</th>
            <th>Дата</th>
            <th>Имя файла</th>
            <th>Путь</th>
            <th>Полнота данных (%)</th>
          </tr>
        </thead>
        <tbody>
          {rows.length > 0 ? (
            rows.map((file, index) => (
              <tr key={index}>
                <td>{file.station.toUpperCase()}</td>
                <td>{file.date}</td>
                <td>{file.filename}</td>
                <td className='path-cell'>{file.path}</td>
                <td>{file.fullness}%</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={5} className='no-data'>
                Нет данных за выбранный период
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default ArchiveResults;

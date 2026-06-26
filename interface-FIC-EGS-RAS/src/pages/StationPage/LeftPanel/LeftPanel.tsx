import './LeftPanel.scss';
import { useReactTable, getCoreRowModel } from '@tanstack/react-table';
import type { CellContext, ColumnDef } from '@tanstack/react-table';
import { Station } from '@constants/constants.ts';
import StationParamsTable from './StationParamsTable.tsx';
import StationParamsMap from './StationParamsMap.tsx';

function LeftPanel({ station }: { station: Station | undefined }) {
  const sitelogUrl = station?.Name
    ? new URL(`../../../constants/passports/${station.Name.toLowerCase()}.txt`, import.meta.url)
        .href
    : undefined;

  type RowData = { field: string; value: unknown; isLink?: boolean };

  const data: RowData[] = [
    { field: 'Страна', value: station?.Region.split(',')[2] || '-' },
    { field: 'Регион', value: station?.Region.split(',')[1] || '-' },
    { field: 'Населенный пункт', value: station?.Region.split(',')[0] || '-' },
    { field: 'Организация', value: 'ФИЦ ЕГС РАН' },
    { field: 'Период наблюдений', value: station?.Period || '-' },
    { field: 'Статус', value: station?.Status || '-' },
    {
      field: 'Журнал станции (Site log)',
      value: sitelogUrl ?? 'Отсутствует',
      isLink: !!sitelogUrl,
    },
    { field: 'Широта', value: station?.Latitude },
    { field: 'Долгота', value: station?.Longitude },
    { field: 'Высота', value: station?.Height },
  ];

  const columns: ColumnDef<RowData>[] = [
    { accessorKey: 'field', header: 'Параметр' },
    {
      accessorKey: 'value',
      header: 'Значение',
      cell: (info: CellContext<RowData, unknown>) => {
        const row = info.row.original;
        const value = info.getValue();

        if (row.isLink && typeof value === 'string') {
          const fileName = value.split('/').pop();

          if (!fileName || fileName === 'undefined') {
            return 'Отсутствует';
          }

          return (
            <a href={value} target='_blank' rel='noopener noreferrer'>
              {fileName}
            </a>
          );
        }

        if (value === null || value === undefined) return '-';
        return typeof value === 'string' ? value : String(value);
      },
    },
  ];

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className='station-page__left-container'>
      <StationParamsTable rows={table.getRowModel().rows} />
      <StationParamsMap station={station} />
    </div>
  );
}

export default LeftPanel;

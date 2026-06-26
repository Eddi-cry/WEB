import { flexRender, Row } from '@tanstack/react-table';

type StationParamsTableProps<TData> = {
  rows: Row<TData>[];
};

function StationParamsTable<TData>({ rows }: StationParamsTableProps<TData>) {
  return (
    <table className='station-page__left-table'>
      <tbody>
        {rows.map((row) => (
          <tr key={row.id}>
            {row.getVisibleCells().map((cell) => (
              <td key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default StationParamsTable;

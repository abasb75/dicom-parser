//@ts-nocheck
import { ChangeEvent, Suspense, useMemo, useRef, useState, useTransition } from 'react';
import { loadAndParseFromFiles } from '@abasb75/dicom-parser';
import {
  useReactTable,
  getCoreRowModel,
  getExpandedRowModel,
  getFilteredRowModel,
  ColumnDef,
  flexRender,
} from '@tanstack/react-table';

type DicomTag = {
  key: string;
  name: string;
  vr: string;
  value: any;
  subRows?: DicomTag[];
};

function App() {
  const [dcmData, setDcmData] = useState<any>({});
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [globalFilter, setGlobalFilter] = useState('');
  const [isPending, startTransition] = useTransition();

  const fileInputRef = useRef<HTMLInputElement>(null);

  // آماده‌سازی داده (بدون تغییر)
  const prepareData = (dataset: any): DicomTag[] => {
    const rows: DicomTag[] = [];
    const elements = { ...dataset.metadata, ...dataset.elements };

    Object.keys(elements).forEach((key) => {
      if (!/^\([0-9A-Fa-f]{4},[0-9A-Fa-f]{4}\)$/.test(key)) return;

      const el = elements[key];
      let value: any = el.value;

      if (['OB', 'OW', 'OF', 'OD'].includes(el.vr)) {
        value = `${el.length || el.totalSize || 0} Bytes`;
      } else if (el.vr === 'SQ') {
        value = `<Sequence of ${el.value?.length || 0} items>`;
      } else if (dataset.get) {
        value = dataset.get(key);
      }

      const row: DicomTag = {
        key,
        name: el.name || el.tagName || 'Unknown',
        vr: el.vr || '??',
        value: typeof value === 'object' ? JSON.stringify(value).slice(0, 100) + '...' : value,
      };

      if (el.vr === 'SQ' && el.value && Array.isArray(el.value)) {
        row.subRows = el.value.flatMap((item: any, index: number) => {
          const subData = prepareData(item);
          return [{ key: `#Item ${index + 1}`, name: '', vr: '', value: '', subRows: subData }];
        });
      }

      rows.push(row);
    });

    return rows;
  };

  const data = useMemo(() => prepareData(dcmData), [dcmData]);

  const columns: ColumnDef<DicomTag>[] = useMemo(
    () => [
      {
        id: 'expander',
        header: () => null,
        cell: ({ row }) => {
          if (row.getCanExpand()) {
            return (
              <span className="inline-block w-6 text-center">
                {row.getIsExpanded() ? '▼' : '▶'}
              </span>
            );
          }
          return <span className="inline-block w-6" />;
        },
      },
      { accessorKey: 'key', header: 'Tag' },
      { accessorKey: 'name', header: 'Name' },
      { accessorKey: 'vr', header: 'VR' },
      { accessorKey: 'value', header: 'Value' },
    ],
    []
  );

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    state: { globalFilter },
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: (row, columnId, filterValue) => {
      const search = filterValue.toLowerCase();
      return (
        row.original.key.toLowerCase().includes(search) ||
        row.original.name.toLowerCase().includes(search) ||
        row.original.vr.toLowerCase().includes(search) ||
        String(row.original.value).toLowerCase().includes(search)
      );
    },
    getRowCanExpand: (row) => !!row.original.subRows,
  });

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      setLoading(true);
      setErrorMessage('');
      setDcmData({});

      loadAndParseFromFiles(file).then((dataset) => {
        startTransition(() => {
          setDcmData(dataset);
          setLoading(false);
        });
      }).catch((err) => {
        setLoading(false);
        setErrorMessage(err.message || 'Error parsing DICOM file');
      });
    }
  };

  const resetToUpload = () => {
    setDcmData({});
    setGlobalFilter('');
    setErrorMessage('');
  };

  const hasData = !!Object.keys(dcmData).length;

  return (
    <div className="w-full h-[100vh] bg-slate-800 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-[1200px] bg-slate-900 rounded-lg border-2 border-slate-700 h-full max-h-[90vh] flex flex-col overflow-hidden shadow-2xl">
        {!hasData ? (
          <div className="flex-1 flex flex-col items-center justify-center bg-slate-900 p-8">
            <div
              className="border-4 border-dashed border-slate-600 rounded-2xl p-12 text-center w-full max-w-lg cursor-pointer hover:border-blue-500 transition"
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                if (e.dataTransfer.files[0]) {
                  const file = e.dataTransfer.files[0];
                  setLoading(true);
                  loadAndParseFromFiles(file).then((dataset) => {
                    startTransition(() => {
                      setDcmData(dataset);
                      setLoading(false);
                    });
                  }).catch(() => {
                    setLoading(false);
                    setErrorMessage('Invalid file');
                  });
                }
              }}
            >
              <h2 className="text-2xl font-bold text-slate-200 mb-4">Drop DICOM File Here</h2>
              <p className="text-slate-400 mb-6">or click to select</p>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
                accept=".dcm,.dicom"
              />
              <p className="text-sm text-slate-500">Supports DICOM files only</p>
            </div>
            {loading && <Loading />}
            {errorMessage && <div className="mt-4 text-red-400 font-semibold">{errorMessage}</div>}
            <div className="absolute bottom-4 text-center text-slate-400 text-sm">
              <a href="https://abasbagheri.ir" className="hover:text-slate-200">
                Abbas Bagheri
              </a>
            </div>
          </div>
        ) : (
          <div className="flex flex-col h-full">
            <div className="flex items-center bg-slate-800 p-3 border-b border-slate-700">
              <input
                type="text"
                placeholder="Search by tag, name, VR, or value..."
                value={globalFilter ?? ''}
                onChange={(e) => setGlobalFilter(e.target.value)}
                className="flex-1 p-2 bg-slate-700 text-white border border-slate-600 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={resetToUpload}
                className="bg-blue-600 text-white px-4 py-2 rounded-r-md hover:bg-blue-700 transition"
              >
                Try New File
              </button>
            </div>

            <div className="flex-1 overflow-auto bg-slate-900 p-4">
              <table className="w-full border-collapse">
                <thead>
                  {table.getHeaderGroups().map((headerGroup) => (
                    <tr key={headerGroup.id}>
                      {headerGroup.headers.map((header) => (
                        <th
                          key={header.id}
                          className="p-3 bg-slate-800 text-slate-200 text-left font-semibold border-b border-slate-700"
                        >
                          {flexRender(header.column.columnDef.header, header.getContext())}
                        </th>
                      ))}
                    </tr>
                  ))}
                </thead>
                <tbody>
                  {table.getRowModel().rows.map((row) => (
                    <>
                      <tr
                        key={row.id}
                        className="border-b border-slate-700 hover:bg-slate-700 cursor-pointer transition"
                        onClick={() => row.toggleExpanded()}
                      >
                        {row.getVisibleCells().map((cell) => (
                          <td key={cell.id} className="p-3 text-slate-200">
                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                          </td>
                        ))}
                      </tr>
                      {row.getIsExpanded() && (
                        <tr>
                          <td colSpan={columns.length} className="p-0">
                            <div className="pl-12 bg-slate-800">
                              <DicomTable data={row.original.subRows || []} />
                            </div>
                          </td>
                        </tr>
                      )}
                    </>
                  ))}
                </tbody>
              </table>
              {loading && <Loading />}
              {errorMessage && <div className="text-red-400 p-4">{errorMessage}</div>}
            </div>

            <div className="text-center py-3 bg-slate-800 text-slate-400 text-sm border-t border-slate-700">
              <a href="https://abasbagheri.ir" className="hover:text-slate-200">
                Abbas Bagheri
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Component recursive با expander
function DicomTable({ data }: { data: DicomTag[] }) {
  const columns: ColumnDef<DicomTag>[] = useMemo(
    () => [
      {
        id: 'expander',
        header: () => null,
        cell: ({ row }) => {
          if (row.getCanExpand()) {
            return (
              <span className="inline-block w-6 text-center">
                {row.getIsExpanded() ? '▼' : '▶'}
              </span>
            );
          }
          return <span className="inline-block w-6" />;
        },
      },
      { accessorKey: 'key', header: 'Tag' },
      { accessorKey: 'name', header: 'Name' },
      { accessorKey: 'vr', header: 'VR' },
      { accessorKey: 'value', header: 'Value' },
    ],
    []
  );

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    getRowCanExpand: (row) => !!row.original.subRows,
  });

  return (
    <table className="w-full border-collapse">
      <tbody>
        {table.getRowModel().rows.map((row) => (
          <>
            <tr
              key={row.id}
              className="border-b border-slate-700 hover:bg-slate-700 cursor-pointer transition"
              onClick={() => row.toggleExpanded()}
            >
              {row.getVisibleCells().map((cell) => (
                <td key={cell.id} className="p-3 text-slate-200">
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
            {row.getIsExpanded() && (
              <tr>
                <td colSpan={columns.length} className="p-0">
                  <div className="pl-12 bg-slate-800">
                    <DicomTable data={row.original.subRows || []} />
                  </div>
                </td>
              </tr>
            )}
          </>
        ))}
      </tbody>
    </table>
  );
}

const Loading = () => (
  <div className="absolute inset-0 bg-slate-900/80 flex items-center justify-center text-slate-200 font-semibold">
    Loading...
  </div>
);

export default App;
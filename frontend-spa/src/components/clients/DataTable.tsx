
export interface Column<T> {
  header: string;
  accessor: keyof T;
  render?: (value: T[keyof T], item: T) => React.ReactNode;
}

interface Props<T> {
  data: T[];
  columns: Column<T>[];
  onEdit?: (item: T) => void;
  onDelete?: (id: number) => void;
}

function DataTable<T extends { id: number }>({
  data,
  columns,
  onEdit,
  onDelete
}: Props<T>) {

  return (
    <table border={1} cellPadding={10} style={{ marginTop: "20px", width: "100%" }}>
      <thead>
        <tr>

          {columns.map((col, index) => (
            <th key={index}>{col.header}</th>
          ))}

          {(onEdit || onDelete) && <th>Acciones</th>}

        </tr>
      </thead>

      <tbody>

        {data.map((item) => (
          <tr key={item.id}>

            {columns.map((col, index) => (
            <td key={index}>
                {col.render
                ? col.render(item[col.accessor], item)
                : String(item[col.accessor] ?? "")}
            </td>
            ))}

            {(onEdit || onDelete) && (
              <td>

                {onEdit && (
                  <button onClick={() => onEdit(item)}>
                    Editar
                  </button>
                )}

                {onDelete && (
                  <button
                    onClick={() => onDelete(item.id)}
                    style={{ marginLeft: "10px" }}
                  >
                    Eliminar
                  </button>
                )}

              </td>
            )}

          </tr>
        ))}

      </tbody>

    </table>
  );
}

export default DataTable;

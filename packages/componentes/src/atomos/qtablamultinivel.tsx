import { Orden } from "@olula/lib/diseño.ts";
import { formatearMoneda } from "@olula/lib/dominio.ts";
import {
  cabecerasMultinivel,
  ColumnaAgrupada,
} from "./cabeceras_multinivel.ts";
import "./qtablamultinivel.css";

export type ColumnaMultinivel = ColumnaAgrupada & {
  tipo?: "texto" | "numero" | "moneda";
  decimales?: number;
  divisa?: string;
  destacada?: boolean;
};

export type FilaMultinivel = {
  id: string;
  etiqueta: string;
  nivel: number;
  valores: Record<string, unknown>;
  expandible?: boolean;
  expandida?: boolean;
  destacada?: boolean;
  tipo?: ColumnaMultinivel["tipo"];
  decimales?: number;
};

export type QTablaMultinivelProps = {
  cabeceraEtiqueta: string;
  columnas: ColumnaMultinivel[];
  filas: FilaMultinivel[];
  cargando?: boolean;
  orden?: Orden;
  onOrdenar?: (columnaId: string) => void;
  onAlternar?: (fila: FilaMultinivel) => void;
};

type Formato = Pick<ColumnaMultinivel, "tipo" | "decimales" | "divisa">;

const formatoCelda = (columna: ColumnaMultinivel, fila: FilaMultinivel): Formato =>
  columna.tipo ? columna : { tipo: fila.tipo, decimales: fila.decimales };

const formatear = (valor: unknown, columna: Formato): string => {
  if (valor === null || valor === undefined) return "";
  if (typeof valor !== "number") return String(valor);
  if (columna.tipo === "moneda") {
    return formatearMoneda(valor, columna.divisa ?? "EUR");
  }
  if (columna.tipo === "numero") {
    return valor.toLocaleString("es-ES", {
      minimumFractionDigits: columna.decimales,
      maximumFractionDigits: columna.decimales,
    });
  }
  return String(valor);
};

export const QTablaMultinivel = ({
  cabeceraEtiqueta,
  columnas,
  filas,
  cargando = false,
  orden = [],
  onOrdenar,
  onAlternar,
}: QTablaMultinivelProps) => {
  const cabeceras = cabecerasMultinivel(columnas);
  const tipos = Object.fromEntries(columnas.map((c) => [c.id, c.tipo ?? ""]));
  const [columnaOrdenada, sentido] = orden;

  return (
    <quimera-tabla-multinivel>
      <div className="tabla-contenedor-scroll">
        <table>
          <thead>
            {cabeceras.map((celdas, nivel) => (
              <tr key={nivel}>
                {nivel === 0 && (
                  <th className="etiqueta" rowSpan={cabeceras.length}>
                    {cabeceraEtiqueta}
                  </th>
                )}
                {celdas.map((celda) => (
                  <th
                    key={celda.clave}
                    colSpan={celda.colSpan}
                    rowSpan={celda.rowSpan}
                    className={celda.columnaId ? tipos[celda.columnaId] : "grupo"}
                    data-orden={
                      celda.columnaId === undefined
                        ? undefined
                        : celda.columnaId === columnaOrdenada
                          ? sentido
                          : ""
                    }
                    onClick={() =>
                      celda.columnaId && onOrdenar?.(celda.columnaId)
                    }
                  >
                    {celda.texto}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody data-cargando={cargando}>
            {filas.map((fila) => (
              <tr key={fila.id} data-destacada={fila.destacada ?? false}>
                <td
                  className="etiqueta"
                  style={{ paddingInlineStart: `calc(${fila.nivel} * var(--espaciado-l) + var(--espaciado-m))` }}
                >
                  {fila.expandible ? (
                    <button
                      type="button"
                      className="btn-alternar"
                      aria-expanded={fila.expandida ?? false}
                      onClick={() => onAlternar?.(fila)}
                    >
                      {fila.expandida ? "−" : "+"}
                    </button>
                  ) : (
                    <span className="btn-alternar" />
                  )}
                  {fila.etiqueta}
                </td>
                {columnas.map((columna) => {
                  const formato = formatoCelda(columna, fila);
                  return (
                    <td key={columna.id} className={formato.tipo ?? ""} data-destacada={columna.destacada ?? false}>
                      {formatear(fila.valores[columna.id], formato)}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </quimera-tabla-multinivel>
  );
};

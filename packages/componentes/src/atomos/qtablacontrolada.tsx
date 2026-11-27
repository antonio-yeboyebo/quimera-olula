import { ContenidoConEnlace } from "./qenlace_ficha.tsx";
import { etiquetaEnlace } from "./url_enlace.ts";
import { Entidad, Orden, Paginacion } from "@olula/lib/diseño.ts";
import {
  calcularPaginacionSimplificada,
  formatearFechaDate,
  formatearFechaHora,
  formatearFechaString,
  formatearHoraString,
  formatearMoneda,
  resolverDivisa,
} from "@olula/lib/dominio.ts";
import { ComponentType, Fragment, ReactNode, useState } from "react";
import { QBoton } from "./qboton.tsx";
import "./qtabla.css";
import { tComponentes } from "../i18n/textos.ts";

type TipoColumna =
  | "texto"
  | "numero"
  | "moneda"
  | "fecha"
  | "hora"
  | "fechahora"
  | "booleano";
export type MetaColumna<T extends Entidad> = {
  id: string;
  cabecera: string;
  prioridad?: "alta" | "media" | "baja";
  esTitulo?: boolean;
  tipo?: TipoColumna;
  divisa?: string | ((entidad: T) => string);
  ancho?: string; // Ancho específico para esta columna
  /** Énfasis visual: `destacado` en negrita (cliente, total), `secundario` en gris (código). */
  estilo?: "destacado" | "secundario";
  render?: (entidad: T) => string | ReactNode;
  /** La celda lleva a la ficha de otra entidad (ver `MetaColumna` de qtabla.tsx). */
  enlace?: (entidad: T) => string | null | undefined;
};

export type MetaTabla2<T extends Entidad> = {
  cols: string[];
  metaCols: Record<string, MetaColumna<T>>;
  expansion?: ComponentType<{ entidad: T }>;
};

export type MetaTabla<T extends Entidad> =
  | MetaColumna<T>[]
  | { cols: MetaColumna<T>[]; expansion?: ComponentType<{ entidad: T }> }
  | MetaTabla2<T>;

const esMetaTabla2 = <T extends Entidad>(m: MetaTabla<T>): m is MetaTabla2<T> =>
  !Array.isArray(m) && "metaCols" in m;

export const obtenerCols = <T extends Entidad>(
  m: MetaTabla<T>
): MetaColumna<T>[] => {
  if (Array.isArray(m)) return m;
  if (esMetaTabla2(m)) return m.cols.map((id) => m.metaCols[id]).filter(Boolean);
  return m.cols;
};

const cabecera = <T extends Entidad>(
  cols: MetaColumna<T>[],
  orden: Orden,
  onOrdenChanged?: (orden: Orden) => void
) => {
  const [colOrdenada, sentido] = orden;

  const renderCabecera = ({ id, cabecera, tipo, ancho }: MetaColumna<T>) => (
    <th
      key={id}
      data-modo="columna"
      data-orden={id === colOrdenada ? sentido : ""}
      className={`${id} ${tipo ?? ""}`}
      style={ancho ? { width: ancho } : undefined}
      onClick={() =>
        onOrdenChanged &&
        onOrdenChanged([
          id,
          colOrdenada == id ? (sentido == "ASC" ? "DESC" : "ASC") : "ASC",
        ])
      }
    >
      {cabecera}
    </th>
  );

  return cols.map(renderCabecera);
};

const a_string = (
  valor: unknown,
  tipo?: TipoColumna,
  divisa?: string
): string => {
  let formateado = "";

  // console.log("valor", valor, "tipo", typeof valor);

  if (tipo === "moneda") {
    if (typeof valor === "number" || typeof valor === "string") {
      formateado = formatearMoneda(valor, divisa ?? "EUR");
    }
  } else if (tipo === "fecha" && typeof valor === "string") {
    formateado = formatearFechaString(valor);
  } else if (tipo === "fecha" && valor !== null && typeof valor === "object") {
    formateado = formatearFechaDate(valor as Date);
  } else if (tipo === "hora" && typeof valor === "string") {
    formateado = formatearHoraString(valor);
  } else if (tipo === "numero" && typeof valor === "number") {
    formateado = valor.toLocaleString("es-ES");
  } else if (typeof valor === "boolean") {
    formateado = valor ? tComponentes("ui.atomos.si") : tComponentes("ui.atomos.no");
  } else if (
    tipo === "fechahora" &&
    valor !== null &&
    typeof valor === "object"
  ) {
    formateado = formatearFechaHora(valor as Date);
  } else if (typeof valor === "string") {
    formateado = valor;
  } else if (typeof valor === "number") {
    formateado = valor.toString();
  } else if (typeof valor === "undefined" || valor === null) {
    formateado = "";
  } else {
    throw new Error(tComponentes("ui.atomos.tipoDeDatoDesconocidoTipoPara", { tipo, valor: String(valor) }));
  }

  return formateado;
};

const fila = <T extends Entidad>(
  entidad: Entidad,
  cols: MetaColumna<T>[],
  cargando: boolean
) => {
  const renderColumna = ({
    id,
    cabecera: titulo,
    render,
    tipo,
    divisa,
    ancho,
    estilo,
    enlace,
  }: MetaColumna<T>) => {
    const valorCelda =
      cargando && typeof entidad[id] == "string"
        ? (entidad[id] as string)
        : (render?.(entidad as T) ??
          a_string(
            entidad[id] as string,
            tipo,
            resolverDivisa(divisa, entidad as T)
          ));

    return (
      <td
        key={[entidad.id, id].join("-")}
        className={`${id} ${tipo ?? ""}`}
        data-estilo={estilo}
        style={ancho ? { width: ancho } : undefined}
      >
        <ContenidoConEnlace
          href={cargando ? null : enlace?.(entidad as T)}
          etiqueta={etiquetaEnlace(titulo, valorCelda)}
        >
          {valorCelda}
        </ContenidoConEnlace>
      </td>
    );
  };

  return cols.map(renderColumna);
};

type PaginaSeleccionada = number | "<" | ">" | "<<" | ">>";

const Paginador = (
  totalEntidades: number | undefined,
  paginacion: Paginacion,
  onPaginacionChanged?: (paginacion: Paginacion) => void
) => {
  if (
    !onPaginacionChanged ||
    totalEntidades === undefined ||
    totalEntidades <= 0
  ) {
    return null;
  }
  const { pagina, limite } = paginacion;

  if (limite >= totalEntidades) {
    return null;
  }
  const { paginasMostradas, totalPaginas } = calcularPaginacionSimplificada(
    totalEntidades,
    pagina,
    limite
  );

  const handlePaginacion = (numPagina: PaginaSeleccionada) => {
    if (!onPaginacionChanged) {
      return;
    }

    const getNumPagina = (numPagina: PaginaSeleccionada) => {
      if (numPagina == "<<") {
        return 1;
      }
      if (numPagina == "<") {
        return Math.max(1, pagina - 1);
      }
      if (numPagina == ">") {
        return Math.min(totalPaginas, pagina + 1);
      }
      if (numPagina == ">>") {
        return totalPaginas;
      }
      return numPagina;
    };
    onPaginacionChanged({
      pagina: getNumPagina(numPagina),
      limite,
    });
  };

  const desde = (pagina - 1) * limite + 1;
  const hasta = Math.min(pagina * limite, totalEntidades);

  return (
    <quimera-tabla-paginacion>
      <span className="paginacion-rango">
        {desde.toLocaleString("es-ES")}–{hasta.toLocaleString("es-ES")}{" "}{tComponentes("ui.atomos.de")}{" "}
        {totalEntidades.toLocaleString("es-ES")}
      </span>
      <QBoton
        deshabilitado={pagina === 1 || totalPaginas === 0}
        tamaño="pequeño"
        variante="texto"
        onClick={() => handlePaginacion("<<")}
      >
        &lt;&lt;
      </QBoton>

      <QBoton
        deshabilitado={pagina === 1 || totalPaginas === 0}
        tamaño="pequeño"
        variante="texto"
        onClick={() => handlePaginacion("<")}
      >
        &lt;
      </QBoton>

      {paginasMostradas.map((numPagina) => (
        <QBoton
          key={numPagina}
          tamaño="pequeño"
          variante={numPagina === pagina ? "solido" : "texto"}
          props={numPagina === pagina ? { "aria-current": "page" } : undefined}
          onClick={() => numPagina !== pagina && handlePaginacion(numPagina)}
        >
          {numPagina}
        </QBoton>
      ))}

      <QBoton
        deshabilitado={pagina >= totalPaginas || totalPaginas === 0}
        tamaño="pequeño"
        variante="texto"
        onClick={() => handlePaginacion(">")}
      >
        &gt;
      </QBoton>

      <QBoton
        deshabilitado={pagina >= totalPaginas || totalPaginas === 0}
        tamaño="pequeño"
        variante="texto"
        onClick={() => handlePaginacion(">>")}
      >
        &gt;&gt;
      </QBoton>
    </quimera-tabla-paginacion>
  );
};

export type QTablaProps<T extends Entidad> = {
  metaTabla: MetaTabla<T>;
  datos: T[];
  cargando: boolean;
  seleccionadaId?: string;
  onSeleccion?: (entidad: T) => void;
  orden: Orden;
  onOrdenChanged?: (orden: Orden) => void;
  paginacion?: Paginacion;
  onPaginacionChanged?: (paginacion: Paginacion) => void;
  totalEntidades?: number;
  seleccionadasIds?: string[];
  onMultiSeleccionToggle?: (id: string) => void;
  onSetSeleccionadas?: (ids: string[]) => void;
};

export const QTablaControlada = <T extends Entidad>({
  metaTabla,
  datos,
  cargando,
  seleccionadaId,
  onSeleccion,
  orden,
  onOrdenChanged,
  paginacion,
  onPaginacionChanged,
  totalEntidades = 0,
  seleccionadasIds,
  onMultiSeleccionToggle,
  onSetSeleccionadas,
}: QTablaProps<T>) => {
  const modoMulti = seleccionadasIds !== undefined;

  const cols = obtenerCols(metaTabla);
  const expansion = Array.isArray(metaTabla) ? undefined : metaTabla.expansion;

  const [expandidas, setExpandidas] = useState<Set<string>>(new Set());

  const toggleExpansion = (id: string) =>
    setExpandidas((prev) => {
      const s = new Set(prev);
      if (s.has(id)) {
        s.delete(id)
      } else s.add(id);
      return s;
    });

  // Detectar si hay anchos específicos
  const tieneAnchosFijos = cols.some((col) => col.ancho);

  // Completar columnas sin ancho
  const colsCompletas = tieneAnchosFijos
    ? cols.map((col) => {
        if (col.ancho) return col;

        const hayPorcentajes = cols.some((c) => c.ancho?.includes("%"));
        const anchos = hayPorcentajes
          ? {
              texto: "20%",
              fecha: "10%",
              hora: "8%",
              moneda: "12%",
              numero: "10%",
              booleano: "8%",
              defecto: "15%",
            }
          : {
              texto: "150px",
              fecha: "90px",
              hora: "80px",
              moneda: "120px",
              numero: "100px",
              booleano: "100px",
              defecto: "150px",
            };

        return {
          ...col,
          ancho: anchos[col.tipo as keyof typeof anchos] || anchos.defecto,
        };
      })
    : cols;

  const todosSeleccionados =
    modoMulti &&
    datos.length > 0 &&
    datos.every((e) => seleccionadasIds!.includes(e.id));
  const algunoSeleccionado =
    modoMulti && datos.some((e) => seleccionadasIds!.includes(e.id));

  const toggleTodos = () => {
    if (!onSetSeleccionadas) return;
    if (todosSeleccionados) {
      const idsEnPagina = new Set(datos.map((e) => e.id));
      onSetSeleccionadas(
        seleccionadasIds!.filter((id) => !idsEnPagina.has(id))
      );
    } else {
      const idsNuevas = datos
        .filter((e) => !seleccionadasIds!.includes(e.id))
        .map((e) => e.id);
      onSetSeleccionadas([...seleccionadasIds!, ...idsNuevas]);
    }
  };

  const totalCols =
    colsCompletas.length + (modoMulti ? 1 : 0) + (expansion ? 1 : 0);

  const ExpansionComp = expansion;

  return (
    <quimera-tabla>
      <div className="tabla-contenedor-scroll">
        <table data-anchos-fijos={tieneAnchosFijos}>
          <thead>
            <tr>
              {expansion && (
                <th className="col-expansion" style={{ width: "36px" }} />
              )}
              {modoMulti && (
                <th className="col-multiseleccion" style={{ width: "36px" }}>
                  <input
                    type="checkbox"
                    checked={todosSeleccionados}
                    ref={(el) => {
                      if (el)
                        el.indeterminate =
                          !todosSeleccionados && algunoSeleccionado;
                    }}
                    onChange={toggleTodos}
                    onClick={(e) => e.stopPropagation()}
                  />
                </th>
              )}
              {cabecera(colsCompletas, orden, onOrdenChanged)}
            </tr>
          </thead>
          <tbody data-cargando={cargando}>
            {datos.map((entidad: T) => (
              <Fragment key={entidad.id}>
                <tr
                  onClick={() => onSeleccion?.(entidad)}
                  data-seleccionada={entidad.id === seleccionadaId}
                >
                  {expansion && (
                    <td
                      className="col-expansion"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleExpansion(entidad.id);
                      }}
                    >
                      <button className="btn-expansion">
                        {expandidas.has(entidad.id) ? "▾" : "▸"}
                      </button>
                    </td>
                  )}
                  {modoMulti && (
                    <td
                      className="col-multiseleccion"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <input
                        type="checkbox"
                        checked={seleccionadasIds!.includes(entidad.id)}
                        onChange={() => onMultiSeleccionToggle?.(entidad.id)}
                      />
                    </td>
                  )}
                  {fila(entidad, colsCompletas, cargando)}
                </tr>
                {ExpansionComp && expandidas.has(entidad.id) && (
                  <tr className="fila-expansion">
                    <td colSpan={totalCols}>
                      <ExpansionComp entidad={entidad} />
                    </td>
                  </tr>
                )}
              </Fragment>
            ))}
          </tbody>
        </table>
      </div>
      {paginacion && Paginador(totalEntidades, paginacion, onPaginacionChanged)}
    </quimera-tabla>
  );
};

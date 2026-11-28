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
import { ComponentType, Fragment, ReactNode, useCallback, useRef, useState } from "react";
import { MenuFlotante, OpcionMenu } from "../vistas/MenuFlotante.tsx";
import { QBoton } from "./qboton.tsx";
import { QIcono } from "./qicono.tsx";
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
  /** Oculta por defecto en las pantallas personalizables: el usuario la añade
   *  desde el selector de columnas. */
  oculta?: boolean;
};

/** Lo que el usuario puede hacer con las columnas desde la cabecera. */
export type PersonalizacionColumnas = {
  onOcultar: (id: string) => void;
  onMover: (id: string, destino: string) => void;
  /** Falso si solo queda una columna visible. */
  puedeOcultar: boolean;
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

const sentidoSiguiente = (id: string, orden: Orden) =>
  orden[0] == id ? (orden[1] == "ASC" ? "DESC" : "ASC") : "ASC";

/** Arrastrar una cabecera sobre otra la mueve a su sitio (solo con ratón; con
 *  teclado se reordena desde el selector de columnas). */
const TIPO_ARRASTRE = "application/x-quimera-columna";

const CeldaCabecera = <T extends Entidad>({
  columna: { id, cabecera, tipo, ancho },
  orden,
  onOrdenChanged,
  personalizacion,
}: {
  columna: MetaColumna<T>;
  orden: Orden;
  onOrdenChanged?: (orden: Orden) => void;
  personalizacion?: PersonalizacionColumnas;
}) => {
  const [colOrdenada, sentido] = orden;
  const boton = useRef<HTMLButtonElement>(null);
  const [menuAbierto, setMenuAbierto] = useState(false);
  const [destino, setDestino] = useState(false);
  const cerrarMenu = useCallback(() => setMenuAbierto(false), []);

  const ordenar = (nuevo: string) => {
    onOrdenChanged?.([id, nuevo]);
    setMenuAbierto(false);
  };

  return (
    <th
      data-modo="columna"
      data-orden={id === colOrdenada ? sentido : ""}
      data-destino-arrastre={destino || undefined}
      className={`${id} ${tipo ?? ""}`}
      style={ancho ? { width: ancho } : undefined}
      onClick={() => onOrdenChanged?.([id, sentidoSiguiente(id, orden)])}
      aria-sort={
        id === colOrdenada ? (sentido === "DESC" ? "descending" : "ascending") : undefined
      }
      {...(personalizacion && {
        // Sin esto el nombre de la columna incluiría el del botón de opciones.
        "aria-label": cabecera,
        draggable: true,
        onDragStart: (e: React.DragEvent) => {
          e.dataTransfer.setData(TIPO_ARRASTRE, id);
          e.dataTransfer.effectAllowed = "move";
        },
        onDragOver: (e: React.DragEvent) => {
          if (!e.dataTransfer.types.includes(TIPO_ARRASTRE)) return;
          e.preventDefault();
          setDestino(true);
        },
        onDragLeave: () => setDestino(false),
        onDrop: (e: React.DragEvent) => {
          e.preventDefault();
          setDestino(false);
          const origen = e.dataTransfer.getData(TIPO_ARRASTRE);
          if (origen) personalizacion.onMover(origen, id);
        },
      })}
    >
      {!personalizacion && cabecera}
      {personalizacion && (
        <span className="cabecera-contenido">
          <span className="cabecera-texto">{cabecera}</span>
          <button
            ref={boton}
            type="button"
            className="cabecera-menu-boton"
            aria-label={`Opciones de la columna ${cabecera}`}
            aria-haspopup="menu"
            aria-expanded={menuAbierto}
            onClick={(e) => {
              e.stopPropagation();
              setMenuAbierto(!menuAbierto);
            }}
          >
            <QIcono nombre="mas_opciones" tamaño="xs" />
          </button>
          {menuAbierto && boton.current && (
            <MenuFlotante
              ancla={boton.current}
              onCerrar={cerrarMenu}
              etiqueta={`Columna ${cabecera}`}
            >
              <OpcionMenu
                icono={<QIcono nombre="arriba" tamaño="sm" />}
                onClick={() => ordenar("ASC")}
                deshabilitado={!onOrdenChanged}
              >
                Orden ascendente
              </OpcionMenu>
              <OpcionMenu
                icono={<QIcono nombre="abajo" tamaño="sm" />}
                onClick={() => ordenar("DESC")}
                deshabilitado={!onOrdenChanged}
              >
                Orden descendente
              </OpcionMenu>
              <OpcionMenu
                icono={<QIcono nombre="ocultar" tamaño="sm" />}
                onClick={() => {
                  personalizacion.onOcultar(id);
                  setMenuAbierto(false);
                }}
                deshabilitado={!personalizacion.puedeOcultar}
              >
                Ocultar columna
              </OpcionMenu>
            </MenuFlotante>
          )}
        </span>
      )}
    </th>
  );
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
  /** Menú por columna y arrastrar para reordenar (pantallas personalizables). */
  personalizacion?: PersonalizacionColumnas;
  /** Contenido de una última celda de cabecera (el selector de columnas). */
  extremoCabecera?: ReactNode;
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
  personalizacion,
  extremoCabecera,
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

  const conExtremo = extremoCabecera !== undefined;
  const totalCols =
    colsCompletas.length +
    (modoMulti ? 1 : 0) +
    (expansion ? 1 : 0) +
    (conExtremo ? 1 : 0);

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
              {colsCompletas.map((columna) => (
                <CeldaCabecera
                  key={columna.id}
                  columna={columna}
                  orden={orden}
                  onOrdenChanged={onOrdenChanged}
                  personalizacion={personalizacion}
                />
              ))}
              {conExtremo && (
                <th className="col-extremo" style={{ width: "40px" }}>
                  {extremoCabecera}
                </th>
              )}
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
                  {conExtremo && <td className="col-extremo" />}
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

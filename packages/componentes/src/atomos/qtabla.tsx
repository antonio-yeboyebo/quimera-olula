import { localeActual } from "@olula/lib/i18n/i18n.ts";
import { tLib } from "@olula/lib/i18n/textos.ts";
import { tComponentes, useTComponentes } from "../i18n/textos.ts";
import { ContenidoConEnlace } from "./qenlace_ficha.tsx";
import { etiquetaEnlace } from "./url_enlace.ts";
import { Entidad, Orden, Paginacion } from "@olula/lib/diseño.ts";
import {
  calcularPaginacionSimplificada,
  formatearFechaDate,
  formatearFechaHora,
  formatearFechaHoraString,
  formatearFechaString,
  formatearHoraString,
  formatearMoneda,
  resolverDivisa,
} from "@olula/lib/dominio.ts";
import { ReactNode } from "react";
import { QBoton } from "./qboton.tsx";
import "./qtabla.css";

type MetaColumna<T extends Entidad> = {
  id: string;
  cabecera: string;
  prioridad?: "alta" | "media" | "baja";
  esTitulo?: boolean;
  tipo?:
    | "texto"
    | "numero"
    | "moneda"
    | "fecha"
    | "hora"
    | "fechahora"
    | "booleano"
    | undefined;
  divisa?: string | ((entidad: T) => string);
  ancho?: string;
  /** Énfasis visual: `destacado` en negrita (cliente, total), `secundario` en gris (código). */
  estilo?: "destacado" | "secundario";
  render?: (entidad: T) => string | ReactNode;
  /**
   * La celda lleva a la ficha de otra entidad: URL (o null si esta fila no tiene). La tabla pinta el
   * valor y `EnlaceFicha` (↗); el clic en la flecha no selecciona la fila. Así una columna de enlace
   * se declara aquí y su aspecto se cambia en un único sitio (qenlace_ficha.css).
   */
  enlace?: (entidad: T) => string | null | undefined;
};

export type MetaTabla<T extends Entidad> = MetaColumna<T>[];

const cabecera = <T extends Entidad>(
  metaTabla: MetaTabla<T>,
  orden: Orden,
  onOrdenar?: (clave: string) => void
) => {
  const [colOrdenada, sentido] = orden;

  const renderCabecera = ({ id, cabecera, tipo, ancho }: MetaColumna<T>) => (
    <th
      key={id}
      data-modo="columna"
      data-orden={id === colOrdenada ? sentido : ""}
      className={`${id} ${tipo ?? ""}`}
      style={ancho ? { width: ancho } : undefined}
      onClick={() => onOrdenar && onOrdenar(id)}
    >
      {cabecera}
    </th>
  );

  return metaTabla.map(renderCabecera);
};

const fila = <T extends Entidad>(entidad: Entidad, metaTabla: MetaTabla<T>) => {
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
    let datos = render?.(entidad as T) ?? (entidad[id] as unknown);

    // Formateo automático según tipo
    if (tipo === "moneda") {
      if (typeof datos === "number" || typeof datos === "string") {
        datos = formatearMoneda(
          datos,
          resolverDivisa(divisa, entidad as T) ?? "EUR"
        );
      }
    } else if (tipo === "fecha" && typeof datos === "string") {
      datos = formatearFechaString(datos);
    } else if (tipo === "fecha" && typeof datos === "object") {
      datos = formatearFechaDate(datos as Date);
    } else if (tipo === "hora" && typeof datos === "string") {
      datos = formatearHoraString(datos);
    } else if (tipo === "fechahora" && typeof datos === "string") {
      datos = formatearFechaHoraString(datos);
    } else if (tipo === "fechahora" && typeof datos === "object") {
      datos = formatearFechaHora(datos as Date);
    } else if (tipo === "numero" && typeof datos === "number") {
      datos = datos.toLocaleString(localeActual());
    } else if (tipo === "booleano" && typeof datos === "boolean") {
      datos = datos ? tLib("si") : tLib("no");
    }

    const href = enlace?.(entidad as T) ?? null;

    return (
      <td
        key={[entidad.id, id].join("-")}
        className={`${id} ${tipo ?? ""}`}
        data-estilo={estilo}
        style={ancho ? { width: ancho } : undefined}
      >
        <ContenidoConEnlace href={href} etiqueta={etiquetaEnlace(titulo, datos)}>
          {datos as string}
        </ContenidoConEnlace>
      </td>
    );
  };

  return metaTabla.map(renderColumna);
};

const paginacionControlador = (
  totalEntidades: number | undefined,
  paginacion: Paginacion,
  onPaginacion?: (pagina: number, limite: number) => void
) => {
  if (!onPaginacion || totalEntidades === undefined || totalEntidades <= 0) {
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

  const desde = (pagina - 1) * limite + 1;
  const hasta = Math.min(pagina * limite, totalEntidades);

  return (
    <quimera-tabla-paginacion>
      <span className="paginacion-rango">
        {tComponentes("listado.rango", {
          desde: desde.toLocaleString(localeActual()),
          hasta: hasta.toLocaleString(localeActual()),
          total: totalEntidades.toLocaleString(localeActual()),
        })}
      </span>
      <QBoton
        deshabilitado={pagina === 1 || totalPaginas === 0}
        tamaño="pequeño"
        variante="texto"
        onClick={() => onPaginacion?.(1, limite)}
      >
        &lt;&lt;
      </QBoton>

      <QBoton
        deshabilitado={pagina === 1 || totalPaginas === 0}
        tamaño="pequeño"
        variante="texto"
        onClick={() => onPaginacion?.(Math.max(1, pagina - 1), limite)}
      >
        &lt;
      </QBoton>

      {paginasMostradas.map((numPagina) => (
        <QBoton
          key={numPagina}
          tamaño="pequeño"
          variante={numPagina === pagina ? "solido" : "texto"}
          props={numPagina === pagina ? { "aria-current": "page" } : undefined}
          onClick={() => numPagina !== pagina && onPaginacion?.(numPagina, limite)}
        >
          {numPagina}
        </QBoton>
      ))}

      <QBoton
        deshabilitado={pagina >= totalPaginas || totalPaginas === 0}
        tamaño="pequeño"
        variante="texto"
        onClick={() =>
          onPaginacion?.(Math.min(totalPaginas, pagina + 1), limite)
        }
      >
        &gt;
      </QBoton>

      <QBoton
        deshabilitado={pagina >= totalPaginas || totalPaginas === 0}
        tamaño="pequeño"
        variante="texto"
        onClick={() => onPaginacion?.(totalPaginas, limite)}
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
  onOrdenar?: (clave: string) => void;
  paginacion?: Paginacion;
  onPaginacion?: (pagina: number, limite: number) => void;
  totalEntidades?: number;
};

export const QTabla = <T extends Entidad>({
  metaTabla,
  datos,
  cargando,
  seleccionadaId,
  onSeleccion,
  orden,
  onOrdenar,
  paginacion,
  onPaginacion,
  totalEntidades = 0,
}: QTablaProps<T>) => {
  // Repinta (paginación, Sí/No) al cambiar de idioma.
  useTComponentes();
  // Detectar si hay anchos específicos
  const tieneAnchosFijos = metaTabla.some((col) => col.ancho);

  // Completar columnas sin ancho
  const metaTablaCompleta = tieneAnchosFijos
    ? metaTabla.map((col) => {
        if (col.ancho) return col;

        const hayPorcentajes = metaTabla.some((c) => c.ancho?.includes("%"));
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
    : metaTabla;

  return (
    <quimera-tabla>
      <div className="tabla-contenedor-scroll">
        <table data-anchos-fijos={tieneAnchosFijos}>
          <thead>
            <tr>{cabecera(metaTablaCompleta, orden, onOrdenar)}</tr>
          </thead>
          <tbody data-cargando={cargando}>
            {datos.map((entidad: T) => (
              <tr
                key={entidad.id}
                onClick={() => onSeleccion && onSeleccion(entidad)}
                data-seleccionada={entidad.id === seleccionadaId}
              >
                {fila(entidad, metaTablaCompleta)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {paginacion &&
        paginacionControlador(totalEntidades, paginacion, onPaginacion)}
    </quimera-tabla>
  );
};

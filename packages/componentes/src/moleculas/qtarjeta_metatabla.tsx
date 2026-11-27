import { ContenidoConEnlace } from "../atomos/qenlace_ficha.tsx";
import { etiquetaEnlace } from "../atomos/url_enlace.ts";
import { Entidad } from "@olula/lib/diseño.ts";
import {
  formatearFechaDate,
  formatearFechaHora,
  formatearFechaString,
  formatearHoraString,
  formatearMoneda,
  resolverDivisa,
} from "@olula/lib/dominio.ts";
import { ReactNode, isValidElement, useMemo } from "react";
import { MetaColumna, MetaTabla, obtenerCols } from "../atomos/qtablacontrolada.tsx";
import { QTarjetaGenerica } from "./qtarjeta_generica.tsx";
import "./qtarjeta_metatabla.css";
import { tComponentes, useTComponentes } from "../i18n/textos.ts";

type Prioridad = "alta" | "media" | "baja";

type QTarjetaMetatablaProps<T extends Entidad> = {
  entidad: T;
  metaTabla: MetaTabla<T>;
  campoTituloId?: string;
  maxCamposPrioritarios?: number;
  mostrarTodosInicialmente?: boolean;
  mostrarExpansion?: boolean;
  placeholderVacio?: string;
};

const pesoPrioridad = (prioridad?: Prioridad) => {
  if (prioridad === "alta") {
    return 0;
  }
  if (prioridad === "baja") {
    return 2;
  }
  return 1;
};

const formatearValor = (
  valor: unknown,
  tipo?:
    | "texto"
    | "numero"
    | "moneda"
    | "fecha"
    | "hora"
    | "fechahora"
    | "booleano",
  divisa?: string
): string => {
  if (tipo === "moneda") {
    if (typeof valor === "number" || typeof valor === "string") {
      return formatearMoneda(valor, divisa ?? "EUR");
    }
    return "";
  }

  if (tipo === "fecha" && typeof valor === "string") {
    return formatearFechaString(valor);
  }

  if (tipo === "fecha" && valor instanceof Date) {
    return formatearFechaDate(valor);
  }

  if (tipo === "hora" && typeof valor === "string") {
    return formatearHoraString(valor);
  }

  if (tipo === "fechahora" && valor instanceof Date) {
    return formatearFechaHora(valor);
  }

  if (tipo === "numero" && typeof valor === "number") {
    return valor.toLocaleString("es-ES");
  }

  if (tipo === "booleano" && typeof valor === "boolean") {
    return valor ? tComponentes("ui.moleculas.si") : tComponentes("ui.moleculas.no");
  }

  if (typeof valor === "boolean") {
    return valor ? tComponentes("ui.moleculas.si") : tComponentes("ui.moleculas.no");
  }

  if (typeof valor === "number") {
    return valor.toString();
  }

  if (typeof valor === "string") {
    return valor;
  }

  return valor as string;
};

const esValorVacio = (valor: unknown) =>
  valor === undefined || valor === null || valor === "";

const valorColumna = <T extends Entidad>(
  entidad: T,
  columna: MetaColumna<T>,
  placeholderVacio: string
): string | ReactNode => {
  const valorRender = columna.render?.(entidad);

  if (valorRender !== undefined && valorRender !== null) {
    if (typeof valorRender === "string" && esValorVacio(valorRender.trim())) {
      return (
        <span className="tarjeta-metatabla-valor-vacio">
          {placeholderVacio}
        </span>
      );
    }

    return valorRender;
  }

  const valorBruto = entidad[columna.id] as unknown;

  if (esValorVacio(valorBruto)) {
    return (
      <span className="tarjeta-metatabla-valor-vacio">{placeholderVacio}</span>
    );
  }

  const valorFormateado = formatearValor(
    valorBruto,
    columna.tipo,
    resolverDivisa(columna.divisa, entidad)
  );

  if (isValidElement(valorFormateado)) {
    return valorFormateado;
  }

  if (
    typeof valorFormateado === "string" ||
    typeof valorFormateado === "number" ||
    typeof valorFormateado === "boolean"
  ) {
    return String(valorFormateado);
  }

  return valorFormateado as ReactNode;
};

const esCampoCorto = <T extends Entidad>(columna: MetaColumna<T>) => {
  if (
    ["booleano", "numero", "moneda", "hora", "fecha"].includes(
      columna.tipo ?? ""
    )
  ) {
    return true;
  }

  return /(iva|dto|descuento|%|impuesto)/i.test(columna.id);
};

const claseCampo = <U extends Entidad>(columna: MetaColumna<U>) => {
  const clases = ["qtarjeta-metatabla-campo"];

  if (esCampoCorto(columna)) {
    clases.push("campo--corto");
  }

  if (columna.prioridad === "alta") {
    clases.push("campo--importante");
  }

  return clases.join(" ");
};

type CampoTarjetaMetatablaProps = {
  id: string;
  clases?: string;
  cabecera: string;
  valor: ReactNode | string;
};

export const CampoTarjetaMetatabla = ({
  id,
  clases,
  cabecera,
  valor,
}: CampoTarjetaMetatablaProps) => {
  return (
    <div key={id} className={clases}>
      <span className="qtarjeta-metatabla-etiqueta">{cabecera}</span>
      <div className="qtarjeta-metatabla-valor">{valor}</div>
    </div>
  );
};

export const QTarjetaMetatabla = <T extends Entidad>({
  entidad,
  metaTabla,
  campoTituloId,
  maxCamposPrioritarios = 4,
  mostrarTodosInicialmente = false,
  placeholderVacio = "—",
}: QTarjetaMetatablaProps<T>) => {
  const t = useTComponentes();
  const cols = obtenerCols(metaTabla);

  const renderCampo = (
    columna: MetaColumna<T>,
    esDetalle: boolean = false
  ) => (
    <CampoTarjetaMetatabla
      id={columna.id}
      cabecera={columna.cabecera}
      valor={
        <ContenidoConEnlace
          href={columna.enlace?.(entidad)}
          etiqueta={etiquetaEnlace(columna.cabecera, entidad[columna.id])}
        >
          {valorColumna(entidad, columna, placeholderVacio)}
        </ContenidoConEnlace>
      }
      clases={
        esDetalle ? "qtarjeta-metatabla-campo-detalle" : claseCampo(columna)
      }
    />
  );

  const columnaTitulo = useMemo(
    () =>
      cols.find((columna) => columna.id === campoTituloId) ??
      cols.find((columna) => columna.esTitulo),
    [cols, campoTituloId]
  );

  const columnasDetalle = useMemo(
    () =>
      cols
        .filter((columna) => columna.id !== columnaTitulo?.id)
        .sort(
          (columnaA, columnaB) =>
            pesoPrioridad(columnaA.prioridad) -
            pesoPrioridad(columnaB.prioridad)
        ),
    [cols, columnaTitulo]
  );

  const columnasPrioritarias = columnasDetalle.slice(0, maxCamposPrioritarios);
  const columnasResto = columnasDetalle.slice(maxCamposPrioritarios);

  const arrIzq =
    columnasPrioritarias.length > 0 ? columnasPrioritarias.at(0) : null;
  const arrDer =
    columnasPrioritarias.length > 1 ? columnasPrioritarias.at(1) : null;
  const abjIzq =
    columnasPrioritarias.length > 2 ? columnasPrioritarias.at(2) : null;
  const abjDer =
    columnasPrioritarias.length > 3 ? columnasPrioritarias.at(3) : null;

  return (
    <QTarjetaGenerica
      mostrarTodo={mostrarTodosInicialmente}
      arribaIzquierda={arrIzq && renderCampo(arrIzq)}
      arribaDerecha={arrDer && renderCampo(arrDer)}
      abajoIzquierda={abjIzq && renderCampo(abjIzq)}
      abajoDerecha={abjDer && renderCampo(abjDer)}
      expansion={
        columnasResto.length > 0 && (
          <section
            className="qtarjeta-metatabla-detalle"
            aria-label={t("ui.moleculas.camposAdicionales")}
          >
            {columnasResto.map((columna) => renderCampo(columna, true))}
          </section>
        )
      }
    />
  );

  // return (
  //   <article className="qtarjeta-metatabla" data-expandida={expandida}>
  //     {columnaTitulo && (
  //       <header className="qtarjeta-metatabla-cabecera">
  //         <span className="qtarjeta-metatabla-titulo-label">
  //           {columnaTitulo.cabecera}
  //         </span>
  //         <strong className="qtarjeta-metatabla-titulo-valor">
  //           {valorColumna(entidad, columnaTitulo, placeholderVacio)}
  //         </strong>
  //       </header>
  //     )}

  //     <section
  //       className="qtarjeta-metatabla-grid"
  //       aria-label="Campos prioritarios"
  //     >
  //       {columnasPrioritarias.map((columna) => (
  //         <div key={columna.id} className={claseCampo(columna)}>
  //           <span className="qtarjeta-metatabla-etiqueta">
  //             {columna.cabecera}
  //           </span>
  //           <div className="qtarjeta-metatabla-valor">
  //             {valorColumna(entidad, columna, placeholderVacio)}
  //           </div>
  //         </div>
  //       ))}
  //     </section>

  //     {expandida && columnasResto.length > 0 && (
  //       <section
  //         className="qtarjeta-metatabla-detalle"
  //         aria-label="Campos adicionales"
  //       >
  //         {columnasResto.map((columna) => (
  //           <div key={columna.id} className="qtarjeta-metatabla-campo-detalle">
  //             <span className="qtarjeta-metatabla-etiqueta">
  //               {columna.cabecera}
  //             </span>
  //             <div className="qtarjeta-metatabla-valor">
  //               {valorColumna(entidad, columna, placeholderVacio)}
  //             </div>
  //           </div>
  //         ))}
  //       </section>
  //     )}

  //     {puedeExpandir && (
  //       <footer className="qtarjeta-metatabla-footer">
  //         <QBoton
  //           tamaño="pequeño"
  //           variante="texto"
  //           onClick={(evento) => {
  //             evento.stopPropagation();
  //             setExpandida((estado) => !estado);
  //           }}
  //         >
  //           {expandida ? "Ver menos" : "Ver más"}
  //         </QBoton>
  //       </footer>
  //     )}
  //   </article>
  // );
};

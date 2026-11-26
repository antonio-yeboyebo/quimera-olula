import { nombreMenu, tComponentes, useTComponentes } from "../i18n/textos.ts";
import { Entidad } from "@olula/lib/diseño.ts";
import { FactoryCtx } from "@olula/lib/factory_ctx.tsx";
import { PropsWithChildren, ReactNode, useContext, useEffect } from "react";
import { QBoton } from "../atomos/qboton.tsx";
import { QIcono } from "../atomos/qicono.tsx";
import { ContextoDetalle } from "../maestro/contexto_maestro.ts";
import { aplanarMenu, urlActiva } from "../menu/dominio.ts";
import "./detalle.css";

export type DatoClave = { etiqueta: string; valor: ReactNode };

const SEPARADOR_TITULO = " · ";

/** Los documentos titulan "código · nombre": en móvil se pintan en dos líneas
 *  (código pequeño con el estado, nombre grande). En escritorio se ve igual. */
const Titulo = ({ titulo }: { titulo: ReactNode }) => {
  if (typeof titulo !== "string" || !titulo.includes(SEPARADOR_TITULO)) {
    return <h2>{titulo}</h2>;
  }
  const [codigo, ...resto] = titulo.split(SEPARADOR_TITULO);
  return (
    <h2>
      <span className="detalle-titulo-codigo">{codigo}</span>
      <span className="detalle-titulo-separador">{SEPARADOR_TITULO}</span>
      <span className="detalle-titulo-nombre" title={resto.join(SEPARADOR_TITULO)}>
        {resto.join(SEPARADOR_TITULO)}
      </span>
    </h2>
  );
};

/** Nombre de la pantalla actual en el menú (para "‹ Facturas" en móvil). */
const useNombrePantalla = () => {
  const { menu } = useContext(FactoryCtx);
  const t = useTComponentes();
  const pantallas = aplanarMenu(menu, () => true);
  const url = urlActiva(
    pantallas.map((p) => p.url),
    window.location.pathname
  );
  const nombre = pantallas.find((p) => p.url === url)?.nombre;
  return nombre ? nombreMenu(nombre) : t("comun.volver");
};

interface DetalleProps<T extends Entidad> {
  id: string | undefined;
  obtenerTitulo?: (entidad: T) => ReactNode;
  /** Etiqueta de estado junto al título (p. ej. Borrador, Emitida). */
  obtenerEstado?: (entidad: T) => ReactNode;
  /** Franja bajo la cabecera con los datos que se consultan de un vistazo. */
  obtenerDatosClave?: (entidad: T) => DatoClave[];
  entidad: T | null;
  setEntidad: (entidad: T) => void;
  cargar?: (id: string) => Promise<T>;
  className?: string;
  cerrarDetalle?: () => void;
}

export function Detalle<T extends Entidad>({
  id,
  obtenerTitulo,
  obtenerEstado,
  obtenerDatosClave,
  children,
  entidad,
  setEntidad,
  cargar,
  className,
  cerrarDetalle,
}: PropsWithChildren<DetalleProps<T>>) {
  const nombrePantalla = useNombrePantalla();

  useEffect(() => {
    if (cargar && id && (!entidad || id !== entidad.id)) {
      const load = async () => {
        const cliente = await cargar(id);
        if (cliente) {
          setEntidad(cliente);
        }
      };
      load();
    }
  }, [id, entidad, cargar, setEntidad]);

  if (!entidad) {
    return <>No se ha encontrado la entidad con Id: {id}</>;
  }

  if (!id) {
    return <></>;
  }

  const datosClave = obtenerDatosClave?.(entidad) ?? [];

  return (
    <div className={`detalle ${className || ""}`.trim()}>
      {" "}
      {cerrarDetalle && (
        // Solo en móvil (CSS): el detalle ocupa la pantalla y se vuelve al listado.
        <button type="button" className="detalle-volver" onClick={cerrarDetalle}>
          <QIcono nombre="izquierda" tamaño="sm" />
          {nombrePantalla}
        </button>
      )}
      {obtenerTitulo && (
        <div className="detalle-cabecera">
          <div className="detalle-cabecera-titulo">
            <Titulo titulo={obtenerTitulo(entidad)} />
            {obtenerEstado?.(entidad)}
          </div>
          {cerrarDetalle && (
            <QBoton
              props={{ className: "detalle-cerrar", "aria-label": tComponentes("detalle.cerrar") }}
              onClick={cerrarDetalle}
              variante="texto"
              tamaño="pequeño"
              destructivo
            >
              <QIcono nombre="cerrar" tamaño="sm" />
            </QBoton>
          )}
        </div>
      )}
      {datosClave.length > 0 && (
        <dl className="detalle-datos-clave">
          {datosClave.map(({ etiqueta, valor }) => (
            <div key={etiqueta}>
              <dt>{etiqueta}</dt>
              <dd>{valor}</dd>
            </div>
          ))}
        </dl>
      )}
      <ContextoDetalle.Provider value={true}>{children}</ContextoDetalle.Provider>
    </div>
  );
}

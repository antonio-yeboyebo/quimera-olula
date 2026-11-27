import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { QBoton } from "../atomos/qboton.tsx";
import { QIcono } from "../atomos/qicono.tsx";
import { useEsMovil } from "../maestro/useEsMovil.ts";
import {
  AccionDefinida,
  accionPrincipal,
  esDestructiva,
  iconoAccion,
} from "../moleculas/acciones.ts";
import {
  botonesQueCaben,
  desbordarAcciones,
  repartirAcciones,
  sinGrupoAcciones,
} from "./dominio.ts";
import { MenuFlotante, OpcionMenu } from "./MenuFlotante.tsx";
import { ListaDestacadas, PersonalizarAcciones } from "./PersonalizarAcciones.tsx";
import { useSeccionPersonalizable } from "./modo_personalizar.ts";
import { createPortal } from "react-dom";
import { usePreferenciasVista } from "./usePreferenciasVista.ts";
import "./AccionesPersonalizables.css";

const clave = (accion: AccionDefinida, i: number) => accion.id ?? `${accion.texto}-${i}`;

/** Botón de una acción destacada; en móvil (o si no tiene texto), solo el icono. */
const BotonAccion = ({ accion, soloIcono }: { accion: AccionDefinida; soloIcono: boolean }) => {
  const destructiva = esDestructiva(accion);
  const icono = iconoAccion(accion);
  const nombre = accion.texto ?? accion.id;
  const conIcono = !!icono && (soloIcono || !accion.texto);
  return (
    <QBoton
      // QBoton deshabilitado solo bloquea el ratón: con teclado se ejecutaría.
      onClick={accion.deshabilitado ? undefined : accion.onClick}
      deshabilitado={accion.deshabilitado}
      advertencia={accion.advertencia && !destructiva}
      destructivo={destructiva}
      variante={destructiva || accion.deshabilitado ? "borde" : "solido"}
      props={{
        ...(conIcono && { "aria-label": nombre, title: nombre, className: "acciones-icono" }),
        ...(accion.deshabilitado && { "aria-disabled": true }),
      }}
    >
      {conIcono ? <QIcono nombre={icono} tamaño="sm" /> : nombre}
    </QBoton>
  );
};

/**
 * Grupo de acciones que el usuario personaliza: elige cuáles salen como botón
 * (y en qué orden); el resto va al desplegable. Si los botones no caben en el
 * ancho disponible, los últimos pasan al desplegable. En móvil, solo iconos.
 */
export const AccionesPersonalizables = ({
  acciones,
  pantalla,
  grupo,
  vertical,
}: {
  acciones: AccionDefinida[];
  pantalla: string;
  grupo: string;
  /** Como en QuimeraAcciones: acciones del documento, arriba a la derecha del detalle. */
  vertical?: boolean;
}) => {
  const preferencias = usePreferenciasVista(pantalla);
  const { config, personalizable } = preferencias;
  const esMovil = useEsMovil();

  if (import.meta.env.DEV) {
    acciones
      .filter((accion) => accion.id && !iconoAccion(accion))
      .forEach((accion) =>
        console.warn(
          `Acción «${accion.id}» de ${pantalla}/${grupo} sin icono: en móvil saldrá con texto.`
        )
      );
  }

  const destacadas = config?.acciones?.[grupo];
  const reparto = repartirAcciones(acciones, destacadas, accionPrincipal);

  const contenedor = useRef<HTMLElement>(null);
  const medida = useRef<HTMLElement>(null);
  // QBoton no expone su botón: se toma del evento para anclar el menú.
  const [ancla, setAncla] = useState<HTMLElement | null>(null);
  const [ancho, setAncho] = useState<number | null>(null);
  const [caben, setCaben] = useState(Number.POSITIVE_INFINITY);
  const [panel, setPanel] = useState<"menu" | "personalizar" | null>(null);
  const cerrar = useCallback(() => setPanel(null), []);

  useLayoutEffect(() => {
    const elemento = contenedor.current;
    if (!elemento || typeof ResizeObserver === "undefined") return;
    const observador = new ResizeObserver(([entrada]) =>
      setAncho(entrada.contentRect.width)
    );
    observador.observe(elemento);
    return () => observador.disconnect();
  }, []);

  // Los anchos se miden en una copia invisible de los botones destacados.
  const firma = `${reparto.botones.map((accion, i) => `${clave(accion, i)}=${accion.texto}`).join("|")}:${esMovil}`;
  useLayoutEffect(() => {
    if (ancho === null || !medida.current || !contenedor.current) return;
    const hijos = Array.from(medida.current.children) as HTMLElement[];
    const anchoMas = hijos.pop()?.offsetWidth ?? 0;
    const hueco = parseFloat(getComputedStyle(contenedor.current).columnGap) || 0;
    setCaben(
      botonesQueCaben(
        hijos.map((hijo) => hijo.offsetWidth),
        ancho,
        hueco,
        anchoMas,
        reparto.menu.length > 0 || personalizable
      )
    );
  }, [ancho, firma, reparto.menu.length, personalizable]);

  const visible = desbordarAcciones(reparto, caben);
  const conMenu = visible.menu.length > 0 || personalizable;

  // Si cambia lo que cabe, el menú abierto ya no corresponde (y su botón puede
  // haber desaparecido).
  useEffect(() => setPanel((actual) => (actual === "menu" ? null : actual)), [caben]);

  // Las destacadas que hoy no están (acciones condicionales al estado del
  // documento) se conservan: el diálogo solo cambia las que conoce.
  const guardarDestacadas = (ids: string[]) => {
    const presentes = new Set(acciones.map((accion) => accion.id));
    const ausentes = (destacadas ?? []).filter((id) => !presentes.has(id));
    void preferencias.guardar({
      ...config,
      acciones: { ...config?.acciones, [grupo]: [...ids, ...ausentes] },
    });
  };

  const restaurar = () =>
    void preferencias.quitar(sinGrupoAcciones(config, grupo)).catch(() => undefined);

  const clases = `acciones-personalizables${vertical ? " vertical" : ""}`;

  const idsDestacadas = reparto.botones.flatMap((accion) => (accion.id ? [accion.id] : []));
  const idsEnMenu = reparto.botones
    .slice(visible.botones.length)
    .flatMap((accion) => (accion.id ? [accion.id] : []));

  // Sección en el panel «Personalizar pantalla».
  const destinoPersonalizar = useSeccionPersonalizable(
    personalizable
      ? {
          id: `acciones:${pantalla}:${grupo}`,
          titulo: grupo === "detalle" ? "Botones del documento" : `Botones (${grupo})`,
        }
      : undefined,
    contenedor
  );

  return (
    <quimera-acciones className={clases} ref={contenedor}>
      {visible.botones.map((accion, i) => (
        <BotonAccion key={clave(accion, i)} accion={accion} soloIcono={esMovil} />
      ))}
      {conMenu && (
        <QBoton
          variante="borde"
          onClick={(e) => {
            setAncla(e.currentTarget as HTMLElement);
            setPanel(panel ? null : "menu");
          }}
          props={{
            className: "acciones-mas",
            "aria-label": "Más acciones",
            "aria-haspopup": "menu",
            "aria-expanded": panel !== null,
            title: "Más acciones",
          }}
        >
          <QIcono nombre="mas_opciones" tamaño="sm" />
        </QBoton>
      )}

      {/* Mismas clases que el grupo: le aplican las mismas reglas de estilo. */}
      <quimera-acciones
        className={`${clases} acciones-medida`}
        ref={medida}
        aria-hidden="true"
        inert
      >
        {reparto.botones.map((accion, i) => (
          <BotonAccion key={clave(accion, i)} accion={accion} soloIcono={esMovil} />
        ))}
        <QBoton variante="borde" props={{ className: "acciones-mas" }}>
          <QIcono nombre="mas_opciones" tamaño="sm" />
        </QBoton>
      </quimera-acciones>

      {panel === "menu" && ancla?.isConnected && (
        <MenuFlotante
          ancla={ancla}
          onCerrar={cerrar}
          alineacion="derecha"
          etiqueta="Más acciones"
        >
          {visible.menu.map((accion, i) => {
            const icono = iconoAccion(accion);
            return (
              <OpcionMenu
                key={clave(accion, i)}
                icono={icono && <QIcono nombre={icono} tamaño="sm" />}
                deshabilitado={accion.deshabilitado}
                destructiva={esDestructiva(accion)}
                onClick={() => {
                  cerrar();
                  accion.onClick();
                }}
              >
                {accion.texto ?? accion.id}
              </OpcionMenu>
            );
          })}
          {personalizable && (
            <>
              {visible.menu.length > 0 && <hr className="menu-flotante-separador" />}
              <OpcionMenu
                icono={<QIcono nombre="ajustes" tamaño="sm" />}
                onClick={() => setPanel("personalizar")}
              >
                Personalizar botones…
              </OpcionMenu>
            </>
          )}
        </MenuFlotante>
      )}

      {panel === "personalizar" && ancla?.isConnected && (
        <PersonalizarAcciones
          ancla={ancla}
          acciones={acciones}
          destacadas={idsDestacadas}
          enMenu={idsEnMenu}
          personalizada={destacadas !== undefined}
          onCambiar={guardarDestacadas}
          onRestaurar={restaurar}
          onCerrar={cerrar}
        />
      )}
      {destinoPersonalizar &&
        createPortal(
          <>
            <p className="panel-personalizar-ayuda">
              Las marcadas salen como botón, en este orden. El resto, en «Más acciones».
            </p>
            <div className="selector-columnas">
              <ListaDestacadas
                acciones={acciones}
                destacadas={idsDestacadas}
                enMenu={idsEnMenu}
                onCambiar={guardarDestacadas}
              />
            </div>
            <button
              type="button"
              className="panel-personalizar-enlace"
              disabled={destacadas === undefined}
              onClick={restaurar}
            >
              Restaurar botones por defecto
            </button>
          </>,
          destinoPersonalizar
        )}
    </quimera-acciones>
  );
};

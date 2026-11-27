import type { GeoJSONSource, Map as MapaLibre, Popup } from "maplibre-gl";
// maplibre busca su worker junto a su módulo, que vite mueve al optimizar dependencias:
// se empaqueta aparte (con sus imports) y se le dice dónde está.
import urlWorker from "maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url";
import { useEffect, useMemo, useRef, useState } from "react";
import { ComponenteDashboard, FormatoValor, RespuestaAgregado } from "../../diseño.ts";
import {
  DatosMapa,
  datosMapa,
  encuadreMapa,
  formatearValor,
  formatoPorDefecto,
} from "../../dominio.ts";
import { LIMITES_ESPAÑA } from "../../geografia.ts";
import { COLORES_SERIE } from "./colores.ts";
import { useTComun } from "../../../i18n/index.ts";

/**
 * Estilo del mapa base. Por defecto OpenFreeMap (sin clave, uso comercial permitido);
 * se cambia con VITE_MAPA_ESTILO (p. ej. un servidor de teselas propio).
 */
const ESTILO =
  import.meta.env.VITE_MAPA_ESTILO || "https://tiles.openfreemap.org/styles/positron";

const FUENTE = "dashboard-puntos";

const geojson = (datos: DatosMapa) => ({
  type: "FeatureCollection" as const,
  features: datos.puntos.map((p) => ({
    type: "Feature" as const,
    geometry: { type: "Point" as const, coordinates: p.centro },
    properties: { codigo: p.codigo, nombre: p.nombre, valor: p.valor, clientes: p.clientes },
  })),
});

type ExpresionRadio = [
  "interpolate",
  ["linear"],
  ["sqrt", ["get", string]],
  number,
  number,
  number,
  number,
];

/** Radio de la burbuja por el área (raíz del valor): de 6 a 34 px. */
const expresionRadio = (maximo: number): ExpresionRadio => [
  "interpolate",
  ["linear"],
  ["sqrt", ["get", "valor"]],
  0,
  6,
  Math.sqrt(Math.max(maximo, 1)),
  34,
];

const contenidoPopup = (
  propiedades: Record<string, unknown>,
  formato: FormatoValor
): HTMLElement => {
  // Nodos DOM (no HTML en texto): los nombres vienen de datos.
  const raiz = document.createElement("div");
  raiz.className = "dashboard-mapa-popup";
  const nombre = document.createElement("strong");
  nombre.textContent = String(propiedades.nombre);
  const valor = document.createElement("span");
  valor.textContent = formatearValor(Number(propiedades.valor), formato);
  raiz.append(nombre, valor);
  if (propiedades.clientes !== null && propiedades.clientes !== undefined) {
    const clientes = document.createElement("span");
    const n = Number(propiedades.clientes);
    clientes.textContent = `${n.toLocaleString("es-ES")} ${n === 1 ? "cliente" : "clientes"}`;
    raiz.append(clientes);
  }
  return raiz;
};

/**
 * Ventas (o la métrica elegida) y clientes por provincia o comunidad sobre un mapa
 * base de maplibre: una burbuja por zona, de área proporcional al valor; al pulsarla,
 * el detalle. La librería se carga solo cuando hay un mapa en pantalla.
 */
export const Mapa = ({
  componente,
  respuesta,
}: {
  componente: ComponenteDashboard;
  respuesta: RespuestaAgregado;
}) => {
  const t = useTComun();
  const consulta = componente.consultas[0];
  const formato = componente.opciones.formato ?? formatoPorDefecto(consulta.metricas);
  const datos = useMemo(() => datosMapa(respuesta, consulta), [respuesta, consulta]);
  const encuadre = useMemo(() => encuadreMapa(datos.puntos), [datos]);
  const contenedor = useRef<HTMLDivElement>(null);
  const mapa = useRef<MapaLibre | null>(null);
  const formatoActual = useRef(formato);
  formatoActual.current = formato;
  const [listo, setListo] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelado = false;
    let observador: ResizeObserver | null = null;
    let popup: Popup | null = null;

    Promise.all([import("maplibre-gl"), import("maplibre-gl/dist/maplibre-gl.css")])
      .then(([maplibre]) => {
        if (cancelado || !contenedor.current) return;
        maplibre.setWorkerUrl(urlWorker);
        const nuevo = new maplibre.Map({
          container: contenedor.current,
          style: ESTILO,
          bounds: LIMITES_ESPAÑA,
          fitBoundsOptions: { padding: 12 },
          attributionControl: { compact: true },
          // Sin esto el mapa sale en blanco al imprimir (exportar a PDF).
          canvasContextAttributes: { preserveDrawingBuffer: true },
          // En un dashboard la rueda desplaza la página; el zoom, con Ctrl.
          cooperativeGestures: true,
          dragRotate: false,
          pitchWithRotate: false,
        });
        nuevo.addControl(new maplibre.NavigationControl({ showCompass: false }), "top-right");
        popup = new maplibre.Popup({ closeButton: false, offset: 8 });

        nuevo.on("load", () => {
          nuevo.addSource(FUENTE, { type: "geojson", data: geojson({ puntos: [], sinSituar: 0 }) });
          nuevo.addLayer({
            id: `${FUENTE}-circulos`,
            type: "circle",
            source: FUENTE,
            paint: {
              "circle-color": COLORES_SERIE[0],
              "circle-opacity": 0.72,
              "circle-stroke-color": "#ffffff",
              "circle-stroke-width": 1.5,
              "circle-radius": 6,
            },
          });
          nuevo.on("click", `${FUENTE}-circulos`, (evento) => {
            const punto = evento.features?.[0];
            if (!punto || !popup) return;
            popup
              .setLngLat(evento.lngLat)
              .setDOMContent(contenidoPopup(punto.properties, formatoActual.current))
              .addTo(nuevo);
          });
          nuevo.on("mouseenter", `${FUENTE}-circulos`, () => {
            nuevo.getCanvas().style.cursor = "pointer";
          });
          nuevo.on("mouseleave", `${FUENTE}-circulos`, () => {
            nuevo.getCanvas().style.cursor = "";
          });
          setListo(true);
        });
        nuevo.on("error", (evento) => {
          // Sin teselas (sin red o estilo inaccesible): se avisa, sin romper el dashboard.
          if (!nuevo.isStyleLoaded()) setError(Boolean(evento.error));
        });

        // El componente cambia de tamaño en la rejilla.
        observador = new ResizeObserver(() => nuevo.resize());
        observador.observe(contenedor.current);
        mapa.current = nuevo;
      })
      .catch(() => !cancelado && setError(true));

    return () => {
      cancelado = true;
      observador?.disconnect();
      popup?.remove();
      mapa.current?.remove();
      mapa.current = null;
    };
  }, []);

  useEffect(() => {
    const actual = mapa.current;
    if (!listo || !actual) return;
    (actual.getSource(FUENTE) as GeoJSONSource | undefined)?.setData(geojson(datos));
    const maximo = datos.puntos[0]?.valor ?? 1;
    actual.setPaintProperty(`${FUENTE}-circulos`, "circle-radius", expresionRadio(maximo));
    if (encuadre.limites) {
      actual.fitBounds(encuadre.limites, { padding: 40, maxZoom: 7, duration: 0 });
    }
  }, [listo, datos, encuadre]);

  return (
    <div className="dashboard-mapa">
      <div
        ref={contenedor}
        className="dashboard-mapa-lienzo"
        role="img"
        aria-label={t("dashboard.mapaJoin", { join: datos.puntos
          .slice(0, 5)
          .map((p) => `${p.nombre} ${formatearValor(p.valor, formato)}`)
          .join(", ") })}
      />
      {error && (
        <p className="dashboard-mapa-aviso">{t("dashboard.noSeHaPodidoCargarEl")}</p>
      )}
      {encuadre.fuera.length > 0 && (
        <p className="dashboard-mapa-pie">
          {t("dashboard.canarias")}{" "}
          {encuadre.fuera
            .map((p) =>
              [p.nombre, formatearValor(p.valor, formato), p.clientes !== null ? `${p.clientes} clientes` : null]
                .filter(Boolean)
                .join(" · ")
            )
            .join("; ")}
        </p>
      )}
      {datos.sinSituar > 0 && (
        <p className="dashboard-mapa-pie">
          {t("dashboard.valorSinProvinciaOFueraDe", { valor: formatearValor(datos.sinSituar, formato) })}
        </p>
      )}
    </div>
  );
};

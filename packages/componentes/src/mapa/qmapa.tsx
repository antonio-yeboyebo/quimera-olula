import type { GeoJSONSource, Map as MapaLibre, Popup } from "maplibre-gl";
import urlWorker from "maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url";
import { useEffect, useRef, useState } from "react";
import {
  Coordenadas,
  limitesDelRadio,
  mismaVista,
  radioDeLimites,
  VistaMapa,
} from "./dominio.ts";
import "./qmapa.css";

export type PuntoMapa = {
  id: string;
  latitud: number;
  longitud: number;
  titulo: string;
  color?: string;
};

type QMapaProps = {
  centro: Coordenadas;
  radioKm: number;
  puntos: PuntoMapa[];
  seleccionado?: string | null;
  posicion?: Coordenadas | null;
  onSeleccionar?: (id: string) => void;
  onMover?: (centro: Coordenadas, radioKm: number) => void;
};

const ESTILO =
  import.meta.env.VITE_MAPA_ESTILO ||
  "https://tiles.openfreemap.org/styles/positron";
const PUNTOS = "qmapa-puntos";
const POSICION = "qmapa-posicion";
const COLOR_POSICION = "#1a73e8";

const colorResuelto = (contenedor: HTMLElement, color: string) => {
  const sonda = document.createElement("span");
  sonda.style.color = color;
  contenedor.append(sonda);
  const resuelto = getComputedStyle(sonda).color;
  sonda.remove();
  return resuelto;
};

type Punto = ReturnType<typeof punto>;

const punto = (
  { latitud, longitud }: Coordenadas,
  properties: Record<string, unknown> = {}
) => ({
  type: "Feature" as const,
  geometry: { type: "Point" as const, coordinates: [longitud, latitud] },
  properties,
});

const coleccion = (features: Punto[]) => ({
  type: "FeatureCollection" as const,
  features,
});

export const QMapa = ({
  centro,
  radioKm,
  puntos,
  seleccionado = null,
  posicion = null,
  onSeleccionar,
  onMover,
}: QMapaProps) => {
  const contenedor = useRef<HTMLDivElement>(null);
  const mapa = useRef<MapaLibre | null>(null);
  const popup = useRef<Popup | null>(null);
  const vistaActual = useRef<VistaMapa | null>(null);
  const vistaInicial = useRef<VistaMapa>({ centro, radioKm });
  const alSeleccionar = useRef(onSeleccionar);
  const alMover = useRef(onMover);
  alSeleccionar.current = onSeleccionar;
  alMover.current = onMover;
  const [listo, setListo] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelado = false;
    let observador: ResizeObserver | null = null;

    Promise.all([
      import("maplibre-gl"),
      import("maplibre-gl/dist/maplibre-gl.css"),
    ])
      .then(([maplibre]) => {
        if (cancelado || !contenedor.current) return;
        maplibre.setWorkerUrl(urlWorker);
        const nuevo = new maplibre.Map({
          container: contenedor.current,
          style: ESTILO,
          bounds: limitesDelRadio(vistaInicial.current),
          attributionControl: { compact: true },
          dragRotate: false,
          pitchWithRotate: false,
          touchPitch: false,
        });
        nuevo.touchZoomRotate.disableRotation();
        nuevo.addControl(
          new maplibre.NavigationControl({ showCompass: false }),
          "top-right"
        );
        popup.current = new maplibre.Popup({
          closeButton: false,
          closeOnClick: false,
          offset: 12,
        });
        vistaActual.current = vistaInicial.current;

        nuevo.on("load", () => {
          nuevo.addSource(PUNTOS, { type: "geojson", data: coleccion([]) });
          nuevo.addSource(POSICION, { type: "geojson", data: coleccion([]) });
          nuevo.addLayer({
            id: POSICION,
            type: "circle",
            source: POSICION,
            paint: {
              "circle-color": COLOR_POSICION,
              "circle-radius": 7,
              "circle-stroke-color": "#ffffff",
              "circle-stroke-width": 2,
            },
          });
          nuevo.addLayer({
            id: PUNTOS,
            type: "circle",
            source: PUNTOS,
            layout: {
              "circle-sort-key": ["case", ["get", "seleccionado"], 1, 0],
            },
            paint: {
              "circle-color": ["get", "color"],
              "circle-radius": ["case", ["get", "seleccionado"], 10, 7],
              "circle-stroke-color": "#ffffff",
              "circle-stroke-width": 2,
            },
          });
          nuevo.on("click", PUNTOS, (evento) => {
            const id = evento.features?.[0]?.properties?.id;
            if (id !== undefined) alSeleccionar.current?.(String(id));
          });
          nuevo.on("mouseenter", PUNTOS, () => {
            nuevo.getCanvas().style.cursor = "pointer";
          });
          nuevo.on("mouseleave", PUNTOS, () => {
            nuevo.getCanvas().style.cursor = "";
          });
          setListo(true);
        });

        nuevo.on("moveend", (evento) => {
          if (!evento.originalEvent) return;
          const { lat, lng } = nuevo.getCenter();
          const limites = nuevo.getBounds().toArray() as [
            [number, number],
            [number, number],
          ];
          const centroNuevo = { latitud: lat, longitud: lng };
          const vista = {
            centro: centroNuevo,
            radioKm: radioDeLimites(centroNuevo, limites),
          };
          vistaActual.current = vista;
          alMover.current?.(vista.centro, vista.radioKm);
        });

        nuevo.on("error", (evento) => {
          if (!nuevo.isStyleLoaded()) setError(Boolean(evento.error));
        });

        observador = new ResizeObserver(() => nuevo.resize());
        observador.observe(contenedor.current);
        mapa.current = nuevo;
      })
      .catch(() => !cancelado && setError(true));

    return () => {
      cancelado = true;
      observador?.disconnect();
      popup.current?.remove();
      mapa.current?.remove();
      mapa.current = null;
    };
  }, []);

  useEffect(() => {
    const actual = mapa.current;
    const vista = {
      centro: { latitud: centro.latitud, longitud: centro.longitud },
      radioKm,
    };
    if (!listo || !actual || mismaVista(vista, vistaActual.current)) return;
    vistaActual.current = vista;
    actual.fitBounds(limitesDelRadio(vista), { padding: 0, duration: 400 });
  }, [listo, centro.latitud, centro.longitud, radioKm]);

  useEffect(() => {
    const actual = mapa.current;
    if (!listo || !actual || !contenedor.current) return;
    const colorPorDefecto = colorResuelto(
      contenedor.current,
      "var(--color-primario)"
    );
    const colores = new Map<string, string>();
    const color = (valor?: string) => {
      if (!valor || !contenedor.current) return colorPorDefecto;
      if (!colores.has(valor))
        colores.set(valor, colorResuelto(contenedor.current, valor));
      return colores.get(valor) ?? colorPorDefecto;
    };
    (actual.getSource(PUNTOS) as GeoJSONSource | undefined)?.setData(
      coleccion(
        puntos.map((p) =>
          punto(p, {
            id: p.id,
            titulo: p.titulo,
            color: color(p.color),
            seleccionado: p.id === seleccionado,
          })
        )
      )
    );

    const elegido = puntos.find((p) => p.id === seleccionado);
    if (elegido) {
      popup.current
        ?.setLngLat([elegido.longitud, elegido.latitud])
        .setText(elegido.titulo)
        .addTo(actual);
    } else {
      popup.current?.remove();
    }
  }, [listo, puntos, seleccionado]);

  useEffect(() => {
    const actual = mapa.current;
    if (!listo || !actual) return;
    (actual.getSource(POSICION) as GeoJSONSource | undefined)?.setData(
      coleccion(posicion ? [punto(posicion)] : [])
    );
  }, [listo, posicion]);

  return (
    <div className="QMapa">
      <div
        ref={contenedor}
        className="lienzo"
        role="region"
        aria-label={`Mapa con ${puntos.length} puntos`}
      />
      {error && <p className="aviso">No se ha podido cargar el mapa.</p>}
    </div>
  );
};

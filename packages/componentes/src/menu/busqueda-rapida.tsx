import { REGLA_ASISTENTE, puede } from "@olula/lib/dominio.ts";
import { FactoryCtx } from "@olula/lib/factory_ctx.tsx";
import { solicitarPreguntaAsistente } from "@olula/lib/panel_lateral_events.ts";
import { useContext, useState } from "react";
import { useNavigate } from "react-router";
import { QIcono } from "../atomos/qicono.tsx";
import { QInput } from "../atomos/qinput.tsx";
import { QModal } from "../moleculas/qmodal.tsx";
import { useMenuControl } from "../plantilla/useMenuControl";
import "./busqueda-rapida.css";
import {
  buscarPantallas,
  detalleResultadoDatos,
  PantallaMenu,
  partesCoincidencia,
} from "./dominio.ts";
import { usePantallasMenu } from "./usePantallasMenu.ts";
import { useBusquedaDatos } from "./useBusquedaDatos.ts";
import { useTComponentes } from "../i18n/textos.ts";

/** Fila navegable de la búsqueda: una pantalla, un dato o la pregunta al asistente. */
type Opcion = {
  clave: string;
  icono: string;
  titulo: string;
  /** Resalta lo buscado en el título (no en la pregunta al asistente). */
  resaltar: boolean;
  detalle: string;
  abrir: (nuevaPestana: boolean) => void;
};
type Seccion = { titulo: string; nota?: string; opciones: Opcion[] };

/**
 * Búsqueda rápida (Ctrl K): pantallas del menú, datos (clientes, proveedores y
 * documentos; 3 por tipo) y, al final, la pregunta al asistente.
 */
export const BusquedaRapida = () => {
  const t = useTComponentes();
  const { cerrarBusqueda, recargarPantalla } = useMenuControl();
  const { app } = useContext(FactoryCtx);
  const { pantallas, favoritos, recientes } = usePantallasMenu();
  const navigate = useNavigate();
  const [texto, setTexto] = useState("");
  const [seleccion, setSeleccion] = useState(0);
  const { grupos, cargando } = useBusquedaDatos(texto);
  const hayAsistente = !!app.Componentes?.panel_asistente && puede(REGLA_ASISTENTE);
  const consulta = texto.trim();

  const ir = (url: string, nuevaPestana: boolean) => {
    if (nuevaPestana) {
      window.open(url, "_blank", "noopener");
      return;
    }
    cerrarBusqueda();
    // Misma ruta (otro documento): el maestro no se vuelve a montar solo.
    const mismaPantalla =
      new URL(url, window.location.origin).pathname === window.location.pathname;
    if (mismaPantalla) recargarPantalla();
    navigate(url);
  };

  const opcionPantalla = (
    p: PantallaMenu & { aliasCoincide?: string },
    icono?: string
  ): Opcion => ({
    clave: `pantalla-${p.url}-${icono ?? ""}`,
    icono: icono ?? p.icono ?? "menu_grupo",
    titulo: p.nombre,
    resaltar: true,
    detalle:
      (p.grupo || t("ui.menu.inicio")) +
      (p.aliasCoincide ? t("ui.menu.tambienAliascoincide", { aliasCoincide: p.aliasCoincide }) : ""),
    abrir: (nueva) => ir(p.url, nueva),
  });

  const iconoDeRuta = (ruta: string) =>
    pantallas.find((p) => p.url === ruta)?.icono ?? "menu_grupo";

  const secciones: Seccion[] = consulta
    ? [
        {
          titulo: t("ui.menu.pantallas"),
          opciones: buscarPantallas(pantallas, consulta, 6).map((p) =>
            opcionPantalla(p)
          ),
        },
        ...grupos.map((g) => ({
          titulo: g.tipo,
          nota:
            g.total > g.resultados.length
              ? `${g.resultados.length} de ${g.total}`
              : undefined,
          opciones: g.resultados.map(
            (r): Opcion => ({
              clave: `${g.recurso}-${r.id}`,
              icono: iconoDeRuta(g.ruta),
              titulo: r.titulo,
              resaltar: true,
              detalle: detalleResultadoDatos(r),
              abrir: (nueva) =>
                ir(`${g.ruta}?id=${encodeURIComponent(String(r.id))}`, nueva),
            })
          ),
        })),
        ...(hayAsistente
          ? [
              {
                titulo: t("ui.menu.asistente"),
                opciones: [
                  {
                    clave: "asistente",
                    icono: "asistente",
                    titulo: t("ui.menu.preguntarAOlulaConsulta", { consulta }),
                    resaltar: false,
                    detalle: t("ui.menu.paraPreguntasComoFacturasPendientesDe"),
                    abrir: () => {
                      cerrarBusqueda();
                      solicitarPreguntaAsistente(consulta);
                    },
                  },
                ],
              },
            ]
          : []),
      ]
    : [
        { titulo: t("ui.menu.recientes"), opciones: recientes.map((p) => opcionPantalla(p, "reloj")) },
        {
          titulo: t("ui.menu.favoritos"),
          opciones: favoritos.map((p) => opcionPantalla(p, "estrella_rellena")),
        },
      ];

  const visibles = secciones.filter((s) => s.opciones.length > 0);
  const lista = visibles.flatMap((s) => s.opciones);
  const actual = Math.min(seleccion, Math.max(lista.length - 1, 0));

  // En el contenedor y no en QInput: el átomo no reenvía onKeyDown al <input>
  // y los inputs no se tocan; la tecla llega aquí por propagación.
  const alPulsar = (e: React.KeyboardEvent<HTMLElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSeleccion(Math.min(actual + 1, lista.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSeleccion(Math.max(actual - 1, 0));
    } else if (e.key === "Enter" && lista[actual]) {
      e.preventDefault();
      lista[actual].abrir(e.ctrlKey || e.metaKey);
    }
  };

  let indice = 0;

  return (
    <QModal
      nombre="busqueda-rapida"
      abierto={true}
      onCerrar={cerrarBusqueda}
      mostrarCabecera={false}
      pantallaCompletaMovil
    >
      <div className="busqueda-rapida" onKeyDown={alPulsar}>
        <div className="busqueda-rapida-entrada">
          <QIcono nombre="buscar" tamaño="md" />
          <QInput
            nombre="busqueda_rapida"
            label=""
            placeholder={t("ui.menu.pantallaClienteProveedorODocumento")}
            valor={texto}
            autoFocus
            onChange={(v) => {
              setTexto(v);
              setSeleccion(0);
            }}
          />
          <kbd>Esc</kbd>
        </div>

        <div
          className="busqueda-rapida-resultados"
          role="listbox"
          aria-label={t("ui.menu.resultados")}
          aria-busy={cargando}
        >
          {visibles.map((seccion) => (
            <section key={seccion.titulo}>
              <h2>
                {seccion.titulo}
                {seccion.nota && <span> · {seccion.nota}</span>}
              </h2>
              <ul>
                {seccion.opciones.map((o) => {
                  const posicion = indice++;
                  const seleccionado = posicion === actual;
                  const { antes, coincide, despues } = o.resaltar
                    ? partesCoincidencia(o.titulo, consulta)
                    : { antes: o.titulo, coincide: "", despues: "" };
                  return (
                    <li key={o.clave}>
                      <button
                        type="button"
                        role="option"
                        aria-selected={seleccionado}
                        className="busqueda-rapida-resultado"
                        onMouseEnter={() => setSeleccion(posicion)}
                        onClick={(e) => o.abrir(e.ctrlKey || e.metaKey)}
                      >
                        <span className="busqueda-rapida-icono">
                          <QIcono nombre={o.icono} tamaño="sm" />
                        </span>
                        <span className="busqueda-rapida-texto">
                          <span className="busqueda-rapida-nombre">
                            {antes}
                            {coincide && <mark>{coincide}</mark>}
                            {despues}
                          </span>
                          <span className="busqueda-rapida-detalle">{o.detalle}</span>
                        </span>
                        {seleccionado && <kbd>↵</kbd>}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </section>
          ))}
          {cargando && (
            <p className="busqueda-rapida-cargando">{t("ui.menu.buscandoEnClientesYDocumentos")}</p>
          )}
          {lista.length === 0 && !cargando && (
            <p className="busqueda-rapida-vacio">
              {consulta
                ? t("ui.menu.nadaCoincideConConsulta", { consulta })
                : t("ui.menu.escribeParaBuscarPantallasClientesProvee")}
            </p>
          )}
        </div>

        <footer className="busqueda-rapida-pie">
          <span>
            <b>↑ ↓</b>{" "}{t("ui.menu.moverse")}
          </span>
          <span>
            <b>↵</b>{" "}{t("ui.menu.abrir")}
          </span>
          <span>
            <b>Ctrl ↵</b>{" "}{t("ui.menu.enPestanaNueva")}
          </span>
        </footer>
      </div>
    </QModal>
  );
};

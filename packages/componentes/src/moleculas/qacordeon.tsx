import { ReactNode, useId, useMemo, useState } from "react";
import { QIcono } from "../atomos/qicono.tsx";
import "./qacordeon.css";
import { useTComponentes } from "../i18n/textos.ts";

export type QAcordeonCabeceraContexto = {
  abierto: boolean;
  idPanel: string;
  idBoton: string;
};

export type QAcordeonItem = {
  id: string;
  titulo?: ReactNode;
  subtitulo?: ReactNode;
  cabecera?: ReactNode | ((contexto: QAcordeonCabeceraContexto) => ReactNode);
  contador?: number;
  contenido: ReactNode;
  deshabilitado?: boolean;
};

type QAcordeonProps = {
  items: QAcordeonItem[];
  abiertoId?: string | null;
  abiertoInicialId?: string | null;
  onAbiertoCambiado?: (id: string | null) => void;
  permitirCerrar?: boolean;
};

export const QAcordeon = ({
  items,
  abiertoId,
  abiertoInicialId = null,
  onAbiertoCambiado,
  permitirCerrar = false,
}: QAcordeonProps) => {
  const t = useTComponentes();
  const acordeonId = useId();
  const primerItemHabilitado = useMemo(
    () => items.find((item) => !item.deshabilitado)?.id ?? null,
    [items]
  );

  const [abiertoInterno, setAbiertoInterno] = useState<string | null>(
    abiertoInicialId ?? primerItemHabilitado
  );

  const abiertoActual = abiertoId === undefined ? abiertoInterno : abiertoId;

  const cambiarAbierto = (id: string) => {
    const siguiente = permitirCerrar && abiertoActual === id ? null : id;

    if (abiertoId === undefined) {
      setAbiertoInterno(siguiente);
    }

    onAbiertoCambiado?.(siguiente);
  };

  return (
    <quimera-acordeon>
      {items.map((item) => {
        const abierto = abiertoActual === item.id;
        const panelId = `${acordeonId}-${item.id}-panel`;
        const botonId = `${acordeonId}-${item.id}-boton`;
        const tituloId = `${acordeonId}-${item.id}-titulo`;
        const cabeceraDefecto = (
          <span className="qacordeon-cabecera-texto">
            {item.titulo && (
              <span className="qacordeon-texto-principal">{item.titulo}</span>
            )}
            {item.subtitulo && (
              <small className="qacordeon-subtitulo">{item.subtitulo}</small>
            )}
          </span>
        );
        const cabeceraPersonalizada =
          typeof item.cabecera === "function"
            ? item.cabecera({
                abierto,
                idPanel: panelId,
                idBoton: botonId,
              })
            : item.cabecera;
        const cabecera = cabeceraPersonalizada ?? cabeceraDefecto;

        return (
          <section
            key={item.id}
            className="qacordeon-item"
            data-abierto={abierto ? "" : undefined}
          >
            <h3 id={tituloId} className="qacordeon-titulo">
              <div className="qacordeon-cabecera">
                <div className="qacordeon-cabecera-principal">{cabecera}</div>
                <span className="qacordeon-cabecera-derecha">
                  {typeof item.contador === "number" && (
                    <span className="qacordeon-contador">{item.contador}</span>
                  )}
                  <button
                    id={botonId}
                    type="button"
                    className="qacordeon-toggle"
                    aria-expanded={abierto}
                    aria-controls={panelId}
                    aria-label={
                      abierto ? t("ui.moleculas.contraerSeccion") : t("ui.moleculas.expandirSeccion")
                    }
                    disabled={item.deshabilitado}
                    onClick={() => cambiarAbierto(item.id)}
                  >
                    <QIcono nombre={abierto ? "arriba" : "abajo"} tamaño="sm" />
                  </button>
                </span>
              </div>
            </h3>

            <div
              id={panelId}
              role="region"
              className="qacordeon-contenido"
              aria-labelledby={tituloId}
              hidden={!abierto}
            >
              {item.contenido}
            </div>
          </section>
        );
      })}
    </quimera-acordeon>
  );
};

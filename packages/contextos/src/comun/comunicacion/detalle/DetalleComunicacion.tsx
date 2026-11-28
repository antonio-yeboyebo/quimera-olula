import { Detalle } from "@olula/componentes/detalle/Detalle.tsx";
import { useMaquina } from "@olula/componentes/hook/useMaquina.js";
import { QuimeraAcciones } from "@olula/componentes/moleculas/qacciones.tsx";
import {
  QTextEnriquecidoJSON,
  type JSONContent,
} from "@olula/componentes/moleculas/qeditor_enriquecido.tsx";
import { QTextoEnriquecido } from "@olula/componentes/moleculas/qtexto_enriquecido.tsx";
import { EmitirEvento } from "@olula/lib/diseño.ts";
import { formatearFechaDate } from "@olula/lib/dominio.js";
import { useEffect } from "react";
import { useParams } from "react-router";
import { Comunicacion } from "../diseño.ts";
import { comunicacionVacia } from "../dominio.ts";
import "./DetalleComunicacion.css";
import { getMaquina } from "./maquina.ts";
import { useTComun } from "../../i18n/index.ts";

const fechaConHora = (fecha: Date | null) => {
  if (!fecha) return "-";

  return `${formatearFechaDate(fecha)} ${fecha.toLocaleTimeString("es-ES", {
    hour: "2-digit",
    minute: "2-digit",
  })}`;
};

const cuerpoComoJson = (cuerpo: string): JSONContent | null => {
  if (!cuerpo) return null;

  try {
    const parsed = JSON.parse(cuerpo) as JSONContent;
    return typeof parsed === "object" && parsed !== null && "type" in parsed
      ? parsed
      : null;
  } catch {
    return null;
  }
};

export const DetalleComunicacion = ({
  id,
  publicar,
}: {
  id?: string;
  publicar: EmitirEvento;
}) => {
  const t = useTComun();
  const params = useParams();
  const comunicacionId = id ?? params.id;

  const { ctx, emitir } = useMaquina(
    getMaquina,
    {
      estado: "INICIAL",
      comunicacion: comunicacionVacia(),
      comunicacionInicial: comunicacionVacia(),
    },
    publicar
  );

  useEffect(() => {
    emitir("comunicacion_id_cambiado", comunicacionId, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [comunicacionId]);

  if (!comunicacionId || !ctx.comunicacion.id) return null;

  const cuerpoJson = cuerpoComoJson(ctx.comunicacion.cuerpo);

  return (
    <Detalle
      id={ctx.comunicacion.id}
      obtenerTitulo={(entidad) =>
        (entidad as Comunicacion).asunto || t("comunicacion.comunicacion")
      }
      setEntidad={() => {}}
      entidad={ctx.comunicacion}
      cerrarDetalle={() => emitir("comunicacion_deseleccionada", null)}
    >
      <div className="DetalleComunicacion">
        <div className="detalle-comunicacion-barra">
          <p className="detalle-comunicacion-fecha">
            {fechaConHora(ctx.comunicacion.fechaEnvio)}
          </p>
          <QuimeraAcciones
            acciones={[
              {
                icono: "ver",
                texto: t("comunicacion.marcarComoNoLeida"),
                onClick: () => emitir("marcado_no_leida_solicitado"),
              },
              {
                icono: "eliminar",
                texto: t("comunicacion.borrar"),
                onClick: () => emitir("borrado_solicitado"),
                advertencia: true,
              },
            ]}
            vertical
          />
        </div>

        <div className="detalle-comunicacion-campos">
          <div>
            <p className="detalle-comunicacion-cuerpo">
              {cuerpoJson ? (
                <QTextEnriquecidoJSON valor={cuerpoJson} />
              ) : (
                <QTextoEnriquecido texto={ctx.comunicacion.cuerpo} />
              )}
            </p>
          </div>
        </div>
      </div>
    </Detalle>
  );
};

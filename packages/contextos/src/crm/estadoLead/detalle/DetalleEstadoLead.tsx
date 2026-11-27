import { useMaquina } from "@olula/componentes/hook/useMaquina.js";
import { Detalle, QBoton, QInput } from "@olula/componentes/index.js";
import { QuimeraAcciones } from "@olula/componentes/moleculas/qacciones.tsx";
import { EmitirEvento, Entidad } from "@olula/lib/diseño.js";
import { useModelo } from "@olula/lib/useModelo.js";
import { useEffect } from "react";
import { useParams } from "react-router";
import { BorrarEstadoLead } from "../borrar/BorrarEstadoLead.tsx";
import { estadoLeadVacio, metaEstadoLead } from "./detalle.ts";
import "./DetalleEstadoLead.css";
import { getMaquina } from "./maquina.ts";
import { useTCrm } from "../../i18n/index.ts";

export const DetalleEstadoLead = ({
  id,
  publicar,
}: {
  id?: string;
  publicar: EmitirEvento;
}) => {
  const t = useTCrm();
  const params = useParams();

  const estadoLeadId = id ?? params.id;
  const titulo = (estado_lead: Entidad) => estado_lead.descripcion as string;

  const { ctx, emitir } = useMaquina(
    getMaquina,
    {
      estado: "INICIAL",
      estado_lead: estadoLeadVacio,
    },
    publicar
  );

  const estado_lead = useModelo(metaEstadoLead, ctx.estado_lead);
  const { modelo, modificado, uiProps, valido } = estado_lead;

  useEffect(() => {
    if (estadoLeadId) {
      emitir("estado_lead_id_cambiado", estadoLeadId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [estadoLeadId]);

  return (
    <Detalle
      id={estadoLeadId}
      obtenerTitulo={titulo}
      setEntidad={() => {}}
      entidad={modelo}
      cerrarDetalle={() => emitir("edicion_estado_lead_cancelada", null)}
    >
      {!!estadoLeadId && (
        <div className="DetalleEstadoLead">
          <QuimeraAcciones
            vertical
            acciones={[
              {
                texto: t("estadoLead.marcarPorDefecto"),
                onClick: () => emitir("marcar_estado_lead_por_defecto"),
                deshabilitado: modelo.valorDefecto,
              },
              {
                texto: t("estadoLead.borrar"),
                onClick: () => emitir("borrado_estado_lead_solicitado"),
                advertencia: true,
              },
            ]}
          />

          <quimera-formulario>
            <QInput label={t("estadoLead.descripcion")} {...uiProps("descripcion")} />
          </quimera-formulario>

          {modificado && (
            <div className="botones maestro-botones">
              <QBoton
                onClick={() => emitir("estado_lead_cambiado", modelo)}
                deshabilitado={!valido}
              >
                {t("estadoLead.guardar")}
              </QBoton>
              <QBoton
                tipo="reset"
                variante="texto"
                onClick={() => emitir("edicion_estado_lead_cancelada")}
              >
                {t("estadoLead.cancelar")}
              </QBoton>
            </div>
          )}

          {ctx.estado === "BORRANDO" && (
            <BorrarEstadoLead publicar={emitir} estado_lead={modelo} />
          )}
        </div>
      )}
    </Detalle>
  );
};

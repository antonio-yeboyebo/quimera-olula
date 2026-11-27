import { useMaquina } from "@olula/componentes/hook/useMaquina.js";
import { Detalle, QBoton, Tab, Tabs } from "@olula/componentes/index.js";
import { QuimeraAcciones } from "@olula/componentes/moleculas/qacciones.tsx";
import { EmitirEvento, Entidad } from "@olula/lib/diseño.js";
import { useModelo } from "@olula/lib/useModelo.js";
import { useEffect } from "react";
import { BorrarLead } from "../borrar/BorrarLead.tsx";
import { Acciones } from "./acciones/Acciones.tsx";
import { leadVacio, metaLead } from "./detalle.ts";
import "./DetalleLead.css";
import { getMaquina } from "./maquina.ts";
import { Oportunidades } from "./oportunidades/Oportunidades.tsx";
import { TabDatos } from "./tabs/TabDatos.tsx";
import { TabObservaciones } from "./tabs/TabObservaciones.tsx";
import { useTCrm } from "../../i18n/index.ts";

export const DetalleLead = ({
  id,
  publicar,
}: {
  id?: string;
  publicar: EmitirEvento;
}) => {
  const t = useTCrm();
  const titulo = (lead: Entidad) => lead.nombre as string;

  const { ctx, emitir } = useMaquina(
    getMaquina,
    {
      estado: "INICIAL",
      lead: leadVacio,
    },
    publicar
  );

  const lead = useModelo(metaLead, ctx.lead);
  const { modelo, modificado, valido } = lead;

  useEffect(() => {
    emitir("lead_id_cambiado", id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (!ctx.lead.id) return;

  return (
    <Detalle
      id={id}
      obtenerTitulo={titulo}
      setEntidad={() => {}}
      entidad={modelo}
      cerrarDetalle={() => emitir("edicion_lead_cancelada", null)}
    >
      <div className="DetalleLead">
        <QuimeraAcciones
          vertical
          acciones={[
            {
              texto: t("lead.borrar"),
              onClick: () => emitir("borrado_lead_solicitado"),
              advertencia: true,
            },
          ]}
        />

        <Tabs>
          <Tab label={t("lead.datos")}>
            <TabDatos lead={lead} />
          </Tab>

          <Tab label={t("lead.observaciones")}>
            <TabObservaciones lead={lead} />
          </Tab>

          <Tab label={t("lead.oportunidades")}>
            <Oportunidades lead={lead} />
          </Tab>

          <Tab label={t("lead.acciones")}>
            <Acciones lead={lead} />
          </Tab>
        </Tabs>

        {modificado && (
          <div className="botones maestro-botones">
            <QBoton
              onClick={() => emitir("lead_cambiado", modelo)}
              deshabilitado={!valido}
            >
              {t("lead.guardar")}
            </QBoton>
            <QBoton
              tipo="reset"
              variante="texto"
              onClick={() => emitir("edicion_lead_cancelada")}
            >
              {t("lead.cancelar")}
            </QBoton>
          </div>
        )}

        {ctx.estado === "BORRANDO" && (
          <BorrarLead publicar={emitir} lead={modelo} />
        )}
      </div>
    </Detalle>
  );
};

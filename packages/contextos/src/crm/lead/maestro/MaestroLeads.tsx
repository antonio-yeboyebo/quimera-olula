import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { useMaquina } from "@olula/componentes/hook/useMaquina.js";
import { Listado } from "@olula/componentes/maestro/Listado.js";
import { MaestroDetalle } from "@olula/componentes/maestro/MaestroDetalle.tsx";
import { listaActivaEntidadesInicial } from "@olula/lib/ListaActivaEntidades.js";
import { getUrlParams, useUrlParams } from "@olula/lib/url-params.js";
import { useEffect } from "react";
import { CrearLead } from "../crear/CrearLead.tsx";
import { DetalleLead } from "../detalle/DetalleLead.tsx";
import { Lead } from "../diseño.ts";
import { metaTablaLead } from "./maestro.ts";
import "./MaestroLeads.css";
import { getMaquina } from "./maquina.ts";
import { TarjetaLead } from "./TarjetaLead.tsx";
import { useTCrm } from "../../i18n/index.ts";

export const MaestroLeads = () => {
  const t = useTCrm();
  const { id, criteria } = getUrlParams();

  const { ctx, emitir } = useMaquina(getMaquina, {
    estado: "INICIAL",
    leads: listaActivaEntidadesInicial<Lead>(id, criteria),
  });

  useUrlParams(ctx.leads.activo, ctx.leads.criteria);

  useEffect(() => {
    emitir("recarga_de_leads_solicitada", ctx.leads.criteria);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="MaestroLeads">
      <MaestroDetalle<Lead>
        Maestro={
          <>
            <h2>{t("lead.leads")}</h2>

            <Listado<Lead>
              metaTabla={metaTablaLead}
              criteria={ctx.leads.criteria}
              modosDisponibles={["tarjetas"]}
              tarjeta={TarjetaLead}
              entidades={ctx.leads.lista}
              totalEntidades={ctx.leads.total}
              seleccionada={ctx.leads.activo}
              renderAcciones={() => (
                <div className="maestro-botones">
                  <QBoton onClick={() => emitir("creacion_de_lead_solicitada")}>
                    {t("lead.nuevo")}
                  </QBoton>
                </div>
              )}
              onSeleccion={(payload) => emitir("lead_seleccionado", payload)}
              onCriteriaChanged={(payload) =>
                emitir("criteria_cambiado", payload)
              }
              onSiguientePagina={(payload) =>
                emitir("siguiente_pagina", payload)
              }
            />
          </>
        }
        Detalle={<DetalleLead id={ctx.leads.activo} publicar={emitir} />}
        seleccionada={ctx.leads.activo}
        modoDisposicion="maestro-50"
      />

      {ctx.estado === "CREANDO" && <CrearLead publicar={emitir} />}
    </div>
  );
};

import { TarjetaConfiguracionCrm } from "#/crm/comun/componentes/TarjetaConfiguracionCrm.tsx";
import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { useMaquina } from "@olula/componentes/hook/useMaquina.js";
import { Listado } from "@olula/componentes/maestro/Listado.js";
import { MaestroDetalle } from "@olula/componentes/maestro/MaestroDetalle.tsx";
import { listaActivaEntidadesInicial } from "@olula/lib/ListaActivaEntidades.js";
import { useEffect } from "react";
import { CrearEstadoLead } from "../crear/CrearEstadoLead.tsx";
import { DetalleEstadoLead } from "../detalle/DetalleEstadoLead.tsx";
import { EstadoLead } from "../diseño.ts";
import { metaTablaEstadoLead } from "./maestro.ts";
import "./MaestroEstadosLead.css";
import { getMaquina } from "./maquina.ts";
import { useTCrm } from "../../i18n/index.ts";

export const MaestroEstadosLead = () => {
  const t = useTCrm();
  const { ctx, emitir } = useMaquina(getMaquina, {
    estado: "INICIAL",
    estados_lead: listaActivaEntidadesInicial<EstadoLead>(),
  });

  useEffect(() => {
    emitir("recarga_de_estados_lead_solicitada", ctx.estados_lead.criteria);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="EstadoLead">
      <MaestroDetalle<EstadoLead>
        Maestro={
          <>
            <h2>{t("estadoLead.estadosDeLead")}</h2>

            <Listado<EstadoLead>
              metaTabla={metaTablaEstadoLead}
              tarjeta={(estado) => (
                <TarjetaConfiguracionCrm
                  codigo={estado.id}
                  descripcion={estado.descripcion}
                  valorDefecto={estado.valorDefecto}
                />
              )}
              criteria={ctx.estados_lead.criteria}
              modo={"tarjetas"}
              entidades={ctx.estados_lead.lista}
              totalEntidades={ctx.estados_lead.total}
              seleccionada={ctx.estados_lead.activo}
              renderAcciones={() => (
                <div className="maestro-botones">
                  <QBoton
                    onClick={() => emitir("creacion_de_estado_lead_solicitada")}
                  >
                    {t("estadoLead.nuevo")}
                  </QBoton>
                </div>
              )}
              onSeleccion={(payload) =>
                emitir("estado_lead_seleccionado", payload)
              }
              onCriteriaChanged={(payload) =>
                emitir("criteria_cambiado", payload)
              }
            />
          </>
        }
        Detalle={
          <DetalleEstadoLead id={ctx.estados_lead.activo} publicar={emitir} />
        }
        seleccionada={ctx.estados_lead.activo}
        modoDisposicion="maestro-50"
      />

      {ctx.estado === "CREANDO" && <CrearEstadoLead publicar={emitir} />}
    </div>
  );
};

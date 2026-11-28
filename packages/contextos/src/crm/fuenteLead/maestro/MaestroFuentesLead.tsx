import { TarjetaConfiguracionCrm } from "#/crm/comun/componentes/TarjetaConfiguracionCrm.tsx";
import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { useMaquina } from "@olula/componentes/hook/useMaquina.js";
import { Listado } from "@olula/componentes/maestro/Listado.js";
import { MaestroDetalle } from "@olula/componentes/maestro/MaestroDetalle.tsx";
import { listaActivaEntidadesInicial } from "@olula/lib/ListaActivaEntidades.js";
import { useEffect } from "react";
import { CrearFuenteLead } from "../crear/CrearFuenteLead.tsx";
import { DetalleFuenteLead } from "../detalle/DetalleFuenteLead.tsx";
import { FuenteLead } from "../diseño.ts";
import { metaTablaFuenteLead } from "./maestro.ts";
import "./MaestroFuentesLead.css";
import { getMaquina } from "./maquina.ts";
import { useTCrm } from "../../i18n/index.ts";

export const MaestroFuentesLead = () => {
  const t = useTCrm();
  const { ctx, emitir } = useMaquina(getMaquina, {
    estado: "INICIAL",
    fuentes_lead: listaActivaEntidadesInicial<FuenteLead>(),
  });

  useEffect(() => {
    emitir("recarga_de_fuentes_lead_solicitada", ctx.fuentes_lead.criteria);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="FuenteLead">
      <MaestroDetalle<FuenteLead>
        Maestro={
          <>
            <h2>{t("fuenteLead.fuentesDeLead")}</h2>

            <Listado<FuenteLead>
              metaTabla={metaTablaFuenteLead}
              tarjeta={(fuente) => (
                <TarjetaConfiguracionCrm
                  codigo={fuente.id}
                  descripcion={fuente.descripcion}
                  valorDefecto={fuente.valorDefecto}
                />
              )}
              criteria={ctx.fuentes_lead.criteria}
              modo={"tarjetas"}
              entidades={ctx.fuentes_lead.lista}
              totalEntidades={ctx.fuentes_lead.total}
              seleccionada={ctx.fuentes_lead.activo}
              renderAcciones={() => (
                <div className="maestro-botones">
                  <QBoton
                    onClick={() => emitir("creacion_de_fuente_lead_solicitada")}
                  >
                    {t("fuenteLead.nuevo")}
                  </QBoton>
                </div>
              )}
              onSeleccion={(payload) =>
                emitir("fuente_lead_seleccionada", payload)
              }
              onCriteriaChanged={(payload) =>
                emitir("criteria_cambiado", payload)
              }
            />
          </>
        }
        Detalle={
          <DetalleFuenteLead id={ctx.fuentes_lead.activo} publicar={emitir} />
        }
        layout={"TARJETA"}
        seleccionada={ctx.fuentes_lead.activo}
        modoDisposicion="maestro-50"
      />

      {ctx.estado === "CREANDO" && <CrearFuenteLead publicar={emitir} />}
    </div>
  );
};

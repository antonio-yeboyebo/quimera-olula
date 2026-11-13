import { AgenteTpvActual } from "#/tpv/agente/agente_actual/AgenteTpvActual.tsx";
import { PuntoVentaTpvActual } from "#/tpv/punto_de_venta/punto_actual/PuntoVentaTpvActual.tsx";
import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { useMaquina } from "@olula/componentes/hook/useMaquina.js";
import { Listado } from "@olula/componentes/maestro/Listado.js";
import { MaestroDetalle } from "@olula/componentes/maestro/MaestroDetalle.tsx";
import { listaActivaEntidadesInicial } from "@olula/lib/ListaActivaEntidades.js";
import { getUrlParams, useUrlParams } from "@olula/lib/url-params.js";
import { useEffect } from "react";
import { DetalleArqueoTpv } from "../Detalle/ArqueoTpv.tsx";
import { CabeceraArqueoTpv } from "../diseño.ts";
import "./MaestroConDetalleArqueoTpv.css";
import { metaTablaArqueo } from "./diseño.ts";
import { getMaquina } from "./maquina.ts";

export const MaestroConDetalleArqueoTpv = () => {
  const { id, criteria } = getUrlParams();

  const { ctx, emitir } = useMaquina(getMaquina, {
    estado: "INICIAL",
    arqueos: listaActivaEntidadesInicial<CabeceraArqueoTpv>(id, criteria),
  });

  useUrlParams(ctx.arqueos.activo, ctx.arqueos.criteria);

  useEffect(() => {
    emitir("recarga_de_arqueos_solicitada", ctx.arqueos.criteria);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="Arqueo">
      <MaestroDetalle<CabeceraArqueoTpv>
        Maestro={
          <>
            <h2>Arqueos TPV</h2>
            <div className="tpv-puesto">
              {/* Los arqueos listados son los del punto de venta del puesto. */}
              <PuntoVentaTpvActual
                onChange={() => emitir("recarga_de_arqueos_solicitada", ctx.arqueos.criteria)}
              />
              <AgenteTpvActual />
            </div>
            <Listado<CabeceraArqueoTpv>
              metaTabla={metaTablaArqueo}
              criteria={ctx.arqueos.criteria}
              modo={"tabla"}
              entidades={ctx.arqueos.lista}
              totalEntidades={ctx.arqueos.total}
              seleccionada={ctx.arqueos.activo}
              renderAcciones={() => (
                <div className="maestro-botones">
                  <QBoton
                    onClick={() => emitir("creacion_de_arqueo_solicitada")}
                  >
                    Abrir arqueo
                  </QBoton>
                </div>
              )}
              onSeleccion={(payload) => emitir("arqueo_seleccionado", payload)}
              onCriteriaChanged={(payload) =>
                emitir("criteria_cambiado", payload)
              }
            />
          </>
        }
        Detalle={<DetalleArqueoTpv id={ctx.arqueos.activo} publicar={emitir} />}
        seleccionada={ctx.arqueos.activo}
        modoDisposicion="maestro-50"
      />
    </div>
  );
};

import { TarjetaConfiguracionCrm } from "#/crm/comun/componentes/TarjetaConfiguracionCrm.tsx";
import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { useMaquina } from "@olula/componentes/hook/useMaquina.js";
import { Listado } from "@olula/componentes/maestro/Listado.js";
import { MaestroDetalle } from "@olula/componentes/maestro/MaestroDetalle.tsx";
import { listaActivaEntidadesInicial } from "@olula/lib/ListaActivaEntidades.js";
import { useEffect } from "react";
import { CrearEstadoOportunidad } from "../crear/CrearEstadoOportunidad.tsx";
import { DetalleEstadoOportunidad } from "../detalle/DetalleEstadoOportunidad.tsx";
import { EstadoOportunidad } from "../diseño.ts";
import { metaTablaEstadoOportunidad } from "./maestro.ts";
import "./MaestroEstadosOportunidad.css";
import { getMaquina } from "./maquina.ts";
import { useTCrm } from "../../i18n/index.ts";
import { textoEstadoBaseOportunidad } from "../../comun/valores/texto_opcion.ts";

export const MaestroEstadosOportunidad = () => {
  const t = useTCrm();
  const { ctx, emitir } = useMaquina(getMaquina, {
    estado: "INICIAL",
    estados_oportunidad: listaActivaEntidadesInicial<EstadoOportunidad>(),
  });

  useEffect(() => {
    emitir(
      "recarga_de_estados_oportunidad_solicitada",
      ctx.estados_oportunidad.criteria
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="EstadoOportunidad">
      <MaestroDetalle<EstadoOportunidad>
        Maestro={
          <>
            <h2>{t("estadoOportunidadVenta.estadosDeOportunidadDeVenta")}</h2>

            <Listado<EstadoOportunidad>
              metaTabla={metaTablaEstadoOportunidad}
              tarjeta={(estado) => (
                <TarjetaConfiguracionCrm
                  codigo={estado.id}
                  descripcion={estado.descripcion}
                  valorDefecto={estado.valorDefecto}
                  derecha={<span>{`${estado.probabilidad}%`}</span>}
                  abajoDerecha={<span>{textoEstadoBaseOportunidad(estado.estadobase)}</span>}
                />
              )}
              criteria={ctx.estados_oportunidad.criteria}
              modo={"tarjetas"}
              entidades={ctx.estados_oportunidad.lista}
              totalEntidades={ctx.estados_oportunidad.total}
              seleccionada={ctx.estados_oportunidad.activo}
              renderAcciones={() => (
                <div className="maestro-botones">
                  <QBoton
                    onClick={() =>
                      emitir("creacion_de_estado_oportunidad_solicitada")
                    }
                  >
                    {t("estadoOportunidadVenta.nuevo")}
                  </QBoton>
                </div>
              )}
              onSeleccion={(payload) =>
                emitir("estado_oportunidad_seleccionado", payload)
              }
              onCriteriaChanged={(payload) =>
                emitir("criteria_cambiado", payload)
              }
            />
          </>
        }
        Detalle={
          <DetalleEstadoOportunidad
            id={ctx.estados_oportunidad.activo}
            publicar={emitir}
          />
        }
        layout={"TARJETA"}
        seleccionada={ctx.estados_oportunidad.activo}
        modoDisposicion="maestro-50"
      />

      {ctx.estado === "CREANDO" && <CrearEstadoOportunidad publicar={emitir} />}
    </div>
  );
};

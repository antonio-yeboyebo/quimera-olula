import { opcionesEstadoAccion } from "#/crm/comun/valores/estado_accion.ts";
import { opcionesTipoAccion } from "#/crm/comun/valores/tipo_accion.ts";
import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { useMaquina } from "@olula/componentes/hook/useMaquina.js";
import { Listado } from "@olula/componentes/maestro/Listado.js";
import { MaestroDetalle } from "@olula/componentes/maestro/MaestroDetalle.tsx";
import { getMetaFiltroDefecto } from "@olula/componentes/maestro/maestroFiltros/MaestroFiltrosActivoControlado.js";
import type { ClausulaFiltro, Orden } from "@olula/lib/diseño.ts";
import { criteriaDefecto } from "@olula/lib/dominio.ts";
import { listaActivaEntidadesInicial } from "@olula/lib/ListaActivaEntidades.js";
import { getUrlParams, useUrlParams } from "@olula/lib/url-params.js";
import { useEffect } from "react";
import { CrearAccion } from "../crear/CrearAccion.tsx";
import { DetalleAccion } from "../detalle/DetalleAccion.tsx";
import { Accion } from "../diseño.ts";
import { metaTablaAccion } from "./maestro.ts";
import "./MaestroAcciones.css";
import { getMaquina } from "./maquina.ts";
import { TarjetaAccionRapida } from "./TarjetaAccionRapida.tsx";
import { useTCrm } from "../../i18n/index.ts";

const criteriaBaseAcciones = {
  ...criteriaDefecto,
  orden: ["fecha", "DESC"] as unknown as Orden,
  filtro: [
    ["estado", "in", ["Pendiente", "Borrador"] as unknown as string],
  ] as ClausulaFiltro[],
};

export const MaestroAcciones = () => {
  const t = useTCrm();
  const { id, criteria } = getUrlParams();

  const criteriaInicial =
    criteria.filtro.length > 0 ||
    criteria.orden.toString() !== criteriaDefecto.orden.toString()
      ? criteria
      : criteriaBaseAcciones;

  const { ctx, emitir } = useMaquina(getMaquina, {
    estado: "INICIAL",
    acciones: listaActivaEntidadesInicial<Accion>(id, criteriaInicial),
  });

  useUrlParams(ctx.acciones.activo, ctx.acciones.criteria);

  useEffect(() => {
    emitir("recarga_de_acciones_solicitada", criteriaInicial);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="MaestroAcciones">
      <MaestroDetalle<Accion>
        Maestro={
          <>
            <h2>{t("accion.acciones")}</h2>

            <Listado<Accion>
              metaTabla={metaTablaAccion}
              metaFiltro={{
                ...getMetaFiltroDefecto(metaTablaAccion),
                tipo: {
                  id: "tipo",
                  label: t("accion.tipo"),
                  tipo: "multiseleccion",
                  opciones: opcionesTipoAccion,
                  filtro: (v) => {
                    const valores = Array.isArray(v)
                      ? v.map(String).filter(Boolean)
                      : [];
                    return valores.length
                      ? ["tipo", "in", valores as unknown as string]
                      : null;
                  },
                },
                estado: {
                  id: "estado",
                  label: t("accion.estado"),
                  tipo: "multiseleccion",
                  opciones: opcionesEstadoAccion,
                  filtro: (v) => {
                    const valores = Array.isArray(v)
                      ? v.map(String).filter(Boolean)
                      : [];
                    return valores.length
                      ? ["estado", "in", valores as unknown as string]
                      : null;
                  },
                },
              }}
              criteria={ctx.acciones.criteria}
              modosDisponibles={["tarjetas"]}
              tarjeta={(accion) => (
                <TarjetaAccionRapida accion={accion} publicar={emitir} />
              )}
              entidades={ctx.acciones.lista}
              totalEntidades={ctx.acciones.total}
              seleccionada={ctx.acciones.activo}
              renderAcciones={() => (
                <div className="maestro-botones">
                  <QBoton
                    onClick={() => emitir("creacion_de_accion_solicitada")}
                  >
                    {t("accion.nueva")}
                  </QBoton>
                </div>
              )}
              onSeleccion={(payload) => emitir("accion_seleccionada", payload)}
              onCriteriaChanged={(payload) =>
                emitir("criteria_cambiado", payload)
              }
              onSiguientePagina={(payload) =>
                emitir("siguiente_pagina", payload)
              }
            />
          </>
        }
        Detalle={<DetalleAccion id={ctx.acciones.activo} publicar={emitir} />}
        seleccionada={ctx.acciones.activo}
        modoDisposicion="maestro-50"
      />

      {ctx.estado === "CREANDO" && <CrearAccion publicar={emitir} />}
    </div>
  );
};

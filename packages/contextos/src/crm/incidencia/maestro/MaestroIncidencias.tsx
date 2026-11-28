import { opcionesEstadoIncidencia } from "#/crm/comun/componentes/EstadoIncidencia.tsx";
import { PrioridadIncidencia } from "#/crm/comun/componentes/PrioridadIncidencia.tsx";
import { TipoIncidencia } from "#/crm/comun/componentes/TipoIncidencia.tsx";
import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { useMaquina } from "@olula/componentes/hook/useMaquina.js";
import { Listado } from "@olula/componentes/maestro/Listado.js";
import { MaestroDetalle } from "@olula/componentes/maestro/MaestroDetalle.tsx";
import {
  filtroTextos,
  getMetaFiltroDefecto,
} from "@olula/componentes/maestro/maestroFiltros/MaestroFiltrosActivoControlado.js";
import type { ClausulaFiltro, Orden } from "@olula/lib/diseño.js";
import { criteriaDefecto } from "@olula/lib/dominio.ts";
import { listaActivaEntidadesInicial } from "@olula/lib/ListaActivaEntidades.js";
import { getUrlParams, useUrlParams } from "@olula/lib/url-params.js";
import { useEffect } from "react";
import { CrearIncidencia } from "../crear/CrearIncidencia.tsx";
import { DetalleIncidencia } from "../detalle/DetalleIncidencia.tsx";
import { Incidencia } from "../diseño.ts";
import { TarjetaIncidencia } from "../vistas/TarjetaIncidencia.tsx";
import {
  crearFiltroEstadoIncidencia,
  estadosIncidenciaOcultosPorDefecto,
  metaTablaIncidencia,
} from "./maestro.ts";
import { getMaquina } from "./maquina.ts";
import { useTCrm } from "../../i18n/index.ts";

const ordenPorPrioridad = ["prioridad", "ASC"] as unknown as Orden;

const estadosVisiblesPorDefecto = opcionesEstadoIncidencia
  .map((opcion) => opcion.valor)
  .filter((valor) => !estadosIncidenciaOcultosPorDefecto.includes(valor));

const criteriaBaseIncidencias = {
  ...criteriaDefecto,
  orden: ordenPorPrioridad,
  filtro: [
    ["estado", "in", estadosVisiblesPorDefecto as unknown as string],
  ] as ClausulaFiltro[],
};

export const MaestroIncidencias = () => {
  const t = useTCrm();
  const { id, criteria } = getUrlParams();

  const criteriaInicial =
    criteria.filtro.length > 0 ||
    criteria.orden.toString() !== criteriaDefecto.orden.toString()
      ? criteria
      : criteriaBaseIncidencias;

  const { ctx, emitir } = useMaquina(getMaquina, {
    estado: "INICIAL",
    incidencias: listaActivaEntidadesInicial<Incidencia>(id, criteriaInicial),
  });

  useUrlParams(ctx.incidencias.activo, ctx.incidencias.criteria);

  useEffect(() => {
    emitir("recarga_de_incidencias_solicitada", criteriaInicial);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="MaestroIncidencias">
      <MaestroDetalle<Incidencia>
        Maestro={
          <>
            <h2>{t("incidencia.incidencias")}</h2>

            <Listado<Incidencia>
              metaTabla={metaTablaIncidencia}
              metaFiltro={{
                ...getMetaFiltroDefecto(metaTablaIncidencia),
                estado: {
                  id: "estado",
                  label: t("incidencia.estado"),
                  tipo: "multiseleccion",
                  opciones: opcionesEstadoIncidencia,
                  filtro: crearFiltroEstadoIncidencia,
                },
                prioridad: {
                  id: "prioridad",
                  label: t("incidencia.prioridad"),
                  filtro: (v) => filtroTextos("prioridad", v),
                  render: (valor, onChange) => (
                    <PrioridadIncidencia
                      valor={(valor as string) ?? ""}
                      onChange={(opcion) => onChange(opcion?.valor ?? "")}
                    />
                  ),
                },
                tipo_incidencia: {
                  id: "tipo_incidencia",
                  label: t("incidencia.tipo"),
                  filtro: (v) => filtroTextos("tipo_incidencia", v),
                  render: (valor, onChange) => (
                    <TipoIncidencia
                      valor={(valor as string) ?? ""}
                      onChange={(opcion) => onChange(opcion?.valor ?? "")}
                    />
                  ),
                },
              }}
              criteria={ctx.incidencias.criteria}
              modosDisponibles={["tarjetas"]}
              tarjeta={TarjetaIncidencia}
              entidades={ctx.incidencias.lista}
              totalEntidades={ctx.incidencias.total}
              seleccionada={ctx.incidencias.activo}
              renderAcciones={() => (
                <div className="maestro-botones">
                  <QBoton
                    onClick={() => emitir("creacion_de_incidencia_solicitada")}
                  >
                    {t("incidencia.nueva")}
                  </QBoton>
                </div>
              )}
              onSeleccion={(payload) =>
                emitir("incidencia_seleccionada", payload)
              }
              onCriteriaChanged={(payload) =>
                emitir("criteria_cambiado", payload)
              }
              onSiguientePagina={(payload) =>
                emitir("siguiente_pagina", payload)
              }
            />
          </>
        }
        Detalle={
          <DetalleIncidencia id={ctx.incidencias.activo} publicar={emitir} />
        }
        seleccionada={ctx.incidencias.activo}
        modoDisposicion="maestro-50"
      />

      {ctx.estado === "CREANDO" && <CrearIncidencia publicar={emitir} />}
    </div>
  );
};

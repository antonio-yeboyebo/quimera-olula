import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { useMaquina } from "@olula/componentes/hook/useMaquina.js";
import { Listado } from "@olula/componentes/maestro/Listado.js";
import { MaestroDetalle } from "@olula/componentes/maestro/MaestroDetalle.tsx";
import { getMetaFiltroDefecto } from "@olula/componentes/maestro/maestroFiltros/MaestroFiltrosActivoControlado.js";
import type { ClausulaFiltro, Filtro, Orden } from "@olula/lib/diseño.ts";
import { criteriaDefecto } from "@olula/lib/dominio.ts";
import { listaActivaEntidadesInicial } from "@olula/lib/ListaActivaEntidades.js";
import { getUrlParams, useUrlParams } from "@olula/lib/url-params.js";
import { useEffect, useMemo, useState } from "react";
import { CrearOportunidadVenta } from "../crear/CrearOportunidadVenta.tsx";
import { DetalleOportunidadVenta } from "../detalle/DetalleOportunidadVenta.tsx";
import { EstadoOportunidad, OportunidadVenta } from "../diseño.ts";
import {
  filtrarColumnasKanbanPorEstado,
  obtenerIdsEstadosTerminales,
} from "../dominio.ts";
import { getEstadosOportunidadVenta } from "../infraestructura.ts";
import {
  crearColumnasKanbanOportunidad,
  crearFiltroEstadoOportunidad,
  crearOpcionesFiltroEstadoOportunidad,
  enriquecerColumnasKanbanOportunidad,
} from "./kanban.ts";
import { metaTablaOportunidadVenta } from "./maestro.ts";
import "./MaestroOportunidadesVenta.css";
import { getMaquina } from "./maquina.ts";
import { TarjetaOportunidadVenta } from "./TarjetaOportunidadVenta.tsx";
import { TarjetaOportunidadVentaKanban } from "./TarjetaOportunidadVentaKanban.tsx";
import { useTCrm } from "../../i18n/index.ts";

export const MaestroOportunidades = () => {
  const t = useTCrm();
  const { id, criteria } = getUrlParams();
  const modoUrl = useMemo(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get("modo");
  }, []);
  const [estadosOportunidad, setEstadosOportunidad] = useState<
    EstadoOportunidad[]
  >([]);
  const [modoActual, setModoActual] = useState<"tabla" | "tarjetas" | "kanban">(
    modoUrl === "kanban" ? "kanban" : "tarjetas"
  );
  const idsEstadosTerminales = useMemo(
    () => obtenerIdsEstadosTerminales(estadosOportunidad),
    [estadosOportunidad]
  );
  const todosLosEstados = useMemo(
    () => estadosOportunidad.map((estado) => String(estado.id)),
    [estadosOportunidad]
  );
  const estadosNoTerminales = useMemo(
    () => todosLosEstados.filter((id) => !idsEstadosTerminales.includes(id)),
    [todosLosEstados, idsEstadosTerminales]
  );
  const ordenBaseOportunidades = useMemo(
    () => ["probabilidad", "DESC", "fecha_cierre", "ASC"] as unknown as Orden,
    []
  );
  const columnasKanban = useMemo(
    () => crearColumnasKanbanOportunidad(estadosOportunidad),
    [estadosOportunidad]
  );
  const criteriaBaseOportunidades = useMemo(
    () => ({
      ...criteriaDefecto,
      orden: ordenBaseOportunidades,
    }),
    [ordenBaseOportunidades]
  );

  const criteriaDesdeUrl = useMemo(
    () =>
      criteria.orden.toString() === criteriaDefecto.orden.toString()
        ? { ...criteria, orden: ordenBaseOportunidades }
        : criteria,
    [criteria, ordenBaseOportunidades]
  );

  const [criteriaInicial, setCriteriaInicial] = useState(
    criteria.filtro.length > 0 ||
      criteria.orden.toString() !== criteriaDefecto.orden.toString()
      ? criteriaDesdeUrl
      : criteriaBaseOportunidades
  );

  const { ctx, emitir } = useMaquina(getMaquina, {
    estado: "INICIAL",
    oportunidades: listaActivaEntidadesInicial<OportunidadVenta>(
      id,
      criteriaInicial
    ),
  });

  const columnasKanbanFiltradas = useMemo(() => {
    const filtroArray = Array.isArray(ctx.oportunidades.criteria.filtro)
      ? (ctx.oportunidades.criteria.filtro as ClausulaFiltro[])
      : [];
    return filtrarColumnasKanbanPorEstado(columnasKanban, filtroArray);
  }, [ctx.oportunidades.criteria.filtro, columnasKanban]);

  const columnasKanbanConTotales = useMemo(() => {
    return enriquecerColumnasKanbanOportunidad(
      columnasKanbanFiltradas,
      ctx.oportunidades.lista,
      estadosOportunidad
    );
  }, [columnasKanbanFiltradas, ctx.oportunidades.lista, estadosOportunidad]);

  useUrlParams(ctx.oportunidades.activo, ctx.oportunidades.criteria);

  useEffect(() => {
    let activo = true;

    const cargarColumnasKanban = async () => {
      const criteriosEstados = {
        filtro: [] as unknown as Filtro,
        orden: ["id"] as unknown as Orden,
      };

      const estados = await getEstadosOportunidadVenta(
        criteriosEstados.filtro,
        criteriosEstados.orden
      );

      if (!activo) return;

      setEstadosOportunidad(estados);

      if (criteria.filtro.length === 0) {
        const idsTerminales = obtenerIdsEstadosTerminales(estados);
        const idsNoTerminales = estados
          .map((e) => String(e.id))
          .filter((id) => !idsTerminales.includes(id));
        // Actualizar criteriaInicial para que el Listado sepa cuál es el filtro base
        const filtroNoTerminales: ClausulaFiltro[] = [
          ["estado_id", "in", idsNoTerminales as unknown as string],
        ];

        const criteriaConFiltro = {
          ...criteriaBaseOportunidades,
          filtro: filtroNoTerminales,
        };
        setCriteriaInicial(criteriaConFiltro);

        emitir("criteria_cambiado", criteriaConFiltro);
      } else {
        emitir("recarga_de_oportunidades_solicitada", criteriaDesdeUrl);
      }
    };

    cargarColumnasKanban();

    return () => {
      activo = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="OportunidadesVenta">
      <MaestroDetalle<OportunidadVenta>
        Maestro={
          <>
            <h2>{t("oportunidadventa.oportunidadesDeVenta")}</h2>

            <Listado<OportunidadVenta>
              metaTabla={metaTablaOportunidadVenta}
              metaFiltro={{
                ...getMetaFiltroDefecto(metaTablaOportunidadVenta),
                estado_id: {
                  id: "estado_id",
                  label: t("oportunidadventa.estado"),
                  tipo: "multiseleccion",
                  opciones:
                    crearOpcionesFiltroEstadoOportunidad(estadosOportunidad),
                  valorDefecto: estadosNoTerminales,
                  filtro: crearFiltroEstadoOportunidad,
                },
              }}
              criteria={ctx.oportunidades.criteria}
              criteriaInicial={criteriaInicial}
              modosDisponibles={["tarjetas", "kanban"]}
              modo={modoActual}
              mostrarCambioModo
              tarjeta={TarjetaOportunidadVenta}
              tarjetaKanban={TarjetaOportunidadVentaKanban}
              entidades={ctx.oportunidades.lista}
              totalEntidades={ctx.oportunidades.total}
              columnasKanban={columnasKanbanConTotales}
              campoEstadoKanban="estado_id"
              onCambioEstadoKanban={(idOportunidad, nuevoEstado) => {
                const estadoDestino = estadosOportunidad.find(
                  (estado) => String(estado.id) === nuevoEstado
                );

                return emitir("estado_oportunidad_cambiado", {
                  idOportunidad,
                  nuevoEstado,
                  descripcionEstado: estadoDestino?.descripcion,
                  probabilidadEstado: estadoDestino?.probabilidad,
                });
              }}
              onModoChanged={(nuevoModo) => {
                setModoActual(nuevoModo);

                if (nuevoModo === "kanban") {
                  emitir("oportunidad_deseleccionada");
                }
              }}
              seleccionada={ctx.oportunidades.activo}
              renderAcciones={() => (
                <div className="maestro-botones">
                  <QBoton
                    onClick={() => emitir("creacion_de_oportunidad_solicitada")}
                  >
                    {t("oportunidadventa.nueva")}
                  </QBoton>
                </div>
              )}
              onSeleccion={(payload) =>
                emitir("oportunidad_seleccionada", payload)
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
          <DetalleOportunidadVenta
            id={ctx.oportunidades.activo}
            publicar={emitir}
          />
        }
        seleccionada={ctx.oportunidades.activo}
        nombreModal="detalleOportunidadKanban"
        onCerrarDetalle={() => emitir("oportunidad_deseleccionada")}
        modoDisposicion={modoActual === "kanban" ? "modal" : "maestro-50"}
      />

      {ctx.estado === "CREANDO" && <CrearOportunidadVenta publicar={emitir} />}
    </div>
  );
};

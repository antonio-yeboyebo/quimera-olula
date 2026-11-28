import { EtiquetaEstado } from "#/comun/componentes/etiqueta_estado/EtiquetaEstado.tsx";
import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { useMaquina } from "@olula/componentes/hook/useMaquina.ts";
import { MetaTabla } from "@olula/componentes/index.js";
import { Listado } from "@olula/componentes/maestro/Listado.js";
import { MaestroDetalle } from "@olula/componentes/maestro/MaestroDetalle.tsx";
import { MetaFiltro } from "@olula/componentes/maestro/maestroFiltros/MaestroFiltrosActivoControlado.js";
import { ClausulaFiltro } from "@olula/lib/diseño.ts";
import { criteriaDefecto } from "@olula/lib/dominio.js";
import { listaActivaEntidadesInicial } from "@olula/lib/ListaActivaEntidades.js";
import { getUrlParams, useUrlParams } from "@olula/lib/url-params.js";
import { useEffect, useMemo } from "react";
import {
  filtroAgente,
  filtroAlmacen,
  filtroCliente,
  filtroCodigo,
  filtroFechaDocumento,
} from "../../comun/filtros.tsx";
import { CrearPresupuesto } from "../crear/CrearPresupuesto.tsx";
import { DetallePresupuesto } from "../detalle/DetallePresupuesto.tsx";
import {
  metaTablaPresupuesto as metaTablaBase,
  Presupuesto,
} from "./diseño.ts";
import "./MaestroConDetallePresupuesto.css";
import { getMaquina } from "./maquina.ts";
import { TarjetaMaestroPresupuesto } from "./TarjetaMaestroPresupuesto.tsx";
import { etiquetaEstadoPresupuesto, widgetsPresupuesto } from "../dominio.ts";
import { tVentas, useTVentas } from "../../i18n/index.ts";

const SIN_APROBAR = "true";
const APROBADO = "false";

const filtroSinAprobar: ClausulaFiltro[] = [["editable", "=", SIN_APROBAR]];

const campoFiltroAprobado = (): MetaFiltro => ({
  editable: {
    id: "editable",
    label: tVentas("documento.maestro.estado"),
    tipo: "multiseleccion",
    opciones: [
      {
        valor: SIN_APROBAR,
        descripcion: tVentas("presupuesto.estado.pendiente"),
      },
      { valor: APROBADO, descripcion: tVentas("presupuesto.estado.aprobado") },
    ],
    filtro: (valor) => {
      const elegidos = (valor as string[]) ?? [];
      if (elegidos.length !== 1) return null;
      return ["editable", "=", elegidos[0]];
    },
  },
});

export const MaestroConDetallePresupuesto = () => {
  const t = useTVentas();
  // Se recalculan al cambiar de idioma (t cambia).
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const widgets = useMemo(() => widgetsPresupuesto(), [t]);
  const { id, criteria } = getUrlParams();
  const criteriaInicial =
    criteria.filtro.length === 0
      ? { ...criteriaDefecto, filtro: filtroSinAprobar }
      : criteria;

  const { ctx, emitir } = useMaquina(getMaquina, {
    estado: "INICIAL",
    presupuestos: listaActivaEntidadesInicial<Presupuesto>(id, criteriaInicial),
  });

  useUrlParams(ctx.presupuestos.activo, ctx.presupuestos.criteria);

  useEffect(() => {
    emitir("recarga_de_presupuestos_solicitada", ctx.presupuestos.criteria);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const metaTablaPresupuesto = [
    {
      id: "estado",
      cabecera: t("documento.maestro.estado"),
      render: (presupuesto: Presupuesto) => (
        <EtiquetaEstado {...etiquetaEstadoPresupuesto(presupuesto)} />
      ),
    },
    ...metaTablaBase(),
  ] as MetaTabla<Presupuesto>;

  const metaFiltroPresupuesto: MetaFiltro = {
    codigo: filtroCodigo,
    cliente_id: filtroCliente,
    agente_id: filtroAgente,
    fecha: filtroFechaDocumento,
    almacen_id: filtroAlmacen,
    ...campoFiltroAprobado(),
  };

  return (
    <div className="Presupuesto">
      <MaestroDetalle<Presupuesto>
        Maestro={
          <>
            <h2>{t("presupuesto.maestro.titulo")}</h2>
            <Listado<Presupuesto>
              metaTabla={metaTablaPresupuesto}
              metaFiltro={metaFiltroPresupuesto}
              widgets={widgets}
              tarjeta={TarjetaMaestroPresupuesto}
              criteria={ctx.presupuestos.criteria}
              entidades={ctx.presupuestos.lista}
              totalEntidades={ctx.presupuestos.total}
              seleccionada={ctx.presupuestos.activo}
              renderAcciones={() => (
                <div className="maestro-botones">
                  <QBoton
                    onClick={() => emitir("crear_presupuesto_solicitado")}
                  >
                    {t("presupuesto.maestro.nuevo")}
                  </QBoton>
                </div>
              )}
              onSeleccion={(payload) =>
                emitir("presupuesto_seleccionado", payload)
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
          <DetallePresupuesto id={ctx.presupuestos.activo} publicar={emitir} />
        }
        seleccionada={ctx.presupuestos.activo}
      />

      {ctx.estado === "CREANDO_PRESUPUESTO" && (
        <CrearPresupuesto
          publicar={emitir}
          onCancelar={() => emitir("creacion_presupuesto_cancelada")}
        />
      )}
    </div>
  );
};

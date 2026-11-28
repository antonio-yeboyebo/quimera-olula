import { EtiquetaEstado } from "#/comun/componentes/etiqueta_estado/EtiquetaEstado.tsx";
import { TarjetaDocumentoVenta } from "#/ventas/comun/componentes/TarjetaDocumentoVenta.tsx";
import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { useMaquina } from "@olula/componentes/hook/useMaquina.js";
import { MetaTabla, QEtiqueta } from "@olula/componentes/index.js";
import { Listado } from "@olula/componentes/maestro/Listado.js";
import { MaestroDetalle } from "@olula/componentes/maestro/MaestroDetalle.tsx";
import {
  filtroBooleanos,
  MetaFiltro,
} from "@olula/componentes/maestro/maestroFiltros/MaestroFiltrosActivoControlado.js";
import { QModal } from "@olula/componentes/moleculas/qmodal.tsx";
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
import { CrearAlbaran } from "../crear/CrearAlbaran.tsx";
import { DetalleAlbaran } from "../detalle/DetalleAlbaran.tsx";
import { Albaran } from "../diseño.ts";
import {
  etiquetaEstadoAlbaran,
  metaTablaAlbaran as metaTablaBase,
  widgetsAlbaran,
} from "../dominio.ts";
import "./MaestroConDetalleAlbaran.css";
import { getMaquina } from "./maquina.ts";
import { tVentas, useTVentas } from "../../i18n/index.ts";

const PENDIENTE = "false";
const FACTURADO = "true";

const filtroPendientes: ClausulaFiltro[] = [["facturado", "=", PENDIENTE]];

const campoFiltroFacturado = (): MetaFiltro => ({
  facturado: {
    id: "facturado",
    label: tVentas("documento.maestro.estado"),
    tipo: "multiseleccion",
    opciones: [
      { valor: PENDIENTE, descripcion: tVentas("albaran.estado.pendiente") },
      { valor: FACTURADO, descripcion: tVentas("albaran.estado.facturado") },
    ],
    filtro: (valor) => {
      const elegidos = (valor as string[]) ?? [];
      if (elegidos.length === 0 || elegidos.length === 2) return null;
      return ["facturado", "=", elegidos[0]];
    },
  },
});

export const MaestroConDetalleAlbaran = () => {
  const t = useTVentas();
  // Se recalculan al cambiar de idioma (t cambia).
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const widgets = useMemo(() => widgetsAlbaran(), [t]);
  const { id, criteria } = getUrlParams();
  const criteriaInicial =
    criteria.filtro.length === 0
      ? { ...criteriaDefecto, filtro: filtroPendientes }
      : criteria;

  const { ctx, emitir } = useMaquina(getMaquina, {
    estado: "INICIAL",
    albaranes: listaActivaEntidadesInicial<Albaran>(id, criteriaInicial),
  });

  useUrlParams(ctx.albaranes.activo, ctx.albaranes.criteria);

  useEffect(() => {
    emitir("recarga_de_albaranes_solicitada", ctx.albaranes.criteria);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const metaTablaAlbaran = [
    {
      id: "estado",
      cabecera: t("documento.maestro.estado"),
      render: (albaran: Albaran) => (
        <EtiquetaEstado {...etiquetaEstadoAlbaran(albaran)} />
      ),
    },
    ...metaTablaBase(),
  ] as MetaTabla<Albaran>;

  const metaFiltroAlbaran: MetaFiltro = {
    codigo: filtroCodigo,
    cliente_id: filtroCliente,
    agente_id: filtroAgente,
    fecha: filtroFechaDocumento,
    almacen_id: filtroAlmacen,
    de_abono: {
      id: "de_abono",
      label: t("albaran.maestro.abono"),
      tipo: "checkbox",
      filtro: (v) => (v ? filtroBooleanos("de_abono", v) : null),
    },
    ...campoFiltroFacturado(),
  };

  return (
    <div className="Albaran">
      <MaestroDetalle<Albaran>
        Maestro={
          <>
            <h2>{t("albaran.maestro.titulo")}</h2>
            <Listado<Albaran>
              metaTabla={metaTablaAlbaran}
              metaFiltro={metaFiltroAlbaran}
              widgets={widgets}
              tarjeta={(albaran) => (
                <TarjetaDocumentoVenta
                  codigo={albaran.codigo}
                  nombreCliente={albaran.cliente.nombre_cliente}
                  fecha={albaran.fecha}
                  total={albaran.total}
                  divisa={albaran.divisa_id}
                  tasaConversion={albaran.tasa_conversion}
                  totalDivisaEmpresa={albaran.total_divisa_empresa}
                  estado={albaran.facturado ? "cerrado" : "pendiente"}
                  etiquetaEstado={etiquetaEstadoAlbaran(albaran)}
                  etiqueta={
                    albaran.de_abono ? (
                      <QEtiqueta variante="advertencia">
                        {t("albaran.maestro.abono")}
                      </QEtiqueta>
                    ) : undefined
                  }
                />
              )}
              criteria={ctx.albaranes.criteria}
              renderAcciones={() => (
                <div className="maestro-botones">
                  <QBoton onClick={() => emitir("crear_albaran_solicitado")}>
                    {t("albaran.maestro.nuevo")}
                  </QBoton>
                </div>
              )}
              entidades={ctx.albaranes.lista}
              totalEntidades={ctx.albaranes.total}
              seleccionada={ctx.albaranes.activo}
              onSeleccion={(payload) => emitir("albaran_seleccionado", payload)}
              onCriteriaChanged={(payload) =>
                emitir("criteria_cambiado", payload)
              }
              onSiguientePagina={(payload) =>
                emitir("siguiente_pagina", payload)
              }
            />
          </>
        }
        Detalle={<DetalleAlbaran id={ctx.albaranes.activo} publicar={emitir} />}
        seleccionada={ctx.albaranes.activo}
        // modoDisposicion="maestro-50"
      />

      <QModal
        nombre="modal"
        abierto={ctx.estado === "CREANDO_ALBARAN"}
        onCerrar={() => emitir("creacion_cancelada")}
        titulo={t("albaran.maestro.nuevo")}
      >
        {ctx.estado === "CREANDO_ALBARAN" && <CrearAlbaran publicar={emitir} />}
      </QModal>
    </div>
  );
};

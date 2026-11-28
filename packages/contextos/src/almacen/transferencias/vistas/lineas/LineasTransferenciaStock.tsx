import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { MetaTabla } from "@olula/componentes/atomos/qtabla.tsx";
import { ListadoSemiControlado } from "@olula/componentes/maestro/ListadoSemiControlado.tsx";
import { getMetaFiltroDefecto } from "@olula/componentes/maestro/maestroFiltros/MaestroFiltrosActivoControlado.tsx";
import { QModal } from "@olula/componentes/moleculas/qmodal.tsx";
import { ContextoError } from "@olula/lib/contexto.ts";
import { Criteria, RespuestaLista2 } from "@olula/lib/diseño.ts";
import { criteriaDefecto } from "@olula/lib/dominio.ts";
import { getSeleccionada } from "@olula/lib/entidad.ts";
import { HookModelo } from "@olula/lib/useModelo.ts";
import { useCallback, useContext, useEffect, useState } from "react";
import { LineaTransferenciaStock, TransferenciaStock } from "../../diseño.ts";
import { obtenerLineasTransferenciaStock } from "../../infraestructura.ts";
import { useMaquinaLineasTransferenciasStock } from "../../maquina_lineas_transferencia_stock.ts";
import { BorrarLineaTransferenciaStock } from "./BorrarLineaTransferenciaStock.tsx";
import { CrearLineaTransferenciaStock } from "./CrearLineaTransferenciaStock.tsx";
import { DetalleLineaTransferenciaStock } from "./DetalleLineaTransferenciaStock.tsx";
import { tAlmacen, useTAlmacen } from "../../../i18n/index.ts";

const metaTablaLineasTransferenciaStock: MetaTabla<LineaTransferenciaStock> = [
  { id: "id", cabecera: "ID" },
  { id: "descripcion_producto", get cabecera() { return tAlmacen("transferencias.articulo"); } },
  { id: "cantidad", get cabecera() { return tAlmacen("transferencias.cantidad"); } },
];

const metaFiltroLineas = getMetaFiltroDefecto(metaTablaLineasTransferenciaStock);

export const LineasTransferenciaStock = ({
  transferencia,
}: {
  transferencia: HookModelo<TransferenciaStock>;
}) => {
  const t = useTAlmacen();
  const { intentar } = useContext(ContextoError);

  const [
    emitir,
    {
      estado,
      contexto: { lineas },
    },
  ] = useMaquinaLineasTransferenciasStock();

  const [transferenciaIdAnterior, setTransferenciaIdAnterior] = useState<
    string | null
  >(null);
  const [lineasRespuesta, setLineasRespuesta] = useState<
    RespuestaLista2<LineaTransferenciaStock>
  >({ datos: [], total: 0 });

  const setEntidades = useCallback(
    (payload: LineaTransferenciaStock[]) => emitir("lineas_cargadas", payload),
    [emitir]
  );
  const setSeleccionada = useCallback(
    (payload: LineaTransferenciaStock) => emitir("linea_seleccionada", payload),
    [emitir]
  );

  const seleccionada = getSeleccionada(lineas);

  const cargarLineas = useCallback(
    async (criteria: Criteria = criteriaDefecto) => {
      if (transferencia.modelo.id) {
        const respuesta = await intentar(() =>
          obtenerLineasTransferenciaStock(
            transferencia.modelo.id,
            criteria.filtro,
            criteria.orden,
            criteria.paginacion
          )
        );

        setEntidades(respuesta.datos);
        setLineasRespuesta((anterior) => ({
          datos: respuesta.datos,
          total: respuesta.total < 0 ? anterior.total : respuesta.total,
        }));
      } else {
        setEntidades([]);
        setLineasRespuesta({ datos: [], total: 0 });
      }
    },
    [transferencia, intentar, setEntidades]
  );

  useEffect(() => {
    const transferenciaId = transferencia.modelo.id || null;
    if (transferenciaId !== transferenciaIdAnterior) {
      setTransferenciaIdAnterior(transferenciaId);
      cargarLineas();
    }
  }, [transferencia.modelo.id, cargarLineas, transferenciaIdAnterior]);

  return (
    <>
      {transferencia.editable && (
        <div className="botones maestro-botones ">
          <QBoton onClick={() => emitir("alta_solicitada")}>{t("transferencias.nueva")}</QBoton>
          <QBoton
            deshabilitado={!seleccionada}
            onClick={() => emitir("edicion_solicitada")}
          >
            {t("transferencias.editar")}
          </QBoton>
          <QBoton
            deshabilitado={!seleccionada}
            onClick={() => emitir("borrado_solicitado")}
          >
            {t("transferencias.borrar")}
          </QBoton>
        </div>
      )}
      {!!transferencia.modelo.id && (
        <ListadoSemiControlado
          metaTabla={metaTablaLineasTransferenciaStock}
          metaFiltro={metaFiltroLineas}
          cargando={false}
          criteriaInicial={criteriaDefecto}
          idReiniciarCriteria={transferencia.modelo.id}
          modo="tabla"
          entidades={lineasRespuesta.datos}
          totalEntidades={lineasRespuesta.total}
          seleccionada={seleccionada}
          onSeleccion={setSeleccionada}
          onCriteriaChanged={cargarLineas}
        />
      )}
      {seleccionada && (
        <QModal
          nombre="modal"
          abierto={estado === "Edicion"}
          onCerrar={() => emitir("edicion_cancelada")}
        >
          <DetalleLineaTransferenciaStock
            emitir={emitir}
            lineaInicial={seleccionada}
            transferenciaID={transferencia.modelo.id}
          />
        </QModal>
      )}
      <CrearLineaTransferenciaStock
        publicar={emitir}
        activo={estado === "Alta"}
        transferenciaID={transferencia.modelo.id}
      />
      <BorrarLineaTransferenciaStock
        publicar={emitir}
        activo={estado === "ConfirmarBorrado"}
        linea={seleccionada!}
        transferenciaID={transferencia.modelo.id}
      />
    </>
  );
};

import { QModalConfirmacion } from "@olula/componentes/moleculas/qmodalconfirmacion.tsx";
import { EmitirEvento } from "@olula/lib/diseño.ts";
import { formatearFechaDate, formatearMoneda } from "@olula/lib/dominio.ts";
import { useForm } from "@olula/lib/useForm.ts";
import { useCallback } from "react";
import { ConciliacionSeleccionada } from "../detalle/diseño.js";
import { ItemConciliacion, MovimientoBancario } from "../diseño.js";
import {
    esConciliacionParcial,
    etiquetaTipoConciliacion,
    reciboIdsConciliacionRemesa,
    restoConciliacionParcial,
} from "../dominio.js";
import { tTesoreria, useTTesoreria } from "../../i18n/index.ts";

/** Línea descriptiva de un ítem de conciliación para el cuerpo del modal. */
const lineaItem = (item: ItemConciliacion, movimiento: MovimientoBancario): string => {
    const divisa = movimiento.divisa ?? "EUR";
    if (item.recibo) {
        const recibo = item.recibo;
        const parcial = esConciliacionParcial(item.tipo);
        return parcial
            ? tTesoreria("conciliacion.tipoCodigoValorDeImporteResto", { tipo: etiquetaTipoConciliacion(item.tipo), codigo: recibo.codigo, valor: formatearMoneda(Math.abs(movimiento.importe), divisa), importe: formatearMoneda(recibo.importe, divisa), valor2: formatearMoneda(restoConciliacionParcial(movimiento, recibo.importe), divisa) })
            : tTesoreria("conciliacion.tipoCodigoValorVenceFechavencimientoImpo", { tipo: etiquetaTipoConciliacion(item.tipo), codigo: recibo.codigo, valor: recibo.tercero ?? tTesoreria("conciliacion.sinTercero"), fechaVencimiento: formatearFechaDate(recibo.fechaVencimiento), importe: formatearMoneda(recibo.importe, divisa) });
    }
    if (item.remesa) {
        const recibos = reciboIdsConciliacionRemesa(item);
        // En una conciliación de varios ítems la remesa cubre su `importe`, no todo el movimiento.
        const importe = item.params.importe !== undefined ? Number(item.params.importe) : Math.abs(movimiento.importe);
        return tTesoreria("conciliacion.tipoRemesaIdCargoFechacargoValor", { tipo: etiquetaTipoConciliacion(item.tipo), id: item.remesa.id, fechaCargo: formatearFechaDate(item.remesa.fechaCargo), valor: (recibos ? tTesoreria("conciliacion.lengthDeNumrecibosRecibos", { length: recibos.length, numRecibos: item.remesa.numRecibos }) : tTesoreria("conciliacion.todosLosRecibosPendientes")), importe: formatearMoneda(importe, divisa) });
    }
    if (item.asiento) {
        const asiento = item.asiento;
        return tTesoreria("conciliacion.tipoAsientoValorFechaImporte", { tipo: etiquetaTipoConciliacion(item.tipo), valor: asiento.numero ?? `#${asiento.id}`, fecha: formatearFechaDate(asiento.fecha), importe: formatearMoneda(asiento.importe, divisa) });
    }
    if (item.cuota) {
        const cuota = item.cuota;
        return tTesoreria("conciliacion.cuotaValorFechaCapitalCapitalY", { valor: cuota.contrato ?? "", fecha: formatearFechaDate(cuota.fecha), capital: formatearMoneda(cuota.capital, divisa), intereses: formatearMoneda(cuota.intereses, divisa) });
    }
    return etiquetaTipoConciliacion(item.tipo);
};

/**
 * Confirmación de una conciliación de recibo (completa o parcial), cuota de
 * préstamo o multi-ítem: la llamada a la API (PATCH `.../conciliar`) vive en
 * detalle/detalle.ts (onConciliado); este modal solo confirma o cancela.
 */
export const ConciliarMovimientoBancario = ({
    movimiento,
    conciliacion,
    publicar,
}: {
    movimiento: MovimientoBancario;
    conciliacion: ConciliacionSeleccionada;
    publicar: EmitirEvento;
}) => {
    const t = useTTesoreria();
    const conciliar_ = useCallback(async () => publicar("conciliacion_confirmada"), [publicar]);
    const cancelar_ = useCallback(() => publicar("conciliacion_cancelada"), [publicar]);

    const [conciliar, cancelar] = useForm(conciliar_, cancelar_);

    const divisa = movimiento.divisa ?? "EUR";
    const item0 = conciliacion.items[0];
    const varios = conciliacion.items.length > 1;
    const titulo = varios
        ? t("conciliacion.conciliarConLengthCandidatos", { length: conciliacion.items.length })
        : item0 ? etiquetaTipoConciliacion(item0.tipo) : t("conciliacion.conciliacion");

    const lineasItems = conciliacion.items.map((item) => lineaItem(item, movimiento));
    const mensaje = [
        t("conciliacion.movimientoFechaConceptoImporte", { fecha: formatearFechaDate(movimiento.fecha), concepto: movimiento.concepto, importe: formatearMoneda(movimiento.importe, divisa) }),
        "",
        ...lineasItems,
        conciliacion.justificacion ? t("conciliacion.motivoJustificacion", { justificacion: conciliacion.justificacion }) : "",
        "",
        varios
            ? t("conciliacion.losRecibosYRemesasQuedaranPagados")
            : item0?.cuota
            ? t("conciliacion.seGeneraraElAsientoDeLa")
            : item0?.remesa
            ? t("conciliacion.losRecibosDeLaRemesaQuedaran")
            : item0?.recibo && esConciliacionParcial(item0.tipo)
            ? t("conciliacion.sePagaranValorDelReciboCon", { valor: formatearMoneda(Math.abs(movimiento.importe), divisa) })
            : t("conciliacion.elReciboQuedaraPagadoConLa"),
    ].filter((linea, i, lineas) => linea !== "" || lineas[i - 1] !== "").join("\n");

    return (
        <QModalConfirmacion
            nombre="conciliarMovimientoBancario"
            abierto={true}
            titulo={titulo}
            mensaje={mensaje}
            onCerrar={cancelar}
            onAceptar={conciliar}
            labelAceptar={t("conciliacion.conciliar")}
        />
    );
};

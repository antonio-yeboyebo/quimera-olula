import { QAviso } from "@olula/componentes/atomos/qaviso.tsx";
import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { QCheckbox } from "@olula/componentes/atomos/qcheckbox.tsx";
import { QModal } from "@olula/componentes/index.js";
import { EmitirEvento } from "@olula/lib/diseño.ts";
import { formatearFechaDate, formatearMoneda } from "@olula/lib/dominio.ts";
import { useForm } from "@olula/lib/useForm.ts";
import { useState } from "react";
import { MovimientoBancario, RemesaCandidata } from "../diseño.js";
import {
    cuadraRemesa,
    esConciliacionRemesaPago,
    esRemesaDeNominas,
    importeRecibosRemesa,
} from "../dominio.js";
import "./ConciliarRemesaMovimientoBancario.css";
import { useTTesoreria } from "../../i18n/index.ts";

/**
 * Conciliación con una remesa de cobro: el usuario confirma qué recibos
 * pendientes paga el movimiento. Parte de los que propone el servidor (todos
 * si la remesa cuadra entera) y solo deja conciliar si suman exactamente el
 * importe del movimiento. Una remesa de pago se paga siempre entera: se
 * muestran sus recibos o nóminas, todos marcados y sin poder cambiarlos. La
 * llamada a la API vive en detalle/detalle.ts (onConciliadoRemesa), que recibe
 * los ids como payload.
 */
export const ConciliarRemesaMovimientoBancario = ({
    movimiento,
    remesa,
    publicar,
}: {
    movimiento: MovimientoBancario;
    remesa: RemesaCandidata;
    publicar: EmitirEvento;
}) => {
    const t = useTTesoreria();
    const [reciboIds, setReciboIds] = useState<string[]>(remesa.reciboIdsPropuestos);

    const conciliar_ = async () => publicar("conciliacion_remesa_confirmada", reciboIds);
    const cancelar_ = () => publicar("conciliacion_cancelada");

    const [conciliar, cancelar] = useForm(conciliar_, cancelar_);

    const marcar = (reciboId: string, marcado: boolean) =>
        setReciboIds((actuales) =>
            marcado ? [...actuales, reciboId] : actuales.filter((id) => id !== reciboId));

    const divisa = movimiento.divisa ?? "EUR";
    const importeMovimiento = Math.abs(movimiento.importe);
    const seleccionado = importeRecibosRemesa(remesa, reciboIds);
    const cuadra = cuadraRemesa(movimiento, remesa, reciboIds);
    const todos = reciboIds.length === remesa.recibos.length;
    const dePago = esConciliacionRemesaPago(remesa.tipoConciliacion);
    const lineas = esRemesaDeNominas(remesa) ? t("conciliacion.nominas") : t("conciliacion.recibos");

    return (
        <QModal abierto={true} nombre="conciliarRemesaMovimientoBancario"
            titulo={t("conciliacion.remesaId", { id: remesa.id })} onCerrar={cancelar}>
            <div className="ConciliarRemesaMovimientoBancario">
                {dePago ? (
                    <p>
                        {t("conciliacion.remesaDePagoConFechaDe", { fechaCargo: formatearFechaDate(remesa.fechaCargo) })}
                        {t("conciliacion.lengthLineasPorTotal", { length: remesa.recibos.length, lineas, total: formatearMoneda(remesa.total, divisa) })}
                        {t("conciliacion.sePagaEnteraConElCargo")}
                    </p>
                ) : (
                    <p>
                        {t("conciliacion.cargoElFechacargoLengthRecibosPendientes", { fechaCargo: formatearFechaDate(remesa.fechaCargo), length: remesa.recibos.length })}
                        {formatearMoneda(remesa.importePendiente, divisa)}
                        {t("conciliacion.marcaLosRecibosQuePagaEl", { importeMovimiento: formatearMoneda(importeMovimiento, divisa) })}
                    </p>
                )}

                {remesa.tipoConciliacion === "cobro_parcial_remesa" && remesa.reciboIdsPropuestos.length === 0 && (
                    <QAviso variante="advertencia">
                        {t("conciliacion.noSeHaEncontradoNingunaCombinacion")}
                    </QAviso>
                )}
                {remesa.propuestaAmbigua && (
                    <QAviso variante="advertencia">
                        {t("conciliacion.puedeHaberOtrasCombinacionesDeRecibos")}
                    </QAviso>
                )}

                <ul className="recibos-remesa">
                    {remesa.recibos.map((recibo) => (
                        <li key={recibo.reciboId}>
                            <QCheckbox
                                nombre={`recibo-remesa-${recibo.reciboId}`}
                                label={`${recibo.codigo} · ${recibo.tercero ?? (dePago ? "—" : t("conciliacion.sinCliente"))}`}
                                valor={reciboIds.includes(recibo.reciboId)}
                                onChange={(valor) => marcar(recibo.reciboId, valor === "true")}
                                soloLectura={dePago}
                                condensado
                            />
                            <span className="importe-recibo">{formatearMoneda(recibo.importe, divisa)}</span>
                        </li>
                    ))}
                </ul>

                <p className={cuadra ? "resumen-remesa" : "resumen-remesa descuadre"}>
                    {t("conciliacion.cuantosLineasPor", { length: reciboIds.length, lineas, total: formatearMoneda(seleccionado, divisa) })}
                    {cuadra
                        ? todos ? t("conciliacion.laRemesaQuedaraPagada") : t("conciliacion.laRemesaSeguiraEmitidaConEl")
                        : t("conciliacion.faltanValorParaCuadrar", { valor: formatearMoneda(Math.round((importeMovimiento - seleccionado) * 100) / 100, divisa) })}
                </p>

                <div className="botones maestro-botones">
                    <QBoton onClick={conciliar} deshabilitado={!cuadra}>{t("conciliacion.conciliar")}</QBoton>
                </div>
            </div>
        </QModal>
    );
};

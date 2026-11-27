import { Detalle } from "@olula/componentes/detalle/Detalle.tsx";
import { Tab, Tabs } from "@olula/componentes/detalle/tabs/Tabs.tsx";
import { useMaquina } from "@olula/componentes/hook/useMaquina.js";
import { EmitirEvento } from "@olula/lib/diseño.ts";
import { useModelo } from "@olula/lib/useModelo.js";
import { formatearFechaDate, formatearMoneda } from "@olula/lib/dominio.js";
import { useEffect } from "react";
import { ConciliarMovimientoBancario } from "../conciliar/ConciliarMovimientoBancario.js";
import { ConciliarAsientoMovimientoBancario } from "../conciliar_asiento/ConciliarAsientoMovimientoBancario.js";
import { ConciliarRemesaMovimientoBancario } from "../conciliar_remesa/ConciliarRemesaMovimientoBancario.js";
import { DesconciliarMovimientoBancario } from "../desconciliar/DesconciliarMovimientoBancario.js";
import { MovimientoBancario } from "../diseño.js";
import { esIngresoMovimientoBancario } from "../dominio.js";
import { IgnorarMovimientoBancario } from "../ignorar/IgnorarMovimientoBancario.js";
import { ReactivarMovimientoBancario } from "../reactivar/ReactivarMovimientoBancario.js";
import { contextoDetalleConciliacionInicial, metaMovimientoBancario } from "./detalle.js";
import "./DetalleConciliacion.css";
import { getMaquina } from "./maquina.js";
import { SeccionEstadoConciliacion } from "./SeccionEstadoConciliacion.js";
import { TabConciliacion } from "./TabConciliacion.js";
import { TabGeneral } from "./TabGeneral.js";
import { useTTesoreria } from "../../i18n/index.ts";

/**
 * Detalle de un movimiento bancario.
 *
 * Layout:
 * - Cabecera (siempre visible, sobre las pestañas): fecha e importe del movimiento.
 * - Tab "Conciliación":
 *   - Siempre visible: SeccionEstadoConciliacion (etiqueta de estado + info
 *     del elemento ERP conciliado + botones Desconciliar/Reactivar).
 *   - Solo cuando el movimiento puede conciliarse (pendiente/candidatos):
 *     las conciliaciones propuestas y una sola lista de candidatos ordenada por
 *     fecha con recibos, remesas (de cobro en un ingreso; de pago en un cargo,
 *     si su plugin está activo) y partidas contables sin movimiento equivalente.
 * - Tab "General": cabecera de solo lectura del movimiento.
 *
 * Los modales (Conciliar/Desconciliar/Ignorar/Reactivar) se montan aquí
 * fuera del panel según `estado` de la máquina.
 */
export const DetalleConciliacion = ({
    id,
    publicar = async () => {},
}: {
    id?: string;
    publicar?: EmitirEvento;
}) => {

    const t = useTTesoreria();
    const { ctx, emitir } = useMaquina(
        getMaquina,
        contextoDetalleConciliacionInicial,
        publicar
    );

    const formModelo = useModelo(metaMovimientoBancario, ctx.movimiento);

    const {
        estado, movimiento, conciliaciones, conciliacionAplicada, candidatos, candidatosTexto, remesas, partidas,
        conciliacionSeleccionada, seleccion, remesaSeleccionada,
    } = ctx;

    useEffect(() => {
        emitir("movimiento_id_cambiado", id, true);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    if (!ctx.movimiento.id) return null;

    const titulo = (m: MovimientoBancario) => m.concepto || t("conciliacion.movimientoId", { id: m.id });

    const puedeConciliar =
        movimiento.estado === "pendiente" || movimiento.estado === "candidatos";

    return (
        <Detalle
            id={id}
            obtenerTitulo={titulo}
            setEntidad={() => {}}
            entidad={ctx.movimiento}
            cerrarDetalle={() => emitir("movimiento_deseleccionado", null, true)}
        >
            <div className="DetalleConciliacion">
                <div className="DetalleConciliacion-cabecera">
                    <span>{formatearFechaDate(movimiento.fecha)}</span>
                    <strong className={esIngresoMovimientoBancario(movimiento) ? "importe-ingreso" : "importe-cargo"}>
                        {formatearMoneda(movimiento.importe, movimiento.divisa ?? "EUR")}
                    </strong>
                </div>
                <Tabs children={[
                    <Tab label={t("conciliacion.conciliacion")}
                        key="tab-conciliacion"
                        children={
                            <div className="DetalleConciliacion-conciliacion">
                                <SeccionEstadoConciliacion
                                    form={formModelo}
                                    movimiento={movimiento}
                                    conciliacionAplicada={conciliacionAplicada}
                                    publicar={emitir}
                                />
                                {puedeConciliar && (
                                    <TabConciliacion
                                        movimiento={movimiento}
                                        conciliaciones={conciliaciones}
                                        candidatos={candidatos}
                                        candidatosTexto={candidatosTexto}
                                        remesas={remesas}
                                        partidas={partidas}
                                        seleccion={seleccion}
                                        publicar={emitir}
                                    />
                                )}
                            </div>
                        }
                    />,
                    <Tab label={t("conciliacion.general")}
                        key="tab-general"
                        children={<TabGeneral form={formModelo} movimiento={ctx.movimiento} />}
                    />,
                ]} />
            </div>

            {estado === "CONCILIANDO" && conciliacionSeleccionada && (
                conciliacionSeleccionada.items[0]?.tipo === "asiento_manual"
                    ? <ConciliarAsientoMovimientoBancario movimiento={movimiento} publicar={emitir} />
                    : <ConciliarMovimientoBancario
                        movimiento={movimiento}
                        conciliacion={conciliacionSeleccionada}
                        publicar={emitir}
                    />
            )}
            {estado === "CONCILIANDO_REMESA" && remesaSeleccionada && (
                <ConciliarRemesaMovimientoBancario
                    movimiento={movimiento}
                    remesa={remesaSeleccionada}
                    publicar={emitir}
                />
            )}
            {estado === "DESCONCILIANDO" && (
                <DesconciliarMovimientoBancario conciliacion={conciliacionAplicada} publicar={emitir} />
            )}
            {estado === "IGNORANDO" && (
                <IgnorarMovimientoBancario movimiento={movimiento} publicar={emitir} />
            )}
            {estado === "REACTIVANDO" && (
                <ReactivarMovimientoBancario movimiento={movimiento} publicar={emitir} />
            )}
        </Detalle>
    );
};

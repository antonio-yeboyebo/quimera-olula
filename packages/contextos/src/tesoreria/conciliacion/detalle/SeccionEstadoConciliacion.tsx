import { QAviso } from "@olula/componentes/atomos/qaviso.tsx";
import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { QEtiqueta } from "@olula/componentes/atomos/qetiqueta.tsx";
import { QInput } from "@olula/componentes/atomos/qinput.tsx";
import { EmitirEvento } from "@olula/lib/diseño.ts";
import { formatearFechaDate, formatearMoneda, FormModelo } from "@olula/lib/dominio.js";
import { Subcuenta } from "../../comun/componentes/Subcuenta.tsx";
import { ejercicioDelMovimiento } from "../conciliar_asiento/dominio.js";
import { Conciliacion, ItemConciliacion, MovimientoBancario, TipoConciliacion } from "../diseño.js";
import {
    contrapartidaEsSubcuentaBanco,
    etiquetaEstadoMovimientoBancario,
    etiquetaOrigenConciliacion,
    etiquetaTipoConciliacion,
    reciboAsociadoMovimientoBancario,
    esConciliacionRemesaPago,
    esRemesaDeNominas,
    reciboIdsConciliacionRemesa,
    subcuentaContrapartida,
    urlAsientoConciliacion,
    urlReciboConciliacion,
    urlRemesaConciliacion,
    varianteEstadoMovimientoBancario,
} from "../dominio.js";
import "./TabConciliacion.css";
import { tTesoreria } from "../../i18n/index.ts";
import { textoEstado } from "../../comun/estados.ts";

const TIPOS_COBRO: TipoConciliacion[] = ["cobrar_recibo_venta", "cobro_parcial_venta"];

const etiquetaTercero = (tipo: TipoConciliacion): string =>
    TIPOS_COBRO.includes(tipo) ? tTesoreria("conciliacion.cliente") : tTesoreria("conciliacion.proveedor");

const etiquetaFechaPago = (tipo: TipoConciliacion): string =>
    TIPOS_COBRO.includes(tipo) ? tTesoreria("conciliacion.fechaDeCobro") : tTesoreria("conciliacion.fechaDePago");

const EnlaceItem = ({ url, children }: { url: string | null; children: string }) =>
    url ? (
        <QBoton tamaño="pequeño" variante="borde" enlace={url}>
            {children}
        </QBoton>
    ) : null;

const ItemReciboConciliado = ({ item, divisa }: { item: ItemConciliacion; divisa: string }) => {
    const { recibo } = item;
    if (!recibo) return null;
    return (
        <div className="item-recibo-conciliado">
            <p className="tipo-item-recibo">{etiquetaTipoConciliacion(item.tipo)}</p>
            <quimera-formulario>
                <QInput nombre="ir-codigo" label={tTesoreria("conciliacion.codigo")} soloLectura valor={recibo.codigo} />
                <QInput nombre="ir-tercero" label={etiquetaTercero(item.tipo)} soloLectura valor={recibo.tercero ?? "—"} />
                <QInput nombre="ir-importe" label={tTesoreria("conciliacion.importe")} soloLectura valor={formatearMoneda(recibo.importe, divisa)} />
                <QInput nombre="ir-fecha-emision" label={tTesoreria("conciliacion.fechaEmision")} soloLectura
                    valor={recibo.fechaEmision ? formatearFechaDate(recibo.fechaEmision) : "—"} />
                <QInput nombre="ir-fecha-cobro" label={etiquetaFechaPago(item.tipo)} soloLectura
                    valor={recibo.fechaCobro ? formatearFechaDate(recibo.fechaCobro) : "—"} />
            </quimera-formulario>
            <EnlaceItem url={urlReciboConciliacion(item)}>{tTesoreria("conciliacion.verRecibo")}</EnlaceItem>
        </div>
    );
};

const ItemRemesaConciliada = ({ item, divisa }: { item: ItemConciliacion; divisa: string }) => {
    const { remesa } = item;
    if (!remesa) return null;
    const recibos = reciboIdsConciliacionRemesa(item);
    const dePago = esConciliacionRemesaPago(item.tipo);
    const lineas = esRemesaDeNominas(remesa) ? tTesoreria("conciliacion.nominasPagadas") : tTesoreria("conciliacion.recibosPagados");
    return (
        <div className="item-recibo-conciliado">
            <p className="tipo-item-recibo">{etiquetaTipoConciliacion(item.tipo)}</p>
            <quimera-formulario>
                <QInput nombre="ir-remesa" label={tTesoreria("conciliacion.remesa")} soloLectura valor={remesa.id} />
                <QInput nombre="ir-fecha-cargo" label={dePago ? tTesoreria("conciliacion.fechaDePago") : tTesoreria("conciliacion.fechaDeCargo")} soloLectura
                    valor={formatearFechaDate(remesa.fechaCargo)} />
                <QInput nombre="ir-total-remesa" label={tTesoreria("conciliacion.totalRemesa")} soloLectura
                    valor={formatearMoneda(remesa.total, divisa)} />
                <QInput nombre="ir-recibos-remesa" label={lineas} soloLectura
                    valor={recibos ? tTesoreria("conciliacion.cuantosDe", { length: recibos.length, numRecibos: remesa.numRecibos })
                        : dePago ? `${remesa.numRecibos}` : tTesoreria("conciliacion.todosLosPendientes")} />
                <QInput nombre="ir-estado-remesa" label={tTesoreria("conciliacion.estadoRemesa")} soloLectura valor={textoEstado(remesa.estado)} />
            </quimera-formulario>
            <EnlaceItem url={urlRemesaConciliacion(item)}>{tTesoreria("conciliacion.verRemesa")}</EnlaceItem>
        </div>
    );
};

const ItemAsientoManualConciliado = ({
    item,
    movimiento,
}: {
    item: ItemConciliacion;
    movimiento: MovimientoBancario;
}) => {
    const contrapartida = subcuentaContrapartida(item);
    return (
        <div className="item-recibo-conciliado">
            <p className="tipo-item-recibo">{etiquetaTipoConciliacion(item.tipo)}</p>
            <quimera-formulario>
                {contrapartida ? (
                    <Subcuenta nombre="am-subcuenta" label={tTesoreria("conciliacion.subcuentaDeContrapartida")} soloLectura
                        ejercicioId={ejercicioDelMovimiento(movimiento)} valor={contrapartida} />
                ) : (
                    <QInput nombre="am-subcuenta" label={tTesoreria("conciliacion.subcuentaDeContrapartida")} soloLectura valor="—" />
                )}
            </quimera-formulario>
            {contrapartidaEsSubcuentaBanco(item, movimiento.subcuentaBancoId) && (
                <QAviso variante="error">
                    {tTesoreria("conciliacion.subcuentaErroneaLaContrapartida")}{" "}<strong>{contrapartida}</strong>{" "}{tTesoreria("conciliacion.esLaPropiaSubcuentaDelBanco")}
                </QAviso>
            )}
            <EnlaceItem url={urlAsientoConciliacion(item)}>{tTesoreria("conciliacion.verAsiento")}</EnlaceItem>
        </div>
    );
};

/** Si el asiento ya no existe (`asiento` null) solo queda el id guardado en los params. */
const ItemAsientoVinculadoConciliado = ({ item, divisa }: { item: ItemConciliacion; divisa: string }) => {
    const { asiento } = item;
    return (
        <div className="item-recibo-conciliado">
            <p className="tipo-item-recibo">{etiquetaTipoConciliacion(item.tipo)}</p>
            <quimera-formulario>
                <QInput nombre="av-numero" label={tTesoreria("conciliacion.numeroDeAsiento")} soloLectura
                    valor={asiento?.numero ?? `#${String(item.params.idasiento ?? "—")}`} />
                <QInput nombre="av-fecha" label={tTesoreria("conciliacion.fecha")} soloLectura
                    valor={asiento ? formatearFechaDate(asiento.fecha) : "—"} />
                <QInput nombre="av-importe" label={tTesoreria("conciliacion.importe")} soloLectura
                    valor={asiento ? formatearMoneda(asiento.importe, divisa) : "—"} />
            </quimera-formulario>
            <EnlaceItem url={urlAsientoConciliacion(item)}>{tTesoreria("conciliacion.verAsiento")}</EnlaceItem>
        </div>
    );
};

const ItemCuotaConciliada = ({ item, divisa }: { item: ItemConciliacion; divisa: string }) => {
    const { cuota } = item;
    if (!cuota) return null;
    return (
        <div className="item-recibo-conciliado">
            <p className="tipo-item-recibo">{etiquetaTipoConciliacion(item.tipo)}</p>
            <quimera-formulario>
                <QInput nombre="cp-contrato" label={tTesoreria("conciliacion.contrato")} soloLectura valor={cuota.contrato ?? "—"} />
                <QInput nombre="cp-fecha" label={tTesoreria("conciliacion.fechaCuota")} soloLectura valor={formatearFechaDate(cuota.fecha)} />
                <QInput nombre="cp-total" label={tTesoreria("conciliacion.totalCuota")} soloLectura valor={formatearMoneda(cuota.total, divisa)} />
            </quimera-formulario>
            <EnlaceItem url={urlAsientoConciliacion(item)}>{tTesoreria("conciliacion.verAsiento")}</EnlaceItem>
        </div>
    );
};

interface SeccionEstadoConciliacionProps {
    form: FormModelo;
    movimiento: MovimientoBancario;
    conciliacionAplicada: Conciliacion | null;
    publicar: EmitirEvento;
}

/**
 * Estado del movimiento + información del elemento ERP conciliado.
 * Se muestra siempre por encima de las pestañas de búsqueda de candidatos.
 * Incluye la etiqueta de estado, la info del recibo/asiento cuando está
 * conciliado, el motivo cuando está ignorado, y los botones Desconciliar
 * y Reactivar.
 */
export const SeccionEstadoConciliacion = ({
    form, movimiento, conciliacionAplicada, publicar,
}: SeccionEstadoConciliacionProps) => {

    const { uiProps } = form;

    return (
        <div className="TabConciliacion">
            {movimiento.requiereRevision && (
                <QAviso variante="advertencia">
                    {tTesoreria("conciliacion.esteMovimientoRequiereRevisionManual")}
                </QAviso>
            )}

            <div id="estado-conciliacion">
                <QEtiqueta variante={varianteEstadoMovimientoBancario(movimiento.estado)}>
                    {etiquetaEstadoMovimientoBancario(movimiento.estado)}
                </QEtiqueta>
            </div>

            {movimiento.estado === "conciliado" && (
                <div className="recibo-conciliado">
                    <div id="recibo-asociado">
                        <div>
                            <span className="etiqueta-recibo">
                                {tTesoreria("conciliacion.conciliacion")}
                                {movimiento.probabilidad !== null && ` · ${movimiento.probabilidad} %`}
                            </span>
                            <span className="valor-recibo">{reciboAsociadoMovimientoBancario(movimiento)}</span>
                        </div>
                    </div>
                    {conciliacionAplicada && conciliacionAplicada.items.some(
                        i => i.recibo !== null || i.remesa !== null || i.cuota !== null
                            || i.tipo === "asiento_manual" || i.tipo === "asiento_vinculado"
                    ) && (
                        <div className="items-recibo-conciliados">
                            {conciliacionAplicada.items.map((item, idx) =>
                                item.tipo === "asiento_manual" ? (
                                    <ItemAsientoManualConciliado
                                        key={idx}
                                        item={item}
                                        movimiento={movimiento}
                                    />
                                ) : item.tipo === "asiento_vinculado" ? (
                                    <ItemAsientoVinculadoConciliado
                                        key={idx}
                                        item={item}
                                        divisa={movimiento.divisa ?? "EUR"}
                                    />
                                ) : item.cuota ? (
                                    <ItemCuotaConciliada
                                        key={idx}
                                        item={item}
                                        divisa={movimiento.divisa ?? "EUR"}
                                    />
                                ) : item.remesa ? (
                                    <ItemRemesaConciliada
                                        key={idx}
                                        item={item}
                                        divisa={movimiento.divisa ?? "EUR"}
                                    />
                                ) : (
                                    <ItemReciboConciliado
                                        key={idx}
                                        item={item}
                                        divisa={movimiento.divisa ?? "EUR"}
                                    />
                                )
                            )}
                        </div>
                    )}
                    <quimera-formulario>
                        <QInput label={tTesoreria("conciliacion.origen")} nombre="origenConciliacion" soloLectura
                            valor={etiquetaOrigenConciliacion(movimiento.origenConciliacion)} />
                        <QInput label={tTesoreria("conciliacion.conciliadoPor")} {...uiProps("conciliadoPor")} />
                        <QInput label={tTesoreria("conciliacion.conciliadoEl")} {...uiProps("conciliadoEn")} />
                        {movimiento.justificacion && (
                            <QInput label={tTesoreria("conciliacion.justificacion")} {...uiProps("justificacion")} />
                        )}
                    </quimera-formulario>
                    <div className="botones">
                        <QBoton variante="borde" onClick={() => publicar("desconciliar_solicitado")}>
                            {tTesoreria("conciliacion.desconciliar")}
                        </QBoton>
                    </div>
                </div>
            )}

            {movimiento.estado === "ignorado" && (
                <div className="movimiento-ignorado">
                    <quimera-formulario>
                        <QInput label={tTesoreria("conciliacion.motivo")} {...uiProps("justificacion")} />
                    </quimera-formulario>
                    <div className="botones">
                        <QBoton variante="borde" onClick={() => publicar("reactivar_solicitado")}>{tTesoreria("conciliacion.reactivar")}</QBoton>
                    </div>
                </div>
            )}
        </div>
    );
};

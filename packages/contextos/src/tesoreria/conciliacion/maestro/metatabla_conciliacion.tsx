import { QEtiqueta } from "@olula/componentes/atomos/qetiqueta.tsx";
import { QIcono } from "@olula/componentes/atomos/qicono.tsx";
import { MetaTabla } from "@olula/componentes/index.js";
import { formatearMoneda } from "@olula/lib/dominio.js";
import { MovimientoBancario } from "../diseño.js";
import {
    cuentaMovimientoBancario,
    esIngresoMovimientoBancario,
    etiquetaEstadoConConciliaciones,
    reciboAsociadoMovimientoBancario,
    varianteEstadoMovimientoBancario,
} from "../dominio.js";
import { tTesoreria } from "../../i18n/index.ts";

/**
 * Los `id` son nombres de campo del API: al pulsar una cabecera se ordena por
 * ese campo, y el backend solo acepta los de MovimientoBancarioApi.
 *
 * Los renders van como funciones anónimas dentro del array (en vez de
 * componentes con nombre propio) para no disparar el aviso de
 * react-refresh/only-export-components en este fichero.
 */
export const metaTablaMovimientoBancario: MetaTabla<MovimientoBancario> = [
    { id: "fecha", get cabecera() { return tTesoreria("conciliacion.fecha"); }, tipo: "fecha" },
    { id: "concepto", get cabecera() { return tTesoreria("conciliacion.concepto"); } },
    {
        id: "importe",
        get cabecera() { return tTesoreria("conciliacion.importe"); },
        tipo: "moneda",
        render: (movimiento) => (
            <span className={esIngresoMovimientoBancario(movimiento) ? "importe-ingreso" : "importe-cargo"}>
                {formatearMoneda(movimiento.importe, movimiento.divisa ?? "EUR")}
            </span>
        ),
    },
    {
        id: "saldo_tras",
        get cabecera() { return tTesoreria("conciliacion.saldo"); },
        tipo: "moneda",
        render: (movimiento) =>
            movimiento.saldo !== null ? (
                <span className={movimiento.saldo < 0 ? "importe-cargo" : undefined}>
                    {formatearMoneda(movimiento.saldo, movimiento.divisa ?? "EUR")}
                </span>
            ) : (
                "—"
            ),
    },
    {
        id: "estado",
        get cabecera() { return tTesoreria("conciliacion.estado"); },
        render: (movimiento) => (
            <div className="celda-estado-movimiento-bancario">
                <QEtiqueta variante={varianteEstadoMovimientoBancario(movimiento.estado)}>
                    {etiquetaEstadoConConciliaciones(movimiento)}
                </QEtiqueta>
                {movimiento.requiereRevision && (
                    <QEtiqueta variante="advertencia">{tTesoreria("conciliacion.revisar")}</QEtiqueta>
                )}
                {movimiento.pendiente && (
                    <QIcono
                        nombre="relojarena"
                        tamaño="xs"
                        color="var(--color-advertencia-oscuro)"
                    />
                )}
            </div>
        ),
    },
    {
        id: "num_items_conciliacion",
        get cabecera() { return tTesoreria("conciliacion.conciliacion"); },
        render: reciboAsociadoMovimientoBancario,
    },
    { id: "contraparte", get cabecera() { return tTesoreria("conciliacion.contraparte"); }, render: (m) => m.contraparte ?? "—" },
    { id: "nombre_cuenta", get cabecera() { return tTesoreria("conciliacion.cuenta"); }, render: cuentaMovimientoBancario },
];

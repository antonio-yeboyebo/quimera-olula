import { MetaTabla, QEtiqueta } from "@olula/componentes/index.js";
import { ReciboVenta } from "../diseño.js";
import { varianteEstadoReciboVenta } from "../dominio.js";
import { tTesoreria } from "../../i18n/index.ts";
import { textoEstado } from "../../comun/estados.ts";

export const metaTablaReciboVenta: MetaTabla<ReciboVenta> = [
    { id: 'codigo', get cabecera() { return tTesoreria("recibo_venta.codigo"); } },
    { id: 'nombreCliente', get cabecera() { return tTesoreria("recibo_venta.cliente"); } },
    { id: 'idFiscal', get cabecera() { return tTesoreria("recibo_venta.idFiscal"); } },
    { id: 'fechaEmision', get cabecera() { return tTesoreria("recibo_venta.fEmision"); }, tipo: 'fecha' },
    { id: 'fechaVencimiento', get cabecera() { return tTesoreria("recibo_venta.fVencimiento"); }, tipo: 'fecha' },
    {
        id: 'estado',
        get cabecera() { return tTesoreria("recibo_venta.estado"); },
        render: (recibo: ReciboVenta) => (
            <QEtiqueta variante={varianteEstadoReciboVenta(recibo.estado)}>
                {textoEstado(recibo.estado)}
            </QEtiqueta>
        ),
    },
    { id: 'importe', get cabecera() { return tTesoreria("recibo_venta.importe"); }, tipo: 'moneda' },
];

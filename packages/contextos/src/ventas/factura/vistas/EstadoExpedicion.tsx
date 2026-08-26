import { QIcono } from "@olula/componentes/atomos/qicono.tsx";
import { Factura } from "../diseño.ts";
import { descripcionEstadoExpedicion, facturaEditable } from "../dominio.ts";
import "./EstadoExpedicion.css";

/**
 * El color dice si la factura se puede tocar, como en el resto de documentos:
 * verde abierta, gris cerrada. El estado concreto va en el tooltip, porque cuál
 * de ellos cierra la factura depende del plugin de expedición.
 */
export const EstadoExpedicion = ({ factura }: { factura: Factura }) => {
    const color = facturaEditable(factura)
        ? "var(--color-exito-oscuro)"
        : "var(--color-deshabilitado-oscuro)";

    return (
        <span
            className="estado-expedicion"
            title={descripcionEstadoExpedicion[factura.estadoExpedicion]}
        >
            <QIcono nombre="circulo_relleno" tamaño="sm" color={color} />
        </span>
    );
};

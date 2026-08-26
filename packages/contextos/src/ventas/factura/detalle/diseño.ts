import { MetaModelo } from "@olula/lib/dominio.ts";
import { metaVenta } from "../../venta/dominio.ts";
import { ContextoFactura, EstadoFactura, Factura, LineaFactura } from "../diseño.ts";
import { facturaEditable } from "../dominio.ts";

export type { ContextoFactura, EstadoFactura, Factura, LineaFactura };

export const editable = (factura: Factura, _?: string) => facturaEditable(factura);

export const metaFactura: MetaModelo<Factura> = {
    campos: {
        ...metaVenta.campos,
        fecha: { tipo: "fecha", requerido: false },
        hora: { tipo: "hora", requerido: false },
        divisa_id: { requerido: true, bloqueado: true },
        tasa_conversion: { tipo: "numero", requerido: true, bloqueado: true },
        agente_id: { bloqueado: true },
        por_comision: { tipo: "decimal", requerido: false, decimales: 2, positivo: true, maximo: 100, bloqueado: true },
        automatica: { tipo: "checkbox", requerido: false },
        servicios: { tipo: "checkbox", requerido: false },
    },
    editable,
};



import { MetaModelo, stringNoVacio } from "@olula/lib/dominio.ts";
import { NuevoArticuloImportacion } from "../validar_importacion/dominio.ts";

export const metaNuevoArticuloImportacion: MetaModelo<NuevoArticuloImportacion> = {
    campos: {
        referencia: { requerido: true, validacion: (m) => stringNoVacio(m.referencia.trim()) },
        descripcion: { requerido: true, validacion: (m) => stringNoVacio(m.descripcion.trim()) },
        grupoIvaProductoId: {
            requerido: true,
            validacion: (m) => stringNoVacio(m.grupoIvaProductoId),
        },
        datoContable: {},
        costeIgualPrecio: { tipo: "checkbox" },
    },
};

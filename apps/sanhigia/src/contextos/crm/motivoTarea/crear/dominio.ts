import { MetaModelo, stringNoVacio } from "@olula/lib/dominio.js";
import { NuevoMotivoTarea } from "../diseño.ts";

export const nuevoMotivoTareaVacio: NuevoMotivoTarea = {
    descripcion: "",
    activo: true,
};

export const metaNuevoMotivoTarea: MetaModelo<NuevoMotivoTarea> = {
    campos: {
        descripcion: {
            requerido: true,
            validacion: (motivoTarea: NuevoMotivoTarea) =>
                stringNoVacio(String(motivoTarea.descripcion ?? "")),
        },
        activo: { requerido: true, tipo: "checkbox" },
    },
};

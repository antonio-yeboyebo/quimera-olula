import { camposIdFiscal } from "#/ventas/comun/componentes/moleculas/CambiarIdFiscal/dominio.ts";
import { MetaModelo } from "@olula/lib/dominio.js";
import { NuevoCliente } from "../diseño.ts";

export const nuevoClienteVacio: NuevoCliente = {
    nombre: '',
    id_fiscal: '',
    empresa_id: '',
    tipo_id_fiscal: '',
    agente_id: '',
};

const metaDireccion: MetaModelo<NonNullable<NuevoCliente["direccion"]>> = {
    campos: {
        nombre_via: { requerido: true },
        ciudad: { requerido: true },
    },
};

export const metaNuevoCliente: MetaModelo<NuevoCliente> = {
    campos: {
        nombre: { requerido: true },
        direccion: {
            meta: metaDireccion,
        },
        ...camposIdFiscal<NuevoCliente>(),
    }
};
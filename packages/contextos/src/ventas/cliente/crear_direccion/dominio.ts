import { tVentas } from "../../i18n/index.ts";
import { MetaModelo } from "@olula/lib/dominio.js";
import { NuevaDireccion } from "../diseño.ts";

export const metaNuevaDireccion: MetaModelo<NuevaDireccion> = {
    campos: {
        nombre_via: { requerido: true },
        ciudad: { requerido: true },
    }
};

export const nuevaDireccionVacia: NuevaDireccion = {
    nombre_via: '',
    tipo_via: '',
    numero: '',
    otros: '',
    cod_postal: '',
    ciudad: '',
    provincia: '',
    pais_id: '',
    apartado: '',
    telefono: '',
}

/** El valor se guarda tal cual (en español, como en Eneboo); solo se traduce lo que se ve. */
const TIPOS_VIA = ["Calle", "Avenida", "Plaza", "Paseo", "Camino", "Carretera"] as const;

export const opcionesTipoVia = () =>
    TIPOS_VIA.map((valor) => ({ valor, descripcion: tVentas(`cliente.direccion.tiposVia.${valor}`) }));

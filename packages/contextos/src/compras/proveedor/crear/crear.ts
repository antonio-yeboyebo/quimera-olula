import { idFiscalCompraValido, tipoIdFiscalCompraValido } from "#/compras/comun/valores.ts";
import { MetaModelo } from "@olula/lib/dominio.ts";
import { NuevoProveedor } from "../diseño.ts";

const metaDireccion: MetaModelo<NonNullable<NuevoProveedor["direccion"]>> = {
    campos: {
        nombreVia: { requerido: true },
        ciudad: { requerido: true },
    },
};

export const metaNuevoProveedor: MetaModelo<NuevoProveedor> = {
    campos: {
        nombre: { requerido: true },
        tipoIdFiscal: {
            requerido: true,
            validacion: (modelo) => tipoIdFiscalCompraValido(modelo.tipoIdFiscal),
        },
        idFiscal: {
            requerido: true,
            validacion: (modelo) => idFiscalCompraValido(modelo.tipoIdFiscal)(modelo.idFiscal),
        },
        direccion: {
            meta: metaDireccion,
        },
    },
};

export const nuevoProveedorInicial = (): NuevoProveedor => ({
    nombre: "",
    idFiscal: "",
    tipoIdFiscal: "NIF",
    direccion: undefined,
});
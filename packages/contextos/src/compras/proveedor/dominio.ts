import { MetaModelo } from "@olula/lib/dominio.ts";
import { errorIbanNoValido, errorIbanRequerido, ibanValido } from "@olula/lib/iban.ts";
import {
    CuentaBancoProveedor,
    DireccionProveedor,
    NuevaCuentaBancoProveedor,
    NuevaDireccionProveedor,
} from "./diseño.ts";

const camposDireccion = {
    nombreVia: { requerido: true },
    tipoVia: {},
    numero: {},
    otros: {},
    codPostal: {},
    ciudad: { requerido: true },
    provincia: {},
    paisId: {},
    apartado: {},
    telefono: { tipo: "telefono" as const },
};

export const metaDireccionProveedor: MetaModelo<DireccionProveedor> = {
    campos: camposDireccion,
};

export const metaNuevaDireccionProveedor: MetaModelo<NuevaDireccionProveedor> = {
    campos: camposDireccion,
};

export const nuevaDireccionProveedorVacia = (): NuevaDireccionProveedor => ({
    nombreVia: "",
    tipoVia: null,
    numero: null,
    otros: null,
    codPostal: null,
    ciudad: "",
    provinciaId: null,
    provincia: null,
    paisId: null,
    pais: null,
    apartado: null,
    telefono: null,
});

const validacionIban = (modelo: { iban: string }): string | boolean => {
    if (!modelo.iban) return errorIbanRequerido();
    return ibanValido(modelo.iban) || errorIbanNoValido();
};

export const metaCuentaBancoProveedor: MetaModelo<CuentaBancoProveedor> = {
    campos: {
        descripcion: { requerido: true },
        iban: { requerido: true, validacion: (m) => validacionIban(m) },
        bic: {},
        codigoCuenta: { bloqueado: true },
        paisId: { bloqueado: true },
        entidad: { bloqueado: true },
        agencia: { bloqueado: true },
        digitoControl: { bloqueado: true },
        cuenta: { bloqueado: true },
    },
};

export const metaNuevaCuentaBancoProveedor: MetaModelo<NuevaCuentaBancoProveedor> = {
    campos: {
        descripcion: { requerido: true },
        iban: { requerido: true, validacion: (m) => validacionIban(m) },
        bic: {},
    },
};

export const nuevaCuentaBancoProveedorVacia = (): NuevaCuentaBancoProveedor => ({
    descripcion: "",
    iban: "",
    bic: null,
});

export const direccionProveedorCompleta = (d: DireccionProveedor): string =>
    [d.tipoVia, d.nombreVia, d.numero].filter(Boolean).join(" ") +
    (d.ciudad ? `, ${d.ciudad}` : "");

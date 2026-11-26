import { tLib } from "./i18n/textos.ts";

export const ERR_IBAN_REQUERIDO = "El IBAN es requerido";
export const ERR_IBAN_NO_VALIDO = "El IBAN no es válido";

/** Los mismos mensajes en el idioma activo (los formularios ya traducidos usan estos). */
export const errorIbanRequerido = () => tLib("validacion.ibanRequerido");
export const errorIbanNoValido = () => tLib("validacion.ibanNoValido");

export const normalizarIban = (valor: string): string =>
    valor.replace(/[\s-]/g, "").toUpperCase();

const restoModulo97 = (iban: string): number => {
    const expandido = [...iban]
        .map((c) => (c >= "A" && c <= "Z" ? String(c.charCodeAt(0) - 55) : c))
        .join("");

    let resto = 0;
    for (const digito of expandido) {
        resto = (resto * 10 + Number(digito)) % 97;
    }
    return resto;
};

export const ibanValido = (valor: string): boolean => {
    const iban = normalizarIban(valor);

    if (!/^[A-Z]{2}\d{2}[A-Z0-9]{11,30}$/.test(iban)) return false;

    return restoModulo97(iban.slice(4) + iban.slice(0, 4)) === 1;
};

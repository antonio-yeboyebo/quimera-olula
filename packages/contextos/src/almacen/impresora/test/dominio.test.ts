import { describe, expect, test } from "vitest";
import { EstadoImpresora } from "../diseño.ts";
import { nuevaImpresoraVacia, textoEstadoImpresora, validarImpresora } from "../dominio.ts";

const valida = { ...nuevaImpresoraVacia, codigo: "PC45D", host: "10.20.2.245" };

const estado = (cambios: Partial<EstadoImpresora> = {}): EstadoImpresora => ({
    lista: true,
    sinPapel: false,
    enPausa: false,
    cabezalAbierto: false,
    etiquetasEnCola: 0,
    ...cambios,
});

describe("validarImpresora", () => {
    test("con los valores por defecto, código y host es válida", () => {
        expect(validarImpresora(valida)).toBe(true);
    });

    test("pide código y host", () => {
        expect(validarImpresora({ ...valida, codigo: " " })).toBe("El código es obligatorio");
        expect(validarImpresora({ ...valida, host: "" })).toBe("La dirección (host) es obligatoria");
    });

    test("el código admite 20 caracteres como máximo", () => {
        expect(validarImpresora({ ...valida, codigo: "X".repeat(21) })).toMatch(/20 caracteres/);
    });

    test("puerto entre 1 y 65535", () => {
        expect(validarImpresora({ ...valida, puerto: 0 })).toMatch(/puerto/);
        expect(validarImpresora({ ...valida, puerto: 70000 })).toMatch(/puerto/);
    });

    test("tamaño de etiqueta positivo y desplazamiento no negativo", () => {
        expect(validarImpresora({ ...valida, altoMm: 0 })).toMatch(/mayores que cero/);
        expect(validarImpresora({ ...valida, desplazamientoX: -1 })).toMatch(/negativo/);
    });
});

describe("textoEstadoImpresora", () => {
    test("lista, con o sin etiquetas en cola", () => {
        expect(textoEstadoImpresora(estado())).toBe("Lista");
        expect(textoEstadoImpresora(estado({ etiquetasEnCola: 2 }))).toBe("Lista (2 en cola)");
    });

    test("enumera lo que impide imprimir", () => {
        expect(textoEstadoImpresora(estado({ lista: false, sinPapel: true, cabezalAbierto: true })))
            .toBe("No puede imprimir: sin papel, cabezal abierto");
    });
});

import { describe, expect, it } from "vitest";
import { Limites, limitesDelRadio, mismaVista, RADIO_MAXIMO_KM, RADIO_MINIMO_KM, radioDeLimites, VistaMapa } from "./dominio.ts";

const zaragoza: VistaMapa = { centro: { latitud: 41.65, longitud: -0.88 }, radioKm: 20 };

describe("limitesDelRadio y radioDeLimites", () => {
    it("el radio de los límites de un radio es el mismo radio", () => {
        expect(radioDeLimites(zaragoza.centro, limitesDelRadio(zaragoza))).toBeCloseTo(20, 0);
    });

    it("los límites están centrados en el centro", () => {
        const [[oeste, sur], [este, norte]] = limitesDelRadio(zaragoza);
        expect((oeste + este) / 2).toBeCloseTo(zaragoza.centro.longitud, 6);
        expect((sur + norte) / 2).toBeCloseTo(zaragoza.centro.latitud, 6);
    });

    it("el radio usa el lado más corto de la vista", () => {
        const [[oeste, sur], [este, norte]] = limitesDelRadio(zaragoza);
        const apaisada: Limites = [
            [oeste - 1, sur],
            [este + 1, norte],
        ];
        expect(radioDeLimites(zaragoza.centro, apaisada)).toBeCloseTo(20, 0);
    });

    it("el radio se limita al mínimo y al máximo", () => {
        expect(radioDeLimites(zaragoza.centro, limitesDelRadio({ ...zaragoza, radioKm: 0.1 }))).toBe(RADIO_MINIMO_KM);
        expect(radioDeLimites(zaragoza.centro, limitesDelRadio({ ...zaragoza, radioKm: 900 }))).toBe(RADIO_MAXIMO_KM);
    });
});

describe("mismaVista", () => {
    it("no hay vista anterior", () => {
        expect(mismaVista(zaragoza, null)).toBe(false);
    });

    it("tolera el redondeo del radio", () => {
        expect(mismaVista(zaragoza, { ...zaragoza, radioKm: 20.2 })).toBe(true);
    });

    it("distingue un centro distinto", () => {
        expect(mismaVista(zaragoza, { ...zaragoza, centro: { latitud: 41.7, longitud: -0.88 } })).toBe(false);
    });
});

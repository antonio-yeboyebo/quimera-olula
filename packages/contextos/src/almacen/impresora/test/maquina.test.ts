import { procesarEvento } from "@olula/lib/dominio.ts";
import { describe, expect, test } from "vitest";
import { contextoDetalleImpresoraInicial } from "../detalle/detalle.ts";
import { ContextoDetalleImpresora, getMaquina } from "../detalle/maquina.ts";
import { impresoraVacia } from "../dominio.ts";

const abierto: ContextoDetalleImpresora = {
    ...contextoDetalleImpresoraInicial,
    estado: "ABIERTO",
    impresora: { ...impresoraVacia(), id: "PC45D", codigo: "PC45D", host: "10.0.0.1" },
};

const LISTA = { lista: true, sinPapel: false, enPausa: false, cabezalAbierto: false, etiquetasEnCola: 0 };

describe("detalle de impresora: comprobar estado", () => {
    test("pedir el estado pasa a COMPROBANDO_ESTADO", async () => {
        const [ctx] = await procesarEvento(getMaquina(), abierto, "estado_solicitado", undefined);
        expect(ctx.estado).toBe("COMPROBANDO_ESTADO");
    });

    test("el estado recibido se guarda y vuelve a ABIERTO", async () => {
        const comprobando = { ...abierto, estado: "COMPROBANDO_ESTADO" as const };
        const [ctx] = await procesarEvento(getMaquina(), comprobando, "estado_recibido", LISTA);
        expect(ctx.estado).toBe("ABIERTO");
        expect(ctx.estadoImpresora).toEqual(LISTA);
    });
});

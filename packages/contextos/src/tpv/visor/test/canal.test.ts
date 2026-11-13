import { afterEach, describe, expect, it } from "vitest";
import { MensajeVisor } from "../diseño.ts";
import { escucharVisor, publicarEnVisor, reiniciarCanalTpv } from "../canal.ts";
import { ventaVisor } from "./fixtures.ts";

const esperar = () => new Promise((r) => setTimeout(r, 50));

describe("canal del visor de cliente", () => {
    afterEach(() => reiniciarCanalTpv());

    it("el visor recibe lo que publica el TPV", async () => {
        const recibidos: MensajeVisor[] = [];
        const dejarDeEscuchar = escucharVisor((m) => recibidos.push(m));
        await esperar();

        publicarEnVisor({ tipo: "venta", venta: ventaVisor(), metodo: null });
        publicarEnVisor({ tipo: "limpiar" });
        await esperar();
        dejarDeEscuchar();

        expect(recibidos.map((m) => m.tipo)).toContain("venta");
        expect(recibidos.at(-1)?.tipo).toBe("limpiar");
    });

    it("un visor abierto a mitad de venta recibe el estado del TPV", async () => {
        publicarEnVisor({ tipo: "venta", venta: ventaVisor(), metodo: "tarjeta" });

        const recibidos: MensajeVisor[] = [];
        const dejarDeEscuchar = escucharVisor((m) => recibidos.push(m));
        await esperar();
        dejarDeEscuchar();

        const estado = recibidos.find((m) => m.tipo === "estado");
        expect(estado?.tipo === "estado" && estado.estado.venta?.id).toBe("v1");
        expect(estado?.tipo === "estado" && estado.estado.cobro?.metodo).toBe("tarjeta");
    });
});

import { describe, test, expect } from "vitest";
import { consultaAApi } from "#/asistente/infraestructura.ts";
import type { ConsultaIa } from "#/asistente/diseño.ts";

// ---------------------------------------------------------------------------
// [asistente-infra-01] consultaAApi mapea ConsultaIa (camelCase) al body snake_case de la API
// ---------------------------------------------------------------------------

describe("[asistente-infra-01] consultaAApi mapea ConsultaIa al body snake_case de la API", () => {
    test("mapea pregunta y thread_id en el primer mensaje de un thread", () => {
        const consulta: ConsultaIa = { pregunta: "Crea un pedido", threadId: null };
        expect(consultaAApi(consulta)).toEqual({
            pregunta: "Crea un pedido",
            thread_id: null,
        });
    });

    test("incluye capacidades completas cuando se informan", () => {
        const consulta: ConsultaIa = {
            pregunta: "Crea un pedido",
            threadId: null,
            capacidades: [{ ruta: "/ventas/pedido", nombre: "Pedidos", descripcion: "Gestiona pedidos" }],
        };
        expect(consultaAApi(consulta)).toEqual({
            pregunta: "Crea un pedido",
            thread_id: null,
            capacidades: [{ ruta: "/ventas/pedido", nombre: "Pedidos", descripcion: "Gestiona pedidos" }],
        });
    });

    test("incluye capacidades_hash en vez de capacidades en mensajes siguientes", () => {
        const consulta: ConsultaIa = {
            pregunta: "Añade una línea",
            threadId: "thread-1",
            capacidadesHash: "1a2b3c",
        };
        const body = consultaAApi(consulta) as Record<string, unknown>;
        expect(body.capacidades_hash).toBe("1a2b3c");
        expect(body.capacidades).toBeUndefined();
    });

    test("mapea contexto_app cuando se informa", () => {
        const consulta: ConsultaIa = {
            pregunta: "Crea un pedido",
            threadId: null,
            contextoApp: { rutaActual: "/ventas/cliente/123", app: "olula" },
        };
        expect(consultaAApi(consulta)).toEqual({
            pregunta: "Crea un pedido",
            thread_id: null,
            contexto_app: { ruta_actual: "/ventas/cliente/123", app: "olula" },
        });
    });
});

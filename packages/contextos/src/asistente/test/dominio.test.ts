import { describe, test, expect, vi } from "vitest";
import { ElementoMenu } from "@olula/lib/menu.ts";
import {
    accionNavegacionConNombreCorto,
    construirCapacidades,
    construirUrlNavegacion,
    hiloDesdeApi,
    mensajesHiloDesdeApi,
    normalizarRespuestaIa,
    adjuntoHiloDesdeApi,
    adjuntosParaEnviar,
    eventoStreamDesdeApi,
} from "#/asistente/dominio.ts";

vi.mock("@olula/lib/dominio.ts", () => ({
    puede: (regla: string) => regla !== "ventas.factura.leer",
}));

// ---------------------------------------------------------------------------
// [asistente-dom-01] construirCapacidades filtra por descripcionIA y permiso
// ---------------------------------------------------------------------------

describe("[asistente-dom-01] construirCapacidades filtra por descripcionIA y permiso", () => {
    const menu: ElementoMenu[] = [
        {
            nombre: "Ventas",
            subelementos: [
                {
                    nombre: "Pedidos",
                    url: "/ventas/pedido",
                    regla: "ventas.pedido.leer",
                    descripcionIA: "Gestiona pedidos de venta",
                    parametrosIA: { cliente_id: "id del cliente" },
                },
                {
                    nombre: "Clientes",
                    url: "/ventas/cliente",
                    regla: "ventas.cliente.leer",
                },
                {
                    nombre: "Facturas",
                    url: "/ventas/factura",
                    regla: "ventas.factura.leer",
                    descripcionIA: "Gestiona facturas de venta",
                },
            ],
        },
    ];

    test("incluye solo las hojas con descripcionIA", () => {
        const capacidades = construirCapacidades(menu);
        expect(capacidades.map(c => c.ruta)).toEqual(["/ventas/pedido"]);
    });

    test("mapea descripcion y parametros correctamente", () => {
        const capacidades = construirCapacidades(menu);
        expect(capacidades[0]).toEqual({
            ruta: "/ventas/pedido",
            nombre: "Pedidos",
            descripcion: "Gestiona pedidos de venta",
            parametros: { cliente_id: "id del cliente" },
            regla: "ventas.pedido.leer",
        });
    });

    test("excluye rutas con descripcionIA si el usuario no tiene permiso", () => {
        const capacidades = construirCapacidades(menu);
        expect(capacidades.some(c => c.ruta === "/ventas/factura")).toBe(false);
    });
});

// ---------------------------------------------------------------------------
// [asistente-dom-03] normalizarRespuestaIa aplica valores por defecto
// ---------------------------------------------------------------------------

describe("[asistente-dom-03] normalizarRespuestaIa normaliza la respuesta cruda del backend", () => {
    test("rellena defaults cuando faltan campos opcionales", () => {
        const respuesta = normalizarRespuestaIa({ respuesta: "Hola", thread_id: "t-1" });
        expect(respuesta).toEqual({
            respuesta: "Hola",
            threadId: "t-1",
            a2uiMessages: [],
            capacidadesHash: null,
            necesitaCapacidades: false,
            accionNavegacion: null,
            adjuntos: [],
        });
    });

    test("preserva accion_navegacion y a2ui_messages cuando vienen informados", () => {
        const respuesta = normalizarRespuestaIa({
            respuesta: "Abro el pedido",
            thread_id: "t-2",
            a2ui_messages: [{ tipo: "surface" }],
            necesita_capacidades: true,
            accion_navegacion: { ruta: "/ventas/pedido", parametros: { cliente_id: "C001" } },
        });
        expect(respuesta.a2uiMessages).toEqual([{ tipo: "surface" }]);
        expect(respuesta.necesitaCapacidades).toBe(true);
        expect(respuesta.accionNavegacion).toEqual({ ruta: "/ventas/pedido", parametros: { cliente_id: "C001" } });
    });

    test("guarda tal cual el capacidades_hash calculado por el servidor", () => {
        const respuesta = normalizarRespuestaIa({
            respuesta: "Hola",
            thread_id: "t-3",
            capacidades_hash: "abc123",
        });
        expect(respuesta.capacidadesHash).toBe("abc123");
    });
});

// ---------------------------------------------------------------------------
// [asistente-dom-04] construirUrlNavegacion añade los parámetros como querystring
// ---------------------------------------------------------------------------

describe("[asistente-dom-04] construirUrlNavegacion añade los parámetros como querystring", () => {
    test("devuelve solo la ruta si no hay parámetros", () => {
        expect(construirUrlNavegacion({ ruta: "/ventas/pedido" })).toBe("/ventas/pedido");
    });

    test("devuelve solo la ruta si los parámetros están vacíos", () => {
        expect(construirUrlNavegacion({ ruta: "/ventas/pedido", parametros: {} })).toBe("/ventas/pedido");
    });

    test("añade los parámetros como querystring", () => {
        expect(construirUrlNavegacion({ ruta: "/ventas/pedido", parametros: { cliente_id: "C001" } }))
            .toBe("/ventas/pedido?cliente_id=C001");
    });

    test("descarta cualquier querystring que ya venga en la ruta (el LLM puede inventarse un placeholder)", () => {
        // Reproduce el bug real: el LLM generó enlaceFila.ruta="/ventas/pedido?id={id}",
        // y al concatenar el querystring propio (?id=13) el resultado era
        // "/ventas/pedido?id={id}?id=13" — todo eso se interpretaba como un único
        // parámetro "id" con valor literal "{id}?id=13".
        expect(construirUrlNavegacion({ ruta: "/ventas/pedido?id={id}", parametros: { id: "13" } }))
            .toBe("/ventas/pedido?id=13");
    });
});

// ---------------------------------------------------------------------------
// [asistente-dom-05] accionNavegacionConNombreCorto usa el nombre de la capacidad local
// ---------------------------------------------------------------------------

describe("[asistente-dom-05] accionNavegacionConNombreCorto usa el nombre de la capacidad local", () => {
    const capacidades = [
        {
            ruta: "/ventas/pedido",
            nombre: "Pedidos",
            descripcion: "Gestiona pedidos de venta: crear un pedido nuevo para un cliente con líneas de artículos.",
        },
    ];

    test("sobreescribe la descripción larga que devuelve el backend con el nombre corto local", () => {
        const accion = { ruta: "/ventas/pedido", parametros: {}, descripcion: "Gestiona pedidos de venta: ..." };
        expect(accionNavegacionConNombreCorto(accion, capacidades)).toEqual({
            ruta: "/ventas/pedido",
            parametros: {},
            descripcion: "Pedidos",
        });
    });

    test("ignora el querystring que el LLM pueda haber inventado en la ruta al buscar la capacidad", () => {
        const accion = { ruta: "/ventas/pedido?id={id}", descripcion: "lo que sea" };
        expect(accionNavegacionConNombreCorto(accion, capacidades).descripcion).toBe("Pedidos");
    });

    test("conserva la descripción del backend si la ruta no coincide con ninguna capacidad local", () => {
        const accion = { ruta: "/otra/ruta", descripcion: "Descripción del backend" };
        expect(accionNavegacionConNombreCorto(accion, capacidades)).toEqual(accion);
    });
});

// ---------------------------------------------------------------------------
// [asistente-dom-05] hiloDesdeApi / mensajesHiloDesdeApi mapean la respuesta del historial
// ---------------------------------------------------------------------------

describe("[asistente-dom-05] hiloDesdeApi mapea un hilo (snake_case) a camelCase", () => {
    test("mapea thread_id, titulo y actualizado_en", () => {
        expect(hiloDesdeApi({ thread_id: "t-1", titulo: "Pedido de Acme", actualizado_en: "2026-01-01T00:00:00Z" }))
            .toEqual({ threadId: "t-1", titulo: "Pedido de Acme", actualizadoEn: "2026-01-01T00:00:00Z" });
    });
});

describe("[asistente-dom-06] mensajesHiloDesdeApi mapea los mensajes reconstruidos de un hilo", () => {
    test("mapea thread_id y la lista de mensajes con sus bloques a2ui", () => {
        const resultado = mensajesHiloDesdeApi({
            thread_id: "t-1",
            mensajes: [
                { id: "t-1-0-u", rol: "user", texto: "Busca el cliente Acme", a2ui_messages: [] },
                { id: "t-1-0-a", rol: "assistant", texto: "Aquí lo tienes", a2ui_messages: [{ createSurface: {} }] },
            ],
        });
        expect(resultado).toEqual({
            threadId: "t-1",
            mensajes: [
                { id: "t-1-0-u", rol: "user", texto: "Busca el cliente Acme", a2uiMessages: [], adjuntos: [] },
                {
                    id: "t-1-0-a", rol: "assistant", texto: "Aquí lo tienes",
                    a2uiMessages: [{ createSurface: {} }], adjuntos: [],
                },
            ],
        });
    });

    test("devuelve una lista vacía si no hay mensajes", () => {
        expect(mensajesHiloDesdeApi({ thread_id: "t-2" })).toEqual({ threadId: "t-2", mensajes: [] });
    });

    test("mapea los adjuntos de un mensaje reconstruido", () => {
        const resultado = mensajesHiloDesdeApi({
            thread_id: "t-3",
            mensajes: [{
                id: "t-3-0-u", rol: "user", texto: "crea el pedido", a2ui_messages: [],
                adjuntos: [{ id: "adj-1", nombre: "pedido.xlsx", tipo_mime: "application/vnd.ms-excel" }],
            }],
        });
        expect(resultado.mensajes[0].adjuntos).toEqual([
            { id: "adj-1", nombre: "pedido.xlsx", tipoMime: "application/vnd.ms-excel" },
        ]);
    });
});

// ---------------------------------------------------------------------------
// [asistente-dom-07] adjuntoHiloDesdeApi / normalizarRespuestaIa mapean adjuntos
// ---------------------------------------------------------------------------

describe("[asistente-dom-07] adjuntoHiloDesdeApi mapea metadatos de adjunto (snake_case) a camelCase", () => {
    test("mapea id, nombre y tipo_mime", () => {
        expect(adjuntoHiloDesdeApi({ id: "adj-1", nombre: "nota.mp3", tipo_mime: "audio/mp3" }))
            .toEqual({ id: "adj-1", nombre: "nota.mp3", tipoMime: "audio/mp3" });
    });
});

describe("[asistente-dom-08] normalizarRespuestaIa mapea los adjuntos del turno", () => {
    test("mapea la lista de adjuntos cuando viene informada", () => {
        const respuesta = normalizarRespuestaIa({
            respuesta: "Aquí tienes tu pedido.",
            thread_id: "t-4",
            adjuntos: [{ id: "adj-1", nombre: "nota.mp3", tipo_mime: "audio/mp3" }],
        });
        expect(respuesta.adjuntos).toEqual([{ id: "adj-1", nombre: "nota.mp3", tipoMime: "audio/mp3" }]);
    });
});

describe("[asistente-dom-09] adjuntosParaEnviar prepara los adjuntos locales para ConsultaIa", () => {
    test("undefined si no hay adjuntos", () => {
        expect(adjuntosParaEnviar(undefined)).toBeUndefined();
        expect(adjuntosParaEnviar([])).toBeUndefined();
    });

    test("mapea nombre/tipoMime/datosBase64, descartando el id local", () => {
        const resultado = adjuntosParaEnviar([
            { id: "temp-1", nombre: "nota.mp3", tipoMime: "audio/mp3", datosBase64: "QUJD" },
        ]);
        expect(resultado).toEqual([{ nombre: "nota.mp3", tipoMime: "audio/mp3", datosBase64: "QUJD" }]);
    });

    test("descarta adjuntos sin datosBase64 en vez de mandarlos incompletos", () => {
        const resultado = adjuntosParaEnviar([{ nombre: "nota.mp3", tipoMime: "audio/mp3" }]);
        expect(resultado).toBeUndefined();
    });
});

// ---------------------------------------------------------------------------
// [asistente-dom-10] eventoStreamDesdeApi mapea los eventos SSE del streaming
// ---------------------------------------------------------------------------

describe("[asistente-dom-10] eventoStreamDesdeApi mapea los eventos SSE (snake_case) a camelCase", () => {
    test("mapea un evento delta", () => {
        expect(eventoStreamDesdeApi({ tipo: "delta", contenido: "Hola" }))
            .toEqual({ tipo: "delta", contenido: "Hola" });
    });

    test("mapea un evento fin sin adjuntos", () => {
        expect(eventoStreamDesdeApi({ tipo: "fin", thread_id: "t-1", necesita_capacidades: false }))
            .toEqual({ tipo: "fin", threadId: "t-1", necesitaCapacidades: false, adjuntos: [] });
    });

    test("mapea los adjuntos persistidos que llegan en el evento fin", () => {
        const evento = eventoStreamDesdeApi({
            tipo: "fin",
            thread_id: "t-1",
            necesita_capacidades: false,
            adjuntos: [{ id: "adj-1", nombre: "nota.mp3", tipo_mime: "audio/mp3" }],
        });
        expect(evento).toEqual({
            tipo: "fin",
            threadId: "t-1",
            necesitaCapacidades: false,
            adjuntos: [{ id: "adj-1", nombre: "nota.mp3", tipoMime: "audio/mp3" }],
        });
    });

    test("mapea necesita_capacidades cuando el hash no se reconoce", () => {
        const evento = eventoStreamDesdeApi({ tipo: "fin", thread_id: "t-2", necesita_capacidades: true });
        expect(evento).toEqual({ tipo: "fin", threadId: "t-2", necesitaCapacidades: true, adjuntos: [] });
    });

    test("mapea un evento error con el mensaje por defecto si falta contenido", () => {
        expect(eventoStreamDesdeApi({ tipo: "error" }))
            .toEqual({ tipo: "error", contenido: "Error desconocido del asistente" });
    });
});

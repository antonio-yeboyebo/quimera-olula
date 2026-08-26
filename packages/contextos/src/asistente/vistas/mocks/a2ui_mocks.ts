/**
 * Fixtures a2ui v0.9 + respuestas del asistente, para desarrollar y probar el
 * widget sin depender del backend externo. Se activan con VITE_ASISTENTE_MOCK=true.
 *
 * Formato real del protocolo v0.9 (ver https://a2ui.org/specification/v0.9-a2ui/):
 *   - "component" (no "type") lleva el nombre del componente.
 *   - Las propiedades van directamente en el objeto (no dentro de "properties").
 *   - Card y Button tienen "child" (singular), Column/Row/List tienen "children".
 *   - Data binding: { path: "/ruta/en/el/modelo" }.
 */
import { ConsultaIa, RespuestaIa } from "#/asistente/diseño.ts";

const BASIC_CATALOG_ID = "https://a2ui.org/specification/v0_9/basic_catalog.json";

// ---------------------------------------------------------------------------
// Surface: lista de artículos
// ---------------------------------------------------------------------------

const MOCK_MESSAGES_ARTICULOS: unknown[] = [
    { version: "v0.9", deleteSurface: { surfaceId: "articulos" } },
    { version: "v0.9", createSurface: { surfaceId: "articulos", catalogId: BASIC_CATALOG_ID } },
    {
        version: "v0.9",
        updateComponents: {
            surfaceId: "articulos",
            components: [
                { id: "root", component: "Column", children: ["titulo", "lista"] },
                { id: "titulo", component: "Text", text: "Artículos disponibles", variant: "h2" },
                { id: "lista", component: "List", children: { componentId: "fila-item", path: "/articulos" } },
                { id: "fila-item", component: "Row", children: ["item-nombre"] },
                { id: "item-nombre", component: "Text", text: { path: "nombre" } },
            ],
        },
    },
    {
        version: "v0.9",
        updateDataModel: {
            surfaceId: "articulos",
            path: "/",
            value: {
                articulos: [
                    { id: "A001", nombre: "Tornillo M6 x 20mm" },
                    { id: "A002", nombre: "Arandela plana M6" },
                    { id: "A003", nombre: "Tuerca hexagonal M6" },
                ],
            },
        },
    },
];

// ---------------------------------------------------------------------------
// Surface: listado de clientes (componente real Tabla, con enlaceFila para probar
// la navegación por click en fila sin ir al backend)
// ---------------------------------------------------------------------------

const MOCK_MESSAGES_CLIENTES: unknown[] = [
    { version: "v0.9", deleteSurface: { surfaceId: "clientes" } },
    { version: "v0.9", createSurface: { surfaceId: "clientes", catalogId: BASIC_CATALOG_ID } },
    {
        version: "v0.9",
        updateComponents: {
            surfaceId: "clientes",
            components: [
                { id: "root", component: "Column", children: ["titulo", "tabla"] },
                { id: "titulo", component: "Text", text: "Se encontraron 2 clientes.", variant: "h2" },
                {
                    id: "tabla",
                    component: "Tabla",
                    columnas: [
                        { id: "nombre", cabecera: "Nombre", prioridad: "alta" },
                        { id: "id", cabecera: "ID", prioridad: "media" },
                    ],
                    filas: [
                        { id: "C001", nombre: "Acme S.L." },
                        { id: "C002", nombre: "Grupo Gallart S.Coop." },
                    ],
                    enlaceFila: { ruta: "/ventas/cliente" },
                },
            ],
        },
    },
];

// ---------------------------------------------------------------------------
// Surface: confirmación genérica (no acoplada a ningún dominio concreto)
// ---------------------------------------------------------------------------

const MOCK_MESSAGES_CONFIRMACION: unknown[] = [
    { version: "v0.9", deleteSurface: { surfaceId: "confirmacion" } },
    { version: "v0.9", createSurface: { surfaceId: "confirmacion", catalogId: BASIC_CATALOG_ID } },
    {
        version: "v0.9",
        updateComponents: {
            surfaceId: "confirmacion",
            components: [
                {
                    id: "root",
                    component: "TarjetaConfirmacion",
                    titulo: "¿Confirmar la creación del pedido?",
                    detalles: [
                        { etiqueta: "Cliente", valor: "Acme S.L." },
                        { etiqueta: "Artículo", valor: "Tornillo M6 x 20mm" },
                        { etiqueta: "Cantidad", valor: "10" },
                    ],
                    accionConfirmar: { event: { name: "confirm", context: { value: true } } },
                    accionCancelar: { event: { name: "confirm", context: { value: false } } },
                },
            ],
        },
    },
];

// ---------------------------------------------------------------------------
// Helper: respuesta simulada según el texto del usuario
// ---------------------------------------------------------------------------

const generarThreadId = () => `mock-${Math.random().toString(36).slice(2, 10)}`;

// Simula el hash que en producción calcula el servidor: si llegan "capacidades" completas,
// se emite un hash mock nuevo (el cliente lo guardará y lo reenviará); si llega un
// "capacidadesHash" ya conocido, se echoa tal cual (simulando que sigue siendo válido).
const resolverCapacidadesHash = (consulta: ConsultaIa): string | null =>
    consulta.capacidadesHash ?? (consulta.capacidades ? `mock-hash-${consulta.capacidades.length}` : null);

export const getMockRespuestaIa = (consulta: ConsultaIa): RespuestaIa => {
    const texto = consulta.pregunta.toLowerCase();
    const threadId = consulta.threadId ?? generarThreadId();
    const capacidadesHash = resolverCapacidadesHash(consulta);

    if (texto.includes("artículo") || texto.includes("articulo") || texto.includes("catálogo") || texto.includes("catalogo")) {
        return {
            respuesta: "Aquí tienes los artículos disponibles.",
            threadId,
            a2uiMessages: MOCK_MESSAGES_ARTICULOS,
            capacidadesHash,
            necesitaCapacidades: false,
            accionNavegacion: null,
            adjuntos: [],
        };
    }

    if (texto.includes("cliente")) {
        return {
            respuesta: "Aquí tienes los clientes encontrados.",
            threadId,
            a2uiMessages: MOCK_MESSAGES_CLIENTES,
            capacidadesHash,
            necesitaCapacidades: false,
            accionNavegacion: null,
            adjuntos: [],
        };
    }

    if (texto.includes("confirmar")) {
        return {
            respuesta: "Antes de continuar, confírmame lo siguiente.",
            threadId,
            a2uiMessages: MOCK_MESSAGES_CONFIRMACION,
            capacidadesHash,
            necesitaCapacidades: false,
            accionNavegacion: null,
            adjuntos: [],
        };
    }

    if (texto.includes("pedido")) {
        return {
            respuesta: "Puedo hacerlo desde el formulario de pedidos — pulsa el botón para ir allí.",
            threadId,
            a2uiMessages: [],
            capacidadesHash,
            necesitaCapacidades: false,
            accionNavegacion: { ruta: "/ventas/pedido", parametros: {}, descripcion: "Pedidos" },
            adjuntos: [],
        };
    }

    return {
        respuesta: "Entendido. Estoy en modo demo (VITE_ASISTENTE_MOCK=true) — prueba a pedirme clientes, un artículo, un pedido o una confirmación.",
        threadId,
        a2uiMessages: [],
        capacidadesHash,
        necesitaCapacidades: false,
        accionNavegacion: null,
        adjuntos: [],
    };
};

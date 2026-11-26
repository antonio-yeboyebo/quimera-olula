import { fichaAApi, fichaNueva, metaFichaInforme } from "#/comun/informe_documentos/dominio.ts";
import { FichaInforme } from "#/comun/informe_documentos/diseño.ts";
import { describe, expect, test } from "vitest";
import { albaranes, facturas, pedidos, pestañasVentas, presupuestos } from "../pestañas.tsx";

const PRESUPUESTOS = presupuestos();
const PEDIDOS = pedidos();
const ALBARANES = albaranes();
const FACTURAS = facturas();
const PESTAÑAS_VENTAS = pestañasVentas();

const ids = (filas: { id: string }[][]) => filas.flat().map((campo) => campo.id);

const COMUNES = [
    "codigo_desde",
    "codigo_hasta",
    "ejercicio_id",
    "intervalo",
    "fecha_desde",
    "fecha_hasta",
    "cliente_id",
    "agente_id",
    "orden1",
    "tipo_orden1",
    "orden2",
    "tipo_orden2",
];

describe("pestañas de Ventas > Informes", () => {
    test("cada pestaña con su API", () => {
        PESTAÑAS_VENTAS.forEach((pestaña) => {
            expect(pestaña.url).toBe(`/ventas/informe/${pestaña.clave}`);
        });
    });

    test("todas tienen los criterios comunes de i_*cli", () => {
        PESTAÑAS_VENTAS.forEach((pestaña) => {
            expect(ids(pestaña.filas)).toEqual(expect.arrayContaining(COMUNES));
        });
    });

    test("presupuestos: pendiente de aprobar", () => {
        expect(ids(PRESUPUESTOS.filas)).toContain("pte_aprobar");
        expect(PRESUPUESTOS.inicial.pte_aprobar).toBe("Todos");
    });

    test("pedidos: servido, serie, referencia y líneas", () => {
        expect(ids(PEDIDOS.filas)).toEqual(
            expect.arrayContaining(["servido", "serie_id", "referencia", "mostrar_lineas", "solo_pendientes"])
        );
    });

    test("albaranes: pendiente de facturar", () => {
        expect(ids(ALBARANES.filas)).toContain("pte_factura");
    });

    test("facturas: los criterios de i_facturascli", () => {
        expect(ids(FACTURAS.filas)).toEqual(
            expect.arrayContaining([
                "grupo_cliente_id",
                "pte_pago",
                "serie_id",
                "de_abono",
                "filtrar_importes",
                "incluir_borradores",
                "importe_desde",
                "importe_hasta",
                "acumulado",
                "orden_acumulado",
                "limite_acumulado",
                "regimen_iva",
                "tipo_informe",
            ])
        );
    });

    test("facturas arranca con los valores por defecto del mtd", () => {
        const api = fichaAApi(FACTURAS, { ...fichaNueva(FACTURAS), descripcion: "F" });
        expect(api.tipo_informe).toBe("Moneda original");
        expect(api.orden_acumulado).toBe("DESC");
        expect(api.regimen_iva).toBe("Todos");
        expect(api.acumulado).toBe(false);
        expect(api.intervalo).toBeNull();
    });

    test("sin «Filtrar por importe» se vacían los importes", () => {
        const meta = metaFichaInforme<FichaInforme>(FACTURAS);
        const ficha = { ...fichaNueva(FACTURAS), filtrar_importes: false, importe_desde: "10", importe_hasta: "20" };
        const ajustada = meta.onChange!(ficha, "filtrar_importes", true);
        expect(ajustada.importe_desde).toBe("");
        expect(ajustada.importe_hasta).toBe("");
    });

    test("los importes solo se editan con «Filtrar por importe»", () => {
        const campo = FACTURAS.filas.flat().find((c) => c.id === "importe_desde")!;
        expect(campo.activo!({ ...fichaNueva(FACTURAS), filtrar_importes: false })).toBe(false);
        expect(campo.activo!({ ...fichaNueva(FACTURAS), filtrar_importes: true })).toBe(true);
    });
});

describe("Ventas > Informes en inglés", () => {
    test("etiquetas traducidas y valores de la API en español", async () => {
        const { cambiarIdioma } = await import("@olula/lib/i18n/i18n.ts");
        await cambiarIdioma("en");
        try {
            const pedidosEn = pedidos();
            expect(pedidosEn.titulo).toBe("Orders");
            const servido = pedidosEn.filas.flat().find((c) => c.id === "servido")!;
            expect(servido.label).toBe("Delivered");
            expect(servido.opciones).toContainEqual({ valor: "Sí", descripcion: "Yes" });
            const desde = pedidosEn.filas.flat().find((c) => c.id === "codigo_desde")!;
            expect(desde.label).toBe("From order No.");
        } finally {
            await cambiarIdioma("es");
        }
    });
});

import {
    AlbaranCandidato,
    FacturaLeida,
    LineaFacturaLeida,
    LineaPropuesta,
    PropuestaImportacion,
} from "#/compras/factura/vistas/validar_importacion/diseño.ts";
import {
    alternarAlbaran,
    articuloConProveedorDesdeFormulario,
    cambiarLinea,
    diferenciaPrecio,
    estadoTotal,
    etiquetaAlerta,
    etiquetaAlertaLinea,
    formatearCantidad,
    formatearDescuento,
    formatearImporte,
    formatearPrecio,
    motivosNoConfirmable,
    nuevoArticuloDesdeLinea,
    puedeConfirmar,
    resumenImportacion,
    textoAlbaranLinea,
    tipoFichero,
} from "#/compras/factura/vistas/validar_importacion/dominio.ts";
import { describe, expect, test } from "vitest";

const linea = (cambios: Partial<LineaFacturaLeida> = {}): LineaFacturaLeida => ({
    articuloId: "A1",
    descripcion: "Tornillo",
    cantidad: "2",
    precioUnitario: "1.5",
    descuento: null,
    refProveedor: "RP1",
    refArticulo: null,
    tipoIva: null,
    albaranLineaId: null,
    ...cambios,
});

const leida = (cambios: Partial<FacturaLeida> = {}): FacturaLeida => ({
    proveedorId: "P1",
    proveedorNombre: "Prov",
    numeroProveedor: "F-1",
    fecha: "2025-01-01",
    total: "3.00",
    lineas: [linea()],
    camposFaltantes: [],
    ficheroOrigen: null,
    ...cambios,
});

const albaran = (id: string, cambios: Partial<AlbaranCandidato> = {}): AlbaranCandidato => ({
    id,
    codigo: `ALB-${id}`,
    fecha: "2025-01-01",
    total: 3,
    lineas: [
        { id: `${id}-1`, articuloId: "A1", descripcion: "Tornillo", cantidad: 2, precio: 1.5, lineaFactura: 0 },
    ],
    cobertura: 1,
    coincide: true,
    seleccionado: false,
    ...cambios,
});

const propuesta = (cambios: Partial<PropuestaImportacion> = {}): PropuestaImportacion => ({
    facturaLeida: leida(),
    totalLeido: 3,
    totalCalculado: 3,
    totalTeorico: 3,
    lineas: [],
    albaranes: [],
    alertas: [],
    modoDatosContables: "subcuenta",
    opcionesDatosContables: [],
    cuentaEspecialCompras: null,
    ...cambios,
});

describe("puedeConfirmar", () => {
    test("factura completa y sin alertas se puede confirmar", () => {
        expect(puedeConfirmar(leida(), propuesta())).toBe(true);
    });

    test("sin propuesta no se puede", () => {
        expect(puedeConfirmar(leida(), null)).toBe(false);
    });

    test("exige proveedor", () => {
        expect(puedeConfirmar(leida({ proveedorId: null }), propuesta())).toBe(false);
        expect(puedeConfirmar(leida({ proveedorId: " " }), propuesta())).toBe(false);
    });

    test("exige al menos una línea", () => {
        expect(puedeConfirmar(leida({ lineas: [] }), propuesta())).toBe(false);
    });

    test("cada línea necesita descripción y cantidad", () => {
        expect(puedeConfirmar(leida({ lineas: [linea({ descripcion: "" })] }), propuesta())).toBe(false);
        expect(puedeConfirmar(leida({ lineas: [linea({ cantidad: null })] }), propuesta())).toBe(false);
    });

    test("una línea sin artículo necesita precio", () => {
        const sinPrecio = linea({ articuloId: null, precioUnitario: null });
        expect(puedeConfirmar(leida({ lineas: [sinPrecio] }), propuesta())).toBe(false);
        const conPrecio = linea({ articuloId: null, precioUnitario: "2" });
        expect(puedeConfirmar(leida({ lineas: [conPrecio] }), propuesta())).toBe(true);
    });

    test("con artículo no hace falta precio", () => {
        expect(puedeConfirmar(leida({ lineas: [linea({ precioUnitario: null })] }), propuesta())).toBe(true);
    });

    test("total discordante exige aceptar la diferencia", () => {
        const p = propuesta({ alertas: ["total_discordante"] });
        expect(puedeConfirmar(leida(), p)).toBe(false);
        expect(puedeConfirmar(leida({ aceptarTotalDiscordante: false }), p)).toBe(false);
        expect(puedeConfirmar(leida({ aceptarTotalDiscordante: true }), p)).toBe(true);
    });

    test("no admite albaranes seleccionados que no coinciden", () => {
        const p = propuesta({ albaranes: [albaran("1", { seleccionado: true, coincide: false })] });
        expect(puedeConfirmar(leida(), p)).toBe(false);
    });

    test("con albaranes, toda línea debe venir de un albarán", () => {
        const p = propuesta({
            albaranes: [albaran("1", { seleccionado: true, coincide: true })],
            lineas: [{ indice: 1, alertas: ["sin_albaran"] } as LineaPropuesta],
        });
        expect(motivosNoConfirmable(leida(), p)).toContain(
            "Línea 2: no viene de ningún albarán seleccionado",
        );
    });

    test("los motivos son legibles", () => {
        expect(motivosNoConfirmable(leida({ proveedorId: null }), propuesta())).toContain("Falta el proveedor");
    });
});

describe("albaranes", () => {
    const albaranes = [albaran("1", { seleccionado: true }), albaran("2")];

    test("marcar añade a la selección existente", () => {
        expect(alternarAlbaran(albaranes, "2", true)).toEqual(["1", "2"]);
    });

    test("desmarcar quita solo ese", () => {
        expect(alternarAlbaran(albaranes, "1", false)).toEqual([]);
    });

    test("texto de la línea de albarán enlazada", () => {
        expect(textoAlbaranLinea(albaranes, "2-1")).toBe("ALB-2 · Tornillo");
        expect(textoAlbaranLinea(albaranes, null)).toBe("");
        expect(textoAlbaranLinea(albaranes, "x")).toBe("");
    });
});

describe("líneas y precios", () => {
    const lp = (precioLeido: number | null, precioTeorico: number | null) =>
        ({ precioLeido, precioTeorico }) as LineaPropuesta;

    test("diferencia de precio", () => {
        expect(diferenciaPrecio(lp(1.5, 1.2))).toBe(0.3);
        expect(diferenciaPrecio(lp(null, 1.2))).toBeNull();
        expect(diferenciaPrecio(lp(1, null))).toBeNull();
    });

    test("cambiarLinea solo modifica la línea indicada", () => {
        const f = leida({ lineas: [linea(), linea({ descripcion: "Otra" })] });
        const r = cambiarLinea(f, 1, { articuloId: "Z" });
        expect(r.lineas[0]).toEqual(f.lineas[0]);
        expect(r.lineas[1].articuloId).toBe("Z");
        expect(r.lineas[1].descripcion).toBe("Otra");
    });
});

describe("etiquetas", () => {
    test("alertas conocidas y desconocidas", () => {
        expect(etiquetaAlerta("sin_proveedor")).toBe("Falta el proveedor");
        expect(etiquetaAlerta("rara")).toBe("rara");
        expect(etiquetaAlertaLinea("sin_articulo")).toBe("Sin artículo");
    });
});

describe("artículo nuevo desde línea", () => {
    test("la referencia prefiere refArticulo sobre refProveedor", () => {
        expect(nuevoArticuloDesdeLinea(linea({ refArticulo: "RA" })).referencia).toBe("RA");
        expect(nuevoArticuloDesdeLinea(linea()).referencia).toBe("RP1");
    });

    test("coste igual al precio por defecto, 0 si se desmarca", () => {
        const l = linea({ precioUnitario: "2.5" });
        const nuevo = { ...nuevoArticuloDesdeLinea(l), grupoIvaProductoId: "G" };
        expect(articuloConProveedorDesdeFormulario(nuevo, l, "P1").coste).toBe(2.5);
        expect(
            articuloConProveedorDesdeFormulario({ ...nuevo, costeIgualPrecio: false }, l, "P1").coste
        ).toBe(0);
    });

    test("dato contable vacío se envía como null", () => {
        const l = linea();
        const nuevo = { ...nuevoArticuloDesdeLinea(l), grupoIvaProductoId: "G" };
        const a = articuloConProveedorDesdeFormulario(nuevo, l, "P1");
        expect(a.datoContable).toBeNull();
        expect(a.refProveedor).toBe("RP1");
        expect(a.proveedorId).toBe("P1");
    });
});

describe("formato local de importes", () => {
    test("importe en moneda con formato español", () => {
        expect(formatearImporte(12345.5)).toMatch(/^12\.345,50\s€$/);
    });

    test("precio con cuatro decimales, como el input", () => {
        expect(formatearPrecio(8.5)).toBe("8,5000");
    });

    test("cantidad con dos decimales y descuento con porcentaje", () => {
        expect(formatearCantidad(3)).toBe("3,00");
        expect(formatearDescuento(10)).toBe("10,00 %");
    });

    test("sin valor se muestra un guion", () => {
        expect(formatearImporte(null)).toBe("—");
        expect(formatearPrecio("")).toBe("—");
        expect(formatearCantidad(undefined)).toBe("—");
    });
});

describe("total frente al leído", () => {
    test("cuadra dentro de la tolerancia", () => {
        expect(estadoTotal(100, 100.01)).toBe("ok");
    });

    test("no cuadra", () => {
        expect(estadoTotal(100, 99)).toBe("error");
    });

    test("sin alguno de los dos no hay estado", () => {
        expect(estadoTotal(null, 100)).toBeNull();
        expect(estadoTotal(100, null)).toBeNull();
    });
});

describe("tipo del fichero original", () => {
    test("por tipo MIME", () => {
        expect(tipoFichero("application/pdf")).toBe("pdf");
        expect(tipoFichero("image/png")).toBe("imagen");
    });

    test("por extensión cuando no hay MIME", () => {
        expect(tipoFichero("factura.JPG")).toBe("imagen");
        expect(tipoFichero("factura.pdf")).toBe("pdf");
    });

    test("sin datos se trata como PDF", () => {
        expect(tipoFichero(null)).toBe("pdf");
    });
});

describe("resumen de la importación", () => {
    const lineaPropuesta = (
        alertas: LineaPropuesta["alertas"],
        origen: "articulo" | "cuenta_especial" = "articulo",
    ) =>
        ({
            alertas,
            subcuenta: { codigo: null, descripcion: null, origen },
        }) as unknown as LineaPropuesta;

    test("datos de la factura y albaranes elegidos", () => {
        const resumen = resumenImportacion(
            leida(),
            propuesta({
                albaranes: [
                    albaran("1", { seleccionado: true }),
                    albaran("2", { seleccionado: false }),
                ],
            }),
        );

        expect(resumen.proveedor).toBe("Prov");
        expect(resumen.numeroProveedor).toBe("F-1");
        expect(resumen.numLineas).toBe(1);
        expect(resumen.albaranes).toEqual(["ALB-1"]);
        expect(resumen.estadoTotal).toBe("ok");
        expect(resumen.avisos).toEqual([]);
    });

    test("cuenta los avisos de las líneas", () => {
        const resumen = resumenImportacion(
            leida(),
            propuesta({
                lineas: [
                    lineaPropuesta(["sin_articulo", "sin_subcuenta"], "cuenta_especial"),
                    lineaPropuesta(["precio_distinto", "dto_distinto"]),
                    lineaPropuesta(["precio_distinto"]),
                ],
            }),
        );

        expect(resumen.avisos).toEqual([
            "1 línea irá a la cuenta especial de compras",
            "1 línea sin artículo",
            "2 líneas con precio distinto al teórico",
            "1 línea con descuento distinto al teórico",
        ]);
    });

    test("total que no cuadra con la diferencia aceptada", () => {
        const resumen = resumenImportacion(
            leida({ aceptarTotalDiscordante: true }),
            propuesta({ totalCalculado: 5, alertas: ["total_discordante"] }),
        );

        expect(resumen.estadoTotal).toBe("error");
        expect(resumen.diferenciaAceptada).toBe(true);
    });
});

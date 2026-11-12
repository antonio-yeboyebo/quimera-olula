import { lineaClientesNuevosDesdeAPI, productosDelObjetivo, sinRepetir, textoKpiTrimestres, totalesKpi } from "./dominio.ts";

test("los trimestres se mandan como año-Tn separados por comas", () => {
    expect(
        textoKpiTrimestres([
            { año: 2026, numero: 1 },
            { año: 2026, numero: 2 },
        ])
    ).toBe("2026-T1,2026-T2");
});

test("el total suma objetivo y alcanzado de todas las líneas", () => {
    expect(
        totalesKpi({
            rango: null,
            lineas: [
                { clave: "a", etiqueta: "A", objetivo: 5, alcanzada: 2 },
                { clave: "b", etiqueta: "B", objetivo: 3, alcanzada: 1 },
            ],
        })
    ).toEqual({ objetivo: 8, alcanzada: 3 });
});

test("las líneas sin subfamilia aportan la familia entera y el resto su subfamilia", () => {
    expect(
        productosDelObjetivo({
            detalle: [
                { codfamilia: "BIO", codsubfamilia: "", objetivo: 1, alcanzada: 0 },
                { codfamilia: "IMP", codsubfamilia: "IMP01", objetivo: 1, alcanzada: 0 },
                { codfamilia: "IMP", codsubfamilia: "IMP01", objetivo: 1, alcanzada: 0 },
            ],
        })
    ).toEqual({ familias: ["BIO"], subfamilias: ["IMP01"] });
});

test("una línea de clientes nuevos sin descripción usa su código", () => {
    expect(
        lineaClientesNuevosDesdeAPI({
            codfamilia: "BIO",
            codsubfamilia: "",
            descripcion: null,
            clientes: [{ codcliente: "000123", nombre: "Clínica", importe: 250 }],
        })
    ).toEqual({ clave: "BIO|", descripcion: "BIO", clientes: [{ codCliente: "000123", nombre: "Clínica", importe: 250 }] });
});

test("un cliente recomendado para varias subfamilias sale una sola vez", () => {
    const cliente = { codCliente: "1", coddir: 10, nombre: "A", ciudad: null, score: 0.9 };
    expect(sinRepetir([cliente, { ...cliente, score: 0.5 }, { ...cliente, coddir: 11 }])).toHaveLength(2);
});

import {
    añoDelPeriodo,
    familiaDesdeAPI,
    historicoDesdeAPI,
    maximoHistorico,
    parametrosPeriodo,
    periodoCompleto,
    textoVariacion,
    variacion,
} from "./dominio.ts";

describe("parametrosPeriodo", () => {
    test("los trimestres van con su año y una marca por trimestre", () => {
        expect(
            parametrosPeriodo(
                {
                    tipo: "trimestres",
                    trimestres: [
                        { año: 2025, numero: 1 },
                        { año: 2025, numero: 3 },
                    ],
                },
                "A1"
            )
        ).toEqual({ codAgente: "A1", customDates: false, anio: 2025, T1: true, T2: false, T3: true, T4: false });
    });

    test("las fechas concretas van como customDates y sin agente se piden todos", () => {
        expect(parametrosPeriodo({ tipo: "fechas", desde: "2026-01-15", hasta: "2026-02-15" }, null)).toEqual({
            codAgente: "TODOS",
            customDates: true,
            dateFrom: "2026-01-15",
            dateTo: "2026-02-15",
        });
    });
});

test("un periodo está completo con algún trimestre o con fechas ordenadas", () => {
    expect(periodoCompleto({ tipo: "trimestres", trimestres: [] })).toBe(false);
    expect(periodoCompleto({ tipo: "fechas", desde: "2026-03-01", hasta: "2026-01-01" })).toBe(false);
    expect(periodoCompleto({ tipo: "fechas", desde: "2026-01-01", hasta: "2026-03-01" })).toBe(true);
});

test("el año del gráfico es el del periodo elegido", () => {
    expect(añoDelPeriodo({ tipo: "trimestres", trimestres: [{ año: 2024, numero: 2 }] })).toBe(2024);
    expect(añoDelPeriodo({ tipo: "fechas", desde: "2025-05-01", hasta: "2025-06-01" })).toBe(2025);
});

test("la variación es respecto al año anterior y sin ventas anteriores no hay", () => {
    expect(variacion(112, 100)).toBeCloseTo(12);
    expect(variacion(100, 0)).toBeNull();
    expect(textoVariacion(12)).toBe("+12.0 %");
    expect(textoVariacion(null)).toBe("—");
});

test("el histórico se lee por mes y la escala cubre ventas, previsión y objetivo", () => {
    const meses = historicoDesdeAPI({
        meses: ["2026-01", "2026-02"],
        ventas: [100, null],
        objetivo: [150, 150],
        prevision: [null, 200],
    });
    expect(meses[1]).toEqual({ mes: "2026-02", ventas: null, objetivo: 150, prevision: 200 });
    expect(maximoHistorico(meses)).toBe(200);
});

test("una familia sin objetivo queda con objetivo nulo", () => {
    expect(
        familiaDesdeAPI({
            codfamilia: "BIO",
            descripcion: "Biomateriales",
            importe: 500,
            importe_anterior: 0,
            objetivo: null,
            subfamilias: [{ codsubfamilia: "B1", descripcion: "Hueso", importe: 500, importe_anterior: 0 }],
        })
    ).toEqual({
        codigo: "BIO",
        descripcion: "Biomateriales",
        importe: 500,
        importeAnterior: 0,
        objetivo: null,
        subfamilias: [{ codigo: "B1", descripcion: "Hueso", importe: 500, importeAnterior: 0 }],
    });
});

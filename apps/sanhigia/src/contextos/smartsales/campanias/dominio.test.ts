import { distanciaKm } from "../comun/geolocalizacion.ts";
import { ClienteCampania } from "./diseño.ts";
import {
    campaniaParaAPI,
    conVentas,
    erroresCampania,
    formularioInicial,
    recomendados,
    tipoProductoDe,
    totalesCampania,
} from "./dominio.ts";

const HOY = new Date(2026, 9, 28);

const cliente = (datos: Partial<ClienteCampania> = {}): ClienteCampania => ({
    codCliente: "000001",
    nombre: "Clínica",
    ciudad: null,
    latitud: null,
    longitud: null,
    idTrato: "1",
    estado: "-",
    afinidad: null,
    ventas12Meses: 0,
    ultimaCompra: null,
    ventasCampania: 0,
    ...datos,
});

describe("formulario de campaña", () => {
    test("pide nombre y producto", () => {
        expect(erroresCampania(formularioInicial(HOY))).toEqual(["Indica el nombre de la campaña", "Elige la subfamilia"]);
    });

    test("la venta cruzada siempre es por artículos y la afinidad por subfamilia", () => {
        expect(tipoProductoDe({ ...formularioInicial(HOY), tipo: "ventaCruzada", tipoProducto: "subfamilia" })).toBe("listadearticulos");
        expect(tipoProductoDe({ ...formularioInicial(HOY), tipo: "captacion", tipoProducto: "listadearticulos" })).toBe("subfamilia");
    });

    test("el umbral de afinidad tiene que estar entre 0 y 100 %", () => {
        const formulario = { ...formularioInicial(HOY), tipo: "captacion" as const, nombre: "C", subfamilia: { codigo: "S1", descripcion: "S" } };
        expect(erroresCampania({ ...formulario, umbral: 0 })).toEqual(["El umbral de afinidad va de 0 a 100 %"]);
        expect(erroresCampania({ ...formulario, umbral: 0.8 })).toEqual([]);
    });
});

describe("campaniaParaAPI", () => {
    test("inactivos por subfamilia manda los días y la subfamilia", () => {
        expect(
            campaniaParaAPI({ ...formularioInicial(HOY), nombre: " Recuperar ", dias: 120, subfamilia: { codigo: "S1", descripcion: "S" } }, "A1")
        ).toEqual({
            tipo: "inactivos",
            tipoproducto: "subfamilia",
            subfamilia: "S1",
            productos: null,
            diasdesdeultimacompra: 120,
            fechainicioultimacompra: null,
            fechafinultimacompra: null,
            umbralrecomendacion: null,
            nombre: "Recuperar",
            descripcion: null,
            codagente: "A1",
        });
    });

    test("la venta cruzada manda las listas de artículos como las campañas de Marketing", () => {
        const api = campaniaParaAPI(
            {
                ...formularioInicial(HOY),
                tipo: "ventaCruzada",
                nombre: "Cruzada",
                articulos: [
                    { codigo: "R1", descripcion: "Uno" },
                    { codigo: "R2", descripcion: "Dos" },
                ],
                modoIncluidos: "todos",
                excluidos: [{ codigo: "R3", descripcion: "Tres" }],
            },
            null
        );
        expect(JSON.parse(api.productos!)).toEqual({
            lista_incluidos: { refs: "R1;R2", tipo: "todos" },
            lista_excluidos: { refs: "R3", tipo: "ninguno" },
        });
        expect(api.fechainicioultimacompra).toBe("2025-10-28");
    });
});

describe("detalle de campaña", () => {
    test("trabajados son los ganados y perdidos; conseguidos, los ganados", () => {
        expect(totalesCampania([cliente({ estado: "Ganado" }), cliente({ estado: "Perdido" }), cliente()])).toEqual({
            total: 3,
            trabajados: 2,
            ganados: 1,
        });
    });

    test("los recomendados son los pendientes ordenados por afinidad", () => {
        const lista = recomendados([
            cliente({ nombre: "B", afinidad: 0.6 }),
            cliente({ nombre: "A", afinidad: 0.9 }),
            cliente({ nombre: "C", estado: "Ganado", afinidad: 1 }),
        ]);
        expect(lista.map((c) => c.nombre)).toEqual(["A", "B"]);
    });

    test("los resultados solo incluyen clientes con ventas", () => {
        expect(conVentas([cliente({ ventasCampania: 10 }), cliente()]).length).toBe(1);
    });

    test("la distancia necesita las coordenadas del cliente", () => {
        expect(distanciaKm({ latitud: 37.39, longitud: -5.99 }, null, null)).toBeNull();
        expect(distanciaKm({ latitud: 37.39, longitud: -5.99 }, 40.42, -3.7)).toBeCloseTo(390, -1);
    });
});

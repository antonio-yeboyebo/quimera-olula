import { CAPITALES } from "./capitales.ts";
import { ClienteMapa } from "./diseño.ts";
import { capitalMasCercana, filtrosAUrl, filtrosDesdeUrl, filtrosIniciales, ordenarClientes, parametrosBusqueda } from "./dominio.ts";

const cliente = (datos: Partial<ClienteMapa>): ClienteMapa => ({
    codCliente: "1",
    nombre: "A",
    direccion: "",
    codPostal: null,
    ciudad: null,
    latitud: 0,
    longitud: 0,
    distancia: 0,
    afinidad: null,
    ultimaCompra: null,
    ventas12Meses: null,
    ...datos,
});

test("están las 50 capitales de provincia más Ceuta y Melilla", () => {
    expect(CAPITALES).toHaveLength(52);
});

test("la zona por defecto es la capital más cercana a la posición", () => {
    expect(capitalMasCercana({ latitud: 37.41, longitud: -6.0 }).nombre).toBe("Sevilla");
    expect(capitalMasCercana({ latitud: 40.3, longitud: -3.8 }).nombre).toBe("Madrid");
});

test("los filtros vacíos no se mandan y los artículos van separados por comas", () => {
    const filtros = {
        ...filtrosIniciales("Madrid"),
        articulos: [
            { codigo: "R1", descripcion: "Uno" },
            { codigo: "R2", descripcion: "Dos" },
        ],
    };
    expect(parametrosBusqueda({ latitud: 40, longitud: -3 }, filtros)).toEqual({
        lat: 40,
        lon: -3,
        radio: 25,
        afinidadMin: null,
        sinCompraMeses: null,
        ventasMin: null,
        subfamilia: null,
        referencias: "R1,R2",
        orden: "distancia",
        soloTotal: null,
    });
    expect(parametrosBusqueda({ latitud: 40, longitud: -3 }, filtros, true).soloTotal).toBe(true);
});

test("los filtros viajan en la URL y una URL rota se ignora", () => {
    const filtros = { ...filtrosIniciales("Sevilla"), radio: 40 };
    expect(filtrosDesdeUrl(new URLSearchParams(filtrosAUrl(filtros)))).toEqual(filtros);
    expect(filtrosDesdeUrl(new URLSearchParams("f=no-es-json"))).toBeNull();
});

test("por afinidad, los clientes sin afinidad quedan al final y empata la distancia", () => {
    const lista = ordenarClientes(
        [
            cliente({ codCliente: "a", afinidad: null, distancia: 1 }),
            cliente({ codCliente: "b", afinidad: 0.8, distancia: 5 }),
            cliente({ codCliente: "c", afinidad: 0.8, distancia: 2 }),
        ],
        "afinidad"
    );
    expect(lista.map((c) => c.codCliente)).toEqual(["c", "b", "a"]);
});

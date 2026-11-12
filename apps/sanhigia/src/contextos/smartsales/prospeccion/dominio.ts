import { distanciaKm, Posicion } from "../comun/geolocalizacion.ts";
import { CAPITALES } from "./capitales.ts";
import { Capital, ClienteMapa, ClienteMapaAPI, FiltrosProspeccion } from "./diseño.ts";

export const RADIO_POR_DEFECTO = 25;

export const OPCIONES_ULTIMA_COMPRA = [
    { valor: "", descripcion: "Cualquiera" },
    { valor: "3", descripcion: "Hace más de 3 meses" },
    { valor: "6", descripcion: "Hace más de 6 meses" },
    { valor: "12", descripcion: "Hace más de 12 meses" },
    { valor: "24", descripcion: "Hace más de 24 meses" },
];

export const filtrosIniciales = (capital: string | null = null): FiltrosProspeccion => ({
    capital,
    radio: RADIO_POR_DEFECTO,
    afinidadMin: null,
    sinCompraMeses: null,
    ventasMin: null,
    subfamilia: null,
    articulos: [],
    orden: "distancia",
});

export const capitalPorNombre = (nombre: string | null): Capital | null => CAPITALES.find((c) => c.nombre === nombre) ?? null;

export const capitalMasCercana = (posicion: Posicion): Capital =>
    CAPITALES.reduce((cercana, capital) =>
        distanciaKm(posicion, capital.latitud, capital.longitud)! < distanciaKm(posicion, cercana.latitud, cercana.longitud)! ? capital : cercana
    );

export const parametrosBusqueda = (
    centro: Posicion,
    filtros: FiltrosProspeccion,
    soloTotal = false
): Record<string, string | number | boolean | null> => ({
    lat: centro.latitud,
    lon: centro.longitud,
    radio: filtros.radio,
    afinidadMin: filtros.afinidadMin,
    sinCompraMeses: filtros.sinCompraMeses,
    ventasMin: filtros.ventasMin,
    subfamilia: filtros.subfamilia?.codigo ?? null,
    referencias: filtros.articulos.length > 0 ? filtros.articulos.map((a) => a.codigo).join(",") : null,
    orden: filtros.orden,
    soloTotal: soloTotal || null,
});

export const filtrosAUrl = (filtros: FiltrosProspeccion) => new URLSearchParams({ f: JSON.stringify(filtros) }).toString();

export const filtrosDesdeUrl = (parametros: URLSearchParams): FiltrosProspeccion | null => {
    const texto = parametros.get("f");
    if (!texto) return null;
    try {
        return { ...filtrosIniciales(), ...(JSON.parse(texto) as Partial<FiltrosProspeccion>) };
    } catch {
        return null;
    }
};

export const clienteMapaDesdeAPI = (cliente: ClienteMapaAPI): ClienteMapa => ({
    codCliente: cliente.codcliente,
    nombre: cliente.nombre,
    direccion: cliente.direccion,
    codPostal: cliente.codpostal,
    ciudad: cliente.ciudad,
    latitud: Number(cliente.latitud),
    longitud: Number(cliente.longitud),
    distancia: Number(cliente.distancia) || 0,
    afinidad: cliente.afinidad === null ? null : Number(cliente.afinidad),
    ultimaCompra: cliente.ultimacompra,
    ventas12Meses: cliente.ventas12meses === null ? null : Number(cliente.ventas12meses),
});

export const ordenarClientes = (clientes: ClienteMapa[], orden: FiltrosProspeccion["orden"]) =>
    [...clientes].sort((a, b) =>
        orden === "afinidad" ? (b.afinidad ?? -1) - (a.afinidad ?? -1) || a.distancia - b.distancia : a.distancia - b.distancia
    );

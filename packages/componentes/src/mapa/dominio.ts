export type Coordenadas = {
    latitud: number;
    longitud: number;
};

export type VistaMapa = {
    centro: Coordenadas;
    radioKm: number;
};

export type Limites = [[number, number], [number, number]];

export const RADIO_MINIMO_KM = 1;
export const RADIO_MAXIMO_KM = 400;

const KM_POR_GRADO = 111.32;

const cosenoLatitud = (latitud: number) => Math.cos((latitud * Math.PI) / 180);

export const limitesDelRadio = ({ centro, radioKm }: VistaMapa): Limites => {
    const dLat = radioKm / KM_POR_GRADO;
    const dLon = radioKm / (KM_POR_GRADO * cosenoLatitud(centro.latitud));
    return [
        [centro.longitud - dLon, centro.latitud - dLat],
        [centro.longitud + dLon, centro.latitud + dLat],
    ];
};

export const radioDeLimites = (centro: Coordenadas, [[oeste, sur], [este, norte]]: Limites): number => {
    const alto = ((norte - sur) / 2) * KM_POR_GRADO;
    const ancho = ((este - oeste) / 2) * KM_POR_GRADO * cosenoLatitud(centro.latitud);
    const radio = Math.round(Math.min(alto, ancho) * 10) / 10;
    return Math.min(Math.max(radio, RADIO_MINIMO_KM), RADIO_MAXIMO_KM);
};

export const mismaVista = (a: VistaMapa, b: VistaMapa | null): boolean =>
    b !== null &&
    Math.abs(a.centro.latitud - b.centro.latitud) < 1e-4 &&
    Math.abs(a.centro.longitud - b.centro.longitud) < 1e-4 &&
    Math.abs(a.radioKm - b.radioKm) <= Math.max(a.radioKm, b.radioKm) * 0.02;

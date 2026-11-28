import { ClaseAbc } from "#/almacen/slotting/diseño.ts";
import { RecorridoOrden } from "#/almacen/orden/diseño.ts";
import {
    CapaMapa, CeldaModulo, ElegidoPlanta, ElementoPlanta, EntradaLeyenda, GeometriaPasillo,
    GeometriaPasilloPlanta, Giro, Lado, MapaAlmacen, MedidasPlanta, MedidasPropias, PasilloEnPlanta,
    PasilloMapa, PlantaAlmacen, PuntoRecorrido, Rect, TipoElemento, Tono, UbicacionMapa, ZonaMapa,
} from "./diseño.ts";
import { tAlmacen } from "../i18n/index.ts";

export const capasMapa: { valor: CapaMapa; descripcion: string }[] = [
    { valor: "OCUPACION", get descripcion() { return tAlmacen("mapa.ocupacion"); } },
    { valor: "ABC_UBICACION", get descripcion() { return tAlmacen("mapa.abcDeLaUbicacion"); } },
    { valor: "ABC_ARTICULO", get descripcion() { return tAlmacen("mapa.abcDelArticulo"); } },
    { valor: "SLOTTING", get descripcion() { return tAlmacen("mapa.slottingArticuloVsUbicacion"); } },
    { valor: "CLASE_ALMACENAMIENTO", get descripcion() { return tAlmacen("mapa.claseDeAlmacenamiento"); } },
    { valor: "PICKING", get descripcion() { return tAlmacen("mapa.pickingFijo"); } },
    { valor: "BLOQUEO", get descripcion() { return tAlmacen("mapa.bloqueo"); } },
];

export const CAPA_POR_DEFECTO: CapaMapa = "OCUPACION";

export const capaMapa = (valor: string | null | undefined): CapaMapa =>
    capasMapa.find((c) => c.valor === valor)?.valor ?? CAPA_POR_DEFECTO;

// ─── Layout ───────────────────────────────────────────────────────────────

/** Impares a la izquierda, pares a la derecha (como una calle), según el sentido de avance. */
export const ladoDeModulo = (modulo: number): Lado => (modulo % 2 === 1 ? "IZQUIERDA" : "DERECHA");

/** Posición a lo largo del pasillo (1..modulos): los módulos 2k-1 y 2k quedan enfrentados. */
export const posicionEnPasillo = (modulo: number): number => Math.floor((modulo + 1) / 2);

export const ladosDePasillo = (p: Pick<PasilloMapa, "caras">): Lado[] =>
    p.caras === "AMBAS" ? ["IZQUIERDA", "DERECHA"] : [p.caras];

/** Números de módulo de una cara, en el sentido de avance. */
export const modulosDeLado = (p: Pick<PasilloMapa, "modulos">, lado: Lado): number[] =>
    Array.from({ length: p.modulos }, (_, i) => (lado === "IZQUIERDA" ? 2 * i + 1 : 2 * i + 2));

export const MEDIDAS = {
    /** Largo de un módulo a lo largo del pasillo. */
    modulo: 22,
    /** Fondo de la estantería. */
    fondo: 20,
    /** Ancho del pasillo por el que se camina. */
    pasillo: 22,
    /** Separación entre dos pasillos. */
    separacion: 12,
    /** Margen superior: el transversal de cabecera por el que se entra a los pasillos. */
    cabecera: 26,
    margen: 8,
};

const anchoPasillo = MEDIDAS.fondo * 2 + MEDIDAS.pasillo;

export const geometriaPasillo = (p: PasilloMapa, indice: number): GeometriaPasillo => {
    const x = MEDIDAS.margen + indice * (anchoPasillo + MEDIDAS.separacion);
    const celdas: CeldaModulo[] = ladosDePasillo(p).flatMap((lado) =>
        modulosDeLado(p, lado).map((modulo) => ({
            modulo,
            lado,
            // Visto desde arriba avanzando hacia abajo, la izquierda de quien avanza es la derecha
            // de la pantalla.
            x: lado === "IZQUIERDA" ? x + MEDIDAS.fondo + MEDIDAS.pasillo : x,
            y: MEDIDAS.cabecera + (posicionEnPasillo(modulo) - 1) * MEDIDAS.modulo,
            ancho: MEDIDAS.fondo,
            alto: MEDIDAS.modulo,
        }))
    );
    return {
        pasilloId: p.pasilloId,
        xEje: x + MEDIDAS.fondo + MEDIDAS.pasillo / 2,
        x,
        ancho: anchoPasillo,
        alto: p.modulos * MEDIDAS.modulo,
        celdas,
    };
};

export const geometriaZona = (pasillos: PasilloMapa[]) => {
    const geometrias = pasillos.map(geometriaPasillo);
    const ancho = MEDIDAS.margen * 2 + Math.max(0, pasillos.length * (anchoPasillo + MEDIDAS.separacion) - MEDIDAS.separacion);
    const alto = MEDIDAS.cabecera + Math.max(0, ...geometrias.map((g) => g.alto)) + MEDIDAS.margen;
    return { geometrias, ancho, alto };
};

/** Centro de un módulo en la planta, sobre el eje del pasillo (donde para el operario). */
export const puntoDeModulo = (g: GeometriaPasillo, modulo: number): { x: number; y: number } => ({
    x: g.xEje,
    y: MEDIDAS.cabecera + (posicionEnPasillo(modulo) - 0.5) * MEDIDAS.modulo,
});

// ─── Agrupaciones ────────────────────────────────────────────────────────

/** Ubicaciones de un pasillo por módulo. */
export const ubicacionesPorModulo = (
    ubicaciones: UbicacionMapa[], pasilloId: string,
): Map<number, UbicacionMapa[]> => {
    const mapa = new Map<number, UbicacionMapa[]>();
    for (const u of ubicaciones) {
        if (u.pasilloId !== pasilloId || u.modulo === null) continue;
        mapa.set(u.modulo, [...(mapa.get(u.modulo) ?? []), u]);
    }
    return mapa;
};

/** Ubicaciones de una zona que no están en ningún pasillo (playas, muelles, migración). */
export const ubicacionesSueltas = (ubicaciones: UbicacionMapa[], zonaId: string): UbicacionMapa[] =>
    ubicaciones.filter((u) => u.zonaId === zonaId && u.pasilloId === null);

/** Huecos de un módulo en un nivel, por número de hueco. */
export const huecosDe = (ubicaciones: UbicacionMapa[], nivel: number): UbicacionMapa[] =>
    ubicaciones.filter((u) => u.nivel === nivel).sort((a, b) => (a.hueco ?? 0) - (b.hueco ?? 0));

// ─── Capas ───────────────────────────────────────────────────────────────

const RANGO: Record<ClaseAbc, number> = { A: 0, B: 1, C: 2 };
const TONOS_CLASE = 6;

/** Índice de color de cada código de clase de almacenamiento, en orden alfabético. */
export const paletaClases = (mapa: MapaAlmacen): Map<string, number> => {
    const codigos = [...new Set(mapa.ubicaciones.flatMap((u) => u.clasesAlmacenamiento))].sort();
    return new Map(codigos.map((c, i) => [c, i % TONOS_CLASE]));
};

export const ocupada = (u: UbicacionMapa): boolean => u.cantidad > 0;

export const bajoMinimo = (u: UbicacionMapa): boolean =>
    u.pickingFijo !== null && u.cantidad < u.pickingFijo.minimo;

const tonoClase = (c: ClaseAbc | null): Tono => (c ? c.toLowerCase() : "sin-dato");

/** Cruce de la rotación del artículo con la accesibilidad del hueco. */
export const tonoSlotting = (u: Pick<UbicacionMapa, "claseArticulo" | "claseUbicacion">): Tono => {
    if (!u.claseArticulo || !u.claseUbicacion) return "sin-dato";
    const diferencia = RANGO[u.claseUbicacion] - RANGO[u.claseArticulo];
    return diferencia === 0 ? "ok" : diferencia > 0 ? "rota-mas" : "rota-menos";
};

export const tonoUbicacion = (u: UbicacionMapa, capa: CapaMapa, paleta: Map<string, number>): Tono => {
    switch (capa) {
        case "OCUPACION":
            return ocupada(u) ? "lleno" : "vacio";
        case "ABC_UBICACION":
            return tonoClase(u.claseUbicacion);
        case "ABC_ARTICULO":
            return tonoClase(u.claseArticulo);
        case "SLOTTING":
            return tonoSlotting(u);
        case "CLASE_ALMACENAMIENTO":
            return tonoClasesAlmacenamiento(u.clasesAlmacenamiento, paleta);
        case "PICKING":
            return u.pickingFijo === null ? "sin-dato" : bajoMinimo(u) ? "bajo-minimo" : "picking";
        case "BLOQUEO":
            return u.bloqueada ? "bloqueada" : "activa";
    }
};

const tonoClasesAlmacenamiento = (codigos: string[], paleta: Map<string, number>): Tono => {
    const unicos = [...new Set(codigos)];
    if (unicos.length === 0) return "sin-dato";
    if (unicos.length > 1) return "mezcla";
    return `clase-${paleta.get(unicos[0]) ?? 0}`;
};

/** Color de un módulo (todos sus niveles y huecos) en la planta. */
export const tonoModulo = (us: UbicacionMapa[], capa: CapaMapa, paleta: Map<string, number>): Tono => {
    if (us.length === 0) return "sin-ubicaciones";
    switch (capa) {
        case "OCUPACION": {
            const llenas = us.filter(ocupada).length;
            return llenas === 0 ? "vacio" : llenas === us.length ? "lleno" : "parcial";
        }
        case "ABC_UBICACION":
            return tonoClase(mejorClase(us.map((u) => u.claseUbicacion)));
        case "ABC_ARTICULO":
            return tonoClase(mejorClase(us.map((u) => u.claseArticulo)));
        case "SLOTTING": {
            const tonos = us.map(tonoSlotting);
            return (["rota-mas", "rota-menos", "ok"] as Tono[]).find((t) => tonos.includes(t)) ?? "sin-dato";
        }
        case "CLASE_ALMACENAMIENTO":
            return tonoClasesAlmacenamiento(us.flatMap((u) => u.clasesAlmacenamiento), paleta);
        case "PICKING":
            return us.some(bajoMinimo) ? "bajo-minimo" : us.some((u) => u.pickingFijo) ? "picking" : "sin-dato";
        case "BLOQUEO": {
            const bloqueadas = us.filter((u) => u.bloqueada).length;
            return bloqueadas === 0 ? "activa" : bloqueadas === us.length ? "bloqueada" : "parcial-bloqueada";
        }
    }
};

/** Letra ABC que se escribe en el hueco (para no depender solo del color); null fuera de esas capas. */
export const letraUbicacion = (u: UbicacionMapa, capa: CapaMapa): ClaseAbc | null => {
    switch (capa) {
        case "ABC_UBICACION":
            return u.claseUbicacion;
        case "ABC_ARTICULO":
        case "SLOTTING":
            return u.claseArticulo;
        default:
            return null;
    }
};

/** Letra de un módulo de la planta: la mejor de sus huecos. */
export const letraModulo = (us: UbicacionMapa[], capa: CapaMapa): ClaseAbc | null =>
    mejorClase(us.map((u) => letraUbicacion(u, capa)));

export const mejorClase = (clases: (ClaseAbc | null)[]): ClaseAbc | null =>
    clases.filter((c): c is ClaseAbc => c !== null).sort((a, b) => RANGO[a] - RANGO[b])[0] ?? null;

export const leyenda = (capa: CapaMapa, paleta: Map<string, number>): EntradaLeyenda[] => {
    switch (capa) {
        case "OCUPACION":
            return [
                { tono: "vacio", texto: tAlmacen("mapa.vacio") },
                { tono: "parcial", texto: tAlmacen("mapa.parcialModulo") },
                { tono: "lleno", texto: tAlmacen("mapa.conStock") },
            ];
        case "ABC_UBICACION":
            return [
                { tono: "a", texto: tAlmacen("mapa.aMasAccesible") },
                { tono: "b", texto: "B" },
                { tono: "c", texto: tAlmacen("mapa.cMenosAccesible") },
                { tono: "sin-dato", texto: tAlmacen("mapa.sinPasillo") },
            ];
        case "ABC_ARTICULO":
            return [
                { tono: "a", texto: tAlmacen("mapa.articuloA") },
                { tono: "b", texto: tAlmacen("mapa.articuloB") },
                { tono: "c", texto: tAlmacen("mapa.articuloC") },
                { tono: "sin-dato", texto: tAlmacen("mapa.vacia") },
            ];
        case "SLOTTING":
            return [
                { tono: "ok", texto: tAlmacen("mapa.rotacionAcordeAlHueco") },
                { tono: "rota-mas", texto: tAlmacen("mapa.rotaMasQueSuHuecoMoverlo") },
                { tono: "rota-menos", texto: tAlmacen("mapa.rotaMenosQueSuHuecoOcupa") },
                { tono: "sin-dato", texto: tAlmacen("mapa.vaciaOSinPasillo") },
            ];
        case "CLASE_ALMACENAMIENTO":
            return [
                ...[...paleta.entries()].map(([codigo, i]) => ({ tono: `clase-${i}`, texto: codigo })),
                { tono: "mezcla", texto: tAlmacen("mapa.variasClases") },
                { tono: "sin-dato", texto: tAlmacen("mapa.vaciaOSinClase") },
            ];
        case "PICKING":
            return [
                { tono: "picking", texto: tAlmacen("mapa.pickingFijo") },
                { tono: "bajo-minimo", texto: tAlmacen("mapa.bajoMinimo") },
                { tono: "sin-dato", texto: tAlmacen("mapa.sinPickingFijo") },
            ];
        case "BLOQUEO":
            return [
                { tono: "activa", texto: tAlmacen("mapa.activa") },
                { tono: "parcial-bloqueada", texto: tAlmacen("mapa.algunaBloqueadaModulo") },
                { tono: "bloqueada", texto: tAlmacen("mapa.bloqueada") },
            ];
    }
};

const fmt = (n: number) => n.toLocaleString("es-ES");

const MAX_EN_LISTA = 5;

/** Los primeros códigos y cuántos más hay (una ubicación de migración puede tener cientos). */
export const listaCorta = (codigos: string[]): string =>
    codigos.slice(0, MAX_EN_LISTA).join(", ") +
    (codigos.length > MAX_EN_LISTA ? tAlmacen("mapa.yValorMas", { valor: codigos.length - MAX_EN_LISTA }) : "");

/** Texto del tooltip de una ubicación. */
export const resumenUbicacion = (u: UbicacionMapa): string => {
    const partes = [u.ubicacion + (u.bloqueada ? tAlmacen("mapa.bloqueada2") : "")];
    partes.push(u.articulos.length ? `${listaCorta(u.articulos)}: ${fmt(u.cantidad)}` : tAlmacen("mapa.vacia"));
    if (u.pickingFijo) {
        partes.push(tAlmacen("mapa.pickingFijoArticuloidMinMinimoMax", { articuloId: u.pickingFijo.articuloId, minimo: fmt(u.pickingFijo.minimo), maximo: fmt(u.pickingFijo.maximo) }));
    }
    if (u.claseUbicacion) partes.push(tAlmacen("mapa.huecoClaseubicacion", { claseUbicacion: u.claseUbicacion }));
    if (u.claseArticulo) partes.push(tAlmacen("mapa.articuloClasearticulo", { claseArticulo: u.claseArticulo }));
    if (u.clasesAlmacenamiento.length) partes.push(tAlmacen("mapa.claseJoin", { join: u.clasesAlmacenamiento.join(", ") }));
    return partes.join("\n");
};

/** Texto del tooltip de un módulo de la planta. */
export const resumenModulo = (pasillo: string, modulo: number, us: UbicacionMapa[]): string => {
    const llenas = us.filter(ocupada).length;
    const bloqueadas = us.filter((u) => u.bloqueada).length;
    const articulos = [...new Set(us.flatMap((u) => u.articulos))];
    return [
        tAlmacen("mapa.pasilloPasilloModuloModulo", { pasillo, modulo }),
        tAlmacen("mapa.lengthHuecosLlenasConStockValor", { length: us.length, llenas, valor: bloqueadas ? tAlmacen("mapa.bloqueadasBloqueados", { bloqueadas }) : "" }),
        ...(articulos.length ? [listaCorta(articulos)] : []),
    ].join("\n");
};

// ─── Recorrido ───────────────────────────────────────────────────────────

/** Paradas del recorrido que caen en un pasillo del mapa. */
export const puntosRecorrido = (recorrido: RecorridoOrden, mapa: MapaAlmacen): PuntoRecorrido[] => {
    const porId = new Map(mapa.ubicaciones.map((u) => [u.ubicacionId, u]));
    return recorrido.paradas.flatMap((p) => {
        const u = porId.get(p.ubicacionId);
        return u?.pasilloId && u.modulo !== null
            ? [{
                secuencia: p.secuencia, ubicacionId: u.ubicacionId, ubicacion: u.ubicacion,
                pasilloId: u.pasilloId, modulo: u.modulo, accion: p.accion,
            }]
            : [];
    });
};

/** Paradas sin posición en el mapa (sin pasillo o de otro almacén). */
export const paradasSinPasillo = (recorrido: RecorridoOrden, mapa: MapaAlmacen) => {
    const conPunto = new Set(puntosRecorrido(recorrido, mapa).map((p) => p.secuencia));
    return recorrido.paradas.filter((p) => !conPunto.has(p.secuencia));
};

/**
 * Trazo del recorrido en una zona: se entra y se sale de cada pasillo por la cabecera
 * (S con retorno); dentro de un pasillo se va de parada en parada.
 */
export const trazoRecorrido = (
    puntos: PuntoRecorrido[], geometrias: GeometriaPasillo[],
): { x: number; y: number }[] => {
    const porPasillo = new Map(geometrias.map((g) => [g.pasilloId, g]));
    const yCabecera = MEDIDAS.cabecera / 2;
    const trazo: { x: number; y: number }[] = [];
    let pasilloActual: string | null = null;
    for (const p of puntos) {
        const g = porPasillo.get(p.pasilloId);
        if (!g) continue;
        if (p.pasilloId !== pasilloActual) {
            if (pasilloActual !== null) {
                const anterior = porPasillo.get(pasilloActual)!;
                trazo.push({ x: anterior.xEje, y: yCabecera });
            }
            trazo.push({ x: g.xEje, y: yCabecera });
            pasilloActual = p.pasilloId;
        }
        trazo.push(puntoDeModulo(g, p.modulo));
    }
    if (pasilloActual !== null) trazo.push({ x: porPasillo.get(pasilloActual)!.xEje, y: yCabecera });
    return trazo;
};

// ─── Planta real (doc/especificaciones/sga_planta.md), en metros ─────────

export const MEDIDAS_PLANTA_POR_DEFECTO: MedidasPlanta = { largoModulo: 2.7, fondo: 1.1, anchoPasillo: 3 };

export const METROS_NIVEL_POR_DEFECTO = 3;

export const GIROS: Giro[] = [0, 90, 180, 270];

export const tiposElemento: { valor: TipoElemento; descripcion: string }[] = [
    { valor: "MUELLE", get descripcion() { return tAlmacen("mapa.muelle"); } },
    { valor: "PUERTA", get descripcion() { return tAlmacen("mapa.puerta"); } },
    { valor: "OFICINA", get descripcion() { return tAlmacen("mapa.oficina"); } },
    { valor: "COLUMNA", get descripcion() { return tAlmacen("mapa.columna"); } },
    { valor: "OTRO", get descripcion() { return tAlmacen("mapa.otro"); } },
];

/** Encaje de la rejilla al arrastrar. */
export const PASO_PLANTA = 0.5;

const redondear = (n: number) => Math.round(n * 100) / 100;

export const ajustarARejilla = (n: number, paso = PASO_PLANTA): number => redondear(Math.round(n / paso) * paso);

export const medidasEfectivas = (planta: MedidasPlanta, propias: MedidasPropias): MedidasPlanta => ({
    largoModulo: propias.largoModulo ?? planta.largoModulo,
    fondo: propias.fondo ?? planta.fondo,
    anchoPasillo: propias.anchoPasillo ?? planta.anchoPasillo,
});

export const girar = (giro: Giro): Giro => GIROS[(GIROS.indexOf(giro) + 1) % GIROS.length];

/** Ancho y largo del pasillo sin girar (sentido de avance hacia abajo). */
const tamanoSinGirar = (p: Pick<PasilloMapa, "caras" | "modulos">, m: MedidasPlanta) => ({
    ancho: m.fondo * (p.caras === "AMBAS" ? 2 : 1) + m.anchoPasillo,
    largo: p.modulos * m.largoModulo,
});

export const tamanoPasillo = (
    p: Pick<PasilloMapa, "caras" | "modulos">, m: MedidasPlanta, giro: Giro,
): { ancho: number; largo: number } => {
    const t = tamanoSinGirar(p, m);
    return giro === 90 || giro === 270 ? { ancho: t.largo, largo: t.ancho } : t;
};

/** Un punto del pasillo sin girar (origen arriba a la izquierda) a coordenadas de la nave. */
const transformar = (
    px: number, py: number, t: { ancho: number; largo: number }, c: Pick<PasilloEnPlanta, "x" | "y" | "giro">,
) => {
    const [gx, gy] = {
        0: [px, py],
        90: [t.largo - py, px],
        180: [t.ancho - px, t.largo - py],
        270: [py, t.ancho - px],
    }[c.giro];
    return { x: c.x + gx, y: c.y + gy };
};

const transformarRect = (
    r: Rect, t: { ancho: number; largo: number }, c: Pick<PasilloEnPlanta, "x" | "y" | "giro">,
): Rect => {
    const a = transformar(r.x, r.y, t, c);
    const b = transformar(r.x + r.ancho, r.y + r.largo, t, c);
    return {
        x: Math.min(a.x, b.x), y: Math.min(a.y, b.y),
        ancho: Math.abs(b.x - a.x), largo: Math.abs(b.y - a.y),
    };
};

/**
 * Dónde empieza el suelo en el pasillo sin girar. Avanzando hacia abajo y visto desde arriba, la
 * cara izquierda (impares) queda a la derecha de la pantalla: la cara derecha va a x = 0, después el
 * suelo y después la izquierda.
 */
const xSueloSinGirar = (p: Pick<PasilloMapa, "caras">, m: MedidasPlanta): number =>
    p.caras === "IZQUIERDA" ? 0 : m.fondo;

/** Se entra por el frente (módulo 1) salvo que sea solo por el fondo, y por el fondo salvo que sea solo por el frente. */
export const entraPorFrente = (accesos: string): boolean => accesos !== "FONDO";

export const entraPorFondo = (accesos: string): boolean => accesos !== "FRENTE" && accesos !== "UN_EXTREMO";

/** Dónde cae cada módulo de un pasillo colocado, y su suelo, en metros de la nave. */
export const geometriaEnPlanta = (
    p: PasilloMapa, colocacion: PasilloEnPlanta, medidasPlanta: MedidasPlanta,
): GeometriaPasilloPlanta => {
    const m = medidasEfectivas(medidasPlanta, colocacion.medidas);
    const t = tamanoSinGirar(p, m);
    const xSuelo = xSueloSinGirar(p, m);
    const celdas = ladosDePasillo(p).flatMap((lado) =>
        modulosDeLado(p, lado).map((modulo) => ({
            modulo,
            ...transformarRect({
                x: lado === "IZQUIERDA" ? xSuelo + m.anchoPasillo : 0,
                y: (posicionEnPasillo(modulo) - 1) * m.largoModulo,
                ancho: m.fondo,
                largo: m.largoModulo,
            }, t, colocacion),
        }))
    );
    const xEje = xSuelo + m.anchoPasillo / 2;
    const tramo = Math.min(t.largo * 0.3, 2.5);
    const flecha = (desde: number, hasta: number) => {
        const a = transformar(xEje, desde, t, colocacion);
        const b = transformar(xEje, hasta, t, colocacion);
        return { x1: a.x, y1: a.y, x2: b.x, y2: b.y };
    };
    return {
        pasilloId: p.pasilloId,
        ...transformarRect({ x: 0, y: 0, ...t }, t, colocacion),
        celdas,
        suelo: transformarRect({ x: xSuelo, y: 0, ancho: m.anchoPasillo, largo: t.largo }, t, colocacion),
        accesos: [
            ...(entraPorFrente(p.accesos) ? [flecha(0.2, tramo)] : []),
            ...(entraPorFondo(p.accesos) ? [flecha(t.largo - 0.2, t.largo - tramo)] : []),
        ],
    };
};

/** Centro del módulo sobre el eje del pasillo (donde para el operario), en metros de la nave. */
export const puntoEnPlanta = (
    p: PasilloMapa, colocacion: PasilloEnPlanta, medidasPlanta: MedidasPlanta, modulo: number,
): { x: number; y: number } => {
    const m = medidasEfectivas(medidasPlanta, colocacion.medidas);
    const t = tamanoSinGirar(p, m);
    const xSuelo = xSueloSinGirar(p, m);
    return transformar(xSuelo + m.anchoPasillo / 2, (posicionEnPasillo(modulo) - 0.5) * m.largoModulo, t, colocacion);
};

export const todosLosPasillos = (mapa: Pick<MapaAlmacen, "zonas">): PasilloMapa[] =>
    mapa.zonas.flatMap((z) => z.pasillos);

/** Código «ZONA-PASILLO» con el que se rotula un pasillo en la planta. */
export const rotuloPasillo = (mapa: Pick<MapaAlmacen, "zonas">, pasilloId: string): string => {
    const zona = mapa.zonas.find((z) => z.pasillos.some((p) => p.pasilloId === pasilloId));
    const pasillo = zona?.pasillos.find((p) => p.pasilloId === pasilloId);
    return zona && pasillo ? `${zona.zona}-${pasillo.pasillo}` : pasilloId;
};

export const pasillosSinColocar = (mapa: Pick<MapaAlmacen, "zonas">, planta: PlantaAlmacen): PasilloMapa[] => {
    const colocados = new Set(planta.pasillos.map((c) => c.pasilloId));
    return todosLosPasillos(mapa).filter((p) => !colocados.has(p.pasilloId));
};

/** Rectángulo de un pasillo colocado (null si ya no existe en el layout). */
export const rectPasillo = (
    mapa: Pick<MapaAlmacen, "zonas">, planta: PlantaAlmacen, c: PasilloEnPlanta,
): Rect | null => {
    const p = todosLosPasillos(mapa).find((x) => x.pasilloId === c.pasilloId);
    if (!p) return null;
    return { x: c.x, y: c.y, ...tamanoPasillo(p, medidasEfectivas(planta.medidas, c.medidas), c.giro) };
};

const TOLERANCIA = 1e-6;

const solapan = (a: Rect, b: Rect): boolean =>
    a.x < b.x + b.ancho - TOLERANCIA && b.x < a.x + a.ancho - TOLERANCIA &&
    a.y < b.y + b.largo - TOLERANCIA && b.y < a.y + a.largo - TOLERANCIA;

export const cabeEnNave = (planta: Pick<PlantaAlmacen, "ancho" | "largo">, r: Rect): boolean =>
    r.x >= -TOLERANCIA && r.y >= -TOLERANCIA &&
    r.x + r.ancho <= planta.ancho + TOLERANCIA && r.y + r.largo <= planta.largo + TOLERANCIA;

/** Mueve el rectángulo lo justo para que quede dentro de la nave (si cabe). */
export const dentroDeNave = (planta: Pick<PlantaAlmacen, "ancho" | "largo">, r: Rect): { x: number; y: number } => ({
    x: redondear(Math.min(Math.max(r.x, 0), Math.max(planta.ancho - r.ancho, 0))),
    y: redondear(Math.min(Math.max(r.y, 0), Math.max(planta.largo - r.largo, 0))),
});

interface PiezaPlanta {
    nombre: string;
    rect: Rect;
}

const piezas = (mapa: Pick<MapaAlmacen, "zonas">, planta: PlantaAlmacen): PiezaPlanta[] => [
    ...planta.pasillos.flatMap((c) => {
        const rect = rectPasillo(mapa, planta, c);
        return rect ? [{ nombre: tAlmacen("mapa.pasilloMapa", { mapa: rotuloPasillo(mapa, c.pasilloId) }), rect }] : [];
    }),
    ...planta.elementos.map((e) => ({ nombre: e.nombre, rect: e })),
];

/** Avisos del editor: solapes y piezas fuera de la nave (el servidor rechaza estas últimas). */
export const avisosPlanta = (mapa: Pick<MapaAlmacen, "zonas">, planta: PlantaAlmacen): string[] => {
    const todas = piezas(mapa, planta);
    const fuera = todas.filter((p) => !cabeEnNave(planta, p.rect)).map((p) => tAlmacen("mapa.nombreSeSaleDeLaNave", { nombre: p.nombre }));
    const solapes = todas.flatMap((a, i) =>
        todas.slice(i + 1).filter((b) => solapan(a.rect, b.rect)).map((b) => tAlmacen("mapa.nombreSeSolapaConNombre2", { nombre: a.nombre, nombre2: b.nombre }))
    );
    return [...fuera, ...solapes];
};

/** Primer hueco libre de la nave (barrido por filas cada metro) para un rectángulo; si no hay, el origen. */
export const huecoLibre = (
    mapa: Pick<MapaAlmacen, "zonas">, planta: PlantaAlmacen, tamano: { ancho: number; largo: number },
): { x: number; y: number } => {
    const ocupado = piezas(mapa, planta).map((p) => p.rect);
    for (let y = 0; y + tamano.largo <= planta.largo + TOLERANCIA; y += 1) {
        for (let x = 0; x + tamano.ancho <= planta.ancho + TOLERANCIA; x += 1) {
            const r = { x, y, ...tamano };
            if (!ocupado.some((o) => solapan(o, r))) return { x, y };
        }
    }
    return { x: 0, y: 0 };
};

const SEPARACION_INICIAL = 2;

/**
 * Planta que se propone al crearla: los pasillos de cada zona en fila por su orden, una zona tras
 * otra, con las medidas por defecto; la nave los abarca con un margen.
 */
export const plantaInicial = (mapa: Pick<MapaAlmacen, "zonas">): PlantaAlmacen => {
    const medidas = MEDIDAS_PLANTA_POR_DEFECTO;
    let x = SEPARACION_INICIAL;
    let largo = 0;
    const pasillos: PasilloEnPlanta[] = [];
    for (const z of mapa.zonas) {
        if (z.pasillos.length === 0) continue;
        for (const p of z.pasillos) {
            const t = tamanoPasillo(p, medidas, 0);
            pasillos.push({ pasilloId: p.pasilloId, x: redondear(x), y: SEPARACION_INICIAL, giro: 0, medidas: {} });
            x += t.ancho + 1;
            largo = Math.max(largo, t.largo);
        }
        x += SEPARACION_INICIAL - 1;
    }
    return {
        // x ya lleva la separación tras la última zona: es el margen derecho.
        ancho: Math.max(10, Math.ceil(x)),
        largo: Math.max(10, Math.ceil(largo + SEPARACION_INICIAL * 2)),
        medidas,
        metrosNivel: METROS_NIVEL_POR_DEFECTO,
        pasillos,
        elementos: [],
    };
};

export const colocarPasillo = (
    mapa: Pick<MapaAlmacen, "zonas">, planta: PlantaAlmacen, pasillo: PasilloMapa,
): PlantaAlmacen => {
    const { x, y } = huecoLibre(mapa, planta, tamanoPasillo(pasillo, planta.medidas, 0));
    return { ...planta, pasillos: [...planta.pasillos, { pasilloId: pasillo.pasilloId, x, y, giro: 0, medidas: {} }] };
};

export const cambiarPasilloEnPlanta = (
    planta: PlantaAlmacen, pasilloId: string, cambios: Partial<PasilloEnPlanta>,
): PlantaAlmacen => ({
    ...planta,
    pasillos: planta.pasillos.map((c) => (c.pasilloId === pasilloId ? { ...c, ...cambios } : c)),
});

export const quitarPasilloDePlanta = (planta: PlantaAlmacen, pasilloId: string): PlantaAlmacen => ({
    ...planta,
    pasillos: planta.pasillos.filter((c) => c.pasilloId !== pasilloId),
});

/** Gira 90° el pasillo sobre su centro, dentro de la nave. */
export const girarPasillo = (
    mapa: Pick<MapaAlmacen, "zonas">, planta: PlantaAlmacen, pasilloId: string,
): PlantaAlmacen => {
    const c = planta.pasillos.find((x) => x.pasilloId === pasilloId);
    const antes = c && rectPasillo(mapa, planta, c);
    if (!c || !antes) return planta;
    const giro = girar(c.giro);
    const despues = { ...antes, ancho: antes.largo, largo: antes.ancho };
    const centrado = {
        ...despues,
        x: ajustarARejilla(antes.x + (antes.ancho - despues.ancho) / 2),
        y: ajustarARejilla(antes.y + (antes.largo - despues.largo) / 2),
    };
    return cambiarPasilloEnPlanta(planta, pasilloId, { giro, ...dentroDeNave(planta, centrado) });
};

export const nuevoElemento = (planta: PlantaAlmacen, tipo: TipoElemento = "MUELLE"): PlantaAlmacen => {
    const numero = planta.elementos.filter((e) => e.tipo === tipo).length + 1;
    const descripcion = tiposElemento.find((t) => t.valor === tipo)?.descripcion ?? tipo;
    const tamano = { ancho: 4, largo: 3 };
    return {
        ...planta,
        elementos: [...planta.elementos, {
            tipo, nombre: `${descripcion} ${numero}`, ...dentroDeNave(planta, { x: 0, y: 0, ...tamano }), ...tamano,
            ubicaciones: [],
        }],
    };
};

export const cambiarElemento = (
    planta: PlantaAlmacen, indice: number, cambios: Partial<ElementoPlanta>,
): PlantaAlmacen => ({
    ...planta,
    elementos: planta.elementos.map((e, i) => (i === indice ? { ...e, ...cambios } : e)),
});

export const quitarElemento = (planta: PlantaAlmacen, indice: number): PlantaAlmacen => ({
    ...planta,
    elementos: planta.elementos.filter((_, i) => i !== indice),
});

/** Lleva una pieza a (x, y) encajada a la rejilla y sin salirse de la nave. */
export const moverPieza = (
    mapa: Pick<MapaAlmacen, "zonas">, planta: PlantaAlmacen, elegido: ElegidoPlanta, x: number, y: number,
): PlantaAlmacen => {
    if (elegido.tipo === "PASILLO") {
        const c = planta.pasillos.find((p) => p.pasilloId === elegido.pasilloId);
        const r = c && rectPasillo(mapa, planta, c);
        if (!r) return planta;
        return cambiarPasilloEnPlanta(planta, elegido.pasilloId,
            dentroDeNave(planta, { ...r, x: ajustarARejilla(x), y: ajustarARejilla(y) }));
    }
    const e = planta.elementos[elegido.indice];
    if (!e) return planta;
    return cambiarElemento(planta, elegido.indice, dentroDeNave(planta, { ...e, x: ajustarARejilla(x), y: ajustarARejilla(y) }));
};

/** Desplaza una pieza (dx, dy) metros desde donde está ahora en la planta. */
export const desplazarPieza = (
    mapa: Pick<MapaAlmacen, "zonas">, planta: PlantaAlmacen, elegido: ElegidoPlanta, dx: number, dy: number,
): PlantaAlmacen => {
    const origen = elegido.tipo === "PASILLO"
        ? planta.pasillos.find((p) => p.pasilloId === elegido.pasilloId)
        : planta.elementos[elegido.indice];
    return origen ? moverPieza(mapa, planta, elegido, origen.x + dx, origen.y + dy) : planta;
};

/** Número de un campo del editor: positivo, o null si no lo es. */
export const metrosPositivos = (valor: string): number | null => {
    const n = Number(String(valor).replace(",", "."));
    return Number.isFinite(n) && n > 0 ? redondear(n) : null;
};

export const metrosNoNegativos = (valor: string): number | null => {
    const n = Number(String(valor).replace(",", "."));
    return Number.isFinite(n) && n >= 0 ? redondear(n) : null;
};


// ─── Distancia real (doc/especificaciones/sga_distancias.md) ─────────────

const FUNCIONES_SALIDA = ["PREPARACION", "EXPEDICION"];
const FUNCIONES_ENTRADA = ["RECEPCION"];

/** Aviso de una zona con pasillos que no usa la distancia real a la salida; null si la usa. */
export const avisoAccesibilidad = (zona: ZonaMapa): string | null => {
    if (zona.pasillos.length === 0 || zona.accesibilidad.calculo === "DISTANCIA") return null;
    const prefijo = tAlmacen("mapa.zonaAccesibilidadEstimadaFormula", { zona: zona.zona });
    switch (zona.accesibilidad.motivo) {
        case "PASILLOS_SIN_COLOCAR": {
            const sin = zona.accesibilidad.pasillosSinColocar;
            return tAlmacen("mapa.prefijoFaltaColocarEnLaPlanta", { prefijo, valor: sin.length === 1 ? tAlmacen("mapa.elPasillo") : tAlmacen("mapa.losPasillos"), join: sin.join(", ") });
        }
        case "SIN_SALIDA":
            return tAlmacen("mapa.prefijoNoHayPuntoDeSalida", { prefijo });
        case "SIN_PLANTA":
            return tAlmacen("mapa.prefijoElAlmacenNoTienePlanta", { prefijo });
        default:
            return prefijo;
    }
};

/** Avisos de cálculo del almacén: si no hay planta, uno solo; si la hay, uno por zona afectada. */
export const avisosAccesibilidad = (mapa: MapaAlmacen): string[] => {
    const conPasillos = mapa.zonas.filter((z) => z.pasillos.length > 0);
    if (!mapa.planta) {
        return conPasillos.length
            ? [tAlmacen("mapa.accesibilidadEstimadaFormulaElAlmacenNo")]
            : [];
    }
    // Sin punto de salida afecta a todas por igual: un solo aviso con todas las zonas.
    const sinSalida = conPasillos.filter((z) => z.accesibilidad.calculo === "FORMULA" && z.accesibilidad.motivo === "SIN_SALIDA");
    const resto = conPasillos.filter((z) => !sinSalida.includes(z));
    return [
        ...(sinSalida.length
            ? [tAlmacen("mapa.joinAccesibilidadEstimadaFormulaNoHay", { join: sinSalida.map((z) => z.zona).join(", ") })]
            : []),
        ...resto.map(avisoAccesibilidad).filter((a): a is string => a !== null),
    ];
};

/** Texto de la leyenda de las capas que dependen de la accesibilidad. */
export const textoCalculo = (mapa: MapaAlmacen): string => {
    const conPasillos = mapa.zonas.filter((z) => z.pasillos.length > 0);
    const reales = conPasillos.filter((z) => z.accesibilidad.calculo === "DISTANCIA").length;
    if (reales === 0) return tAlmacen("mapa.accesibilidadEstimadaFormula");
    return reales === conPasillos.length
        ? tAlmacen("mapa.accesibilidadPorDistanciaALaSalida")
        : tAlmacen("mapa.accesibilidadPorDistanciaALaSalida2");
};

const fmtMetros = (m: number) => `${Math.round(m).toLocaleString("es-ES")} m`;

/** «A 23 m de la salida · 41 m de la recepción», o null sin distancia real. */
export const textoDistancias = (u: Pick<UbicacionMapa, "metrosSalida" | "metrosEntrada">): string | null => {
    const partes = [
        ...(u.metrosSalida !== null ? [tAlmacen("mapa.metrossalidaDeLaSalida", { metrosSalida: fmtMetros(u.metrosSalida) })] : []),
        ...(u.metrosEntrada !== null ? [tAlmacen("mapa.metrosentradaDeLaRecepcion", { metrosEntrada: fmtMetros(u.metrosEntrada) })] : []),
    ];
    return partes.length ? `A ${partes.join(" · ")}` : null;
};

/** Ubicaciones sin pasillo del almacén (las que se pueden situar en un elemento). */
export const ubicacionesSinPasillo = (mapa: Pick<MapaAlmacen, "ubicaciones">): UbicacionMapa[] =>
    mapa.ubicaciones.filter((u) => u.pasilloId === null);

export const vinculadas = (planta: PlantaAlmacen): Set<string> =>
    new Set(planta.elementos.flatMap((e) => e.ubicaciones));

/** Las sin pasillo que todavía no están en ningún elemento. */
export const sinVincular = (mapa: Pick<MapaAlmacen, "ubicaciones">, planta: PlantaAlmacen): UbicacionMapa[] => {
    const ya = vinculadas(planta);
    return ubicacionesSinPasillo(mapa).filter((u) => !ya.has(u.ubicacionId));
};

/** Añade ubicaciones a un elemento quitándolas de cualquier otro (cada una en uno solo). */
export const vincularUbicaciones = (planta: PlantaAlmacen, indice: number, ids: string[]): PlantaAlmacen => ({
    ...planta,
    elementos: planta.elementos.map((e, i) =>
        i === indice
            ? { ...e, ubicaciones: [...new Set([...e.ubicaciones, ...ids])] }
            : { ...e, ubicaciones: e.ubicaciones.filter((u) => !ids.includes(u)) }
    ),
});

export const desvincularUbicacion = (planta: PlantaAlmacen, indice: number, id: string): PlantaAlmacen =>
    cambiarElemento(planta, indice, { ubicaciones: planta.elementos[indice].ubicaciones.filter((u) => u !== id) });

const funcionDe = (mapa: Pick<MapaAlmacen, "zonas" | "ubicaciones">, ubicacionId: string): string | undefined => {
    const u = mapa.ubicaciones.find((x) => x.ubicacionId === ubicacionId);
    return u ? mapa.zonas.find((z) => z.zonaId === u.zonaId)?.funcion : undefined;
};

/** Si el elemento es punto de salida y/o de entrada, por la función de las zonas de sus ubicaciones. */
export const usoElemento = (
    mapa: Pick<MapaAlmacen, "zonas" | "ubicaciones">, e: ElementoPlanta,
): { salida: boolean; entrada: boolean } => {
    const funciones = e.ubicaciones.map((u) => funcionDe(mapa, u));
    return {
        salida: funciones.some((f) => f !== undefined && FUNCIONES_SALIDA.includes(f)),
        entrada: funciones.some((f) => f !== undefined && FUNCIONES_ENTRADA.includes(f)),
    };
};

/** Avisos del editor sobre la distancia real (se suman a los de solapes). */
export const avisosDistancia = (mapa: MapaAlmacen, planta: PlantaAlmacen): string[] => {
    const avisos: string[] = [];
    if (!planta.elementos.some((e) => usoElemento(mapa, e).salida)) {
        avisos.push(tAlmacen("mapa.noHayPuntoDeSalidaVincula"));
    }
    const sueltas = sinVincular(mapa, planta);
    if (sueltas.length) {
        avisos.push(tAlmacen("mapa.ubicacionesSinPasilloSinSituarEn", { valor: listaCorta(sueltas.map((u) => u.ubicacion)) }));
    }
    return avisos;
};

export interface ParadaEnElemento {
    secuencia: number;
    ubicacionId: string;
    ubicacion: string;
    accion: PuntoRecorrido["accion"];
    x: number;
    y: number;
}

/** Paradas del recorrido en ubicaciones situadas en elementos: en el centro del elemento. */
export const paradasEnElementos = (recorrido: RecorridoOrden, planta: PlantaAlmacen): ParadaEnElemento[] => {
    const elementoDe = new Map(planta.elementos.flatMap((e) => e.ubicaciones.map((u) => [u, e] as const)));
    return recorrido.paradas.flatMap((p) => {
        const e = elementoDe.get(p.ubicacionId);
        return e
            ? [{ secuencia: p.secuencia, ubicacionId: p.ubicacionId, ubicacion: p.ubicacion, accion: p.accion, x: e.x + e.ancho / 2, y: e.y + e.largo / 2 }]
            : [];
    });
};

import { KeyboardEvent, PointerEvent, useRef, useState } from "react";
import { textoAccionParada } from "#/almacen/orden/dominio.ts";
import {
    CapaMapa, ElegidoPlanta, MapaAlmacen, PlantaAlmacen, PuntoRecorrido, TrazadoRecorrido,
} from "../diseño.ts";
import {
    geometriaEnPlanta, letraModulo, ParadaEnElemento, PASO_PLANTA, puntoEnPlanta, resumenModulo, resumenUbicacion,
    rotuloPasillo, todosLosPasillos, tonoModulo, tonoUbicacion, ubicacionesPorModulo, usoElemento,
} from "../dominio.ts";
import { useTAlmacen } from "../../i18n/index.ts";

type Props = {
    mapa: MapaAlmacen;
    planta: PlantaAlmacen;
    capa: CapaMapa;
    paleta: Map<string, number>;
    /** "" = todas; las demás zonas se atenúan. */
    zonaId: string;
    pasilloId: string | null;
    ubicacionId: string | null;
    recorrido: PuntoRecorrido[];
    /** Paradas en ubicaciones situadas en elementos (muelles, playas). */
    paradasElementos?: ParadaEnElemento[];
    /** Camino a pie entre paradas; sin él, se unen en línea recta. */
    trazado?: TrazadoRecorrido | null;
    onPasillo: (pasilloId: string) => void;
    /** Pulsar una ubicación situada en un elemento (solo fuera de la edición). */
    onUbicacion?: (ubicacionId: string) => void;
    /** Solo en edición: elegir y mover piezas. */
    edicion?: {
        elegido: ElegidoPlanta | null;
        onElegir: (elegido: ElegidoPlanta | null) => void;
        /** Metros que se mueve la pieza desde donde esté (la máquina lo aplica sobre la planta vigente). */
        onDesplazar: (elegido: ElegidoPlanta, dx: number, dy: number) => void;
    };
};

/** Píxeles por metro a tamaño natural (luego se encoge al ancho disponible). */
const PX_POR_METRO = 16;

const mismo = (a: ElegidoPlanta | null, b: ElegidoPlanta): boolean =>
    a !== null && (a.tipo === "PASILLO" && b.tipo === "PASILLO"
        ? a.pasilloId === b.pasilloId
        : a.tipo === "ELEMENTO" && b.tipo === "ELEMENTO" && a.indice === b.indice);

const FLECHAS: Record<string, [number, number]> = {
    ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1],
};

/** Planta real de la nave, en metros: contorno con rejilla, elementos fijos y pasillos colocados. */
export const PlantaReal = ({
    mapa, planta, capa, paleta, zonaId, pasilloId, ubicacionId, recorrido, paradasElementos = [], trazado, onPasillo,
    onUbicacion, edicion,
}: Props) => {
    const tx = useTAlmacen();
    const zonaDe = new Map(mapa.zonas.flatMap((z) => z.pasillos.map((p) => [p.pasilloId, z.zonaId])));
    const svg = useRef<SVGSVGElement>(null);
    const [arrastre, setArrastre] = useState<{
        pieza: ElegidoPlanta; inicio: { x: number; y: number }; dx: number; dy: number;
    } | null>(null);

    const pasillos = new Map(todosLosPasillos(mapa).map((p) => [p.pasilloId, p]));
    const colocados = planta.pasillos.flatMap((c) => {
        const p = pasillos.get(c.pasilloId);
        return p ? [{ p, c }] : [];
    });

    const enMetros = (e: PointerEvent): { x: number; y: number } => {
        const ctm = svg.current?.getScreenCTM();
        if (!ctm) return { x: 0, y: 0 };
        const punto = new DOMPoint(e.clientX, e.clientY).matrixTransform(ctm.inverse());
        return { x: punto.x, y: punto.y };
    };

    const empezar = (pieza: ElegidoPlanta) => (e: PointerEvent<SVGGElement>) => {
        if (!edicion) return;
        e.stopPropagation();
        edicion.onElegir(pieza);
        (e.currentTarget as Element).setPointerCapture?.(e.pointerId);
        setArrastre({ pieza, inicio: enMetros(e), dx: 0, dy: 0 });
    };

    const mover = (e: PointerEvent<SVGSVGElement>) => {
        if (!arrastre) return;
        const ahora = enMetros(e);
        setArrastre({ ...arrastre, dx: ahora.x - arrastre.inicio.x, dy: ahora.y - arrastre.inicio.y });
    };

    const soltar = () => {
        if (!arrastre || !edicion) return;
        if (arrastre.dx !== 0 || arrastre.dy !== 0) {
            edicion.onDesplazar(arrastre.pieza, arrastre.dx, arrastre.dy);
        }
        setArrastre(null);
    };

    /** Flechas: mueven la pieza elegida medio metro (accesible sin ratón). */
    const teclas = (pieza: ElegidoPlanta) => (e: KeyboardEvent<SVGGElement>) => {
        if (!edicion) return;
        const flecha = FLECHAS[e.key];
        if (flecha) {
            e.preventDefault();
            edicion.onDesplazar(pieza, flecha[0] * PASO_PLANTA, flecha[1] * PASO_PLANTA);
        } else if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            edicion.onElegir(pieza);
        }
    };

    /** Desplazamiento en curso de una pieza (solo la que se arrastra). */
    const desplazamiento = (pieza: ElegidoPlanta) =>
        arrastre && mismo(arrastre.pieza, pieza) ? `translate(${arrastre.dx} ${arrastre.dy})` : undefined;

    const lineasRejilla = (total: number, cada: number) =>
        Array.from({ length: Math.floor(total / cada) + 1 }, (_, i) => i * cada);

    const puntos = [
        ...recorrido.flatMap((r) => {
            const p = pasillos.get(r.pasilloId);
            const c = planta.pasillos.find((x) => x.pasilloId === r.pasilloId);
            return p && c
                ? [{
                    secuencia: r.secuencia, ubicacionId: r.ubicacionId, ubicacion: r.ubicacion, accion: r.accion,
                    ...puntoEnPlanta(p, c, planta.medidas, r.modulo),
                }]
                : [];
        }),
        ...paradasElementos,
    ].sort((a, b) => a.secuencia - b.secuencia);
    const ubicacionPorId = new Map(mapa.ubicaciones.map((u) => [u.ubicacionId, u]));
    // Por el camino del trazado; los tramos sin camino (o sin trazado), en recto entre paradas.
    const puntoDe = new Map(puntos.map((p) => [p.ubicacionId, p]));
    const lineas: { x: number; y: number }[][] = trazado?.tramos.length
        ? trazado.tramos.flatMap((t) => {
            if (t.puntos.length > 1) return [t.puntos];
            const a = puntoDe.get(t.desde);
            const b = puntoDe.get(t.hasta);
            return a && b ? [[a, b]] : [];
        })
        : puntos.length > 1 ? [puntos] : [];

    const margen = 1;

    return (
        <div className="mapa-planta-real-scroll">
            <svg
                ref={svg}
                className={`mapa-planta-real${edicion ? " editando" : ""}`}
                viewBox={`${-margen} ${-margen} ${planta.ancho + margen * 2} ${planta.largo + margen * 2}`}
                style={{ maxWidth: (planta.ancho + margen * 2) * PX_POR_METRO }}
                role="group"
                aria-label={tx("mapa.plantaDeLaNaveAnchoLargo", { ancho: planta.ancho, largo: planta.largo })}
                onPointerMove={mover}
                onPointerUp={soltar}
                onPointerCancel={() => setArrastre(null)}
                onClick={() => edicion?.onElegir(null)}
            >
                <rect className="mapa-nave" x={0} y={0} width={planta.ancho} height={planta.largo} />
                <g className="mapa-rejilla" aria-hidden="true">
                    {lineasRejilla(planta.ancho, 1).map((x) => (
                        <line key={`x${x}`} className={x % 5 === 0 ? "marcada" : undefined} x1={x} y1={0} x2={x} y2={planta.largo} />
                    ))}
                    {lineasRejilla(planta.largo, 1).map((y) => (
                        <line key={`y${y}`} className={y % 5 === 0 ? "marcada" : undefined} x1={0} y1={y} x2={planta.ancho} y2={y} />
                    ))}
                </g>

                {planta.elementos.map((el, indice) => {
                    const pieza: ElegidoPlanta = { tipo: "ELEMENTO", indice };
                    const elegidoEl = mismo(edicion?.elegido ?? null, pieza);
                    const uso = usoElemento(mapa, el);
                    const textoUso = uso.salida && uso.entrada ? tx("mapa.salidaYEntrada") : uso.salida ? "salida" : uso.entrada ? "entrada" : "";
                    const conFichas = el.ubicaciones.length > 0;
                    return (
                        <g key={indice}>
                        <g
                            className={`mapa-elemento mapa-elemento-${el.tipo.toLowerCase()}${elegidoEl ? " elegido" : ""}${uso.salida ? " uso-salida" : ""}${uso.entrada ? " uso-entrada" : ""}`}
                            transform={desplazamiento(pieza)}
                            {...(edicion
                                ? {
                                    role: "button",
                                    "aria-pressed": elegidoEl,
                                    tabIndex: 0,
                                    "aria-label": tx("mapa.nombreFlechasParaMoverlo", { nombre: el.nombre }),
                                    onPointerDown: empezar(pieza),
                                    onKeyDown: teclas(pieza),
                                    onClick: (e: { stopPropagation: () => void }) => e.stopPropagation(),
                                }
                                : {})}
                        >
                            <rect x={el.x} y={el.y} width={el.ancho} height={el.largo} />
                            <text x={el.x + el.ancho / 2} y={conFichas ? el.y + 0.6 : el.y + el.largo / 2}>
                                {el.nombre}
                                {/* El uso en otra línea: con el nombre en la misma desbordaría un muelle de 4 m. */}
                                {textoUso && (
                                    <tspan className="mapa-elemento-uso" x={el.x + el.ancho / 2} dy={0.8}>{textoUso}</tspan>
                                )}
                            </text>
                            <title>{`${el.nombre} (${el.ancho} × ${el.largo} m)${textoUso ? tx("mapa.puntoDeTextouso", { textoUso }) : ""}`}</title>
                        </g>
                        {conFichas && (
                            <g className="mapa-elemento-fichas" transform={desplazamiento(pieza)}>
                                {el.ubicaciones.map((id, i) => {
                                    const u = ubicacionPorId.get(id);
                                    if (!u) return null;
                                    const ancho = Math.max(Math.min(el.ancho - 0.4, 3.4), 0.5);
                                    const x = el.x + (el.ancho - ancho) / 2;
                                    // Bajo el nombre (y el uso), repartidas en el alto que queda.
                                    const inicio = el.y + (textoUso ? 1.9 : 1.1);
                                    const paso = Math.min(1.0, Math.max(el.largo - (inicio - el.y) - 0.1, 0.4) / el.ubicaciones.length);
                                    const alto = paso * 0.8;
                                    const y = inicio + i * paso;
                                    const interactiva = !edicion && onUbicacion;
                                    return (
                                        <g
                                            key={id}
                                            className={`mapa-elemento-ficha tono-${tonoUbicacion(u, capa, paleta)}${u.ubicacionId === ubicacionId ? " seleccionada" : ""}`}
                                            {...(interactiva
                                                ? {
                                                    role: "button",
                                                    "aria-pressed": u.ubicacionId === ubicacionId,
                                                    tabIndex: 0,
                                                    "aria-label": resumenUbicacion(u).replace(/\n/g, ". "),
                                                    onClick: () => onUbicacion(u.ubicacionId),
                                                    onKeyDown: (e: KeyboardEvent<SVGGElement>) => {
                                                        if (e.key === "Enter" || e.key === " ") {
                                                            e.preventDefault();
                                                            onUbicacion(u.ubicacionId);
                                                        }
                                                    },
                                                }
                                                : {})}
                                        >
                                            <rect x={x} y={y} width={ancho} height={alto} rx={0.15} />
                                            <text x={x + ancho / 2} y={y + alto / 2}>{u.ubicacion}</text>
                                            <title>{resumenUbicacion(u)}</title>
                                        </g>
                                    );
                                })}
                            </g>
                        )}
                        </g>
                    );
                })}

                {colocados.map(({ p, c }) => {
                    const g = geometriaEnPlanta(p, c, planta.medidas);
                    const pieza: ElegidoPlanta = { tipo: "PASILLO", pasilloId: p.pasilloId };
                    const porModulo = ubicacionesPorModulo(mapa.ubicaciones, p.pasilloId);
                    const rotulo = rotuloPasillo(mapa, p.pasilloId);
                    const elegido = mismo(edicion?.elegido ?? null, pieza);
                    const vertical = c.giro === 0 || c.giro === 180;
                    return (
                        <g
                            key={p.pasilloId}
                            className={`mapa-pasillo-real${p.pasilloId === pasilloId ? " seleccionado" : ""}${elegido ? " elegido" : ""}${zonaId && zonaDe.get(p.pasilloId) !== zonaId ? " atenuado" : ""}`}
                            transform={desplazamiento(pieza)}
                            {...(edicion
                                ? {
                                    role: "button",
                                    "aria-pressed": elegido,
                                    tabIndex: 0,
                                    "aria-label": tx("mapa.pasilloRotuloFlechasParaMoverlo", { rotulo }),
                                    onPointerDown: empezar(pieza),
                                    onKeyDown: teclas(pieza),
                                    onClick: (e: { stopPropagation: () => void }) => e.stopPropagation(),
                                }
                                : {})}
                        >
                            <rect className="mapa-pasillo-contorno" x={g.x} y={g.y} width={g.ancho} height={g.largo} />
                            <rect
                                className="mapa-pasillo-suelo"
                                x={g.suelo.x}
                                y={g.suelo.y}
                                width={g.suelo.ancho}
                                height={g.suelo.largo}
                                onClick={edicion ? undefined : () => onPasillo(p.pasilloId)}
                            />
                            {g.celdas.map((celda) => {
                                const us = porModulo.get(celda.modulo) ?? [];
                                const letra = letraModulo(us, capa);
                                const contieneSeleccion = us.some((u) => u.ubicacionId === ubicacionId);
                                return (
                                    <g key={celda.modulo}>
                                        <rect
                                            className={`mapa-celda tono-${tonoModulo(us, capa, paleta)}${contieneSeleccion ? " seleccionada" : ""}`}
                                            x={celda.x}
                                            y={celda.y}
                                            width={celda.ancho}
                                            height={celda.largo}
                                            {...(edicion
                                                ? {}
                                                : {
                                                    role: "button",
                                                    tabIndex: 0,
                                                    "aria-label": resumenModulo(p.pasillo, celda.modulo, us).replace(/\n/g, ". "),
                                                    onClick: () => onPasillo(p.pasilloId),
                                                    onKeyDown: (e: KeyboardEvent<SVGRectElement>) => {
                                                        if (e.key === "Enter" || e.key === " ") {
                                                            e.preventDefault();
                                                            onPasillo(p.pasilloId);
                                                        }
                                                    },
                                                })}
                                        >
                                            <title>{resumenModulo(p.pasillo, celda.modulo, us)}</title>
                                        </rect>
                                        {letra && (
                                            <text
                                                className="mapa-celda-letra"
                                                x={celda.x + celda.ancho / 2}
                                                y={celda.y + celda.largo / 2}
                                                aria-hidden="true"
                                            >
                                                {letra}
                                            </text>
                                        )}
                                    </g>
                                );
                            })}
                            {g.accesos.map((f, i) => (
                                <line
                                    key={i}
                                    className="mapa-pasillo-flecha"
                                    x1={f.x1}
                                    y1={f.y1}
                                    x2={f.x2}
                                    y2={f.y2}
                                    markerEnd="url(#mapa-flecha)"
                                    aria-hidden="true"
                                />
                            ))}
                            <text
                                className="mapa-pasillo-rotulo"
                                x={g.suelo.x + g.suelo.ancho / 2}
                                y={g.suelo.y + g.suelo.largo / 2}
                                transform={vertical
                                    ? `rotate(-90 ${g.suelo.x + g.suelo.ancho / 2} ${g.suelo.y + g.suelo.largo / 2})`
                                    : undefined}
                                aria-hidden="true"
                            >
                                {rotulo}
                            </text>
                        </g>
                    );
                })}

                {lineas.map((linea, i) => (
                    <polyline
                        key={i}
                        className={`mapa-recorrido${trazado ? " por-camino" : ""}`}
                        points={linea.map((t) => `${t.x},${t.y}`).join(" ")}
                    />
                ))}
                {puntos.map((r) => (
                    <g key={r.secuencia} className={`mapa-parada mapa-parada-${r.accion.toLowerCase()}`}>
                        <circle cx={r.x} cy={r.y} r={0.65} />
                        <text x={r.x} y={r.y}>{r.secuencia}</text>
                        <title>{tx("mapa.secuenciaValorEnUbicacion", { secuencia: r.secuencia, valor: textoAccionParada[r.accion], ubicacion: r.ubicacion })}</title>
                    </g>
                ))}

                <defs>
                    <marker id="mapa-flecha" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
                        <path d="M 0 0 L 10 5 L 0 10 z" className="mapa-flecha-punta" />
                    </marker>
                </defs>
            </svg>
            <p className="mapa-planta-escala">
                {tx("mapa.naveDeAnchoLargoMRejilla", { ancho: planta.ancho, largo: planta.largo })}
            </p>
        </div>
    );
};


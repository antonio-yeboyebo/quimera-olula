import { KeyboardEvent } from "react";
import { textoAccionParada } from "#/almacen/orden/dominio.ts";
import { CapaMapa, PuntoRecorrido, UbicacionMapa, ZonaMapa } from "../diseño.ts";
import {
    geometriaZona, letraModulo, MEDIDAS, puntoDeModulo, resumenModulo, resumenUbicacion, tonoModulo, tonoUbicacion,
    trazoRecorrido, ubicacionesPorModulo, ubicacionesSueltas,
} from "../dominio.ts";
import { tAlmacen } from "../../i18n/index.ts";

type Props = {
    zona: ZonaMapa;
    ubicaciones: UbicacionMapa[];
    capa: CapaMapa;
    paleta: Map<string, number>;
    pasilloId: string | null;
    ubicacionId: string | null;
    recorrido: PuntoRecorrido[];
    onPasillo: (pasilloId: string) => void;
    onUbicacion: (ubicacionId: string) => void;
};

/** Enter o espacio sobre un elemento SVG con role="button". */
const alPulsar = (accion: () => void) => (e: KeyboardEvent<SVGElement>) => {
    if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        accion();
    }
};

/** Planta esquemática de una zona: pasillos por su orden, módulos a cada lado. */
export const PlantaZona = ({
    zona, ubicaciones, capa, paleta, pasilloId, ubicacionId, recorrido, onPasillo, onUbicacion,
}: Props) => {
    const { geometrias, ancho, alto } = geometriaZona(zona.pasillos);
    const sueltas = ubicacionesSueltas(ubicaciones, zona.zonaId);
    const deZona = new Set(zona.pasillos.map((p) => p.pasilloId));
    const puntos = recorrido.filter((p) => deZona.has(p.pasilloId));
    const trazo = trazoRecorrido(puntos, geometrias);

    return (
        <section className="mapa-zona">
            <h3>
                {zona.zona} <span className="mapa-zona-funcion">{zona.funcion}</span>
            </h3>
            {zona.pasillos.length > 0 && (
                <div className="mapa-planta-scroll">
                    <svg
                        className="mapa-planta"
                        viewBox={`0 0 ${ancho} ${alto}`}
                        width={ancho * 1.6}
                        height={alto * 1.6}
                        role="group"
                        aria-label={tAlmacen("mapa.plantaDeLaZonaZona", { zona: zona.zona })}
                    >
                        {zona.pasillos.map((p, i) => {
                            const g = geometrias[i];
                            const porModulo = ubicacionesPorModulo(ubicaciones, p.pasilloId);
                            const seleccionado = p.pasilloId === pasilloId;
                            return (
                                <g key={p.pasilloId} className={`mapa-pasillo${seleccionado ? " seleccionado" : ""}`}>
                                    <rect
                                        className="mapa-pasillo-suelo"
                                        x={g.x + MEDIDAS.fondo}
                                        y={MEDIDAS.cabecera}
                                        width={MEDIDAS.pasillo}
                                        height={g.alto}
                                        onClick={() => onPasillo(p.pasilloId)}
                                    />
                                    <text className="mapa-pasillo-codigo" x={g.xEje} y={MEDIDAS.cabecera - 6}>
                                        {p.pasillo}
                                    </text>
                                    {g.celdas.map((c) => {
                                        const us = porModulo.get(c.modulo) ?? [];
                                        const contieneSeleccion = us.some((u) => u.ubicacionId === ubicacionId);
                                        const letra = letraModulo(us, capa);
                                        return (
                                            <g key={c.modulo}>
                                                <rect
                                                    className={`mapa-celda tono-${tonoModulo(us, capa, paleta)}${contieneSeleccion ? " seleccionada" : ""}`}
                                                    x={c.x + 1}
                                                    y={c.y + 1}
                                                    width={c.ancho - 2}
                                                    height={c.alto - 2}
                                                    rx={2}
                                                    role="button"
                                                    tabIndex={0}
                                                    aria-label={resumenModulo(p.pasillo, c.modulo, us).replace(/\n/g, ". ")}
                                                    onClick={() => onPasillo(p.pasilloId)}
                                                    onKeyDown={alPulsar(() => onPasillo(p.pasilloId))}
                                                >
                                                    <title>{resumenModulo(p.pasillo, c.modulo, us)}</title>
                                                </rect>
                                                {letra && (
                                                    <text
                                                        className="mapa-celda-letra"
                                                        x={c.x + c.ancho / 2}
                                                        y={c.y + c.alto / 2}
                                                        aria-hidden="true"
                                                    >
                                                        {letra}
                                                    </text>
                                                )}
                                            </g>
                                        );
                                    })}
                                </g>
                            );
                        })}
                        {trazo.length > 1 && (
                            <polyline
                                className="mapa-recorrido"
                                points={trazo.map((t) => `${t.x},${t.y}`).join(" ")}
                            />
                        )}
                        {puntos.map((p) => {
                            const g = geometrias.find((x) => x.pasilloId === p.pasilloId);
                            if (!g) return null;
                            const { x, y } = puntoDeModulo(g, p.modulo);
                            return (
                                <g key={p.secuencia} className={`mapa-parada mapa-parada-${p.accion.toLowerCase()}`}>
                                    <circle cx={x} cy={y} r={7} />
                                    <text x={x} y={y}>{p.secuencia}</text>
                                    <title>{tAlmacen("mapa.secuenciaValorEnUbicacion", { secuencia: p.secuencia, valor: textoAccionParada[p.accion], ubicacion: p.ubicacion })}</title>
                                </g>
                            );
                        })}
                    </svg>
                </div>
            )}
            {sueltas.length > 0 && (
                <div className="mapa-sueltas">
                    {sueltas.map((u) => (
                        <button
                            key={u.ubicacionId}
                            type="button"
                            className={`mapa-ficha tono-${tonoUbicacion(u, capa, paleta)}${u.ubicacionId === ubicacionId ? " seleccionada" : ""}`}
                            title={resumenUbicacion(u)}
                            onClick={() => onUbicacion(u.ubicacionId)}
                        >
                            {u.ubicacion}
                        </button>
                    ))}
                </div>
            )}
            {zona.pasillos.length === 0 && sueltas.length === 0 && <p>{tAlmacen("mapa.sinUbicaciones")}</p>}
        </section>
    );
};

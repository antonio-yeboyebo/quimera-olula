import { useEffect, useState } from "react";
import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { QInput } from "@olula/componentes/atomos/qinput.tsx";
import { QSelect } from "@olula/componentes/index.js";
import { ElegidoPlanta, MapaAlmacen, MedidasPlanta, PlantaAlmacen, TipoElemento } from "../diseño.ts";
import {
    avisosDistancia, avisosPlanta, cambiarElemento, desvincularUbicacion, sinVincular, vincularUbicaciones, cambiarPasilloEnPlanta, colocarPasillo, girarPasillo, medidasEfectivas,
    metrosNoNegativos, metrosPositivos, moverPieza, nuevoElemento, pasillosSinColocar, quitarElemento,
    quitarPasilloDePlanta, rotuloPasillo, tiposElemento,
} from "../dominio.ts";
import { tAlmacen, useTAlmacen } from "../../i18n/index.ts";

type Props = {
    mapa: MapaAlmacen;
    planta: PlantaAlmacen;
    elegido: ElegidoPlanta | null;
    /** `elegido`: lo que queda elegido después (sin él, lo mismo). */
    onCambiar: (planta: PlantaAlmacen, elegido?: ElegidoPlanta | null) => void;
    onGuardar: () => void;
    onCancelar: () => void;
};

/**
 * Campo en metros que se aplica al salir (o con Enter): mientras se escribe no se toca la planta.
 * `opcional`: vacío = null (la medida de la planta).
 */
const CampoMetros = ({ label, nombre, valor, opcional, ceroValido, onCambio }: {
    label: string;
    nombre: string;
    valor: number | null;
    opcional?: boolean;
    ceroValido?: boolean;
    onCambio: (valor: number | null) => void;
}) => {
    const t = useTAlmacen();
    const texto = valor === null ? "" : String(valor);
    const [escrito, setEscrito] = useState(texto);
    useEffect(() => setEscrito(texto), [texto]);

    const aplicar = (v: string) => {
        if (opcional && v.trim() === "") return onCambio(null);
        const n = ceroValido ? metrosNoNegativos(v) : metrosPositivos(v);
        if (n === null) return setEscrito(texto);
        onCambio(n);
    };

    return (
        <QInput
            label={label}
            nombre={nombre}
            tipo="numero"
            valor={escrito}
            placeholder={opcional ? t("mapa.deLaPlanta") : undefined}
            onChange={(v: string) => setEscrito(v)}
            onBlur={(v: string) => aplicar(v)}
            onEnterKeyUp={(v: string) => aplicar(v)}
        />
    );
};

const textoMedida: Record<keyof MedidasPlanta, string> = {
    get largoModulo() { return tAlmacen("mapa.largoDeModuloM"); },
    get fondo() { return tAlmacen("mapa.fondoDeEstanteriaM"); },
    get anchoPasillo() { return tAlmacen("mapa.anchoDePasilloM"); },
};

const CAMPOS_MEDIDA: (keyof MedidasPlanta)[] = ["largoModulo", "fondo", "anchoPasillo"];

/** Panel del editor de la planta: nave, medidas, pieza elegida, pasillos sin colocar y avisos. */
export const EditorPlanta = ({ mapa, planta, elegido, onCambiar, onGuardar, onCancelar }: Props) => {
    const sinColocar = pasillosSinColocar(mapa, planta);
    const avisos = [...avisosDistancia(mapa, planta), ...avisosPlanta(mapa, planta)];
    const colocacion = elegido?.tipo === "PASILLO"
        ? planta.pasillos.find((c) => c.pasilloId === elegido.pasilloId) ?? null
        : null;
    const indiceElemento = elegido?.tipo === "ELEMENTO" ? elegido.indice : null;
    const elemento = indiceElemento !== null ? planta.elementos[indiceElemento] ?? null : null;

    return (
        <section className="mapa-panel mapa-editor-planta" aria-label={tAlmacen("mapa.editorDeLaPlanta")}>
            <div className="mapa-panel-cabecera">
                <h3>{tAlmacen("mapa.editarPlanta")}</h3>
            </div>

            <p className="mapa-editor-ayuda">
                {tAlmacen("mapa.arrastraLosPasillosYElementosO")}
            </p>

            <fieldset>
                <legend>{tAlmacen("mapa.naveYMedidasPorDefecto")}</legend>
                <quimera-formulario>
                    <CampoMetros label={tAlmacen("mapa.anchoDeLaNaveM")} nombre="naveAncho" valor={planta.ancho}
                        onCambio={(v) => v !== null && onCambiar({ ...planta, ancho: v })} />
                    <CampoMetros label={tAlmacen("mapa.largoDeLaNaveM")} nombre="naveLargo" valor={planta.largo}
                        onCambio={(v) => v !== null && onCambiar({ ...planta, largo: v })} />
                    {CAMPOS_MEDIDA.map((campo) => (
                        <CampoMetros key={campo} label={textoMedida[campo]} nombre={`planta-${campo}`}
                            valor={planta.medidas[campo]}
                            onCambio={(v) => v !== null && onCambiar({ ...planta, medidas: { ...planta.medidas, [campo]: v } })} />
                    ))}
                    <CampoMetros label={tAlmacen("mapa.metrosPorNivel")} nombre="metrosNivel" valor={planta.metrosNivel}
                        onCambio={(v) => v !== null && onCambiar({ ...planta, metrosNivel: v })} />
                </quimera-formulario>
                <p className="mapa-editor-nota">
                    {tAlmacen("mapa.metrosAPieQueEquivalenA")}
                </p>
            </fieldset>

            {colocacion && (
                <fieldset>
                    <legend>{tAlmacen("mapa.pasilloValor", { valor: rotuloPasillo(mapa, colocacion.pasilloId) })}</legend>
                    <quimera-formulario>
                        <CampoMetros label={tAlmacen("mapa.xM")} nombre="pasilloX" valor={colocacion.x} ceroValido
                            onCambio={(v) => v !== null && onCambiar(moverPieza(mapa, planta, elegido!, v, colocacion.y))} />
                        <CampoMetros label={tAlmacen("mapa.yM")} nombre="pasilloY" valor={colocacion.y} ceroValido
                            onCambio={(v) => v !== null && onCambiar(moverPieza(mapa, planta, elegido!, colocacion.x, v))} />
                        {CAMPOS_MEDIDA.map((campo) => (
                            <CampoMetros key={campo} label={textoMedida[campo]} nombre={`pasillo-${campo}`} opcional
                                valor={colocacion.medidas[campo] ?? null}
                                onCambio={(v) => {
                                    const medidas = { ...colocacion.medidas };
                                    if (v === null) delete medidas[campo];
                                    else medidas[campo] = v;
                                    onCambiar(cambiarPasilloEnPlanta(planta, colocacion.pasilloId, { medidas }));
                                }} />
                        ))}
                    </quimera-formulario>
                    <p className="mapa-editor-nota">
                        {tAlmacen("mapa.giro")}{" "}{colocacion.giro}{tAlmacen("mapa.medidasEnUso")}{" "}
                        {(() => {
                            const m = medidasEfectivas(planta.medidas, colocacion.medidas);
                            return tAlmacen("mapa.moduloLargomoduloMFondoFondoM", { largoModulo: m.largoModulo, fondo: m.fondo, anchoPasillo: m.anchoPasillo });
                        })()}
                    </p>
                    <div className="botones">
                        <QBoton variante="borde" onClick={() => onCambiar(girarPasillo(mapa, planta, colocacion.pasilloId))}>
                            {tAlmacen("mapa.girar90")}
                        </QBoton>
                        <QBoton variante="texto" onClick={() => onCambiar(quitarPasilloDePlanta(planta, colocacion.pasilloId), null)}>
                            {tAlmacen("mapa.quitarDeLaPlanta")}
                        </QBoton>
                    </div>
                </fieldset>
            )}

            {elemento && indiceElemento !== null && (
                <fieldset>
                    <legend>{elemento.nombre}</legend>
                    <quimera-formulario>
                        <QSelect
                            label={tAlmacen("mapa.tipo")}
                            nombre="elementoTipo"
                            valor={elemento.tipo}
                            opciones={tiposElemento}
                            onChange={(o) => o && onCambiar(cambiarElemento(planta, indiceElemento, { tipo: o.valor as TipoElemento }))}
                        />
                        <QInput
                            label={tAlmacen("mapa.nombre")}
                            nombre="elementoNombre"
                            valor={elemento.nombre}
                            onChange={(v: string) => onCambiar(cambiarElemento(planta, indiceElemento, { nombre: v }))}
                        />
                        <CampoMetros label={tAlmacen("mapa.xM")} nombre="elementoX" valor={elemento.x} ceroValido
                            onCambio={(v) => v !== null && onCambiar(moverPieza(mapa, planta, elegido!, v, elemento.y))} />
                        <CampoMetros label={tAlmacen("mapa.yM")} nombre="elementoY" valor={elemento.y} ceroValido
                            onCambio={(v) => v !== null && onCambiar(moverPieza(mapa, planta, elegido!, elemento.x, v))} />
                        <CampoMetros label={tAlmacen("mapa.anchoM")} nombre="elementoAncho" valor={elemento.ancho}
                            onCambio={(v) => v !== null && onCambiar(cambiarElemento(planta, indiceElemento, { ancho: v }))} />
                        <CampoMetros label={tAlmacen("mapa.largoM")} nombre="elementoLargo" valor={elemento.largo}
                            onCambio={(v) => v !== null && onCambiar(cambiarElemento(planta, indiceElemento, { largo: v }))} />
                    </quimera-formulario>
                    <UbicacionesElemento
                        mapa={mapa}
                        planta={planta}
                        indice={indiceElemento}
                        onCambiar={(p) => onCambiar(p)}
                    />
                    <div className="botones">
                        <QBoton variante="texto" onClick={() => onCambiar(quitarElemento(planta, indiceElemento), null)}>
                            {tAlmacen("mapa.quitarElemento")}
                        </QBoton>
                    </div>
                </fieldset>
            )}

            <div className="botones">
                <QBoton variante="borde" onClick={() => {
                    const nueva = nuevoElemento(planta);
                    onCambiar(nueva, { tipo: "ELEMENTO", indice: nueva.elementos.length - 1 });
                }}>
                    {tAlmacen("mapa.anadirElemento")}
                </QBoton>
            </div>

            {sinColocar.length > 0 && (
                <div className="mapa-editor-sin-colocar">
                    <h4>{tAlmacen("mapa.pasillosSinColocar")}</h4>
                    <ul>
                        {sinColocar.map((p) => (
                            <li key={p.pasilloId}>
                                <span>{rotuloPasillo(mapa, p.pasilloId)}</span>
                                <QBoton variante="texto" onClick={() =>
                                    onCambiar(colocarPasillo(mapa, planta, p), { tipo: "PASILLO", pasilloId: p.pasilloId })}>
                                    {tAlmacen("mapa.colocar")}
                                </QBoton>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {avisos.length > 0 && (
                <ul className="mapa-editor-avisos" aria-label={tAlmacen("mapa.avisos")}>
                    {avisos.map((a) => <li key={a}>{a}</li>)}
                </ul>
            )}

            <div className="botones mapa-editor-acciones">
                <QBoton onClick={onGuardar}>{tAlmacen("mapa.guardarPlanta")}</QBoton>
                <QBoton variante="texto" onClick={onCancelar}>{tAlmacen("mapa.cancelar")}</QBoton>
            </div>
        </section>
    );
};

/**
 * Ubicaciones sin pasillo situadas en el elemento (muelles, playas): les da posición en la planta y,
 * por la función de su zona, hacen del elemento un punto de salida o de entrada.
 */
const UbicacionesElemento = ({ mapa, planta, indice, onCambiar }: {
    mapa: MapaAlmacen;
    planta: PlantaAlmacen;
    indice: number;
    onCambiar: (planta: PlantaAlmacen) => void;
}) => {
    const elemento = planta.elementos[indice];
    const porId = new Map(mapa.ubicaciones.map((u) => [u.ubicacionId, u]));
    const zonaDe = (zonaId: string) => mapa.zonas.find((z) => z.zonaId === zonaId);
    const libres = sinVincular(mapa, planta);
    const zonasLibres = [...new Set(libres.map((u) => u.zonaId))].flatMap((id) => {
        const z = zonaDe(id);
        return z ? [z] : [];
    });

    return (
        <div className="mapa-editor-ubicaciones">
            <h4>{tAlmacen("mapa.ubicacionesEnElElemento")}</h4>
            {elemento.ubicaciones.length === 0 && (
                <p className="mapa-editor-nota">{tAlmacen("mapa.ningunaVinculaAquiLosMuellesO")}</p>
            )}
            <ul>
                {elemento.ubicaciones.map((id) => {
                    const u = porId.get(id);
                    const z = u && zonaDe(u.zonaId);
                    return (
                        <li key={id}>
                            <span>
                                {u?.ubicacion ?? id}
                                {z && <span className="mapa-editor-nota"> · {z.zona} ({z.funcion.toLowerCase()})</span>}
                            </span>
                            <QBoton variante="texto" onClick={() => onCambiar(desvincularUbicacion(planta, indice, id))}>
                                {tAlmacen("mapa.quitar")}
                            </QBoton>
                        </li>
                    );
                })}
            </ul>
            {libres.length > 0 && (
                <>
                    <quimera-formulario>
                        <QSelect
                            label={tAlmacen("mapa.anadirUbicacion")}
                            nombre="elementoUbicacion"
                            valor=""
                            opciones={[
                                { valor: "", descripcion: tAlmacen("mapa.elegir") },
                                ...libres.map((u) => ({
                                    valor: u.ubicacionId,
                                    descripcion: `${u.ubicacion} · ${zonaDe(u.zonaId)?.zona ?? ""}`,
                                })),
                            ]}
                            onChange={(o) => o?.valor && onCambiar(vincularUbicaciones(planta, indice, [o.valor]))}
                        />
                    </quimera-formulario>
                    <div className="botones">
                        {zonasLibres.map((z) => (
                            <QBoton
                                key={z.zonaId}
                                variante="texto"
                                onClick={() => onCambiar(vincularUbicaciones(
                                    planta, indice, libres.filter((u) => u.zonaId === z.zonaId).map((u) => u.ubicacionId)))}
                            >
                                {tAlmacen("mapa.todasLasDeZona", { zona: z.zona })}
                            </QBoton>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
};

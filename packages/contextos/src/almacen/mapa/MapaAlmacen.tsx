import { OrdenAbierta } from "#/almacen/comun/componentes/OrdenAbierta.tsx";
import { urlFicha, urlListado } from "#/almacen/comun/fichas.ts";
import { ValorConEnlace } from "@olula/componentes/atomos/qenlace_ficha.tsx";
import { useEffect } from "react";
import { Almacen } from "#/almacen/comun/componentes/Almacen.tsx";
import { motivoRecorridoVacio, textoAccionParada } from "#/almacen/orden/dominio.ts";
import { DIAS_POR_DEFECTO, enteroPositivo, origenesRotacion } from "#/almacen/slotting/dominio.ts";
import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { QInput } from "@olula/componentes/atomos/qinput.tsx";
import { QSelect } from "@olula/componentes/index.js";
import { useMaquina } from "@olula/componentes/hook/useMaquina.ts";
import { puede } from "@olula/lib/dominio.ts";
import { AlzadoPasillo } from "./alzado/AlzadoPasillo.tsx";
import { DetalleUbicacionMapa } from "./detalle/DetalleUbicacionMapa.tsx";
import { ElegidoPlanta, PlantaAlmacen, UbicacionMapa } from "./diseño.ts";
import {
    avisosAccesibilidad, capasMapa, leyenda, paletaClases, paradasEnElementos, paradasSinPasillo,
    puntosRecorrido, resumenUbicacion, textoCalculo, tonoUbicacion, vinculadas,
} from "./dominio.ts";
import { contextoMapaDeEntrada, desplazarEnBorrador, getMaquina } from "./maquina.ts";
import { PlantaZona } from "./planta/PlantaZona.tsx";
import { EditorPlanta } from "./planta_real/EditorPlanta.tsx";
import { PlantaReal } from "./planta_real/PlantaReal.tsx";
import "#/comun/estilos/pagina_proceso.css";
import "./MapaAlmacen.css";
import { tAlmacen, useTAlmacen } from "../i18n/index.ts";

export const MapaAlmacen = () => {
    const t = useTAlmacen();
    const { ctx, emitir, setCtx } = useMaquina(getMaquina, contextoMapaDeEntrada());

    // Con almacén de trabajo o un enlace, carga directamente.
    useEffect(() => {
        emitir("entrada");
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    const { mapa, capa } = ctx;
    const paleta = mapa ? paletaClases(mapa) : new Map<string, number>();
    const zonas = mapa ? mapa.zonas.filter((z) => !ctx.zonaId || z.zonaId === ctx.zonaId) : [];
    const pasillo = mapa?.zonas.flatMap((z) => z.pasillos).find((p) => p.pasilloId === ctx.pasilloId) ?? null;
    const ubicacion = mapa?.ubicaciones.find((u) => u.ubicacionId === ctx.ubicacionId) ?? null;
    const puntos = mapa && ctx.recorrido ? puntosRecorrido(ctx.recorrido, mapa) : [];
    const sinPasillo = mapa && ctx.recorrido ? paradasSinPasillo(ctx.recorrido, mapa) : [];
    const editando = ctx.estado === "EDITANDO" && ctx.borrador !== null;
    const planta: PlantaAlmacen | null = editando ? ctx.borrador : mapa?.planta ?? null;
    const enPlanta = (editando || ctx.vista === "PLANTA") && planta !== null;
    const puedeEditar = puede("almacen.pasillo");
    // En la planta, las ubicaciones situadas en un elemento se dibujan dentro de él.
    const enElementos = enPlanta && planta ? vinculadas(planta) : new Set<string>();
    const sueltas = mapa
        ? mapa.ubicaciones.filter((u) =>
            u.pasilloId === null && !enElementos.has(u.ubicacionId) && (!ctx.zonaId || u.zonaId === ctx.zonaId))
        : [];
    const paradasElementos = enPlanta && planta && ctx.recorrido ? paradasEnElementos(ctx.recorrido, planta) : [];
    const sinPosicion = sinPasillo.filter((p) => !paradasElementos.some((e) => e.secuencia === p.secuencia));
    const avisosCalculo = mapa && !editando ? avisosAccesibilidad(mapa) : [];
    const capaDeAccesibilidad = capa === "ABC_UBICACION" || capa === "SLOTTING";

    return (
        <div className="MapaAlmacen PaginaProceso">
            <h2>{t("mapa.mapaDelAlmacen")}</h2>

            <quimera-formulario>
                <Almacen
                    label={t("mapa.almacen")}
                    nombre="almacenId"
                    valor={ctx.almacenId}
                    onChange={(opcion) => emitir("almacen_cambiado", opcion?.valor ?? "")}
                />
                <QSelect
                    label={t("mapa.zona")}
                    nombre="zonaId"
                    valor={ctx.zonaId}
                    opciones={[
                        { valor: "", descripcion: t("mapa.todas") },
                        ...(mapa?.zonas ?? []).map((z) => ({ valor: z.zonaId, descripcion: `${z.zona} · ${z.funcion}` })),
                    ]}
                    deshabilitado={!mapa}
                    onChange={(opcion) => emitir("zona_cambiada", opcion?.valor ?? "")}
                />
                <QSelect
                    label={t("mapa.capa")}
                    nombre="capa"
                    valor={capa}
                    opciones={capasMapa}
                    onChange={(opcion) => emitir("capa_cambiada", opcion?.valor ?? "")}
                />
                <QSelect
                    label={t("mapa.vista")}
                    nombre="vista"
                    valor={enPlanta ? "PLANTA" : "ESQUEMA"}
                    opciones={[
                        { valor: "ESQUEMA", descripcion: t("mapa.esquemaPorZonas") },
                        ...(mapa?.planta ? [{ valor: "PLANTA", descripcion: t("mapa.plantaReal") }] : []),
                    ]}
                    deshabilitado={!mapa?.planta || editando}
                    onChange={(opcion) => emitir("vista_cambiada", opcion?.valor ?? "")}
                />
            </quimera-formulario>

            {mapa && puedeEditar && !editando && (
                <div className="botones mapa-botones-planta">
                    <QBoton variante="borde" onClick={() => emitir("edicion_solicitada")}>
                        {mapa.planta ? t("mapa.editarPlanta") : t("mapa.crearPlanta")}
                    </QBoton>
                </div>
            )}

            <div className="mapa-barra" hidden={editando}>
                <div className="mapa-barra-campos">
                    <quimera-formulario>
                        <QSelect
                            label={t("mapa.rotacionSegun")}
                            nombre="origen"
                            valor={ctx.origen}
                            opciones={origenesRotacion}
                            onChange={(opcion) => emitir("origen_cambiado", opcion?.valor ?? "")}
                        />
                        <QInput
                            label={t("mapa.dias")} nombre="dias" tipo="numero" valor={ctx.dias}
                            onChange={(v: string) => emitir("dias_cambiados", v)}
                        />
                    </quimera-formulario>
                </div>
                <div className="botones">
                    <QBoton deshabilitado={!ctx.almacenId} onClick={() => emitir("actualizacion_solicitada")}>
                        {mapa ? t("mapa.recalcularDiasDias", { dias: enteroPositivo(ctx.dias, DIAS_POR_DEFECTO) }) : t("mapa.cargar")}
                    </QBoton>
                </div>
            </div>

            <div className="mapa-barra" hidden={editando}>
                <div className="mapa-barra-campos">
                    <quimera-formulario>
                        <OrdenAbierta
                            label={t("mapa.recorridoDeLaOrden")}
                            nombre="ordenId"
                            almacenId={ctx.almacenId}
                            valor={ctx.ordenId}
                            deshabilitado={!mapa}
                            onChange={(ordenId) => emitir("orden_cambiada", ordenId)}
                        />
                    </quimera-formulario>
                </div>
                <div className="botones">
                    <QBoton
                        variante="borde"
                        deshabilitado={!mapa || !ctx.ordenId.trim()}
                        onClick={() => emitir("recorrido_solicitado")}
                    >
                        {t("mapa.verRecorrido")}
                    </QBoton>
                    {ctx.recorrido && (
                        <QBoton variante="texto" onClick={() => emitir("recorrido_quitado")}>
                            {t("mapa.quitarRecorrido")}
                        </QBoton>
                    )}
                </div>
            </div>

            {mapa && (
                <ul className="mapa-leyenda" aria-label={t("mapa.leyenda")}>
                    {leyenda(capa, paleta).map((e) => (
                        <li key={e.tono}>
                            <span className={`mapa-muestra tono-${e.tono}`} aria-hidden="true" />
                            {e.texto}
                        </li>
                    ))}
                    {capaDeAccesibilidad && <li className="mapa-leyenda-calculo">{textoCalculo(mapa)}</li>}
                    {ctx.recorrido && ctx.recorrido.paradas.length > 0 && (
                        <>
                            <li>
                                <span className="mapa-muestra mapa-muestra-recorrido" aria-hidden="true" />
                                {t("mapa.recorrido")}{" "}
                                <ValorConEnlace href={urlFicha.orden(ctx.recorrido.ordenId)} etiqueta={t("mapa.abrirOrdenOrdenid", { ordenId: ctx.recorrido.ordenId })}>
                                    {ctx.recorrido.ordenId}
                                </ValorConEnlace>: {ctx.recorrido.paradas.length}{" "}{t("mapa.paradas")}{" "}
                                {ctx.recorrido.calculo === "DISTANCIA" && ctx.recorrido.metros != null
                                    ? t("mapa.tolocalestringMAPieOrdenadoPor", { toLocaleString: Math.round(ctx.recorrido.metros).toLocaleString("es-ES") })
                                    : enPlanta && ctx.trazado?.metros != null
                                        ? t("mapa.tolocalestringMAPie", { toLocaleString: Math.round(ctx.trazado.metros).toLocaleString("es-ES") })
                                        : t("mapa.modulosrecorridosModulos", { modulosRecorridos: ctx.recorrido.modulosRecorridos })}
                            </li>
                            <li>
                                <span className="mapa-muestra mapa-muestra-parada mapa-parada-recoger" aria-hidden="true" />
                                {t("mapa.recoger")}
                            </li>
                            <li>
                                <span className="mapa-muestra mapa-muestra-parada mapa-parada-dejar" aria-hidden="true" />
                                {t("mapa.dejar")}
                            </li>
                        </>
                    )}
                </ul>
            )}

            {ctx.recorrido && ctx.recorrido.paradas.length === 0 && (
                <p className="mapa-aviso">{motivoRecorridoVacio(ctx.recorrido)}</p>
            )}

            {sinPosicion.length > 0 && (
                <p className="mapa-aviso">
                    {t("mapa.paradasFueraDePasillo")}{" "}
                    {sinPosicion.map((p) => t("mapa.secuenciaValorEnUbicacion", { secuencia: p.secuencia, valor: textoAccionParada[p.accion], ubicacion: p.ubicacion })).join(", ")}
                </p>
            )}

            {avisosCalculo.length > 0 && (
                <ul className="mapa-avisos-calculo" aria-label={t("mapa.calculoDeLaAccesibilidad")}>
                    {avisosCalculo.map((a) => <li key={a}>{a}</li>)}
                </ul>
            )}

            {mapa && mapa.zonas.length === 0 && <p>{t("mapa.elAlmacenNoTieneZonas")}</p>}

            <div className="mapa-vistas">
                {enPlanta && mapa && planta && (
                    <div className="mapa-zonas mapa-zonas-planta">
                        <section className="mapa-zona mapa-zona-planta">
                            <PlantaReal
                                mapa={mapa}
                                planta={planta}
                                capa={capa}
                                paleta={paleta}
                                zonaId={ctx.zonaId}
                                pasilloId={ctx.pasilloId}
                                ubicacionId={ctx.ubicacionId}
                                recorrido={editando ? [] : puntos}
                                paradasElementos={editando ? [] : paradasElementos}
                                trazado={editando ? null : ctx.trazado}
                                onUbicacion={(id) => emitir("ubicacion_seleccionada", id)}
                                onPasillo={(id) => emitir("pasillo_seleccionado", id)}
                                edicion={editando
                                    ? {
                                        elegido: ctx.elegido,
                                        onElegir: (e: ElegidoPlanta | null) => emitir("pieza_elegida", e),
                                        onDesplazar: (e: ElegidoPlanta, dx: number, dy: number) =>
                                            setCtx((c) => desplazarEnBorrador(c, e, dx, dy)),
                                    }
                                    : undefined}
                            />
                            {!editando && sueltas.length > 0 && (
                                <FichasSueltas
                                    ubicaciones={sueltas}
                                    capa={capa}
                                    paleta={paleta}
                                    ubicacionId={ctx.ubicacionId}
                                    onUbicacion={(id) => emitir("ubicacion_seleccionada", id)}
                                />
                            )}
                        </section>
                    </div>
                )}

                {editando && mapa && planta && (
                    <EditorPlanta
                        mapa={mapa}
                        planta={planta}
                        elegido={ctx.elegido}
                        onCambiar={(p, e) => emitir("borrador_cambiado", { planta: p, elegido: e })}
                        onGuardar={() => emitir("guardado_solicitado")}
                        onCancelar={() => emitir("edicion_cancelada")}
                    />
                )}

                {!enPlanta && (
                <div className="mapa-zonas" aria-label={t("mapa.zonasDelAlmacen")} role="group">
                    {zonas.map((z) => (
                        <PlantaZona
                            key={z.zonaId}
                            zona={z}
                            ubicaciones={mapa!.ubicaciones}
                            capa={capa}
                            paleta={paleta}
                            pasilloId={ctx.pasilloId}
                            ubicacionId={ctx.ubicacionId}
                            recorrido={puntos}
                            onPasillo={(id) => emitir("pasillo_seleccionado", id)}
                            onUbicacion={(id) => emitir("ubicacion_seleccionada", id)}
                        />
                    ))}
                </div>
                )}

                {mapa && pasillo && !editando && (
                    <section className="mapa-panel mapa-panel-alzado">
                        <div className="mapa-panel-cabecera">
                            <h3>
                                <ValorConEnlace href={urlListado.ubicacionesDePasillo(pasillo.pasilloId)} etiqueta={`Ver las ubicaciones del pasillo ${pasillo.pasillo}`}>
                                    {t("mapa.pasilloPasillo", { pasillo: pasillo.pasillo })}
                                </ValorConEnlace>
                            </h3>
                            <QBoton variante="texto" onClick={() => emitir("pasillo_seleccionado", null)}>
                                {t("mapa.cerrar")}
                            </QBoton>
                        </div>
                        <AlzadoPasillo
                            pasillo={pasillo}
                            ubicaciones={mapa.ubicaciones}
                            capa={capa}
                            paleta={paleta}
                            ubicacionId={ctx.ubicacionId}
                            onUbicacion={(id) => emitir("ubicacion_seleccionada", id)}
                        />
                    </section>
                )}
            </div>

            {ubicacion && !editando && (
                <DetalleUbicacionMapa
                    ubicacion={ubicacion}
                    onCerrar={() => emitir("ubicacion_seleccionada", null)}
                />
            )}
        </div>
    );
};

/** Ubicaciones sin pasillo (playas, muelles, migración) bajo la planta real. */
const FichasSueltas = ({ ubicaciones, capa, paleta, ubicacionId, onUbicacion }: {
    ubicaciones: UbicacionMapa[];
    capa: Parameters<typeof tonoUbicacion>[1];
    paleta: Map<string, number>;
    ubicacionId: string | null;
    onUbicacion: (id: string) => void;
}) => (
    <div className="mapa-sueltas" aria-label={tAlmacen("mapa.ubicacionesFueraDePasillo")} role="group">
        {ubicaciones.map((u) => (
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
);

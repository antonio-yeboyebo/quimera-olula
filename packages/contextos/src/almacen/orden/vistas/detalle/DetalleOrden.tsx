import { CrearCaja } from "#/almacen/caja/crear/CrearCaja.tsx";
import { EtiquetaEstado } from "#/comun/componentes/etiqueta_estado/EtiquetaEstado.tsx";
import { Almacen } from "#/almacen/comun/componentes/Almacen.tsx";
import { Caja } from "#/almacen/comun/componentes/Caja.tsx";
import { Ubicacion } from "#/almacen/comun/componentes/Ubicacion.tsx";
import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { Detalle } from "@olula/componentes/detalle/Detalle.tsx";
import { useMaquina } from "@olula/componentes/hook/useMaquina.js";
import { QInput } from "@olula/componentes/index.js";
import { ContextoError } from "@olula/lib/contexto.ts";
import { EmitirEvento } from "@olula/lib/diseño.js";
import { plugin } from "@olula/lib/dominio.js";
import { imprimir_blob } from "@olula/lib/impresion.ts";
import { listaEntidadesInicial } from "@olula/lib/ListaEntidades.js";
import { useModelo } from "@olula/lib/useModelo.ts";
import { usePreferencia } from "@olula/lib/usePreferencia.ts";
import { desbloquearTTS, useSintesisVoz } from "@olula/lib/voz/useSintesisVoz.ts";
import { useCallback, useContext, useEffect } from "react";
import { Link, useParams } from "react-router";
import { TipoOrden } from "../../../comun/componentes/TipoOrden.tsx";
import { LineaOrdenAlmacen, OrdenAlmacen } from "../../diseño.ts";
import {
    etiquetaEstadoOrden,
    hayAgenciasEnvio,
    metaOrden,
    ordenAlbaranable,
    ordenPermiteEnvio,
    ordenVacia,
    pedidoUnicoDeOrden,
} from "../../dominio.ts";
import { crearCajasOrden, getEtiquetaEnvio, getReportEtiquetasOrden } from "../../infraestructura.ts";
import { AlbaranarOrden } from "../albaranar/AlbaranarOrden.tsx";
import { BorrarOrden } from "../borrar/BorrarOrden.tsx";
import { GenerarEnvioOrden } from "../generar_envio/GenerarEnvioOrden.tsx";
import { ColocacionOrden } from "../colocar/ColocacionOrden.tsx";
import { TerminarOrden } from "../terminar/TerminarOrden.tsx";
import { calcularAccionPrincipal } from "./accion_principal.ts";
import { guardarOrden } from "./detalle.ts";
import "./DetalleOrden.css";
import { LecturaOrden } from "./lectura/LecturaLineaOrden.tsx";
import { LecturasCajaOrden } from "./lecturas_caja/LecturasCajaOrden.tsx";
import { LecturaCajaOrden } from "./leer_caja/LecturaCajaOrden.tsx";
import { iniciarAudioLectura } from "#/almacen/comun/audio.ts";
import { definicionDeLinea, tieneFaseDrop } from "../../pasos/catalogo.ts";
import { LeerPasosOrden } from "./leer_pasos/LeerPasosOrden.tsx";
import { LecturaUbicacionOrden } from "./leer_ubicacion/LecturaUbicacionOrden.tsx";
import { LineasOrden } from "./lineas/LineasOrden.tsx";
import { ContextoOrdenAlmacen, getMaquina } from "./maquina.ts";

const titulo = (orden: OrdenAlmacen) => `${orden.descripcion}`

export const DetalleOrden = ({
    id,
    publicar = async () => {},
}: {
    id?: string;
    publicar?: EmitirEvento;
}) => {
    const params = useParams();
    const ordenId = id ?? params.id;

    const contextoInicial: ContextoOrdenAlmacen = {
        estado: "INICIAL",
        orden: ordenVacia(),
        lineas: listaEntidadesInicial<LineaOrdenAlmacen>(),
    };

    const { ctx, emitir } = useMaquina(getMaquina, contextoInicial, publicar);
    const { intentar } = useContext(ContextoError);
    const [modoVoz, setModoVoz] = usePreferencia("sga.modo-voz", false);
    const tts = useSintesisVoz();
    const imprimirEtiquetas = useCallback(async () => {
        await intentar(async () => {
            const blob = await getReportEtiquetasOrden(ctx.orden.id);
            imprimir_blob(blob);
        });
    }, [ctx.orden.id, intentar]);

    const reimprimirEtiquetaEnvio = useCallback(async (albaranId: string) => {
        await intentar(async () => {
            imprimir_blob(await getEtiquetaEnvio(albaranId));
        });
    }, [intentar]);

    const generarCajas = useCallback(async () => {
        await intentar(async () => {
            await crearCajasOrden(ctx.orden.id);
            await emitir("orden_id_cambiada", ctx.orden.id, true);
        });
    }, [ctx.orden.id, emitir, intentar]);

    const autoGuardar = useCallback(
        async (orden: OrdenAlmacen) => {
            await guardarOrden(ctx, orden);
            await emitir("orden_guardada");
        },
        [ctx, emitir]
    );

    const orden = useModelo(metaOrden, ctx.orden, autoGuardar);
    const { modelo } = orden;

    const sgaActivo = plugin("sga") === "activo";
    const ocultarTemporalDemos = false;
    // Cajas y ubicaciones de cabecera y lecturas de caja: de momento no se usan.
    const usarCajasCabecera = false;
    const mostrarOrigen = ["SALIDA", "TRASPASO"].includes(modelo.tipo);
    const mostrarDestino = ["ENTRADA", "TRASPASO"].includes(modelo.tipo);

    useEffect(() => {
        if (ordenId) {
            emitir("orden_id_cambiada", ordenId, true);
        }
    }, [ordenId]); // eslint-disable-line react-hooks/exhaustive-deps

    const accionPrincipal = sgaActivo && ctx.estado === "ABIERTA"
        ? calcularAccionPrincipal(modelo, {
              emitirPickSolicitado: () => emitir("lectura_pick_solicitada"),
              emitirDropSolicitado: () => { iniciarAudioLectura(); emitir("lectura_drop_solicitada"); },
              emitirColocacionSolicitada: () => emitir("colocacion_solicitada"),
              emitirAlbaranadoSolicitado: () => emitir("albaranado_solicitado"),
              emitirDevolucionSobrante: (linea) => emitir("devolucion_sobrante_solicitada", linea),
          })
        : null;

    if (!ctx.orden.id) return null;

    const pedidoUnico = modelo.tipo === "SALIDA" ? pedidoUnicoDeOrden(modelo) : null;

    return (
        <Detalle
            id={ordenId}
            obtenerTitulo={titulo}
            obtenerEstado={(o: OrdenAlmacen) => <EtiquetaEstado {...etiquetaEstadoOrden(o)} />}
            setEntidad={() => {}}
            entidad={ctx.orden}
            cerrarDetalle={() => publicar("cancelar_seleccion")}
        >
            <div className="maestro-botones">
                <QBoton variante="borde" onClick={() => emitir("borrado_solicitado")}>Borrar</QBoton>
                {modelo.estado !== "TERMINADA" && modelo.estado !== "PREPARADA" && (
                    <QBoton variante="borde" onClick={() => emitir("terminado_solicitado")}>Terminar</QBoton>
                )}
                {modelo.tipo === "SALIDA" && modelo.estado !== "TERMINADA" && (
                    <QBoton
                        variante="borde"
                        deshabilitado={!ordenAlbaranable(modelo)}
                        onClick={() => emitir("albaranado_solicitado")}
                    >
                        Albaranar
                    </QBoton>
                )}
                {modelo.tipo === "ENTRADA" && (
                    <QBoton
                        variante="borde"
                        deshabilitado={modelo.estado !== "TERMINADA"}
                        onClick={() => emitir("colocacion_solicitada")}
                    >
                        Colocar
                    </QBoton>
                )}
                {ordenPermiteEnvio(modelo, hayAgenciasEnvio()) && (
                    <QBoton variante="borde" onClick={() => emitir("envio_solicitado")}>Generar envío</QBoton>
                )}
                <QBoton variante="borde" onClick={imprimirEtiquetas}>Imprimir etiquetas</QBoton>
                {sgaActivo && (
                    <QBoton variante="borde" onClick={generarCajas}>Crear cajas</QBoton>
                )}
            </div>
            {accionPrincipal && (
                <div className="accion-principal">
                    <QBoton tamaño="xl" onClick={accionPrincipal.onClick}>
                        {accionPrincipal.label}
                    </QBoton>
                    <p className="accion-principal__instruccion">{accionPrincipal.instruccion}</p>
                </div>
            )}
            <div className="DetalleOrden">
                <quimera-formulario>
                    <QInput label="Descripción" {...orden.uiProps("descripcion")}/>
                    <TipoOrden {...orden.uiProps("tipo")} soloLectura />
                    <Almacen {...orden.uiProps("almacenId")} soloLectura />
                    <QInput label="Fecha" {...orden.uiProps("fecha")} soloLectura />
                    {pedidoUnico && (
                        <div className="DetalleOrden__albaranes">
                            <span>Pedido</span>
                            <Link to={`/ventas/pedido?id=${pedidoUnico.id}`}>{pedidoUnico.codigo}</Link>
                            {pedidoUnico.cliente && <span>{pedidoUnico.cliente}</span>}
                        </div>
                    )}
                    {modelo.albaranes.length > 0 && (
                        <div className="DetalleOrden__albaranes">
                            <span>{modelo.albaranes.length === 1 ? "Albarán" : "Albaranes"}</span>
                            {modelo.albaranes.map(({ id, codigo, agenciaEnvio, numeroTracking }) => (
                                <span key={id} className="DetalleOrden__albaran">
                                    <Link to={`/ventas/albaran?id=${id}`}>{codigo}</Link>
                                    {numeroTracking && (
                                        <>
                                            <span>{agenciaEnvio} {numeroTracking}</span>
                                            <QBoton
                                                variante="texto"
                                                tamaño="pequeño"
                                                onClick={() => reimprimirEtiquetaEnvio(id)}
                                            >
                                                Etiqueta
                                            </QBoton>
                                        </>
                                    )}
                                </span>
                            ))}
                        </div>
                    )}
                    {usarCajasCabecera && sgaActivo && mostrarOrigen && (
                        <Caja
                            {...orden.uiProps("idCajaOrigen")}
                            label="Caja origen"
                            nombre="idCajaOrigen"
                        />
                    )}
                    {usarCajasCabecera && sgaActivo && mostrarOrigen && (
                        <Ubicacion
                            {...orden.uiProps("idUbicacionOrigen")}
                            label="Ubicación origen"
                            nombre="idUbicacionOrigen"
                        />
                    )}
                    {usarCajasCabecera && sgaActivo && mostrarDestino && (
                        <Caja
                            {...orden.uiProps("idCajaDestino")}
                            label="Caja destino"
                            nombre="idCajaDestino"
                        />
                    )}
                    {usarCajasCabecera && sgaActivo && mostrarDestino && (
                        <QBoton variante="borde" texto='Nueva caja' onClick={() => emitir("creacion_de_caja_solicitada")} />
                    )}
                    {usarCajasCabecera && sgaActivo && mostrarDestino && (
                        <Ubicacion
                            {...orden.uiProps("idUbicacionDestino", "ubicacionDestino")}
                            label="Ubicación destino"
                            nombre="idUbicacionDestino"
                        />
                    )}
                </quimera-formulario>
            </div>
            <div className="maestro-botones">
                {ocultarTemporalDemos && (
                <QBoton variante="borde" onClick={() => emitir("lectura_solicitada")}>Lectura</
                QBoton>
                )}
                {ocultarTemporalDemos && sgaActivo && ["TRASPASO", "SALIDA"].includes(modelo.tipo) && (
                    <QBoton variante="borde" onClick={() => emitir("lectura_caja_solicitada")}>Lectura caja</QBoton>
                )}
                {ocultarTemporalDemos && sgaActivo && ["TRASPASO", "SALIDA"].includes(modelo.tipo) && (
                    <QBoton variante="borde" onClick={() => emitir("lectura_ubicacion_solicitada")}>Lectura bandeja</QBoton>
                )}
                {sgaActivo && modelo.lineas.some((l) => !!definicionDeLinea(l, modelo, "PICK")) && (
                    <QBoton variante="borde" onClick={() => emitir("lectura_pick_solicitada")}>Leer pick</QBoton>
                )}
                {sgaActivo && modelo.lineas.some((l) => tieneFaseDrop(l, modelo)) && (
                    <QBoton variante="borde" onClick={() => { iniciarAudioLectura(); emitir("lectura_drop_solicitada"); }}>Leer drop</QBoton>
                )}
                {sgaActivo && (
                    <QBoton variante="borde" onClick={() => {
                        const nuevoValor = !modoVoz;
                        if (nuevoValor) desbloquearTTS();
                        setModoVoz(nuevoValor);
                    }}>
                        {modoVoz ? "Voz ON" : "Voz OFF"}
                    </QBoton>
                )}
                {sgaActivo && modoVoz && !tts.vocesDisponibles && (
                    <p className="q-texto-error">No hay voces TTS instaladas. Instala espeak-ng en el sistema.</p>
                )}
            </div>
            {usarCajasCabecera && sgaActivo && <LecturasCajaOrden orden={ctx.orden} />}
            <h3>LÍNEAS</h3>
            <LineasOrden
                orden={ctx.orden}
                lineas={ctx.lineas}
                estado={ctx.estado}
                publicar={emitir}
                modoVoz={modoVoz}
            />

            {ctx.estado === "BORRANDO" && (
                <BorrarOrden
                    publicar={emitir}
                    orden={ctx.orden}
                />
            )}
            {ctx.estado === "TERMINANDO" && (
                <TerminarOrden
                    publicar={emitir}
                    orden={ctx.orden}
                />
            )}
            {ctx.estado === "LEYENDO_LINEA" && (
                <LecturaOrden publicar={emitir} orden={modelo} tipo={modelo.tipo} modoVoz={modoVoz} />
            )}
            {ctx.estado === "LEYENDO_CAJA" && (
                <LecturaCajaOrden publicar={emitir} orden={modelo} tipo={modelo.tipo} modoVoz={modoVoz} />
            )}
            {ctx.estado === "LEYENDO_UBICACION" && (
                <LecturaUbicacionOrden publicar={emitir} orden={modelo} tipo={modelo.tipo} modoVoz={modoVoz} />
            )}
            {ctx.estado === "CREANDO_CAJA" && (
                <CrearCaja publicar={emitir} idUbicacion={modelo.idUbicacionDestino} />
            )}
            {ctx.estado === "LEYENDO_PICK" && (
                <LeerPasosOrden publicar={emitir} orden={ctx.orden} fase="PICK" modoVoz={modoVoz} />
            )}
            {ctx.estado === "LEYENDO_DROP" && (
                <LeerPasosOrden publicar={emitir} orden={ctx.orden} fase="DROP" modoVoz={modoVoz} />
            )}
            {ctx.estado === "COLOCANDO" && (
                <ColocacionOrden publicar={emitir} orden={ctx.orden} />
            )}
            {ctx.estado === "ALBARANANDO" && (
                <AlbaranarOrden publicar={emitir} orden={ctx.orden} />
            )}
            {ctx.estado === "GENERANDO_ENVIO" && (
                <GenerarEnvioOrden publicar={emitir} orden={ctx.orden} />
            )}
        </Detalle>
    );
};

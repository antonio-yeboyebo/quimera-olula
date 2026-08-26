import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useRef,
    useState,
    type PropsWithChildren,
} from "react";
import {
    AssistantRuntimeProvider,
    useExternalStoreRuntime,
    type AppendMessage,
    type ThreadMessageLike,
} from "@assistant-ui/react";
import { MessageProcessor } from "@a2ui/web_core/v0_9";
import type { SurfaceModel } from "@a2ui/web_core/v0_9";
import type { ReactComponentImplementation } from "@a2ui/react/v0_9";
import { FactoryCtx } from "@olula/lib/factory_ctx.tsx";
import { usePreferencia } from "@olula/lib/usePreferencia.ts";
import { catalogoAsistente } from "#/asistente/vistas/catalogo/catalogo.ts";
import { consultarIa, consultarIaStream, enviarAccionA2ui, obtenerMensajesHilo } from "#/asistente/infraestructura.ts";
import {
    accionNavegacionConNombreCorto, adjuntosParaEnviar, construirCapacidades, mensajeVacio,
} from "#/asistente/dominio.ts";
import { getMockRespuestaIa } from "#/asistente/vistas/mocks/a2ui_mocks.ts";
import type {
    A2uiClientAction, AccionNavegacion, AdjuntoHiloIa, AdjuntoIa, AdjuntoMensaje, ConsultaIa, MensajeAsistente,
    RespuestaIa,
} from "#/asistente/diseño.ts";

const ASISTENTE_MOCK_ENABLED = import.meta.env.VITE_ASISTENTE_MOCK === "true";

interface AsistenteContextValue {
    isRunning: boolean;
    enviarMensaje: (texto: string, adjuntos?: AdjuntoMensaje[]) => Promise<void>;
    cancelarMensaje: () => void;
    streamingEnabled: boolean;
    setStreamingEnabled: (v: boolean) => void;
    a2uiSurfaces: SurfaceModel<ReactComponentImplementation>[];
    messageSurfaceMap: Record<string, string[]>;
    enviarAccion: (accion: A2uiClientAction) => Promise<void>;
    threadIdActivo: string | null;
    cambiarAHilo: (threadId: string) => Promise<void>;
    nuevaConversacion: () => void;
    /** Adjuntos (audio/documentos) por id de mensaje — el runtime de assistant-ui solo
     * conoce texto (ver convertMessage), así que la UI accede a esto por fuera, igual
     * que ya hace messageSurfaceMap para los bloques A2UI. */
    adjuntosPorMensaje: Record<string, AdjuntoMensaje[]>;
    /** Navegación propuesta por el asistente (tool proponer_navegacion), por id de
     * mensaje — la app YA NO navega sola al recibirla: se muestra como un botón dentro
     * del propio mensaje (ver Chat.tsx) y solo se navega cuando el usuario lo pulsa. */
    accionNavegacionPorMensaje: Record<string, AccionNavegacion>;
}

const AsistenteContext = createContext<AsistenteContextValue | null>(null);

export function useAsistenteContext(): AsistenteContextValue {
    const ctx = useContext(AsistenteContext);
    if (!ctx) throw new Error("useAsistenteContext debe usarse dentro de AsistenteRuntimeProvider");
    return ctx;
}

let contador = 0;
const nuevoId = () => `asistente-msg-${++contador}`;

const textoDe = (msg: AppendMessage): string =>
    msg.content
        .filter((p): p is { type: "text"; text: string } => p.type === "text")
        .map(p => p.text)
        .join("\n");

const crearProcessor = (
    onAction: (accion: A2uiClientAction) => void
): MessageProcessor<ReactComponentImplementation> => new MessageProcessor([catalogoAsistente], onAction);

interface Props {
    /** Ejecuta una acción de navegación decidida por el asistente (la app decide cómo navegar). */
    onAccionNavegacion?: (accion: AccionNavegacion) => void;
}

export function AsistenteRuntimeProvider({ children, onAccionNavegacion }: PropsWithChildren<Props>) {
    const { menu } = useContext(FactoryCtx);
    const capacidades = useMemo(() => construirCapacidades(menu), [menu]);

    const [mensajes, setMensajes] = useState<MensajeAsistente[]>([]);
    const [isRunning, setIsRunning] = useState(false);
    const [streamingEnabled, setStreamingEnabled] = useState(false);
    const [a2uiSurfaces, setA2uiSurfaces] = useState<SurfaceModel<ReactComponentImplementation>[]>([]);
    const [messageSurfaceMap, setMessageSurfaceMap] = useState<Record<string, string[]>>({});
    const [accionNavegacionPorMensaje, setAccionNavegacionPorMensaje] = useState<Record<string, AccionNavegacion>>({});
    const [threadIdActivo, setThreadIdActivo] = useState<string | null>(null);

    // Última conversación abierta — solo una conveniencia para restaurarla al reabrir
    // el panel; la vía real para retomar cualquier hilo anterior es cambiarAHilo, ver
    // más abajo (listado explícito, no depende de este valor).
    const [threadIdPersistido, setThreadIdPersistido] = usePreferencia<string | null>(
        "asistente.threadIdActivo", null
    );

    const threadIdRef = useRef<string | null>(null);
    // Hash de capacidades calculado por el SERVIDOR — se guarda tal cual y se reenvía
    // en los siguientes mensajes del thread; nunca se recalcula en el cliente.
    const capacidadesHashRef = useRef<string | null>(null);
    const currentMessageIdRef = useRef<string | null>(null);
    const abortRef = useRef<AbortController | null>(null);
    const actionHandlerRef = useRef<(accion: A2uiClientAction) => void>(() => {});

    const establecerThreadId = useCallback(
        (threadId: string | null) => {
            threadIdRef.current = threadId;
            setThreadIdActivo(threadId);
            setThreadIdPersistido(threadId);
        },
        [setThreadIdPersistido]
    );

    const [a2uiProcessor] = useState<MessageProcessor<ReactComponentImplementation>>(() =>
        crearProcessor(accion => actionHandlerRef.current(accion))
    );

    useEffect(() => {
        const subCreated = a2uiProcessor.onSurfaceCreated(surface => {
            setA2uiSurfaces(prev => [...prev, surface]);
            const messageId = currentMessageIdRef.current;
            if (messageId) {
                setMessageSurfaceMap(prev => ({
                    ...prev,
                    [messageId]: [...(prev[messageId] ?? []), surface.id],
                }));
            }
        });
        const subDeleted = a2uiProcessor.onSurfaceDeleted(id => {
            setA2uiSurfaces(prev => prev.filter(s => s.id !== id));
            setMessageSurfaceMap(prev => {
                const next = { ...prev };
                for (const [msgId, surfaceIds] of Object.entries(next)) {
                    const filtrados = surfaceIds.filter(sid => sid !== id);
                    if (filtrados.length === 0) delete next[msgId];
                    else next[msgId] = filtrados;
                }
                return next;
            });
        });
        return () => {
            subCreated.unsubscribe();
            subDeleted.unsubscribe();
        };
    }, [a2uiProcessor]);

    const convertMessage = useCallback(
        (msg: MensajeAsistente): ThreadMessageLike => ({
            id: msg.id,
            role: msg.rol,
            content: [{ type: "text", text: msg.texto }],
        }),
        []
    );

    const procesarMensajesA2ui = useCallback(
        (mensajesA2ui: unknown[], messageId?: string) => {
            if (!mensajesA2ui.length) return;

            const normalizados: unknown[] = [];
            for (const msg of mensajesA2ui) {
                const m = msg as Record<string, unknown>;
                if (m.createSurface) {
                    const { surfaceId } = m.createSurface as { surfaceId: string };
                    if (a2uiProcessor.model.getSurface(surfaceId)) {
                        normalizados.push({ version: "v0.9", deleteSurface: { surfaceId } });
                    }
                }
                normalizados.push(msg);
            }

            currentMessageIdRef.current = messageId ?? null;
            try {
                a2uiProcessor.processMessages(
                    normalizados as Parameters<typeof a2uiProcessor.processMessages>[0]
                );
            } catch (err) {
                console.error("[asistente] Error al procesar mensajes a2ui:", err, normalizados);
            } finally {
                currentMessageIdRef.current = null;
            }
        },
        [a2uiProcessor]
    );

    const construirConsulta = useCallback(
        (pregunta: string, forzarCapacidadesCompletas: boolean, adjuntos?: AdjuntoIa[]): ConsultaIa => {
            const threadId = threadIdRef.current;
            const hashConocido = capacidadesHashRef.current;
            return {
                pregunta,
                threadId,
                ...(hashConocido && !forzarCapacidadesCompletas
                    ? { capacidadesHash: hashConocido }
                    : { capacidades }),
                ...(adjuntos?.length ? { adjuntos } : {}),
            };
        },
        [capacidades]
    );

    const consultar = useCallback(
        async (consulta: ConsultaIa): Promise<RespuestaIa> =>
            ASISTENTE_MOCK_ENABLED ? getMockRespuestaIa(consulta) : consultarIa(consulta),
        []
    );

    const aplicarRespuesta = useCallback(
        (respuesta: RespuestaIa, assistantId: string) => {
            establecerThreadId(respuesta.threadId);
            capacidadesHashRef.current = respuesta.capacidadesHash;
            setMensajes(prev => prev.map(m => (m.id === assistantId ? { ...m, texto: respuesta.respuesta } : m)));
            if (respuesta.a2uiMessages.length) {
                procesarMensajesA2ui(respuesta.a2uiMessages, assistantId);
            }
            if (respuesta.accionNavegacion) {
                const accion = accionNavegacionConNombreCorto(respuesta.accionNavegacion, capacidades);
                setAccionNavegacionPorMensaje(prev => ({ ...prev, [assistantId]: accion }));
            }
        },
        [establecerThreadId, procesarMensajesA2ui, capacidades]
    );

    // El servidor devuelve el id con el que ha persistido cada adjunto — se guarda en
    // el propio mensaje de usuario para poder recuperarlo más adelante (p. ej. si se
    // reabre el hilo tras recargar la página). Compartido por el camino streaming y
    // el no-streaming.
    const aplicarIdsAdjuntos = useCallback((mensajeId: string, adjuntosApi: AdjuntoHiloIa[]) => {
        if (!adjuntosApi.length) return;
        setMensajes(prev => prev.map(m => (
            m.id === mensajeId && m.adjuntos?.length
                ? { ...m, adjuntos: m.adjuntos.map((a, i) => (adjuntosApi[i] ? { ...a, id: adjuntosApi[i].id } : a)) }
                : m
        )));
    }, []);

    const procesarTexto = useCallback(
        async (texto: string, adjuntos?: AdjuntoMensaje[]) => {
            if (!texto.trim() && !adjuntos?.length) return;

            const userMessageId = nuevoId();
            setMensajes(prev => [...prev, { id: userMessageId, rol: "user", texto, adjuntos }]);
            setIsRunning(true);
            abortRef.current = new AbortController();

            const adjuntosApi = adjuntosParaEnviar(adjuntos);

            try {
                if (streamingEnabled && !ASISTENTE_MOCK_ENABLED) {
                    const assistantId = nuevoId();
                    setMensajes(prev => [...prev, mensajeVacio(assistantId, "assistant")]);

                    // Igual que en el camino no-streaming: si el servidor no reconoce el
                    // capacidades_hash enviado, hay que reintentar UNA vez con las
                    // capacidades completas (nunca se persiste nada en el intento
                    // fallido, así que reenviar los mismos adjuntos es seguro).
                    const ejecutarStream = async (forzarCapacidadesCompletas: boolean): Promise<boolean> => {
                        let acumulado = "";
                        let necesitaCapacidades = false;
                        for await (const evento of consultarIaStream(
                            construirConsulta(texto, forzarCapacidadesCompletas, adjuntosApi),
                            abortRef.current?.signal
                        )) {
                            if (evento.tipo === "delta") {
                                acumulado += evento.contenido;
                                setMensajes(prev => prev.map(m => (m.id === assistantId ? { ...m, texto: acumulado } : m)));
                            } else if (evento.tipo === "estado") {
                                // Aviso de progreso transitorio (p.ej. "Buscando el
                                // cliente…") — se muestra sustituyendo el texto, sin
                                // tocar `acumulado`, así que el primer "delta" real
                                // lo reemplaza igual que si nunca hubiera estado.
                                setMensajes(prev =>
                                    prev.map(m => (m.id === assistantId ? { ...m, texto: evento.contenido } : m))
                                );
                            } else if (evento.tipo === "a2ui") {
                                procesarMensajesA2ui([evento.a2uiMessage], assistantId);
                            } else if (evento.tipo === "accion_navegacion") {
                                const accion = accionNavegacionConNombreCorto(evento.accionNavegacion, capacidades);
                                setAccionNavegacionPorMensaje(prev => ({ ...prev, [assistantId]: accion }));
                            } else if (evento.tipo === "fin") {
                                establecerThreadId(evento.threadId);
                                if (evento.necesitaCapacidades) {
                                    necesitaCapacidades = true;
                                } else {
                                    aplicarIdsAdjuntos(userMessageId, evento.adjuntos);
                                }
                            } else if (evento.tipo === "error") {
                                setMensajes(prev =>
                                    prev.map(m => (m.id === assistantId ? { ...m, texto: `Error: ${evento.contenido}` } : m))
                                );
                            }
                        }
                        return necesitaCapacidades;
                    };

                    if (await ejecutarStream(false)) {
                        await ejecutarStream(true);
                    }
                } else {
                    const assistantId = nuevoId();
                    setMensajes(prev => [...prev, mensajeVacio(assistantId, "assistant")]);

                    let respuesta = await consultar(construirConsulta(texto, false, adjuntosApi));
                    if (respuesta.necesitaCapacidades) {
                        respuesta = await consultar({
                            ...construirConsulta(texto, true, adjuntosApi), threadId: respuesta.threadId,
                        });
                    }
                    aplicarRespuesta(respuesta, assistantId);
                    aplicarIdsAdjuntos(userMessageId, respuesta.adjuntos);
                }
            } catch (err) {
                if ((err as Error).name === "AbortError") return;
                setMensajes(prev => [
                    ...prev,
                    { id: nuevoId(), rol: "assistant", texto: `Error: ${(err as Error).message}` },
                ]);
            } finally {
                setIsRunning(false);
            }
        },
        [
            streamingEnabled, construirConsulta, consultar, aplicarRespuesta, aplicarIdsAdjuntos,
            procesarMensajesA2ui, establecerThreadId, capacidades,
        ]
    );

    const onNew = useCallback(async (appendMsg: AppendMessage) => {
        await procesarTexto(textoDe(appendMsg));
    }, [procesarTexto]);

    const onCancel = useCallback(async () => {
        abortRef.current?.abort();
        setIsRunning(false);
    }, []);

    const enviarMensaje = useCallback(
        (texto: string, adjuntos?: AdjuntoMensaje[]) => procesarTexto(texto, adjuntos),
        [procesarTexto]
    );

    const cancelarMensaje = useCallback(() => {
        abortRef.current?.abort();
        setIsRunning(false);
    }, []);

    const enviarAccion = useCallback(
        async (accion: A2uiClientAction) => {
            if (accion.name === "navegar") {
                // Navegación disparada por un click en una fila de Tabla (ver
                // catalogo/Tabla.tsx) — puramente client-side, sin ida y vuelta al
                // backend, a diferencia del resto de acciones a2ui.
                const { ruta, parametros } = accion.context as {
                    ruta?: string;
                    parametros?: Record<string, string>;
                };
                if (ruta) onAccionNavegacion?.({ ruta, parametros });
                return;
            }

            const pendingId = nuevoId();
            setMensajes(prev => [...prev, mensajeVacio(pendingId, "assistant")]);
            setIsRunning(true);
            try {
                const respuesta = ASISTENTE_MOCK_ENABLED
                    ? getMockRespuestaIa({ pregunta: accion.name, threadId: threadIdRef.current })
                    : await enviarAccionA2ui(accion, threadIdRef.current);

                if (respuesta.respuesta) {
                    aplicarRespuesta(respuesta, pendingId);
                } else {
                    setMensajes(prev => prev.filter(m => m.id !== pendingId));
                }
            } catch (err) {
                console.error("[asistente] Error al enviar acción a2ui:", err);
                setMensajes(prev => prev.filter(m => m.id !== pendingId));
            } finally {
                setIsRunning(false);
            }
        },
        [aplicarRespuesta, onAccionNavegacion]
    );

    useEffect(() => {
        actionHandlerRef.current = enviarAccion;
    }, [enviarAccion]);

    const limpiarSurfaces = useCallback(() => {
        // Borra TODAS las superficies activas (no solo las de la conversación en curso)
        // antes de cargar/vaciar un hilo — si no, las tarjetas/tablas del hilo anterior
        // seguirían visibles mezcladas con las del que se acaba de abrir.
        for (const id of Array.from(a2uiProcessor.model.surfacesMap.keys())) {
            a2uiProcessor.model.deleteSurface(id);
        }
    }, [a2uiProcessor]);

    const cambiarAHilo = useCallback(
        async (threadId: string) => {
            abortRef.current?.abort();
            setIsRunning(true);
            try {
                const hilo = await obtenerMensajesHilo(threadId);
                limpiarSurfaces();
                // Se desconoce el capacidades_hash vigente en el servidor para un hilo
                // recuperado — se limpia para que el siguiente mensaje reenvíe
                // "capacidades" completas (siempre válido, el servidor recalcula el hash).
                capacidadesHashRef.current = null;
                establecerThreadId(hilo.threadId);
                setMensajes(hilo.mensajes.map(m => ({
                    id: m.id, rol: m.rol, texto: m.texto,
                    adjuntos: m.adjuntos.length ? m.adjuntos : undefined,
                })));
                for (const m of hilo.mensajes) {
                    if (m.a2uiMessages.length) procesarMensajesA2ui(m.a2uiMessages, m.id);
                }
            } finally {
                setIsRunning(false);
            }
        },
        [limpiarSurfaces, establecerThreadId, procesarMensajesA2ui]
    );

    const nuevaConversacion = useCallback(() => {
        abortRef.current?.abort();
        limpiarSurfaces();
        capacidadesHashRef.current = null;
        establecerThreadId(null);
        setMensajes([]);
        setIsRunning(false);
    }, [limpiarSurfaces, establecerThreadId]);

    useEffect(() => {
        // Al abrir el panel (este provider solo se monta mientras está abierto),
        // restaura la última conversación como conveniencia — el resto de hilos
        // anteriores se recuperan explícitamente vía cambiarAHilo (historial).
        if (threadIdPersistido) {
            cambiarAHilo(threadIdPersistido).catch(() => setThreadIdPersistido(null));
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const adjuntosPorMensaje = useMemo(
        () => Object.fromEntries(
            mensajes.filter(m => m.adjuntos?.length).map(m => [m.id, m.adjuntos as AdjuntoMensaje[]])
        ),
        [mensajes]
    );

    const runtime = useExternalStoreRuntime({
        isRunning,
        messages: mensajes,
        convertMessage,
        onNew,
        onCancel,
    });

    return (
        <AsistenteContext.Provider
            value={{
                isRunning,
                enviarMensaje,
                cancelarMensaje,
                streamingEnabled,
                setStreamingEnabled,
                a2uiSurfaces,
                messageSurfaceMap,
                enviarAccion,
                adjuntosPorMensaje,
                accionNavegacionPorMensaje,
                threadIdActivo,
                cambiarAHilo,
                nuevaConversacion,
            }}
        >
            <AssistantRuntimeProvider runtime={runtime}>{children}</AssistantRuntimeProvider>
        </AsistenteContext.Provider>
    );
}

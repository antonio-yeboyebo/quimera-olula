import type { AdjuntoMensaje } from "#/asistente/diseño.ts";
import { obtenerAdjuntoHilo } from "#/asistente/infraestructura.ts";
import { useAsistenteContext } from "#/asistente/vistas/AsistenteRuntimeProvider.tsx";
import { HistorialHilos } from "#/asistente/vistas/HistorialHilos.tsx";
import { useGrabacionAudio } from "#/asistente/vistas/useGrabacionAudio.ts";
import { useCapturaFoto } from "#/asistente/vistas/useCapturaFoto.ts";
import { renderMarkdown } from "@a2ui/markdown-it";
import { A2uiSurface, MarkdownContext } from "@a2ui/react/v0_9";
import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { MessagePrimitive, ThreadPrimitive, useMessage } from "@assistant-ui/react";
import {
    IconBolt,
    IconBoltOff,
    IconCamera,
    IconFileTypePdf,
    IconFileTypeXls,
    IconHistory, IconMicrophone, IconPaperclip,
    IconPlayerStop, IconPlus, IconRobot, IconSend, IconTrash, IconUser, IconX,
} from "@tabler/icons-react";
import {
    useCallback, useEffect, useRef, useState,
    type ChangeEvent, type KeyboardEvent, type ReactNode, type RefObject,
} from "react";
import "./Chat.css";

interface Props {
    onCerrar?: () => void;
}

export function Chat({ onCerrar }: Props) {
    const [texto, setTexto] = useState("");
    const [mostrarHistorial, setMostrarHistorial] = useState(false);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const {
        threadIdActivo, cambiarAHilo, nuevaConversacion, isRunning, streamingEnabled, setStreamingEnabled,
    } = useAsistenteContext();

    const aplicarPlantilla = useCallback((plantilla: string) => {
        setTexto(plantilla);
        const textarea = textareaRef.current;
        if (!textarea) return;
        textarea.focus();
        requestAnimationFrame(() => {
            const inicio = plantilla.indexOf("[");
            const fin = plantilla.indexOf("]");
            if (inicio !== -1 && fin !== -1) {
                textarea.setSelectionRange(inicio, fin + 1);
            } else {
                textarea.setSelectionRange(plantilla.length, plantilla.length);
            }
        });
    }, []);

    const abrirConversacion = useCallback(
        async (threadId: string) => {
            await cambiarAHilo(threadId);
            setMostrarHistorial(false);
        },
        [cambiarAHilo]
    );

    const empezarNuevaConversacion = useCallback(() => {
        nuevaConversacion();
        setMostrarHistorial(false);
    }, [nuevaConversacion]);

    return (
        <div className="asistente-chat">
            <header className="asistente-chat__header">
                <div className="asistente-chat__titulo">
                    <div className="asistente-chat__avatar">
                        <IconRobot size={16} />
                    </div>
                    <p className="asistente-chat__nombre">{mostrarHistorial ? "Conversaciones" : "Asistente IA"}</p>
                </div>

                <div className="asistente-chat__header-acciones">
                    {!mostrarHistorial && (
                        <button
                            type="button"
                            disabled={isRunning}
                            title={streamingEnabled ? "Cambiar a modo estándar" : "Cambiar a modo streaming"}
                            className="asistente-chat__toggle"
                            onClick={() => setStreamingEnabled(!streamingEnabled)}
                        >
                            {streamingEnabled ? <IconBolt size={12} /> : <IconBoltOff size={12} />}
                            {streamingEnabled ? "Streaming" : "Estándar"}
                        </button>
                    )}
                    <button
                        type="button"
                        aria-label="Nueva conversación"
                        title="Nueva conversación"
                        className="asistente-chat__cerrar"
                        onClick={empezarNuevaConversacion}
                    >
                        <IconPlus size={16} />
                    </button>
                    <button
                        type="button"
                        aria-label={mostrarHistorial ? "Volver al chat" : "Ver conversaciones anteriores"}
                        title={mostrarHistorial ? "Volver al chat" : "Ver conversaciones anteriores"}
                        className={
                            "asistente-chat__cerrar" +
                            (mostrarHistorial ? " asistente-chat__cerrar--activo" : "")
                        }
                        onClick={() => setMostrarHistorial(prev => !prev)}
                    >
                        <IconHistory size={16} />
                    </button>
                    {onCerrar && (
                        <button type="button" aria-label="Cerrar asistente" className="asistente-chat__cerrar" onClick={onCerrar}>
                            <IconX size={16} />
                        </button>
                    )}
                </div>
            </header>

            {mostrarHistorial ? (
                <HistorialHilos
                    threadIdActivo={threadIdActivo}
                    onSeleccionar={abrirConversacion}
                    onHiloActivoBorrado={nuevaConversacion}
                />
            ) : (
                <>
                    <ThreadPrimitive.Root className="asistente-chat__hilo">
                        <ThreadPrimitive.Viewport className="asistente-chat__viewport">
                            <ThreadPrimitive.Empty>
                                <EmptyState onSeleccionarSugerencia={aplicarPlantilla} />
                            </ThreadPrimitive.Empty>
                            <ThreadPrimitive.Messages components={{ UserMessage, AssistantMessage }} />
                        </ThreadPrimitive.Viewport>
                    </ThreadPrimitive.Root>

                    <Compositor texto={texto} setTexto={setTexto} textareaRef={textareaRef} />
                </>
            )}
        </div>
    );
}

interface EmptyStateProps {
    onSeleccionarSugerencia: (plantilla: string) => void;
}

function EmptyState({ onSeleccionarSugerencia }: EmptyStateProps) {
    return (
        <div className="asistente-chat__vacio">
            <div className="asistente-chat__vacio-icono">
                <IconRobot size={28} />
            </div>
            <p className="asistente-chat__vacio-titulo">¿En qué puedo ayudarte?</p>
            <p className="asistente-chat__vacio-subtitulo">
                Puedo buscar información y realizar acciones en la aplicación por ti.
            </p>
            <div className="asistente-chat__sugerencias">
                {SUGERENCIAS.map(s => (
                    <button
                        key={s.etiqueta}
                        type="button"
                        className="asistente-chat__chip"
                        onClick={() => onSeleccionarSugerencia(s.plantilla)}
                    >
                        {s.etiqueta}
                    </button>
                ))}
            </div>
        </div>
    );
}

const SUGERENCIAS = [
    { etiqueta: "Busca un cliente", plantilla: "Busca el cliente [nombre o NIF]" },
    { etiqueta: "Busca un artículo", plantilla: "Busca el artículo [nombre o referencia]" },
    { etiqueta: "Crea un pedido", plantilla: "Crea un pedido para el cliente [nombre]" },
];

interface CompositorProps {
    texto: string;
    setTexto: (texto: string) => void;
    textareaRef: RefObject<HTMLTextAreaElement | null>;
}

const LIMITE_BYTES_DOCUMENTO = 15 * 1024 * 1024;

const extensionDeAudio = (tipoMime: string): string => {
    if (tipoMime.includes("ogg")) return "ogg";
    if (tipoMime.includes("mp3") || tipoMime.includes("mpeg")) return "mp3";
    if (tipoMime.includes("wav")) return "wav";
    if (tipoMime.includes("webm")) return "webm";
    return "audio";
};

const leerArchivoComoBase64 = (archivo: File): Promise<string> =>
    new Promise((resolve, reject) => {
        const lector = new FileReader();
        lector.onloadend = () => {
            const resultado = lector.result as string;
            resolve(resultado.slice(resultado.indexOf(",") + 1));
        };
        lector.onerror = () => reject(lector.error);
        lector.readAsDataURL(archivo);
    });

function Compositor({ texto, setTexto, textareaRef }: CompositorProps) {
    const { isRunning, enviarMensaje, cancelarMensaje } = useAsistenteContext();
    const { soportado: microSoportado, grabando, iniciar: iniciarGrabacion, detener: detenerGrabacion } = useGrabacionAudio();
    const {
        soportado: fotoSoportada, abierta: camaraAbierta, error: errorCamara,
        videoRef, abrir: abrirCamara, cerrar: cerrarCamara, capturar: capturarFoto,
    } = useCapturaFoto();
    const [adjuntoPendiente, setAdjuntoPendiente] = useState<AdjuntoMensaje | null>(null);
    const [errorAdjunto, setErrorAdjunto] = useState<string | null>(null);
    const [menuAdjuntarAbierto, setMenuAdjuntarAbierto] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const menuAdjuntarRef = useRef<HTMLDivElement>(null);

    const enviar = useCallback(async () => {
        const recortado = texto.trim();
        if ((!recortado && !adjuntoPendiente) || isRunning) return;
        setTexto("");
        const adjuntos = adjuntoPendiente ? [adjuntoPendiente] : undefined;
        setAdjuntoPendiente(null);
        await enviarMensaje(recortado, adjuntos);
    }, [texto, isRunning, enviarMensaje, setTexto, adjuntoPendiente]);

    const handleKeyDown = useCallback(
        (e: KeyboardEvent<HTMLTextAreaElement>) => {
            if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                enviar();
            }
        },
        [enviar]
    );

    const alternarGrabacion = useCallback(async () => {
        if (grabando) {
            const audio = await detenerGrabacion();
            if (audio) {
                setErrorAdjunto(null);
                setAdjuntoPendiente({
                    nombre: `nota-de-voz.${extensionDeAudio(audio.tipoMime)}`,
                    tipoMime: audio.tipoMime,
                    datosBase64: audio.datosBase64,
                });
            }
        } else {
            setAdjuntoPendiente(null);
            await iniciarGrabacion();
        }
    }, [grabando, detenerGrabacion, iniciarGrabacion]);

    const adjuntarDocumento = useCallback(async (archivo: File) => {
        setErrorAdjunto(null);
        if (archivo.size > LIMITE_BYTES_DOCUMENTO) {
            setErrorAdjunto("El archivo supera el tamaño máximo admitido (15 MB).");
            return;
        }
        setAdjuntoPendiente({
            nombre: archivo.name,
            tipoMime: archivo.type,
            datosBase64: await leerArchivoComoBase64(archivo),
        });
    }, []);

    const onSeleccionarArchivo = useCallback(
        async (e: ChangeEvent<HTMLInputElement>) => {
            const archivo = e.target.files?.[0];
            e.target.value = "";
            if (archivo) await adjuntarDocumento(archivo);
        },
        [adjuntarDocumento]
    );

    // Cierra el menú "Adjuntar" al hacer click fuera de él (fuera del botón y del popup).
    useEffect(() => {
        if (!menuAdjuntarAbierto) return;
        const cerrarSiFuera = (e: MouseEvent) => {
            if (menuAdjuntarRef.current && !menuAdjuntarRef.current.contains(e.target as Node)) {
                setMenuAdjuntarAbierto(false);
            }
        };
        document.addEventListener("mousedown", cerrarSiFuera);
        return () => document.removeEventListener("mousedown", cerrarSiFuera);
    }, [menuAdjuntarAbierto]);

    const hacerFoto = useCallback(() => {
        const foto = capturarFoto();
        if (foto) {
            setErrorAdjunto(null);
            setAdjuntoPendiente({ nombre: "foto.jpg", tipoMime: foto.tipoMime, datosBase64: foto.datosBase64 });
        }
    }, [capturarFoto]);

    return (
        <div className="asistente-chat__compositor">
            {(errorAdjunto || errorCamara) && (
                <p className="asistente-chat__error-adjunto">{errorAdjunto || errorCamara}</p>
            )}

            {adjuntoPendiente && (
                <AdjuntoPendientePreview adjunto={adjuntoPendiente} onQuitar={() => setAdjuntoPendiente(null)} />
            )}

            <form
                onSubmit={e => {
                    e.preventDefault();
                    enviar();
                }}
                className="asistente-chat__form"
            >
                <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.xlsx,application/pdf,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                    onChange={onSeleccionarArchivo}
                    className="asistente-chat__input-archivo"
                />

                {!adjuntoPendiente && (
                    <div className="asistente-chat__adjuntar-wrapper" ref={menuAdjuntarRef}>
                        {menuAdjuntarAbierto && (
                            <div className="asistente-chat__menu-adjuntar" role="menu">
                                <button
                                    type="button"
                                    role="menuitem"
                                    onClick={() => {
                                        setMenuAdjuntarAbierto(false);
                                        fileInputRef.current?.click();
                                    }}
                                    className="asistente-chat__menu-adjuntar-opcion"
                                >
                                    <IconPaperclip size={16} />
                                    Adjuntar documento
                                </button>
                                {fotoSoportada && (
                                    <button
                                        type="button"
                                        role="menuitem"
                                        onClick={async () => {
                                            setMenuAdjuntarAbierto(false);
                                            setErrorAdjunto(null);
                                            await abrirCamara();
                                        }}
                                        className="asistente-chat__menu-adjuntar-opcion"
                                    >
                                        <IconCamera size={16} />
                                        Hacer foto
                                    </button>
                                )}
                            </div>
                        )}
                        <button
                            type="button"
                            onClick={() => setMenuAdjuntarAbierto(v => !v)}
                            disabled={isRunning || grabando}
                            aria-label="Adjuntar"
                            aria-haspopup="menu"
                            aria-expanded={menuAdjuntarAbierto}
                            title="Adjuntar documento o hacer una foto"
                            className="asistente-chat__boton asistente-chat__boton--adjuntar"
                        >
                            <IconPaperclip size={17} />
                        </button>
                    </div>
                )}

                <textarea
                    ref={textareaRef}
                    value={texto}
                    onChange={e => setTexto(e.target.value)}
                    onKeyDown={handleKeyDown}
                    rows={1}
                    autoFocus
                    placeholder="Escribe un mensaje…"
                    disabled={isRunning}
                    className="asistente-chat__textarea"
                />

                {microSoportado && !adjuntoPendiente && (
                    <button
                        type="button"
                        onClick={alternarGrabacion}
                        disabled={isRunning}
                        aria-label={grabando ? "Detener grabación" : "Grabar nota de voz"}
                        title={grabando ? "Detener grabación" : "Grabar nota de voz"}
                        className={
                            "asistente-chat__boton asistente-chat__boton--microfono" +
                            (grabando ? " asistente-chat__boton--grabando" : "")
                        }
                    >
                        <IconMicrophone size={17} />
                    </button>
                )}

                {isRunning ? (
                    <button
                        type="button"
                        onClick={cancelarMensaje}
                        aria-label="Cancelar"
                        className="asistente-chat__boton asistente-chat__boton--cancelar"
                    >
                        <IconPlayerStop size={17} />
                    </button>
                ) : (
                    <button
                        type="submit"
                        disabled={!texto.trim() && !adjuntoPendiente}
                        aria-label="Enviar"
                        className="asistente-chat__boton asistente-chat__boton--enviar"
                    >
                        <IconSend size={17} />
                    </button>
                )}
            </form>

            {camaraAbierta && (
                <div className="asistente-chat__camara-overlay" role="dialog" aria-label="Hacer una foto">
                    <div className="asistente-chat__camara-ventana">
                        <video ref={videoRef} autoPlay playsInline muted className="asistente-chat__camara-video" />
                        <div className="asistente-chat__camara-acciones">
                            <button
                                type="button"
                                onClick={cerrarCamara}
                                aria-label="Cancelar"
                                title="Cancelar"
                                className="asistente-chat__camara-cancelar"
                            >
                                <IconX size={18} />
                            </button>
                            <button
                                type="button"
                                onClick={hacerFoto}
                                aria-label="Hacer la foto"
                                title="Hacer la foto"
                                className="asistente-chat__camara-disparador"
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

interface AdjuntoPendientePreviewProps {
    adjunto: AdjuntoMensaje;
    onQuitar: () => void;
}

function AdjuntoPendientePreview({ adjunto, onQuitar }: AdjuntoPendientePreviewProps) {
    const esAudio = adjunto.tipoMime.startsWith("audio/");
    const esImagen = adjunto.tipoMime.startsWith("image/");
    const dataUrl = `data:${adjunto.tipoMime};base64,${adjunto.datosBase64}`;

    return (
        <div className="asistente-chat__adjunto-pendiente">
            {esAudio ? (
                <audio controls src={dataUrl} className="asistente-chat__adjunto-audio" />
            ) : esImagen ? (
                <img src={dataUrl} alt={adjunto.nombre} className="asistente-chat__adjunto-imagen" />
            ) : (
                <div className="asistente-chat__adjunto-chip">
                    {adjunto.tipoMime === "application/pdf" ? <IconFileTypePdf size={18} /> : <IconFileTypeXls size={18} />}
                    <span className="asistente-chat__adjunto-nombre">{adjunto.nombre}</span>
                </div>
            )}
            <button
                type="button"
                onClick={onQuitar}
                aria-label="Quitar adjunto"
                title="Quitar adjunto"
                className="asistente-chat__adjunto-quitar"
            >
                <IconTrash size={15} />
            </button>
        </div>
    );
}

function UserMessage() {
    return (
        <MessagePrimitive.Root className="asistente-chat__mensaje asistente-chat__mensaje--usuario">
            <div className="asistente-chat__burbuja-fila">
                <div className="asistente-chat__burbuja asistente-chat__burbuja--usuario">
                    <MessagePrimitive.Content
                        components={{ Text: ({ text }) => <span className="asistente-chat__texto-pre">{text}</span> }}
                    />
                    <UserMessageAdjuntos />
                </div>
                <div className="asistente-chat__avatar asistente-chat__avatar--usuario">
                    <IconUser size={13} />
                </div>
            </div>
        </MessagePrimitive.Root>
    );
}

function UserMessageAdjuntos() {
    const messageId = useMessage(m => m.id);
    const { adjuntosPorMensaje } = useAsistenteContext();
    const adjuntos = adjuntosPorMensaje[messageId];

    if (!adjuntos?.length) return null;

    return (
        <div className="asistente-chat__adjuntos-mensaje">
            {adjuntos.map((adjunto, i) => (
                <AdjuntoMensajeVista key={adjunto.id ?? `${messageId}-${i}`} adjunto={adjunto} />
            ))}
        </div>
    );
}

interface AdjuntoMensajeVistaProps {
    adjunto: AdjuntoMensaje;
}

function AdjuntoMensajeVista({ adjunto }: AdjuntoMensajeVistaProps) {
    const { threadIdActivo } = useAsistenteContext();
    const [urlMedia, setUrlMedia] = useState<string | null>(
        adjunto.datosBase64 ? `data:${adjunto.tipoMime};base64,${adjunto.datosBase64}` : null
    );
    const [cargando, setCargando] = useState(false);
    const esAudio = adjunto.tipoMime.startsWith("audio/");
    const esImagen = adjunto.tipoMime.startsWith("image/");

    const cargarMedia = useCallback(async () => {
        if (urlMedia || !adjunto.id || !threadIdActivo) return;
        setCargando(true);
        try {
            const blob = await obtenerAdjuntoHilo(threadIdActivo, adjunto.id);
            setUrlMedia(URL.createObjectURL(blob));
        } finally {
            setCargando(false);
        }
    }, [urlMedia, adjunto.id, threadIdActivo]);

    const descargar = useCallback(async () => {
        let url: string | null = null;
        let hayQueRevocar = false;
        if (adjunto.datosBase64) {
            url = `data:${adjunto.tipoMime};base64,${adjunto.datosBase64}`;
        } else if (adjunto.id && threadIdActivo) {
            setCargando(true);
            try {
                const blob = await obtenerAdjuntoHilo(threadIdActivo, adjunto.id);
                url = URL.createObjectURL(blob);
                hayQueRevocar = true;
            } finally {
                setCargando(false);
            }
        }
        if (!url) return;
        const enlace = document.createElement("a");
        enlace.href = url;
        enlace.download = adjunto.nombre;
        enlace.click();
        if (hayQueRevocar) URL.revokeObjectURL(url);
    }, [adjunto, threadIdActivo]);

    if (esAudio) {
        return urlMedia ? (
            <audio controls src={urlMedia} className="asistente-chat__adjunto-audio-mensaje" />
        ) : (
            <button
                type="button"
                className="asistente-chat__adjunto-cargar"
                onClick={cargarMedia}
                disabled={cargando}
            >
                <IconMicrophone size={14} />
                {cargando ? "Cargando…" : "Reproducir nota de voz"}
            </button>
        );
    }

    if (esImagen) {
        return urlMedia ? (
            <img src={urlMedia} alt={adjunto.nombre} className="asistente-chat__adjunto-imagen-mensaje" />
        ) : (
            <button
                type="button"
                className="asistente-chat__adjunto-cargar"
                onClick={cargarMedia}
                disabled={cargando}
            >
                <IconCamera size={14} />
                {cargando ? "Cargando…" : "Ver foto"}
            </button>
        );
    }

    return (
        <button type="button" className="asistente-chat__adjunto-chip-mensaje" onClick={descargar} disabled={cargando}>
            {adjunto.tipoMime === "application/pdf" ? <IconFileTypePdf size={16} /> : <IconFileTypeXls size={16} />}
            <span className="asistente-chat__adjunto-nombre">{adjunto.nombre}</span>
        </button>
    );
}

function AssistantMessage() {
    return (
        <MessagePrimitive.Root className="asistente-chat__mensaje asistente-chat__mensaje--asistente">
            <AssistantMessageBurbujaFila />
            <AssistantMessageA2ui />
            <AssistantMessageAccionNavegacion />
        </MessagePrimitive.Root>
    );
}

/** Componentes A2UI "autoexplicativos": ya traen su propio título y detalles
 * (confirmación de una acción / resultado de ejecutarla / resultado de una pregunta
 * agregada), así que mostrar también la burbuja de texto del LLM al lado es puramente
 * redundante — a veces literalmente la misma frase (ver _a2ui_tarjeta_confirmacion/
 * _resultado_escritura_a2ui_str/_a2ui_str_metrica en el backend, que usan el mismo
 * texto tanto para "respuesta" como para el título de la tarjeta). */
const COMPONENTES_AUTOEXPLICATIVOS = new Set(["TarjetaConfirmacion", "TarjetaResultado", "TarjetaMetrica"]);

function AssistantMessageBurbujaFila() {
    const messageId = useMessage(m => m.id);
    const { a2uiSurfaces, messageSurfaceMap } = useAsistenteContext();
    // Tools como mostrar_tabla no dejan ningún texto de acompañamiento (el LLM solo
    // devuelve el bloque a2ui) — sin esto se veía una burbuja vacía (avatar + hueco en
    // blanco) encima de la tabla. Solo se comprueba cuando el mensaje ya ha terminado:
    // mientras está "running" con texto aún vacío, hace falta la burbuja para los tres
    // puntos de "escribiendo…" (ver AssistantMessageContent/mostrarPuntos).
    const sinTextoYaTerminado = useMessage(m => {
        if (m.status?.type === "running") return false;
        const texto = m.content.filter(p => p.type === "text").map(p => (p as { text: string }).text).join("");
        return texto.trim().length === 0;
    });

    const surfaceIds = messageSurfaceMap[messageId] ?? [];
    const ocultarTexto = sinTextoYaTerminado || a2uiSurfaces.some(
        s => surfaceIds.includes(s.id) &&
            Array.from(s.componentsModel.entries).some(([, c]) => COMPONENTES_AUTOEXPLICATIVOS.has(c.type))
    );

    if (ocultarTexto) return null;

    return (
        <div className="asistente-chat__burbuja-fila">
            <div className="asistente-chat__avatar">
                <IconRobot size={13} />
            </div>
            <AssistantMessageContent />
        </div>
    );
}

function AssistantMessageAccionNavegacion() {
    const messageId = useMessage(m => m.id);
    const { accionNavegacionPorMensaje, enviarAccion } = useAsistenteContext();
    const accion = accionNavegacionPorMensaje[messageId];

    if (!accion) return null;

    const navegar = () => {
        void enviarAccion({
            name: "navegar",
            surfaceId: "",
            sourceComponentId: "",
            timestamp: new Date().toISOString(),
            context: { ruta: accion.ruta, parametros: accion.parametros ?? {} },
        });
    };

    return (
        <div className="asistente-chat__navegacion">
            <QBoton variante="borde" onClick={navegar}>
                {accion.descripcion ? `Ir a ${accion.descripcion}` : "Ir a la pantalla solicitada"}
            </QBoton>
        </div>
    );
}

function AssistantMessageA2ui() {
    const messageId = useMessage(m => m.id);
    const { a2uiSurfaces, messageSurfaceMap } = useAsistenteContext();

    const surfaceIds = messageSurfaceMap[messageId] ?? [];
    const surfaces = a2uiSurfaces.filter(s => surfaceIds.includes(s.id));

    if (surfaces.length === 0) return null;

    return (
        <MarkdownContext.Provider value={renderMarkdown}>
            <div className="asistente-chat__a2ui">
                {surfaces.map(surface => (
                    <A2uiSurface key={surface.id} surface={surface} />
                ))}
            </div>
        </MarkdownContext.Provider>
    );
}

// El LLM a veces envuelve un valor destacado en negrita markdown ("**21.534,68 €**")
// dentro del texto plano de la respuesta (fuera de los bloques a2ui, que sí pasan por
// renderMarkdown) — sin esto se veían los "**" literales en vez de negrita real.
const renderTextoConNegrita = (texto: string): ReactNode =>
    texto.split(/\*\*(.+?)\*\*/g).map((parte, i) => (i % 2 === 1 ? <strong key={i}>{parte}</strong> : parte));

function AssistantMessageContent() {
    const mostrarPuntos = useMessage(m => {
        if (m.status?.type !== "running") return false;
        const texto = m.content
            .filter(p => p.type === "text")
            .map(p => (p as { text: string }).text)
            .join("");
        return texto.length === 0;
    });

    return (
        <div className="asistente-chat__burbuja">
            {mostrarPuntos ? (
                <span className="asistente-chat__puntos">
                    <span className="asistente-chat__punto" style={{ animationDelay: "0ms" }} />
                    <span className="asistente-chat__punto" style={{ animationDelay: "200ms" }} />
                    <span className="asistente-chat__punto" style={{ animationDelay: "400ms" }} />
                </span>
            ) : (
                <MessagePrimitive.Content
                    components={{
                        Text: ({ text }) => (
                            <span className="asistente-chat__texto-pre">{renderTextoConNegrita(text)}</span>
                        ),
                    }}
                />
            )}
        </div>
    );
}

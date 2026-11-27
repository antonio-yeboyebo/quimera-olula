import { useCallback, useEffect, useState } from "react";
import { IconMessageChatbot, IconX } from "@tabler/icons-react";
import { FactoryObj } from "@olula/lib/factory_ctx.tsx";
import {
    ASISTENTE_ABRIR_HILO_EVENT,
    ASISTENTE_PREGUNTAR_EVENT,
    PANEL_LATERAL_ABIERTO_EVENT,
    PANEL_LATERAL_TOGGLE_EVENT,
    notificarPanelLateralAbierto,
} from "@olula/lib/panel_lateral_events.ts";
import { preferencias } from "@olula/lib/preferencias.ts";
import { construirUrlNavegacion } from "#/asistente/dominio.ts";
import type { AccionNavegacion } from "#/asistente/diseño.ts";
import { AsistenteRuntimeProvider, useAsistenteContext } from "#/asistente/vistas/AsistenteRuntimeProvider.tsx";
import { Chat } from "#/asistente/vistas/Chat.tsx";
import { AsistenteVozBase } from "#/asistente/vistas/modo_voz/AsistenteVoz.tsx";
import { useSesionActiva } from "#/asistente/useSesionActiva.ts";
import "./PanelAsistente.css";

export interface PanelAsistenteProps {
    /** Ejecuta la navegación hacia la ruta/parámetros decididos por el asistente. */
    navigate?: (url: string) => void;
    /**
     * "flotante" (por defecto): botón flotante + drawer superpuesto, independiente del
     * resto del layout.
     * "lateral": panel fijo anclado bajo la cabecera, en la misma zona que el menú de
     * usuario — se abre/cierra desde el icono añadido en Cabecera.tsx (packages/componentes),
     * coordinados vía el bus de eventos de @olula/lib/panel_lateral_events.ts.
     */
    modo?: "flotante" | "lateral";
}

interface PanelAsistenteModoProps {
    navigate?: (url: string) => void;
}

const usePreparar = (navigate: ((url: string) => void) | undefined) => {
    const onAccionNavegacion = useCallback(
        (accion: AccionNavegacion) => {
            // No se cierra el panel: como el chat (AsistenteRuntimeProvider) solo vive
            // mientras el panel está abierto, cerrarlo lo desmontaba y se perdía toda la
            // conversación en cada navegación (tanto la decidida por el backend como la
            // de un click en una fila de Tabla).
            navigate?.(construirUrlNavegacion(accion));
        },
        [navigate]
    );
    return onAccionNavegacion;
};

/**
 * Abre el panel en un hilo concreto cuando alguien lo pide por evento (el modo voz,
 * para mostrar su hilo). AsistenteRuntimeProvider restaura al montarse el hilo
 * guardado en "asistente.threadIdActivo": se guarda ahí el pedido y se cambia la
 * `clave` del provider para forzar ese remontaje aunque el panel ya estuviera abierto.
 */
const useAbrirHiloSolicitado = (abrir: () => void) => {
    const [clave, setClave] = useState(0);
    useEffect(() => {
        const alSolicitarHilo = (e: Event) => {
            preferencias.set("asistente.threadIdActivo", (e as CustomEvent<string>).detail);
            setClave(c => c + 1);
            abrir();
        };
        window.addEventListener(ASISTENTE_ABRIR_HILO_EVENT, alSolicitarHilo);
        return () => window.removeEventListener(ASISTENTE_ABRIR_HILO_EVENT, alSolicitarHilo);
    }, [abrir]);
    return clave;
};

/**
 * Pregunta pedida desde fuera del panel (búsqueda rápida): abre el panel y la guarda
 * hasta que el chat está montado; EnviarPreguntaPendiente la envía.
 */
const usePreguntaSolicitada = (abrir: () => void) => {
    const [pregunta, setPregunta] = useState<string | null>(null);
    useEffect(() => {
        const alPreguntar = (e: Event) => {
            // Conversación nueva: que el panel no restaure al abrirse la anterior
            // (se cargaría a la vez que se envía la pregunta).
            preferencias.set("asistente.threadIdActivo", null);
            setPregunta((e as CustomEvent<string>).detail);
            abrir();
        };
        window.addEventListener(ASISTENTE_PREGUNTAR_EVENT, alPreguntar);
        return () => window.removeEventListener(ASISTENTE_PREGUNTAR_EVENT, alPreguntar);
    }, [abrir]);
    return { pregunta, enviada: useCallback(() => setPregunta(null), []) };
};

const EnviarPreguntaPendiente = ({ pregunta, enviada }: { pregunta: string | null; enviada: () => void }) => {
    const { enviarMensaje, isRunning, nuevaConversacion } = useAsistenteContext();
    useEffect(() => {
        if (!pregunta || isRunning) return;
        enviada();
        nuevaConversacion();
        void enviarMensaje(pregunta);
    }, [pregunta, isRunning, enviarMensaje, enviada, nuevaConversacion]);
    return null;
};

const PanelAsistenteFlotante = ({ navigate }: PanelAsistenteModoProps) => {
    const [abierto, setAbierto] = useState(false);
    const onAccionNavegacion = usePreparar(navigate);
    const claveHilo = useAbrirHiloSolicitado(useCallback(() => setAbierto(true), []));
    const { pregunta, enviada } = usePreguntaSolicitada(useCallback(() => setAbierto(true), []));

    return (
        <div className="asistente-panel">
            <button
                type="button"
                className="asistente-panel__fab"
                aria-label={abierto ? "Cerrar asistente" : "Abrir asistente"}
                onClick={() => setAbierto(v => !v)}
            >
                {abierto ? <IconX size={22} /> : <IconMessageChatbot size={22} />}
            </button>

            {abierto && (
                <div className="asistente-panel__drawer">
                    <AsistenteRuntimeProvider key={claveHilo} onAccionNavegacion={onAccionNavegacion}>
                        <EnviarPreguntaPendiente pregunta={pregunta} enviada={enviada} />
                        <Chat onCerrar={() => setAbierto(false)} />
                    </AsistenteRuntimeProvider>
                </div>
            )}
        </div>
    );
};

const PanelAsistenteLateral = ({ navigate }: PanelAsistenteModoProps) => {
    const [abierto, setAbierto] = useState(false);
    const onAccionNavegacion = usePreparar(navigate);
    const claveHilo = useAbrirHiloSolicitado(useCallback(() => setAbierto(true), []));
    const { pregunta, enviada } = usePreguntaSolicitada(useCallback(() => setAbierto(true), []));

    useEffect(() => {
        const alSolicitarToggle = (e: Event) => {
            if ((e as CustomEvent<string>).detail === "asistente") setAbierto(v => !v);
        };
        const alAbrirOtroPanel = (e: Event) => {
            // Comparte la zona derecha con el menú de usuario y el panel de personalizar.
            const panel = (e as CustomEvent<string>).detail;
            if (panel === "usuario" || panel === "personalizar") setAbierto(false);
        };
        window.addEventListener(PANEL_LATERAL_TOGGLE_EVENT, alSolicitarToggle);
        window.addEventListener(PANEL_LATERAL_ABIERTO_EVENT, alAbrirOtroPanel);
        return () => {
            window.removeEventListener(PANEL_LATERAL_TOGGLE_EVENT, alSolicitarToggle);
            window.removeEventListener(PANEL_LATERAL_ABIERTO_EVENT, alAbrirOtroPanel);
        };
    }, []);

    useEffect(() => {
        if (abierto) notificarPanelLateralAbierto("asistente");
    }, [abierto]);

    return (
        <panel-asistente className={abierto ? "activo" : ""}>
            {abierto && (
                <AsistenteRuntimeProvider key={claveHilo} onAccionNavegacion={onAccionNavegacion}>
                    <EnviarPreguntaPendiente pregunta={pregunta} enviada={enviada} />
                    <Chat onCerrar={() => setAbierto(false)} />
                </AsistenteRuntimeProvider>
            )}
        </panel-asistente>
    );
};

export const PanelAsistenteBase = ({ navigate, modo = "flotante" }: PanelAsistenteProps) => {
    const sesionActiva = useSesionActiva();
    if (!sesionActiva) return null;

    const AsistenteVoz_ = (FactoryObj.app.Asistente?.asistente_AsistenteVoz as typeof AsistenteVozBase) ?? AsistenteVozBase;

    return (
        <>
            {modo === "lateral"
                ? <PanelAsistenteLateral navigate={navigate} />
                : <PanelAsistenteFlotante navigate={navigate} />}
            <AsistenteVoz_ navigate={navigate} />
        </>
    );
};

export const PanelAsistente = (props: PanelAsistenteProps) => {
    const Panel_ = (FactoryObj.app.Asistente?.asistente_PanelAsistente as typeof PanelAsistenteBase) ?? PanelAsistenteBase;
    return <Panel_ {...props} />;
};

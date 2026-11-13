import { useCallback } from "react";
import { useNavigate } from "react-router";
import { estadoRecargaVista } from "@olula/componentes/vista/recarga_vista.ts";
import { construirUrlNavegacion } from "#/asistente/dominio.ts";
import type { AccionNavegacion } from "#/asistente/diseño.ts";
import { AsistenteRuntimeProvider } from "#/asistente/vistas/AsistenteRuntimeProvider.tsx";
import { Chat } from "#/asistente/vistas/Chat.tsx";
import { useSesionActiva } from "#/asistente/useSesionActiva.ts";
import "./PaginaAsistente.css";

/**
 * Vista de página completa del asistente ("modo solo chat"): a diferencia de
 * PanelAsistente (superpuesto/lateral, vive fuera del flujo de rutas, montado
 * siempre desde Plantilla), esta se registra como una ruta más — aprovecha el
 * layout normal (cabecera, menú lateral) pero ocupa todo el área de contenido
 * con el chat, sin necesidad de abrir el panel para conversar con el asistente.
 */
export const PaginaAsistente = () => {
    const navigate = useNavigate();
    const sesionActiva = useSesionActiva();

    const onAccionNavegacion = useCallback(
        (accion: AccionNavegacion) =>
            navigate(construirUrlNavegacion(accion), { state: estadoRecargaVista() }),
        [navigate]
    );

    if (!sesionActiva) return null;

    return (
        <div className="asistente-pagina">
            <AsistenteRuntimeProvider onAccionNavegacion={onAccionNavegacion}>
                <Chat />
            </AsistenteRuntimeProvider>
        </div>
    );
};

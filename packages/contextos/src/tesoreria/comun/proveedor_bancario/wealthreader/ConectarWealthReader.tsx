import { QAviso } from "@olula/componentes/atomos/qaviso.tsx";
import { QModal } from "@olula/componentes/moleculas/qmodal.tsx";
import { useEffect, useRef, useState } from "react";
import { ConectarProveedorBancarioProps } from "../diseño.js";
import "./ConectarWealthReader.css";
import {
    ORIGEN_WIDGET_WEALTH_READER,
    URL_SCRIPT_WEALTH_READER,
    interpretarMensajeWealthReader,
} from "./dominio.js";
import { useTTesoreria } from "../../../i18n/index.ts";

declare global {
    interface Window {
        wr_conf?: Record<string, unknown>;
    }
}

/**
 * Widget de Wealth Reader: un iframe (`#wr-iframe`) que su script `load.js`
 * configura con `window.wr_conf`, tal como lo devolvió
 * `POST tesoreria/conexion_bancaria/iniciar` (`datos.wr_conf`).
 *
 * El iframe no devuelve nada al navegador: Wealth Reader manda los datos del
 * banco al callback del servidor y, cuando el servidor los ha aceptado, avisa
 * por `postMessage` con "flow completed". Entonces se completa la conexión con
 * la operación (`datos.operacion_id`), que el servidor relaciona con lo que
 * recibió. Los mensajes de error (doble factor, login incorrecto…) se muestran
 * sin cerrar el modal: el propio widget guía al usuario.
 */
export const ConectarWealthReader = ({
    datos,
    onCompletado,
    onCancelado,
}: ConectarProveedorBancarioProps) => {
    const t = useTTesoreria();
    const [aviso, setAviso] = useState<string | null>(null);
    // El widget puede repetir el mensaje: la conexión se completa una sola vez.
    const completado = useRef(false);
    const operacionId = typeof datos.operacion_id === "string" ? datos.operacion_id : null;

    useEffect(() => {
        window.wr_conf = (datos.wr_conf as Record<string, unknown>) ?? {};

        // El script se vuelve a cargar en cada apertura: lee wr_conf al ejecutarse.
        const script = document.createElement("script");
        script.src = URL_SCRIPT_WEALTH_READER;
        script.async = true;
        document.body.appendChild(script);

        const escuchar = (evento: MessageEvent) => {
            if (evento.origin !== ORIGEN_WIDGET_WEALTH_READER) return;

            const mensaje = interpretarMensajeWealthReader(evento.data);
            if (mensaje.tipo === "completado" && operacionId && !completado.current) {
                completado.current = true;
                onCompletado({ operacion_id: operacionId });
            } else if (mensaje.tipo === "error") {
                setAviso(mensaje.texto);
            }
        };
        window.addEventListener("message", escuchar);

        return () => {
            window.removeEventListener("message", escuchar);
            script.remove();
            delete window.wr_conf;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <QModal abierto={true} nombre="conectarWealthReader" titulo={t("comun.conectarBanco")} onCerrar={onCancelado}>
            <div className="ConectarWealthReader">
                {aviso && <QAviso variante="advertencia">{aviso}</QAviso>}
                <iframe
                    id="wr-iframe"
                    title="Wealth Reader"
                    width="100%"
                    frameBorder="0"
                    referrerPolicy="origin"
                />
            </div>
        </QModal>
    );
};

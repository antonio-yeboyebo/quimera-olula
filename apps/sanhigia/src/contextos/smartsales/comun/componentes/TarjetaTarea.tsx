import { QEtiqueta } from "@olula/componentes/atomos/qetiqueta.tsx";
import { QIcono } from "@olula/componentes/atomos/qicono.tsx";
import { Link } from "react-router";
import { Tarea, TipoTarea } from "../diseño.ts";
import { estadoTarea, textoTipoTarea } from "../dominio.ts";
import { rutasSmartsales } from "../rutas.ts";
import "./TarjetaTarea.css";

type TarjetaTareaProps = {
    tarea: Tarea;
    ahora?: Date;
    conFecha?: boolean;
};

const textoEstado = {
    en_curso: "En curso",
    atrasada: "Atrasada",
} as const;

const iconoTipo: Record<TipoTarea, string> = {
    Cita: "calendario_evento",
    Llamada: "telefono",
    Email: "correo",
    Whatsapp: "whatsapp",
};

const diaMes = (iso: string) => new Date(`${iso}T00:00:00`).toLocaleDateString("es-ES", { day: "2-digit", month: "2-digit" });

export const TarjetaTarea = ({ tarea, ahora, conFecha = false }: TarjetaTareaProps) => {
    const estado = estadoTarea(tarea, ahora);
    const interlocutores = [tarea.nombreCliente, tarea.nombreContacto].filter(Boolean).join(" · ");

    return (
        <Link to={rutasSmartsales.tarea(tarea.id)} className={`TarjetaTarea ${estado ?? ""}`}>
            <time className="hora">
                {conFecha && <span className="fecha">{diaMes(tarea.fecha)}</span>}
                {tarea.hora?.slice(0, 5) ?? (conFecha ? null : "—")}
            </time>
            <span className="icono">
                <QIcono nombre={iconoTipo[tarea.tipo]} />
            </span>
            <div className="contenido">
                <strong className="interlocutores">{interlocutores || tarea.titulo}</strong>
                {interlocutores && <span className="titulo">{tarea.titulo}</span>}
            </div>
            <div className="etiquetas">
                <QEtiqueta variante="neutro" className={`tipo-${tarea.tipo.toLowerCase()}`}>
                    {textoTipoTarea[tarea.tipo]}
                </QEtiqueta>
                {estado && (
                    <QEtiqueta variante={estado === "atrasada" ? "error" : "advertencia"}>
                        {textoEstado[estado]}
                    </QEtiqueta>
                )}
            </div>
        </Link>
    );
};

import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { ReactNode } from "react";
import { useTComun } from "../../i18n/index.ts";
import "./PantallaConfig.css";

interface PantallaConfigProps {
    titulo: string;
    descripcion?: string;
    /** Sin `onGuardar` la pantalla no tiene botón (aún no hay opciones). */
    onGuardar?: () => void;
    cambiada?: boolean;
    guardando?: boolean;
    children?: ReactNode;
}

/**
 * Marco común de las pantallas de configuración de un área (Ventas, Compras,
 * Almacén, Empresa), como la de Tesorería: datos generales de una sola fila que
 * se guardan a mano con el botón Guardar.
 */
export const PantallaConfig = ({
    titulo,
    descripcion,
    onGuardar,
    cambiada = false,
    guardando = false,
    children,
}: PantallaConfigProps) => {
    const t = useTComun();
    return (
    <div className="PantallaConfig">
        <h2>{titulo}</h2>
        {descripcion && <p className="descripcion-config">{descripcion}</p>}
        {children ?? <p className="sin-opciones">{t("pantallaConfig.sinOpciones")}</p>}
        {onGuardar && (
            <div className="botones">
                <QBoton deshabilitado={!cambiada || guardando} onClick={onGuardar}>
                    {guardando ? t("pantallaConfig.guardando") : t("pantallaConfig.guardar")}
                </QBoton>
            </div>
        )}
    </div>
    );
};

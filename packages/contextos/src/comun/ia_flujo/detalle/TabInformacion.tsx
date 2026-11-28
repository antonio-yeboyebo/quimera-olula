import { formatearFechaDate } from "@olula/lib/dominio.js";
import { IaFlujo } from "../diseño.js";
import { tComun } from "../../i18n/index.ts";

interface TabInformacionProps {
    iaFlujo: IaFlujo;
}

/**
 * Tab de solo lectura con los metadatos de auditoría del flujo.
 */
export const TabInformacion = ({ iaFlujo }: TabInformacionProps) => {
    return (
        <div className="TabInformacion">
            <dl>
                <dt>{tComun("iaFlujo.estado")}</dt>
                <dd>{iaFlujo.activo ? tComun("iaFlujo.activo") : tComun("iaFlujo.inactivo")}</dd>
                <dt>{tComun("iaFlujo.creadoPor")}</dt>
                <dd>{iaFlujo.creadoPor || "-"}</dd>
                <dt>{tComun("iaFlujo.creadoEn")}</dt>
                <dd>{formatearFechaDate(iaFlujo.creadoEn)}</dd>
                <dt>{tComun("iaFlujo.actualizadoEn")}</dt>
                <dd>{formatearFechaDate(iaFlujo.actualizadoEn)}</dd>
            </dl>
        </div>
    );
};

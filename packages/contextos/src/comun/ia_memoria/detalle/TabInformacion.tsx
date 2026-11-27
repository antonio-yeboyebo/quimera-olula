import { QEtiqueta } from "@olula/componentes/atomos/qetiqueta.tsx";
import { formatearFechaDate } from "@olula/lib/dominio.js";
import { IaMemoria } from "../diseño.js";
import { tComun } from "../../i18n/index.ts";

interface TabInformacionProps {
    iaMemoria: IaMemoria;
}

/**
 * Tab de solo lectura con los metadatos de auditoría de la memoria.
 */
export const TabInformacion = ({ iaMemoria }: TabInformacionProps) => {
    return (
        <div className="TabInformacion">
            <dl>
                <dt>{tComun("iaMemoria.estado")}</dt>
                <dd>{iaMemoria.activo ? tComun("iaMemoria.activo") : tComun("iaMemoria.inactivo")}</dd>
                <dt>{tComun("iaMemoria.creadoPor")}</dt>
                <dd>{iaMemoria.creadoPor || "-"}</dd>
                <dt>{tComun("iaMemoria.creadoEn")}</dt>
                <dd>{formatearFechaDate(iaMemoria.creadoEn)}</dd>
                <dt>{tComun("iaMemoria.actualizadoEn")}</dt>
                <dd>{formatearFechaDate(iaMemoria.actualizadoEn)}</dd>
                <dt>{tComun("iaMemoria.indexadoRag")}</dt>
                <dd>
                    {iaMemoria.indexado
                        ? tComun("iaMemoria.siValor", { valor: iaMemoria.indexadoEn ? formatearFechaDate(iaMemoria.indexadoEn) : "-" })
                        : tComun("iaMemoria.no")}
                    {iaMemoria.modeloDesactualizado && (
                        <>
                            {" "}
                            <QEtiqueta variante="advertencia">
                                {tComun("iaMemoria.modeloDeEmbeddingsDesactualizadoConviene")}
                            </QEtiqueta>
                        </>
                    )}
                </dd>
            </dl>
        </div>
    );
};

import { formatearFechaDate } from "@olula/lib/dominio.js";
import { Empresa } from "../../componentes/empresa.js";
import { getConfiguracionCredenciales } from "../configuracion.js";
import { OPCIONES_TIPO_AUTH } from "../dominio.js";
import { CredencialExterna } from "../diseño.js";
import { tComun } from "../../i18n/index.ts";

interface TabInformacionProps {
    credencial: CredencialExterna;
}

/**
 * Tab de solo lectura con los metadatos de auditoría y el tipo de
 * autenticación (fijo desde la creación, ver dominio.ts).
 */
export const TabInformacion = ({ credencial }: TabInformacionProps) => {
    const tipoAuth = OPCIONES_TIPO_AUTH.find((o) => o.valor === credencial.tipoAuth)?.descripcion
        ?? credencial.tipoAuth;

    return (
        <div className="TabInformacion">
            <dl>
                {!getConfiguracionCredenciales().empresaFija && (
                    <>
                        <dt>{tComun("credencialExterna.empresa")}</dt>
                        <dd><Empresa valor={credencial.empresaId} soloLectura /></dd>
                    </>
                )}
                <dt>{tComun("credencialExterna.categoria")}</dt>
                <dd>{credencial.categoria === "llm" ? tComun("credencialExterna.modeloDeIa") : tComun("credencialExterna.conector")}</dd>
                <dt>{tComun("credencialExterna.tipoDeAutenticacion")}</dt>
                <dd>{tipoAuth}</dd>
                <dt>{tComun("credencialExterna.ambito")}</dt>
                <dd>{credencial.propietarioId ? tComun("credencialExterna.personal") : tComun("credencialExterna.todaLaEmpresa")}</dd>
                <dt>{tComun("credencialExterna.estado")}</dt>
                <dd>{credencial.activo ? tComun("credencialExterna.activa") : tComun("credencialExterna.inactiva")}</dd>
                <dt>{tComun("credencialExterna.creadoPor")}</dt>
                <dd>{credencial.creadoPor || "-"}</dd>
                <dt>{tComun("credencialExterna.creadoEn")}</dt>
                <dd>{formatearFechaDate(credencial.creadoEn)}</dd>
                <dt>{tComun("credencialExterna.actualizadoEn")}</dt>
                <dd>{formatearFechaDate(credencial.actualizadoEn)}</dd>
            </dl>
        </div>
    );
};

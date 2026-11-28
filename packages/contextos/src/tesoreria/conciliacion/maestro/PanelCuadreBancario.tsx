import { formatearFechaHora, formatearMoneda } from "@olula/lib/dominio.js";
import { ReactNode, useEffect, useState } from "react";
import { Link } from "react-router";
import { CuadreBancario, CuadreCuenta } from "../diseño.js";
import { urlConciliacionCuentaBancaria } from "../dominio.js";
import { getCuadreBancario } from "../infraestructura.js";
import { PartidasSinConciliar } from "./PartidasSinConciliar.js";
import { useTTesoreria } from "../../i18n/index.ts";

/**
 * Panel de cuadre bancario-contable: muestra el saldo banco vs. saldo contable
 * y las alertas de discrepancia de la cuenta bancaria indicada. Sin cuenta
 * (listado de todas las cuentas) no se muestra.
 *
 * Se recarga en el montaje y cada vez que `version` cambia (p.ej. tras sync o
 * conciliación automática). Cada badge es un enlace al maestro con el filtro
 * correspondiente preseleccionado.
 */
export const PanelCuadreBancario = ({
    cuentaBancoId,
    version = 0,
}: {
    cuentaBancoId: string | null;
    version?: number;
}) => {

    const [cuadre, setCuadre] = useState<CuadreBancario | null>(null);

    useEffect(() => {
        if (!cuentaBancoId) return;
        getCuadreBancario().then(setCuadre).catch(console.error);
    }, [cuentaBancoId, version]);

    const cuenta = cuentaBancoId
        ? cuadre?.cuentas.find((c) => c.cuentaBancoId === cuentaBancoId)
        : undefined;
    if (!cuenta) return null;

    return (
        <div className="CuadreBancario">
            <FilaCuadreCuenta cuenta={cuenta} />
        </div>
    );
};

/**
 * Construye la URL al maestro de conciliación de una cuenta bancaria con filtros
 * de cuadre preseleccionados. Incluye `_label` para que el maestro sepa que son
 * filtros de cuadre (no del usuario) y los trate por separado.
 *
 * Los filtros usan el formato que entiende `getUrlParams`:
 *   - operador `=` o `in` → `campo=operador__valor`
 *   - operador `~` (defecto) → `campo=valor`
 */
const urlMovimientosCuenta = (cuentaBancoId: string, filtros: Record<string, string>, label: string): string => {
    const params = new URLSearchParams({ ...filtros, _label: label });
    return `${urlConciliacionCuentaBancaria(cuentaBancoId)}?${params}`;
};

/** Badge de alerta: enlace si hay cuenta bancaria enlazada, botón si abre algo
 * en la propia pantalla y span estático si no. */
const Alerta = ({
    variante,
    children,
    href,
    onClick,
}: {
    variante: string;
    children: ReactNode;
    href?: string;
    onClick?: () => void;
}) => {
    const className = `alerta alerta--${variante}`;
    if (href) {
        return <Link className={className} to={href}>{children}</Link>;
    }
    if (onClick) {
        return <button type="button" className={className} onClick={onClick}>{children}</button>;
    }
    return <span className={className}>{children}</span>;
};

const FilaCuadreCuenta = ({ cuenta }: { cuenta: CuadreCuenta }) => {
    const t = useTTesoreria();
    const { diferencia, cuentaBancoId } = cuenta;
    const hayAlertas = cuenta.totalAlertas > 0;
    const hayDiferencia = diferencia !== null && diferencia !== 0;
    const [verPartidas, setVerPartidas] = useState(false);

    // Construye la URL al maestro con filtros; null si la cuenta no tiene codcuenta ERP.
    const url = cuentaBancoId
        ? (filtros: Record<string, string>, label: string) => urlMovimientosCuenta(cuentaBancoId, filtros, label)
        : null;

    return (
        <div className={`CuadreCuenta ${hayAlertas || hayDiferencia ? "CuadreCuenta--alertas" : ""}`}>
            <div className="CuadreCuenta-cabecera">
                <span className="CuadreCuenta-nombre">
                    {cuenta.institucion ? `${cuenta.institucion} — ` : ""}{cuenta.nombreCuenta}
                </span>
                <span className="CuadreCuenta-sincronizacion">
                    {t("conciliacion.ultimaSincronizacion")}{" "}
                    <strong>
                        {cuenta.ultimaSincronizacion
                            ? formatearFechaHora(cuenta.ultimaSincronizacion)
                            : t("conciliacion.cuadreNunca")}
                    </strong>
                </span>
                <span className="CuadreCuenta-saldos">
                    {cuenta.saldoBanco !== null && (
                        <span>
                            {t("conciliacion.banco")}{" "}<strong>{formatearMoneda(cuenta.saldoBanco, "EUR")}</strong>
                        </span>
                    )}
                    {cuenta.saldoContable !== null && (
                        <span>
                            {t("conciliacion.contable")}{" "}<strong>{formatearMoneda(cuenta.saldoContable, "EUR")}</strong>
                        </span>
                    )}
                    {diferencia !== null && (
                        <span className={Math.abs(diferencia) > 0.01 ? "CuadreCuenta-diferencia--error" : ""}>
                            {t("conciliacion.diferencia")}{" "}<strong>{formatearMoneda(diferencia, "EUR")}</strong>
                        </span>
                    )}
                </span>
            </div>

            {hayAlertas && (
                <div className="CuadreCuenta-alertas">
                    {cuenta.bancarioSinConciliar > 0 && (
                        <Alerta
                            variante="pendiente"
                            href={url?.({ estado: "in__pendiente,candidatos" }, t("conciliacion.cuadreFiltroSinConciliar"))}
                        >
                            {t("conciliacion.cuadreSinConciliar", { count: cuenta.bancarioSinConciliar })}
                            {" "}({formatearMoneda(cuenta.importeSinConciliar, "EUR")})
                        </Alerta>
                    )}
                    {cuenta.bancarioIgnorado > 0 && (
                        <Alerta
                            variante="ignorado"
                            href={url?.({ estado: "in__ignorado" }, t("conciliacion.cuadreFiltroIgnorados"))}
                        >
                            {t("conciliacion.cuadreIgnorados", { count: cuenta.bancarioIgnorado })}
                            {" "}({formatearMoneda(cuenta.importeIgnorado, "EUR")})
                        </Alerta>
                    )}
                    {cuenta.requiereRevision > 0 && (
                        <Alerta
                            variante="revision"
                            href={url?.({ requiere_revision: "=__true" }, t("conciliacion.cuadreFiltroRevision"))}
                        >
                            {t("conciliacion.cuadreRevision", { count: cuenta.requiereRevision })}
                        </Alerta>
                    )}
                    {cuenta.bancoEliminoConciliado > 0 && (
                        <Alerta
                            variante="eliminado"
                            href={url?.({ eliminado_en_banco: "=__true", estado: "in__conciliado" }, t("conciliacion.cuadreFiltroEliminados"))}
                        >
                            {t("conciliacion.cuadreEliminados", { count: cuenta.bancoEliminoConciliado })}
                        </Alerta>
                    )}
                    {cuenta.asientoDescuadrado > 0 && (
                        <Alerta
                            variante="error"
                            href={url?.({ asiento_descuadrado: "=__true" }, t("conciliacion.cuadreFiltroDescuadrados"))}
                        >
                            {t("conciliacion.cuadreDescuadrados", { count: cuenta.asientoDescuadrado })}
                        </Alerta>
                    )}
                    {cuenta.partidaHuerfana > 0 && (
                        <Alerta variante="error" onClick={() => setVerPartidas(true)}>
                            {t("conciliacion.cuadrePartidas", { count: cuenta.partidaHuerfana })}
                        </Alerta>
                    )}
                </div>
            )}

            {verPartidas && (
                <PartidasSinConciliar cuentaId={cuenta.cuentaId} onCerrar={() => setVerPartidas(false)} />
            )}
        </div>
    );
};

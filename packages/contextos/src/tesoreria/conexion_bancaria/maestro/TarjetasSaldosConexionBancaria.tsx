import { QIcono } from "@olula/componentes/atomos/qicono.tsx";
import { formatearMoneda } from "@olula/lib/dominio.js";
import { useEffect, useState } from "react";
import { ResumenSaldosConexionBancaria, SaldoCuentaConexionBancaria } from "../diseño.js";
import { getSaldosConexionBancaria } from "../infraestructura.js";
import { paletaBancoEspana } from "./colores_bancos_es.js";
import "./TarjetasSaldosConexionBancaria.css";
import { tTesoreria, useTTesoreria } from "../../i18n/index.ts";

const DIVISA_DEFECTO = "EUR";

const formatearSaldo = (importe: number | null, divisa: string | null): string => {
    if (importe === null) return "—";
    return formatearMoneda(importe, divisa ?? DIVISA_DEFECTO);
};

const mascaraCuenta = (cuenta: SaldoCuentaConexionBancaria): string =>
    cuenta.mascara ? `···· ${cuenta.mascara}` : "····";

const TarjetaCuenta = ({
    cuenta,
    onReautenticar,
}: {
    cuenta: SaldoCuentaConexionBancaria;
    onReautenticar?: (conexionId: string) => void;
}) => {
    const paleta = paletaBancoEspana(cuenta.institucionNombre);
    const saldo = formatearSaldo(cuenta.saldoDisponible ?? cuenta.saldoActual, cuenta.divisa);
    const contableDistinto =
        cuenta.saldoActual !== null &&
        cuenta.saldoDisponible !== null &&
        cuenta.saldoActual !== cuenta.saldoDisponible;
    const alerta =
        cuenta.error
            ? "error"
            : cuenta.estadoConexion === "requiere_reautenticacion"
                ? "reauth"
                : null;

    return (
        <article
            className={`tarjeta-banco${paleta.clara ? " tarjeta-banco--clara" : ""}${alerta ? ` tarjeta-banco--${alerta}` : ""}`}
            style={{
                ["--banco-tono" as string]: paleta.tono,
                ["--banco-acento" as string]: paleta.acento,
            }}
        >
            <div className="tarjeta-banco-brillo" aria-hidden />
            <header className="tarjeta-banco-cabecera">
                <div className="tarjeta-banco-institucion">
                    <span className="tarjeta-banco-chip" aria-hidden>
                        <QIcono
                            nombre="tarjeta"
                            tamaño="sm"
                            color={paleta.clara ? "var(--banco-acento)" : "currentColor"}
                        />
                    </span>
                    <span className="tarjeta-banco-nombre">
                        {cuenta.institucionNombre ?? tTesoreria("conexion_bancaria.banco")}
                    </span>
                </div>
                {alerta === "reauth" && onReautenticar ? (
                    <button
                        type="button"
                        className="tarjeta-banco-alerta tarjeta-banco-alerta--accion"
                        onClick={() => onReautenticar(cuenta.conexionId)}
                    >
                        {tTesoreria("conexion_bancaria.reautenticar")}
                    </button>
                ) : alerta && (
                    <span className="tarjeta-banco-alerta">
                        {alerta === "reauth" ? tTesoreria("conexion_bancaria.reautenticar") : tTesoreria("conexion_bancaria.error")}
                    </span>
                )}
            </header>

            <p className="tarjeta-banco-mascara">{mascaraCuenta(cuenta)}</p>
            <p className="tarjeta-banco-cuenta">{cuenta.nombre}</p>

            <div className="tarjeta-banco-saldo">
                <span className="tarjeta-banco-saldo-etiqueta">{tTesoreria("conexion_bancaria.disponible")}</span>
                <span className="tarjeta-banco-saldo-valor">{saldo}</span>
                {contableDistinto && (
                    <span className="tarjeta-banco-saldo-contable">
                        {tTesoreria("conexion_bancaria.contableValor", { valor: formatearSaldo(cuenta.saldoActual, cuenta.divisa) })}
                    </span>
                )}
            </div>
        </article>
    );
};

const TarjetaResumen = ({
    titulo,
    valor,
    icono,
}: {
    titulo: string;
    valor: string;
    icono: string;
}) => (
    <article className="tarjeta-saldo-resumen">
        <header className="tarjeta-saldo-resumen-cabecera">
            <span className="tarjeta-saldo-resumen-titulo">{titulo}</span>
            <QIcono nombre={icono} tamaño="sm" color="var(--gris-6)" />
        </header>
        <span className="tarjeta-saldo-resumen-valor">{valor}</span>
    </article>
);

const REINTENTO_REFRESCO_MS = 2500;
const MAX_REINTENTOS_REFRESCO = 2;

/**
 * Resumen de saldos cacheados en BD. Si el backend marca `necesitaRefresco`,
 * reconsulta tras unos segundos para recoger el refresco en segundo plano.
 * Un fallo deja el bloque vacío sin romper el listado.
 */
export const TarjetasSaldosConexionBancaria = ({
    refrescarClave = 0,
    onReautenticar,
}: {
    refrescarClave?: number;
    /** Si se indica, la alerta "Reautenticar" de una cuenta abre la reautenticación de su conexión. */
    onReautenticar?: (conexionId: string) => void;
}) => {
    const t = useTTesoreria();
    const [resumen, setResumen] = useState<ResumenSaldosConexionBancaria | null>(null);

    useEffect(() => {
        let cancelado = false;
        let temporizador: ReturnType<typeof setTimeout> | undefined;
        let reintentos = 0;

        const cargar = () => {
            getSaldosConexionBancaria()
                .then((datos) => {
                    if (cancelado) return;
                    setResumen(datos);
                    if (datos.necesitaRefresco && reintentos < MAX_REINTENTOS_REFRESCO) {
                        reintentos += 1;
                        temporizador = setTimeout(cargar, REINTENTO_REFRESCO_MS);
                    }
                })
                .catch(() => {
                    if (!cancelado) setResumen(null);
                });
        };

        cargar();
        return () => {
            cancelado = true;
            if (temporizador !== undefined) clearTimeout(temporizador);
        };
    }, [refrescarClave]);

    if (!resumen || resumen.cuentas.length === 0) return null;

    const divisa = resumen.divisa ?? DIVISA_DEFECTO;
    const cuentasActivas = resumen.cuentas.filter((c) => c.activa && c.tipo !== "loans");

    return (
        <div className="TarjetasSaldosConexionBancaria">
            <div className="tarjetas-saldos-resumen">
                {resumen.totalDisponible !== null && (
                    <TarjetaResumen
                        titulo={t("conexion_bancaria.totalDisponible")}
                        valor={formatearSaldo(resumen.totalDisponible, divisa)}
                        icono="tarjeta"
                    />
                )}
                {resumen.totalActual !== null && resumen.totalActual !== resumen.totalDisponible && (
                    <TarjetaResumen
                        titulo={t("conexion_bancaria.totalContable")}
                        valor={formatearSaldo(resumen.totalActual, divisa)}
                        icono="fichero"
                    />
                )}
            </div>

            <div className="tarjetas-saldos-cuentas">
                {cuentasActivas.map((cuenta) => (
                    <TarjetaCuenta key={cuenta.cuentaId} cuenta={cuenta} onReautenticar={onReautenticar} />
                ))}
            </div>
        </div>
    );
};

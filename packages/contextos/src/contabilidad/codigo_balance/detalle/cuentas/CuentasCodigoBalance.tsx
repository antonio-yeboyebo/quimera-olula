import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { useMaquina } from "@olula/componentes/hook/useMaquina.ts";
import { useEffect } from "react";
import { BorrarCuentaCodigoBalance } from "../../borrar_cuenta/BorrarCuentaCodigoBalance.tsx";
import { CambiarCuentaCodigoBalance } from "../../cambiar_cuenta/CambiarCuentaCodigoBalance.tsx";
import { CrearCuentaCodigoBalance } from "../../crear_cuenta/CrearCuentaCodigoBalance.tsx";
import { CodigoBalance, FormatoBalance } from "../../diseño.ts";
import { CuentasLista } from "./CuentasLista.tsx";
import { getMaquina } from "./maquina.ts";
import { useTContabilidad } from "../../../i18n/index.ts";

/**
 * Orquestador de las cuentas de un código de balance (`co_cuentascb` o
 * `co_cuentascbba`). Se aparta de la plantilla `_con_lineas` en que lleva su
 * propia máquina: el detalle tiene DOS sub-recursos con la misma forma (normal
 * y abreviado) y así no se duplican los estados en la máquina del detalle.
 */
export const CuentasCodigoBalance = ({
    formato,
    codigoBalance,
}: {
    formato: FormatoBalance;
    codigoBalance: CodigoBalance;
}) => {
    const t = useTContabilidad();
    const { ctx, emitir } = useMaquina(getMaquina, {
        estado: "INICIAL",
        formato,
        codigoBalanceId: codigoBalance.id,
        cuentas: [],
        activa: null,
    });

    const { estado, cuentas, activa } = ctx;

    useEffect(() => {
        emitir("recarga_de_cuentas_solicitada");
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <div className="CuentasCodigoBalance">
            <div className="botones maestro-botones">
                <QBoton onClick={() => emitir("alta_cuenta_solicitada")}>{t("codigo_balance.nuevaCuenta")}</QBoton>
                <QBoton onClick={() => emitir("cambio_cuenta_solicitado")} deshabilitado={!activa}>
                    {t("codigo_balance.editar")}
                </QBoton>
                <QBoton onClick={() => emitir("baja_cuenta_solicitada")} deshabilitado={!activa}>
                    {t("codigo_balance.borrar")}
                </QBoton>
            </div>
            <CuentasLista cuentas={cuentas} seleccionada={activa?.id} publicar={emitir} />

            {estado === "CREANDO" && (
                <CrearCuentaCodigoBalance
                    formato={formato}
                    codigoBalance={codigoBalance}
                    publicar={emitir}
                />
            )}
            {activa && estado === "CAMBIANDO" && (
                <CambiarCuentaCodigoBalance cuenta={activa} publicar={emitir} />
            )}
            {activa && estado === "BORRANDO" && (
                <BorrarCuentaCodigoBalance cuenta={activa} publicar={emitir} />
            )}
        </div>
    );
};

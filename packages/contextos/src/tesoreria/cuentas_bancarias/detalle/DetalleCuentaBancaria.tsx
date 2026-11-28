import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { QCheckbox } from "@olula/componentes/atomos/qcheckbox.tsx";
import { QInput } from "@olula/componentes/atomos/qinput.tsx";
import { Detalle } from "@olula/componentes/detalle/Detalle.tsx";
import { useMaquina } from "@olula/componentes/hook/useMaquina.js";
import { QuimeraAcciones } from "@olula/componentes/index.js";
import { EmitirEvento } from "@olula/lib/diseño.ts";
import { puede } from "@olula/lib/dominio.ts";
import { useModelo } from "@olula/lib/useModelo.js";
import { useCallback, useEffect } from "react";
import { BorrarCuentaBancaria } from "../borrar/BorrarCuentaBancaria.js";
import { CuentaBancaria } from "../diseño.js";
import {
    contextoDetalleCuentaBancariaInicial,
    guardarCuenta,
    metaCuentaBancaria,
} from "./detalle.js";
import "./DetalleCuentaBancaria.css";
import { getMaquina } from "./maquina.js";
import { useTTesoreria } from "../../i18n/index.ts";

export const DetalleCuentaBancaria = ({
    id,
    publicar = async () => {},
}: {
    id?: string;
    publicar?: EmitirEvento;
}) => {

    const t = useTTesoreria();
    const { ctx, emitir } = useMaquina(
        getMaquina,
        contextoDetalleCuentaBancariaInicial,
        publicar,
    );

    const autoGuardar = useCallback(
        async (cuenta: CuentaBancaria) => {
            await guardarCuenta(ctx, cuenta);
            await emitir("cuenta_guardada");
        },
        [ctx, emitir],
    );

    const { uiProps } = useModelo(metaCuentaBancaria, ctx.cuenta, autoGuardar);

    const { estado, cuenta } = ctx;

    useEffect(() => {
        emitir("cuenta_id_cambiado", id, true);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    if (!ctx.cuenta.id) return null;

    const titulo = (c: CuentaBancaria) => c.descripcion || c.iban || c.codigoCuenta;

    const accionesCuenta = [
        {
            texto: t("cuentas_bancarias.borrar"),
            onClick: () => publicar("borrado_solicitado"),
            advertencia: true,
        },
    ];

    return (
        <Detalle
            id={id}
            obtenerTitulo={titulo}
            setEntidad={() => {}}
            entidad={ctx.cuenta}
            cerrarDetalle={() => emitir("cuenta_deseleccionada", null, true)}
        >
            <div className="DetalleCuentaBancaria">
                <QuimeraAcciones acciones={accionesCuenta} />
                {puede("tesoreria.conciliacion") && (
                    <div className="botones">
                        <QBoton variante="borde" enlace={`/tesoreria/cuentas_bancarias/${cuenta.id}/conciliacion`}>
                            {t("cuentas_bancarias.conciliacionBancaria")}
                        </QBoton>
                    </div>
                )}
                <quimera-formulario>
                    <QInput label={t("cuentas_bancarias.descripcion")} {...uiProps("descripcion")} />
                    <QInput label="IBAN" {...uiProps("iban")} />
                    <QInput label={t("cuentas_bancarias.empresa")} {...uiProps("empresaId")} />
                    <QCheckbox label={t("cuentas_bancarias.obsoleta")} {...uiProps("obsoleta")} />

                    {/* Calculados por el servidor a partir del IBAN */}
                    <QInput label={t("cuentas_bancarias.codigoDeCuenta")} {...uiProps("codigoCuenta")} soloLectura />
                    <QInput label={t("cuentas_bancarias.pais")} {...uiProps("paisId")} soloLectura />
                    <QInput label={t("cuentas_bancarias.digitoControl")} {...uiProps("digitoControl")} soloLectura />
                    <QInput label={t("cuentas_bancarias.numeroDeCuenta")} {...uiProps("cuenta")} soloLectura />
                    <QInput label={t("cuentas_bancarias.bicSwift")} {...uiProps("bic")} soloLectura />
                    <QInput label={t("cuentas_bancarias.entidad")} {...uiProps("entidad")} soloLectura />
                    <QInput label={t("cuentas_bancarias.agencia")} {...uiProps("agencia")} soloLectura />
                </quimera-formulario>
            </div>

            {estado === "BORRANDO" && (
                <BorrarCuentaBancaria
                    cuenta={cuenta}
                    publicar={emitir}
                />
            )}
        </Detalle>
    );
};

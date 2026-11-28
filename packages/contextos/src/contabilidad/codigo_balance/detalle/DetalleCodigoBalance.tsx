import { QInput } from "@olula/componentes/atomos/qinput.tsx";
import { Detalle } from "@olula/componentes/detalle/Detalle.tsx";
import { Tab, Tabs } from "@olula/componentes/detalle/tabs/Tabs.tsx";
import { useMaquina } from "@olula/componentes/hook/useMaquina.js";
import { QuimeraAcciones } from "@olula/componentes/moleculas/qacciones.tsx";
import { EmitirEvento } from "@olula/lib/diseño.ts";
import { puede } from "@olula/lib/dominio.ts";
import { useModelo } from "@olula/lib/useModelo.js";
import { useCallback, useEffect } from "react";
import { BorrarCodigoBalance } from "../borrar/BorrarCodigoBalance.tsx";
import { CodigoBalance } from "../diseño.ts";
import { etiquetaCodigoBalance, metaCodigoBalance } from "../dominio.ts";
import { CuentasCodigoBalance } from "./cuentas/CuentasCodigoBalance.tsx";
import { contextoDetalleCodigoBalanceInicial, guardarCodigoBalance } from "./detalle.ts";
import { getMaquina } from "./maquina.ts";
import { TabGeneral } from "./TabGeneral.tsx";
import { useTContabilidad } from "../../i18n/index.ts";

/** Formulario de Eneboo `co_codbalances08.ui`: datos del código, pestaña de
 * cuentas normales (`co_cuentascb`) y pestaña de balance abreviado
 * (descripción abreviada del nivel 4 y `co_cuentascbba`). */
export const DetalleCodigoBalance = ({
    id,
    publicar = async () => {},
}: {
    id?: string;
    publicar?: EmitirEvento;
}) => {
    const t = useTContabilidad();
    const { ctx, emitir } = useMaquina(getMaquina, contextoDetalleCodigoBalanceInicial, publicar);

    const autoGuardar = useCallback(
        async (codigoBalance: CodigoBalance) => {
            await guardarCodigoBalance(ctx, codigoBalance);
            await emitir("codigo_balance_guardado");
        },
        [ctx, emitir]
    );

    const formModelo = useModelo(metaCodigoBalance, ctx.codigoBalance, autoGuardar);

    const { estado, codigoBalance } = ctx;

    useEffect(() => {
        emitir("codigo_balance_id_cambiado", id, true);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    if (!codigoBalance.id) return null;

    const acciones = [
        {
            texto: t("codigo_balance.borrar"),
            onClick: () => emitir("borrado_solicitado"),
            deshabilitado: !puede("contabilidad.asiento"),
            advertencia: true,
        },
    ];

    return (
        <Detalle
            id={id}
            obtenerTitulo={etiquetaCodigoBalance}
            setEntidad={() => {}}
            entidad={codigoBalance}
            cerrarDetalle={() => emitir("codigo_balance_deseleccionado", null, true)}
        >
            <div className="DetalleCodigoBalance">
                <div className="maestro-botones">
                    <QuimeraAcciones acciones={acciones} vertical />
                </div>
                <Tabs children={[
                    <Tab label={t("codigo_balance.general")}
                        key="tab-general"
                        children={<TabGeneral form={formModelo} codigoBalance={codigoBalance} />}
                    />,
                    <Tab label={t("codigo_balance.cuentasNormales")}
                        key="tab-cuentas"
                        children={
                            <CuentasCodigoBalance
                                key={`normal-${codigoBalance.id}`}
                                formato="normal"
                                codigoBalance={codigoBalance}
                            />
                        }
                    />,
                    <Tab label={t("codigo_balance.cuentasDeBalanceAbreviado")}
                        key="tab-cuentas-abreviado"
                        children={
                            <>
                                <quimera-formulario>
                                    <QInput label={t("codigo_balance.codigoNivel4")} nombre="nivel4ba"
                                        valor={codigoBalance.nivel4} soloLectura />
                                    <QInput label={t("codigo_balance.descripcionBalanceAbreviado")}
                                        {...formModelo.uiProps("descripcion4ba")} />
                                </quimera-formulario>
                                <CuentasCodigoBalance
                                    key={`abreviado-${codigoBalance.id}`}
                                    formato="abreviado"
                                    codigoBalance={codigoBalance}
                                />
                            </>
                        }
                    />,
                ]} />
            </div>

            {estado === "BORRANDO" && (
                <BorrarCodigoBalance codigoBalance={codigoBalance} publicar={emitir} />
            )}
        </Detalle>
    );
};

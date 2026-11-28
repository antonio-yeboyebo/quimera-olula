import { Detalle } from "@olula/componentes/detalle/Detalle.tsx";
import { Tab, Tabs } from "@olula/componentes/detalle/tabs/Tabs.tsx";
import { useMaquina } from "@olula/componentes/hook/useMaquina.js";
import { QuimeraAcciones } from "@olula/componentes/moleculas/qacciones.tsx";
import { EmitirEvento } from "@olula/lib/diseño.ts";
import { puede } from "@olula/lib/dominio.ts";
import { useModelo } from "@olula/lib/useModelo.js";
import { useCallback, useEffect } from "react";
import { BorrarCuentasAnuales } from "../borrar/BorrarCuentasAnuales.tsx";
import { CuentasAnuales } from "../diseño.ts";
import { etiquetaCuentasAnuales } from "../dominio.ts";
import {
    contextoDetalleCuentasAnualesInicial,
    guardarInforme,
    metaCuentasAnuales,
} from "./detalle.ts";
import { getMaquina } from "./maquina.ts";
import { TabCriterios } from "./TabCriterios.tsx";
import { TabResultado } from "./TabResultado.tsx";
import { useTContabilidad } from "../../i18n/index.ts";

export const DetalleCuentasAnuales = ({
    id,
    publicar = async () => {},
}: {
    id?: string;
    publicar?: EmitirEvento;
}) => {
    const t = useTContabilidad();
    const { ctx, emitir } = useMaquina(
        getMaquina,
        contextoDetalleCuentasAnualesInicial,
        publicar
    );

    const autoGuardar = useCallback(
        async (informe: CuentasAnuales) => {
            await guardarInforme(ctx, informe);
            await emitir("informe_guardado");
        },
        [ctx, emitir]
    );

    const formModelo = useModelo(metaCuentasAnuales, ctx.informe, autoGuardar);

    const { estado, informe, balance } = ctx;

    useEffect(() => {
        emitir("informe_id_cambiado", id, true);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    if (!informe.id) return null;

    const acciones = [
        {
            texto: t("cuentas_anuales.borrar"),
            onClick: () => emitir("borrado_solicitado"),
            deshabilitado: !puede("contabilidad.asiento"),
            advertencia: true,
        },
    ];

    return (
        <Detalle
            id={id}
            obtenerTitulo={etiquetaCuentasAnuales}
            setEntidad={() => {}}
            entidad={informe}
            cerrarDetalle={() => emitir("informe_deseleccionado", null, true)}
        >
            <div className="DetalleCuentasAnuales">
                <div className="maestro-botones">
                    <QuimeraAcciones acciones={acciones} vertical />
                </div>
                <Tabs
                    children={[
                        <Tab
                            label={t("cuentas_anuales.criterios")}
                            key="tab-criterios"
                            children={
                                <TabCriterios
                                    form={formModelo}
                                    informe={formModelo.modelo}
                                />
                            }
                        />,
                        <Tab
                            label={t("cuentas_anuales.resultado")}
                            key="tab-resultado"
                            children={
                                <TabResultado
                                    informe={informe}
                                    balance={balance}
                                    emitir={emitir}
                                />
                            }
                        />,
                    ]}
                />
            </div>

            {estado === "BORRANDO" && (
                <BorrarCuentasAnuales informe={informe} publicar={emitir} />
            )}
        </Detalle>
    );
};

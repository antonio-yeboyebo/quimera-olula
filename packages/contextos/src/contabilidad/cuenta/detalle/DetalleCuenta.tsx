import { Detalle } from "@olula/componentes/detalle/Detalle.tsx";
import { Tab, Tabs } from "@olula/componentes/detalle/tabs/Tabs.tsx";
import { useMaquina } from "@olula/componentes/hook/useMaquina.js";
import { QuimeraAcciones } from "@olula/componentes/moleculas/qacciones.tsx";
import { EmitirEvento } from "@olula/lib/diseño.ts";
import { puede } from "@olula/lib/dominio.ts";
import { useModelo } from "@olula/lib/useModelo.js";
import { useCallback, useEffect } from "react";
import { BorrarCuenta } from "../borrar/BorrarCuenta.tsx";
import { Cuenta } from "../diseño.ts";
import { etiquetaCuenta } from "../dominio.ts";
import { contextoDetalleCuentaInicial, guardarCuenta, metaCuenta } from "./detalle.ts";
import { getMaquina } from "./maquina.ts";
import { TabGeneral } from "./TabGeneral.tsx";
import { useTContabilidad } from "../../i18n/index.ts";

export const DetalleCuenta = ({
    id,
    publicar = async () => {},
}: {
    id?: string;
    publicar?: EmitirEvento;
}) => {

    const t = useTContabilidad();
    const { ctx, emitir } = useMaquina(
        getMaquina,
        contextoDetalleCuentaInicial,
        publicar
    );

    const autoGuardar = useCallback(
        async (cuenta: Cuenta) => {
            await guardarCuenta(ctx, cuenta);
            await emitir("cuenta_guardada");
        },
        [ctx, emitir]
    );

    const formModelo = useModelo(metaCuenta, ctx.cuenta, autoGuardar);

    const { estado, cuenta } = ctx;

    useEffect(() => {
        emitir("cuenta_id_cambiada", id, true);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    if (!cuenta.id) return null;

    const accionesCuenta = [
        {
            texto: t("cuenta.borrar"),
            onClick: () => emitir("borrado_solicitado"),
            deshabilitado: !puede("contabilidad.cuenta"),
            advertencia: true,
        },
    ];

    return (
        <Detalle
            id={id}
            obtenerTitulo={etiquetaCuenta}
            setEntidad={() => {}}
            entidad={cuenta}
            cerrarDetalle={() => emitir("cuenta_deseleccionada", null, true)}
        >
            <div className="DetalleCuenta">
                <div className="maestro-botones">
                    <QuimeraAcciones acciones={accionesCuenta} vertical />
                </div>
                <Tabs children={[
                    <Tab label={t("cuenta.general")}
                        key="tab-general"
                        children={
                            <TabGeneral form={formModelo} cuenta={cuenta} />
                        }
                    />,
                ]} />
            </div>

            {estado === "BORRANDO" && (
                <BorrarCuenta cuenta={cuenta} publicar={emitir} />
            )}
        </Detalle>
    );
};

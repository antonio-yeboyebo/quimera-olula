import { Detalle } from "@olula/componentes/detalle/Detalle.tsx";
import { Tab, Tabs } from "@olula/componentes/detalle/tabs/Tabs.tsx";
import { useMaquina } from "@olula/componentes/hook/useMaquina.js";
import { QuimeraAcciones } from "@olula/componentes/moleculas/qacciones.tsx";
import { EmitirEvento } from "@olula/lib/diseño.ts";
import { puede } from "@olula/lib/dominio.ts";
import { useModelo } from "@olula/lib/useModelo.js";
import { useCallback, useEffect } from "react";
import { BorrarSubcuenta } from "../borrar/BorrarSubcuenta.tsx";
import { Subcuenta } from "../diseño.ts";
import { etiquetaSubcuenta } from "../dominio.ts";
import {
    contextoDetalleSubcuentaInicial,
    guardarSubcuenta,
    metaSubcuenta,
} from "./detalle.ts";
import { getMaquina } from "./maquina.ts";
import { TabGeneral } from "./TabGeneral.tsx";
import { useTContabilidad } from "../../i18n/index.ts";

export const DetalleSubcuenta = ({
    id,
    publicar = async () => {},
}: {
    id?: string;
    publicar?: EmitirEvento;
}) => {

    const t = useTContabilidad();
    const { ctx, emitir } = useMaquina(
        getMaquina,
        contextoDetalleSubcuentaInicial,
        publicar
    );

    const autoGuardar = useCallback(
        async (subcuenta: Subcuenta) => {
            await guardarSubcuenta(ctx, subcuenta);
            await emitir("subcuenta_guardada");
        },
        [ctx, emitir]
    );

    const formModelo = useModelo(metaSubcuenta, ctx.subcuenta, autoGuardar);

    const { estado, subcuenta } = ctx;

    useEffect(() => {
        emitir("subcuenta_id_cambiada", id, true);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    if (!subcuenta.id) return null;

    const accionesSubcuenta = [
        {
            texto: t("subcuenta.borrar"),
            onClick: () => emitir("borrado_solicitado"),
            deshabilitado: !puede("contabilidad.subcuenta"),
            advertencia: true,
        },
    ];

    return (
        <Detalle
            id={id}
            obtenerTitulo={etiquetaSubcuenta}
            setEntidad={() => {}}
            entidad={subcuenta}
            cerrarDetalle={() => emitir("subcuenta_deseleccionada", null, true)}
        >
            <div className="DetalleSubcuenta">
                <div className="maestro-botones">
                    <QuimeraAcciones acciones={accionesSubcuenta} vertical />
                </div>
                <Tabs children={[
                    <Tab label={t("subcuenta.general")}
                        key="tab-general"
                        children={
                            <TabGeneral form={formModelo} subcuenta={subcuenta} />
                        }
                    />,
                ]} />
            </div>

            {estado === "BORRANDO" && (
                <BorrarSubcuenta subcuenta={subcuenta} publicar={emitir} />
            )}
        </Detalle>
    );
};

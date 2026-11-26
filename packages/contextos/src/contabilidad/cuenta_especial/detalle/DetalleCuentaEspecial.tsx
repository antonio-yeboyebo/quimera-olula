import { Detalle } from "@olula/componentes/detalle/Detalle.tsx";
import { Tab, Tabs } from "@olula/componentes/detalle/tabs/Tabs.tsx";
import { useMaquina } from "@olula/componentes/hook/useMaquina.js";
import { QuimeraAcciones } from "@olula/componentes/moleculas/qacciones.tsx";
import { EmitirEvento } from "@olula/lib/diseño.ts";
import { puede } from "@olula/lib/dominio.ts";
import { useModelo } from "@olula/lib/useModelo.js";
import { useCallback, useEffect } from "react";
import { BorrarCuentaEspecial } from "../borrar/BorrarCuentaEspecial.tsx";
import { CuentaEspecial } from "../diseño.ts";
import { etiquetaCuentaEspecial } from "../dominio.ts";
import {
    contextoDetalleCuentaEspecialInicial,
    guardarCuentaEspecial,
    metaCuentaEspecial,
} from "./detalle.ts";
import { getMaquina } from "./maquina.ts";
import { TabGeneral } from "./TabGeneral.tsx";
import { useTContabilidad } from "../../i18n/index.ts";

export const DetalleCuentaEspecial = ({
    id,
    publicar = async () => {},
}: {
    id?: string;
    publicar?: EmitirEvento;
}) => {

    const t = useTContabilidad();
    const { ctx, emitir } = useMaquina(
        getMaquina,
        contextoDetalleCuentaEspecialInicial,
        publicar
    );

    const autoGuardar = useCallback(
        async (cuentaEspecial: CuentaEspecial) => {
            await guardarCuentaEspecial(ctx, cuentaEspecial);
            await emitir("cuenta_especial_guardada");
        },
        [ctx, emitir]
    );

    const formModelo = useModelo(
        metaCuentaEspecial,
        ctx.cuentaEspecial,
        autoGuardar
    );

    const { estado, cuentaEspecial } = ctx;

    useEffect(() => {
        emitir("cuenta_especial_id_cambiada", id, true);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    if (!cuentaEspecial.id) return null;

    const accionesCuentaEspecial = [
        {
            texto: t("cuenta_especial.borrar"),
            onClick: () => emitir("borrado_solicitado"),
            deshabilitado: !puede("contabilidad.cuenta_especial"),
            advertencia: true,
        },
    ];

    return (
        <Detalle
            id={id}
            obtenerTitulo={etiquetaCuentaEspecial}
            setEntidad={() => {}}
            entidad={cuentaEspecial}
            cerrarDetalle={() =>
                emitir("cuenta_especial_deseleccionada", null, true)
            }
        >
            <div className="DetalleCuentaEspecial">
                <div className="maestro-botones">
                    <QuimeraAcciones acciones={accionesCuentaEspecial} vertical />
                </div>
                <Tabs children={[
                    <Tab label={t("cuenta_especial.general")}
                        key="tab-general"
                        children={
                            <TabGeneral
                                form={formModelo}
                                cuentaEspecial={cuentaEspecial}
                            />
                        }
                    />,
                ]} />
            </div>

            {estado === "BORRANDO" && (
                <BorrarCuentaEspecial
                    cuentaEspecial={cuentaEspecial}
                    publicar={emitir}
                />
            )}
        </Detalle>
    );
};

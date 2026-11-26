import { Detalle } from "@olula/componentes/detalle/Detalle.tsx";
import { Tab, Tabs } from "@olula/componentes/detalle/tabs/Tabs.tsx";
import { useMaquina } from "@olula/componentes/hook/useMaquina.js";
import { QuimeraAcciones } from "@olula/componentes/moleculas/qacciones.tsx";
import { EmitirEvento } from "@olula/lib/diseño.ts";
import { puede } from "@olula/lib/dominio.ts";
import { useModelo } from "@olula/lib/useModelo.js";
import { useCallback, useEffect } from "react";
import { BorrarEpigrafe } from "../borrar/BorrarEpigrafe.tsx";
import { Epigrafe } from "../diseño.ts";
import { etiquetaEpigrafe } from "../dominio.ts";
import {
    contextoDetalleEpigrafeInicial,
    guardarEpigrafe,
    metaEpigrafe,
} from "./detalle.ts";
import { getMaquina } from "./maquina.ts";
import { TabGeneral } from "./TabGeneral.tsx";
import { useTContabilidad } from "../../i18n/index.ts";

export const DetalleEpigrafe = ({
    id,
    publicar = async () => {},
}: {
    id?: string;
    publicar?: EmitirEvento;
}) => {

    const t = useTContabilidad();
    const { ctx, emitir } = useMaquina(
        getMaquina,
        contextoDetalleEpigrafeInicial,
        publicar
    );

    const autoGuardar = useCallback(
        async (epigrafe: Epigrafe) => {
            await guardarEpigrafe(ctx, epigrafe);
            await emitir("epigrafe_guardado");
        },
        [ctx, emitir]
    );

    const formModelo = useModelo(metaEpigrafe, ctx.epigrafe, autoGuardar);

    const { estado, epigrafe } = ctx;

    useEffect(() => {
        emitir("epigrafe_id_cambiado", id, true);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    if (!epigrafe.id) return null;

    const accionesEpigrafe = [
        {
            texto: t("epigrafe.borrar"),
            onClick: () => emitir("borrado_solicitado"),
            deshabilitado: !puede("contabilidad.epigrafe"),
            advertencia: true,
        },
    ];

    return (
        <Detalle
            id={id}
            obtenerTitulo={etiquetaEpigrafe}
            setEntidad={() => {}}
            entidad={epigrafe}
            cerrarDetalle={() => emitir("epigrafe_deseleccionado", null, true)}
        >
            <div className="DetalleEpigrafe">
                <div className="maestro-botones">
                    <QuimeraAcciones acciones={accionesEpigrafe} vertical />
                </div>
                <Tabs children={[
                    <Tab label={t("epigrafe.general")}
                        key="tab-general"
                        children={
                            <TabGeneral form={formModelo} epigrafe={epigrafe} />
                        }
                    />,
                ]} />
            </div>

            {estado === "BORRANDO" && (
                <BorrarEpigrafe epigrafe={epigrafe} publicar={emitir} />
            )}
        </Detalle>
    );
};

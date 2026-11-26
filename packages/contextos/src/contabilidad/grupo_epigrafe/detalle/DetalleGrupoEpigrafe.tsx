import { Detalle } from "@olula/componentes/detalle/Detalle.tsx";
import { Tab, Tabs } from "@olula/componentes/detalle/tabs/Tabs.tsx";
import { useMaquina } from "@olula/componentes/hook/useMaquina.js";
import { QuimeraAcciones } from "@olula/componentes/moleculas/qacciones.tsx";
import { EmitirEvento } from "@olula/lib/diseño.ts";
import { puede } from "@olula/lib/dominio.ts";
import { useModelo } from "@olula/lib/useModelo.js";
import { useCallback, useEffect } from "react";
import { BorrarGrupoEpigrafe } from "../borrar/BorrarGrupoEpigrafe.tsx";
import { GrupoEpigrafe } from "../diseño.ts";
import { etiquetaGrupoEpigrafe } from "../dominio.ts";
import {
    contextoDetalleGrupoEpigrafeInicial,
    guardarGrupoEpigrafe,
    metaGrupoEpigrafe,
} from "./detalle.ts";
import { getMaquina } from "./maquina.ts";
import { TabGeneral } from "./TabGeneral.tsx";
import { useTContabilidad } from "../../i18n/index.ts";

export const DetalleGrupoEpigrafe = ({
    id,
    publicar = async () => {},
}: {
    id?: string;
    publicar?: EmitirEvento;
}) => {

    const t = useTContabilidad();
    const { ctx, emitir } = useMaquina(
        getMaquina,
        contextoDetalleGrupoEpigrafeInicial,
        publicar
    );

    const autoGuardar = useCallback(
        async (grupo: GrupoEpigrafe) => {
            await guardarGrupoEpigrafe(ctx, grupo);
            await emitir("grupo_epigrafe_guardado");
        },
        [ctx, emitir]
    );

    const formModelo = useModelo(metaGrupoEpigrafe, ctx.grupo, autoGuardar);

    const { estado, grupo } = ctx;

    useEffect(() => {
        emitir("grupo_epigrafe_id_cambiado", id, true);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    if (!grupo.id) return null;

    const accionesGrupo = [
        {
            texto: t("grupo_epigrafe.borrar"),
            onClick: () => emitir("borrado_solicitado"),
            deshabilitado: !puede("contabilidad.grupo_epigrafe"),
            advertencia: true,
        },
    ];

    return (
        <Detalle
            id={id}
            obtenerTitulo={etiquetaGrupoEpigrafe}
            setEntidad={() => {}}
            entidad={grupo}
            cerrarDetalle={() =>
                emitir("grupo_epigrafe_deseleccionado", null, true)
            }
        >
            <div className="DetalleGrupoEpigrafe">
                <div className="maestro-botones">
                    <QuimeraAcciones acciones={accionesGrupo} vertical />
                </div>
                <Tabs children={[
                    <Tab label={t("grupo_epigrafe.general")}
                        key="tab-general"
                        children={
                            <TabGeneral form={formModelo} grupo={grupo} />
                        }
                    />,
                ]} />
            </div>

            {estado === "BORRANDO" && (
                <BorrarGrupoEpigrafe grupo={grupo} publicar={emitir} />
            )}
        </Detalle>
    );
};

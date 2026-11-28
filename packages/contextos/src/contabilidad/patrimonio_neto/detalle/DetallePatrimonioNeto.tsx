import { Detalle } from "@olula/componentes/detalle/Detalle.tsx";
import { Tab, Tabs } from "@olula/componentes/detalle/tabs/Tabs.tsx";
import { useMaquina } from "@olula/componentes/hook/useMaquina.js";
import { QuimeraAcciones } from "@olula/componentes/moleculas/qacciones.tsx";
import { EmitirEvento } from "@olula/lib/diseño.ts";
import { puede } from "@olula/lib/dominio.ts";
import { useModelo } from "@olula/lib/useModelo.js";
import { useCallback, useEffect } from "react";
import { BorrarPatrimonioNeto } from "../borrar/BorrarPatrimonioNeto.tsx";
import { PatrimonioNeto } from "../diseño.ts";
import { etiquetaPatrimonioNeto } from "../dominio.ts";
import {
    contextoDetallePatrimonioNetoInicial,
    guardarInforme,
    metaPatrimonioNeto,
} from "./detalle.ts";
import { getMaquina } from "./maquina.ts";
import { TabCriterios } from "./TabCriterios.tsx";
import { TabResultado } from "./TabResultado.tsx";
import { useTContabilidad } from "../../i18n/index.ts";

export const DetallePatrimonioNeto = ({
    id,
    publicar = async () => {},
}: {
    id?: string;
    publicar?: EmitirEvento;
}) => {
    const t = useTContabilidad();
    const { ctx, emitir } = useMaquina(
        getMaquina,
        contextoDetallePatrimonioNetoInicial,
        publicar
    );

    const autoGuardar = useCallback(
        async (informe: PatrimonioNeto) => {
            await guardarInforme(ctx, informe);
            await emitir("informe_guardado");
        },
        [ctx, emitir]
    );

    const formModelo = useModelo(metaPatrimonioNeto, ctx.informe, autoGuardar);

    const { estado, informe, datos } = ctx;

    useEffect(() => {
        emitir("informe_id_cambiado", id, true);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    if (!informe.id) return null;

    const acciones = [
        {
            texto: t("patrimonio_neto.borrar"),
            onClick: () => emitir("borrado_solicitado"),
            deshabilitado: !puede("contabilidad.asiento"),
            advertencia: true,
        },
    ];

    return (
        <Detalle
            id={id}
            obtenerTitulo={etiquetaPatrimonioNeto}
            setEntidad={() => {}}
            entidad={informe}
            cerrarDetalle={() => emitir("informe_deseleccionado", null, true)}
        >
            <div className="DetallePatrimonioNeto">
                <div className="maestro-botones">
                    <QuimeraAcciones acciones={acciones} vertical />
                </div>
                <Tabs
                    children={[
                        <Tab
                            label={t("patrimonio_neto.criterios")}
                            key="tab-criterios"
                            children={
                                <TabCriterios form={formModelo} />
                            }
                        />,
                        <Tab
                            label={t("patrimonio_neto.resultado")}
                            key="tab-resultado"
                            children={
                                <TabResultado
                                    informe={informe}
                                    datos={datos}
                                    emitir={emitir}
                                />
                            }
                        />,
                    ]}
                />
            </div>

            {estado === "BORRANDO" && (
                <BorrarPatrimonioNeto informe={informe} publicar={emitir} />
            )}
        </Detalle>
    );
};

import { Detalle } from "@olula/componentes/detalle/Detalle.tsx";
import { Tab, Tabs } from "@olula/componentes/detalle/tabs/Tabs.tsx";
import { useMaquina } from "@olula/componentes/hook/useMaquina.js";
import { QuimeraAcciones } from "@olula/componentes/moleculas/qacciones.tsx";
import { EmitirEvento } from "@olula/lib/diseño.ts";
import { useModelo } from "@olula/lib/useModelo.js";
import { useCallback, useEffect } from "react";
import { BorrarPlantillaAsiento } from "../borrar/BorrarPlantillaAsiento.tsx";
import { PlantillaAsiento } from "../diseño.ts";
import { etiquetaPlantilla } from "../dominio.ts";
import {
    contextoDetallePlantillaInicial,
    guardarPlantilla,
    metaPlantillaAsiento,
} from "./detalle.ts";
import { LineasPlantillaAsiento } from "./lineas/LineasPlantillaAsiento.tsx";
import { getMaquina } from "./maquina.ts";
import { TabGeneral } from "./TabGeneral.tsx";
import { useTContabilidad } from "../../i18n/index.ts";

export const DetallePlantillaAsiento = ({
    id,
    publicar = async () => {},
}: {
    id?: string;
    publicar?: EmitirEvento;
}) => {
    const t = useTContabilidad();
    const { ctx, emitir } = useMaquina(getMaquina, contextoDetallePlantillaInicial, publicar);

    const autoGuardar = useCallback(
        async (plantilla: PlantillaAsiento) => {
            await guardarPlantilla(ctx, plantilla);
            await emitir("plantilla_guardada");
        },
        [ctx, emitir]
    );

    const modelo = useModelo(metaPlantillaAsiento, ctx.plantilla, autoGuardar);

    useEffect(() => {
        emitir("plantilla_id_cambiado", id, true);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    if (!ctx.plantilla.id) return null;

    return (
        <Detalle
            id={id}
            obtenerTitulo={etiquetaPlantilla}
            setEntidad={() => {}}
            entidad={ctx.plantilla}
            cerrarDetalle={() => emitir("plantilla_deseleccionada", null, true)}
        >
            <div className="DetallePlantillaAsiento">
                <div className="maestro-botones">
                    <QuimeraAcciones
                        acciones={[
                            {
                                icono: "eliminar",
                                texto: t("plantilla_asiento.borrar"),
                                onClick: () => emitir("borrado_solicitado"),
                                advertencia: true,
                            },
                        ]}
                        vertical
                    />
                </div>
                <Tabs
                    children={[
                        <Tab
                            key="tab-partidas"
                            label={t("plantilla_asiento.partidas")}
                            children={
                                <LineasPlantillaAsiento
                                    plantilla={ctx.plantilla}
                                    partidas={ctx.partidas}
                                    estado={ctx.estado}
                                    publicar={emitir}
                                />
                            }
                        />,
                        <Tab key="tab-general" label={t("plantilla_asiento.general")} children={<TabGeneral form={modelo} />} />,
                    ]}
                />
            </div>

            {ctx.estado === "BORRANDO" && (
                <BorrarPlantillaAsiento plantilla={ctx.plantilla} publicar={emitir} />
            )}
        </Detalle>
    );
};

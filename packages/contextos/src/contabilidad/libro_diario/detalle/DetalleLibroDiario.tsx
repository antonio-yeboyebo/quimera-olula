import { Detalle } from "@olula/componentes/detalle/Detalle.tsx";
import { Tab, Tabs } from "@olula/componentes/detalle/tabs/Tabs.tsx";
import { useMaquina } from "@olula/componentes/hook/useMaquina.js";
import { QuimeraAcciones } from "@olula/componentes/moleculas/qacciones.tsx";
import { EmitirEvento } from "@olula/lib/diseño.ts";
import { puede } from "@olula/lib/dominio.ts";
import { useModelo } from "@olula/lib/useModelo.js";
import { useRangosEjercicio } from "#/contabilidad/comun/use_rangos_ejercicio.ts";
import { useCallback, useEffect } from "react";
import { BorrarLibroDiario } from "../borrar/BorrarLibroDiario.tsx";
import { LibroDiario } from "../diseño.ts";
import { etiquetaLibroDiario } from "../dominio.ts";
import {
    contextoDetalleLibroDiarioInicial,
    guardarInforme,
    metaLibroDiario,
} from "./detalle.ts";
import { getMaquina } from "./maquina.ts";
import { TabCriterios } from "./TabCriterios.tsx";
import { TabResultado } from "./TabResultado.tsx";
import { useTContabilidad } from "../../i18n/index.ts";

export const DetalleLibroDiario = ({
    id,
    publicar = async () => {},
}: {
    id?: string;
    publicar?: EmitirEvento;
}) => {
    const t = useTContabilidad();
    const { ctx, emitir } = useMaquina(
        getMaquina,
        contextoDetalleLibroDiarioInicial,
        publicar
    );

    const autoGuardar = useCallback(
        async (informe: LibroDiario) => {
            await guardarInforme(ctx, informe);
            await emitir("informe_guardado");
        },
        [ctx, emitir]
    );

    const formModelo = useModelo(metaLibroDiario, ctx.informe, autoGuardar);

    useRangosEjercicio(formModelo.modelo, formModelo.set, {
        asientos: true,
        subcuentas: true,
    });

    const { estado, informe, resultado } = ctx;

    useEffect(() => {
        emitir("informe_id_cambiado", id, true);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    if (!informe.id) return null;

    const acciones = [
        {
            texto: t("libro_diario.borrar"),
            onClick: () => emitir("borrado_solicitado"),
            deshabilitado: !puede("contabilidad.asiento"),
            advertencia: true,
        },
    ];

    return (
        <Detalle
            id={id}
            obtenerTitulo={etiquetaLibroDiario}
            setEntidad={() => {}}
            entidad={informe}
            cerrarDetalle={() => emitir("informe_deseleccionado", null, true)}
        >
            <div className="DetalleLibroDiario">
                <div className="maestro-botones">
                    <QuimeraAcciones acciones={acciones} vertical />
                </div>
                <Tabs
                    children={[
                        <Tab
                            label={t("libro_diario.criterios")}
                            key="tab-criterios"
                            children={
                                <TabCriterios
                                    form={formModelo}
                                    informe={formModelo.modelo}
                                />
                            }
                        />,
                        <Tab
                            label={t("libro_diario.resultado")}
                            key="tab-resultado"
                            children={
                                <TabResultado
                                    informe={informe}
                                    resultado={resultado}
                                    emitir={emitir}
                                />
                            }
                        />,
                    ]}
                />
            </div>

            {estado === "BORRANDO" && (
                <BorrarLibroDiario informe={informe} publicar={emitir} />
            )}
        </Detalle>
    );
};

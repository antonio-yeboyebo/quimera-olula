import { Detalle } from "@olula/componentes/detalle/Detalle.tsx";
import { Tab, Tabs } from "@olula/componentes/detalle/tabs/Tabs.tsx";
import { useMaquina } from "@olula/componentes/hook/useMaquina.js";
import { QInput } from "@olula/componentes/atomos/qinput.tsx";
import { QuimeraAcciones } from "@olula/componentes/moleculas/qacciones.tsx";
import { EmitirEvento } from "@olula/lib/diseño.ts";
import { puede } from "@olula/lib/dominio.ts";
import { useModelo } from "@olula/lib/useModelo.js";
import { useCallback, useEffect } from "react";
import { BorrarComparativaVentas } from "../borrar/BorrarComparativaVentas.tsx";
import { ComparativaVentas } from "../diseño.ts";
import { etiquetaComparativaVentas } from "../dominio.ts";
import { CamposCriterios } from "./CamposCriterios.tsx";
import {
    contextoDetalleComparativaVentasInicial,
    guardarComparativa,
    metaDetalleComparativaVentas,
} from "./detalle.ts";
import { getMaquina } from "./maquina.ts";
import { TabResultado } from "./TabResultado.tsx";

export const DetalleComparativaVentas = ({
    id,
    publicar = async () => {},
}: {
    id?: string;
    publicar?: EmitirEvento;
}) => {
    const { ctx, emitir } = useMaquina(
        getMaquina,
        contextoDetalleComparativaVentasInicial,
        publicar
    );

    const autoGuardar = useCallback(
        async (comparativa: ComparativaVentas) => {
            await guardarComparativa(ctx, comparativa);
            await emitir("comparativa_guardada");
        },
        [ctx, emitir]
    );

    const formModelo = useModelo(
        metaDetalleComparativaVentas,
        ctx.comparativa,
        autoGuardar
    );

    const { estado, comparativa, resultado } = ctx;

    useEffect(() => {
        emitir("comparativa_id_cambiado", id, true);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    if (!comparativa.id) return null;

    const acciones = [
        {
            texto: "Borrar",
            onClick: () => emitir("borrado_solicitado"),
            deshabilitado: !puede("ventas.factura"),
            advertencia: true,
        },
    ];

    return (
        <Detalle
            id={id}
            obtenerTitulo={etiquetaComparativaVentas}
            setEntidad={() => {}}
            entidad={comparativa}
            cerrarDetalle={() => emitir("comparativa_deseleccionada", null, true)}
        >
            <div className="DetalleComparativaVentas">
                <div className="maestro-botones">
                    <QuimeraAcciones acciones={acciones} vertical />
                </div>
                <Tabs
                    children={[
                        <Tab
                            label="Criterios"
                            key="tab-criterios"
                            children={
                                <div className="TabCriterios">
                                    <quimera-formulario>
                                        <QInput
                                            label="Descripción"
                                            {...formModelo.uiProps("descripcion")}
                                        />
                                    </quimera-formulario>
                                    <CamposCriterios
                                        form={formModelo}
                                        comparativa={formModelo.modelo}
                                    />
                                </div>
                            }
                        />,
                        <Tab
                            label="Resultado"
                            key="tab-resultado"
                            children={
                                <TabResultado
                                    comparativa={comparativa}
                                    resultado={resultado}
                                    emitir={emitir}
                                />
                            }
                        />,
                    ]}
                />
            </div>

            {estado === "BORRANDO" && (
                <BorrarComparativaVentas comparativa={comparativa} publicar={emitir} />
            )}
        </Detalle>
    );
};

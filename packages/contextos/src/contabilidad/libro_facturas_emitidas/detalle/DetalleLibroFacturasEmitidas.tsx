import { Detalle } from "@olula/componentes/detalle/Detalle.tsx";
import { Tab, Tabs } from "@olula/componentes/detalle/tabs/Tabs.tsx";
import { useMaquina } from "@olula/componentes/hook/useMaquina.js";
import { QuimeraAcciones } from "@olula/componentes/moleculas/qacciones.tsx";
import { EmitirEvento } from "@olula/lib/diseño.ts";
import { puede } from "@olula/lib/dominio.ts";
import { useModelo } from "@olula/lib/useModelo.js";
import { useCallback, useEffect } from "react";
import { BorrarLibroFacturasEmitidas } from "../borrar/BorrarLibroFacturasEmitidas.tsx";
import { LibroFacturasEmitidas } from "../diseño.ts";
import { etiquetaLibroFacturasEmitidas } from "../dominio.ts";
import {
    contextoDetalleLibroFacturasEmitidasInicial,
    guardarInforme,
    metaLibroFacturasEmitidas,
} from "./detalle.ts";
import { getMaquina } from "./maquina.ts";
import { TabCriterios } from "./TabCriterios.tsx";
import { TabResultado } from "./TabResultado.tsx";
import { useTContabilidad } from "../../i18n/index.ts";

export const DetalleLibroFacturasEmitidas = ({
    id,
    publicar = async () => {},
}: {
    id?: string;
    publicar?: EmitirEvento;
}) => {
    const t = useTContabilidad();
    const { ctx, emitir } = useMaquina(
        getMaquina,
        contextoDetalleLibroFacturasEmitidasInicial,
        publicar
    );

    const autoGuardar = useCallback(
        async (informe: LibroFacturasEmitidas) => {
            await guardarInforme(ctx, informe);
            await emitir("informe_guardado");
        },
        [ctx, emitir]
    );

    const formModelo = useModelo(
        metaLibroFacturasEmitidas,
        ctx.informe,
        autoGuardar
    );

    const { estado, informe, resultado } = ctx;

    useEffect(() => {
        emitir("informe_id_cambiado", id, true);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    if (!informe.id) return null;

    const acciones = [
        {
            texto: t("libro_facturas_emitidas.borrar"),
            onClick: () => emitir("borrado_solicitado"),
            deshabilitado: !puede("contabilidad.asiento"),
            advertencia: true,
        },
    ];

    return (
        <Detalle
            id={id}
            obtenerTitulo={etiquetaLibroFacturasEmitidas}
            setEntidad={() => {}}
            entidad={informe}
            cerrarDetalle={() => emitir("informe_deseleccionado", null, true)}
        >
            <div className="DetalleLibroFacturasEmitidas">
                <div className="maestro-botones">
                    <QuimeraAcciones acciones={acciones} vertical />
                </div>
                <Tabs
                    children={[
                        <Tab
                            label={t("libro_facturas_emitidas.criterios")}
                            key="tab-criterios"
                            children={
                                <TabCriterios
                                    form={formModelo}
                                    informe={formModelo.modelo}
                                />
                            }
                        />,
                        <Tab
                            label={t("libro_facturas_emitidas.resultado")}
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
                <BorrarLibroFacturasEmitidas
                    informe={informe}
                    publicar={emitir}
                />
            )}
        </Detalle>
    );
};

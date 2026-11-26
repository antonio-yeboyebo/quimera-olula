import { Detalle } from "@olula/componentes/detalle/Detalle.tsx";
import { Tab, Tabs } from "@olula/componentes/detalle/tabs/Tabs.tsx";
import { useMaquina } from "@olula/componentes/hook/useMaquina.js";
import { EmitirEvento } from "@olula/lib/diseño.ts";
import { useModelo } from "@olula/lib/useModelo.js";
import { useCallback, useEffect } from "react";
import { Agente } from "../diseño.js";
import {
    contextoDetalleAgenteInicial,
    guardarAgente,
    metaAgente,
} from "./detalle.js";
import "./DetalleAgente.css";
import { getMaquina } from "./maquina.js";
import { TabContacto } from "./TabContacto.js";
import { TabGeneral } from "./TabGeneral.js";
import { useTVentas } from "../../i18n/index.ts";

export const DetalleAgente = ({
    id,
    publicar = async () => {},
}: {
    id?: string;
    publicar?: EmitirEvento;
}) => {
    const t = useTVentas();

    const { ctx, emitir } = useMaquina(
        getMaquina,
        contextoDetalleAgenteInicial,
        publicar,
    );

    const autoGuardar = useCallback(
        async (agente: Agente) => {
            await guardarAgente(ctx, agente);
            await emitir("agente_guardado");
        },
        [ctx, emitir],
    );

    const formModelo = useModelo(metaAgente, ctx.agente, autoGuardar);

    useEffect(() => {
        emitir("agente_id_cambiado", id, true);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    if (!ctx.agente.id) return null;

    const titulo = (a: Agente) => a.nombre || `Agente ${a.id}`;

    return (
        <Detalle
            id={id}
            className="detalle-agente"
            obtenerTitulo={titulo}
            setEntidad={() => {}}
            entidad={ctx.agente}
            cerrarDetalle={() => emitir("agente_deseleccionado", null, true)}
        >
            <div className="DetalleAgente">
                <Tabs children={[
                    <Tab label={t("agente.detalle.general")}
                        key="tab-general"
                        children={<TabGeneral form={formModelo} />}
                    />,
                    <Tab label={t("agente.detalle.datos")}
                        key="tab-datos"
                        children={<TabContacto form={formModelo} />}
                    />,
                ]} />
            </div>
        </Detalle>
    );
};

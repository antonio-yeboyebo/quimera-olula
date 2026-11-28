import { Detalle } from "@olula/componentes/detalle/Detalle.tsx";
import { Tab, Tabs } from "@olula/componentes/detalle/tabs/Tabs.tsx";
import { useMaquina } from "@olula/componentes/hook/useMaquina.js";
import { EmitirEvento } from "@olula/lib/diseño.ts";
import { useModelo } from "@olula/lib/useModelo.js";
import { useEffect } from "react";
import { Mandato } from "../diseño.js";
import { contextoDetalleMandatoInicial, metaMandato } from "./detalle.js";
import "./DetalleMandato.css";
import { getMaquina } from "./maquina.js";
import { TabFirma } from "./TabFirma.js";
import { TabGeneral } from "./TabGeneral.js";
import { useTTesoreria } from "../../i18n/index.ts";

export const DetalleMandato = ({
    id,
    publicar = async () => {},
}: {
    id?: string;
    publicar?: EmitirEvento;
}) => {

    const t = useTTesoreria();
    const { ctx, emitir } = useMaquina(
        getMaquina,
        contextoDetalleMandatoInicial,
        publicar
    );

    const formModelo = useModelo(metaMandato, ctx.mandato);

    useEffect(() => {
        emitir("mandato_id_cambiado", id, true);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    if (!ctx.mandato.id) return null;

    const titulo = (m: Mandato) => m.referencia || t("mandato.mandatoId", { id: m.id });

    return (
        <Detalle
            id={id}
            obtenerTitulo={titulo}
            setEntidad={() => {}}
            entidad={ctx.mandato}
            cerrarDetalle={() => emitir("mandato_deseleccionado", null, true)}
        >
            <div className="DetalleMandato">
                <Tabs children={[
                    <Tab label={t("mandato.general")}
                        key="tab-general"
                        children={<TabGeneral form={formModelo} />}
                    />,
                    <Tab label={t("mandato.firma")}
                        key="tab-firma"
                        children={<TabFirma form={formModelo} />}
                    />,
                ]} />
            </div>
        </Detalle>
    );
};

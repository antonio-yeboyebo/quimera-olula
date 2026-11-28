import { Detalle } from "@olula/componentes/detalle/Detalle.tsx";
import { Tab, Tabs } from "@olula/componentes/detalle/tabs/Tabs.tsx";
import { useMaquina } from "@olula/componentes/hook/useMaquina.js";
import { QuimeraAcciones } from "@olula/componentes/index.js";
import { EmitirEvento } from "@olula/lib/diseño.ts";
import { configuracion } from "@olula/lib/dominio.ts";
import { useModelo } from "@olula/lib/useModelo.js";
import { useEffect } from "react";
import { Remesa } from "../diseño.js";
import { contextoDetalleRemesaInicial, metaRemesa } from "./detalle.js";
import "./DetalleRemesa.css";
import { DeshacerPagoRemesa } from "./deshacer_pago/DeshacerPagoRemesa.js";
import { GenerarFicheroRemesa } from "./fichero/GenerarFicheroRemesa.tsx";
import { getMaquina } from "./maquina.js";
import { PagarRemesa } from "./pagar/PagarRemesa.js";
import { PagosRemesa } from "./pagos/PagosRemesa.js";
import { RecibosRemesa } from "./recibos/RecibosRemesa.js";
import { TabGeneral } from "./TabGeneral.js";
import { useTTesoreria } from "../../i18n/index.ts";

export const DetalleRemesa = ({
    id,
    publicar = async () => {},
}: {
    id?: string;
    publicar?: EmitirEvento;
}) => {

    const t = useTTesoreria();
    const { ctx, emitir } = useMaquina(
        getMaquina,
        contextoDetalleRemesaInicial,
        publicar
    );

    const formModelo = useModelo(metaRemesa, ctx.remesa);

    useEffect(() => {
        emitir("remesa_id_cambiado", id, true);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    if (!ctx.remesa.id) return null;

    const titulo = (r: Remesa) => t("remesa.remesaDeCobroId", { id: r.id });

    return (
        <Detalle
            id={id}
            obtenerTitulo={titulo}
            setEntidad={() => {}}
            entidad={ctx.remesa}
            cerrarDetalle={() => emitir("remesa_deseleccionada", null, true)}
        >
            <div className="DetalleRemesa">
                <QuimeraAcciones
                    acciones={[{
                        texto: t("remesa.ficheroBancario"),
                        onClick: () => emitir("fichero_solicitado"),
                        deshabilitado: ctx.remesa.recibos.length === 0,
                    }]}
                    vertical
                />

                <Tabs children={[
                    <Tab label={t("remesa.general")}
                        key="tab-general"
                        children={<TabGeneral form={formModelo} />}
                    />,
                    <Tab label={t("remesa.recibosLength", { length: ctx.remesa.recibos.length })}
                        key="tab-recibos"
                        children={<RecibosRemesa recibos={ctx.remesa.recibos} />}
                    />,
                    configuracion("tesoreria.pago_diferido") && (
                        <Tab label={t("remesa.pagosLength", { length: ctx.remesa.pagos.length })}
                            key="tab-pagos"
                            children={<PagosRemesa remesa={ctx.remesa} publicar={emitir} />}
                        />
                    ),
                ]} />

                {ctx.estado === "PAGANDO" && <PagarRemesa publicar={emitir} />}

                {ctx.estado === "GENERANDO_FICHERO" && (
                    <GenerarFicheroRemesa remesa={ctx.remesa} publicar={emitir} />
                )}

                {ctx.estado === "DESHACIENDO_PAGO" && (
                    <DeshacerPagoRemesa remesa={ctx.remesa} publicar={emitir} />
                )}
            </div>
        </Detalle>
    );
};

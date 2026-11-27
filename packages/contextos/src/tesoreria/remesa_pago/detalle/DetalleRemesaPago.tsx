import { Detalle } from "@olula/componentes/detalle/Detalle.tsx";
import { Tab, Tabs } from "@olula/componentes/detalle/tabs/Tabs.tsx";
import { useMaquina } from "@olula/componentes/hook/useMaquina.js";
import { EmitirEvento } from "@olula/lib/diseño.ts";
import { useModelo } from "@olula/lib/useModelo.js";
import { useEffect } from "react";
import { RemesaPago } from "../diseño.js";
import { esRemesaDeNominas } from "../dominio.js";
import { DeshacerPagoRemesaPago } from "./deshacer_pago/DeshacerPagoRemesaPago.js";
import { contextoDetalleRemesaPagoInicial, metaRemesaPago } from "./detalle.js";
import { getMaquina } from "./maquina.js";
import { NominasRemesaPago } from "./nominas/NominasRemesaPago.js";
import { PagarRemesaPago } from "./pagar/PagarRemesaPago.js";
import { PagosRemesaPago } from "./pagos/PagosRemesaPago.js";
import { RecibosRemesaPago } from "./recibos/RecibosRemesaPago.js";
import { TabGeneral } from "./TabGeneral.js";
import { useTTesoreria } from "../../i18n/index.ts";

export const DetalleRemesaPago = ({
    id,
    publicar = async () => {},
}: {
    id?: string;
    publicar?: EmitirEvento;
}) => {

    const t = useTTesoreria();
    const { ctx, emitir } = useMaquina(
        getMaquina,
        contextoDetalleRemesaPagoInicial,
        publicar
    );

    const formModelo = useModelo(metaRemesaPago, ctx.remesa);

    useEffect(() => {
        emitir("remesa_id_cambiado", id, true);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    if (!ctx.remesa.id) return null;

    const { remesa } = ctx;

    const titulo = (r: RemesaPago) =>
        t("remesa_pago.remesaDePagoIdValor", { id: r.id, valor: esRemesaDeNominas(r) ? t("remesa_pago.nominas") : t("remesa_pago.recibos") });

    return (
        <Detalle
            id={id}
            obtenerTitulo={titulo}
            setEntidad={() => {}}
            entidad={remesa}
            cerrarDetalle={() => emitir("remesa_deseleccionada", null, true)}
        >
            <div className="DetalleRemesaPago">
                <Tabs children={[
                    <Tab label={t("remesa_pago.general")}
                        key="tab-general"
                        children={<TabGeneral form={formModelo} />}
                    />,
                    esRemesaDeNominas(remesa)
                        ? <Tab label={t("remesa_pago.nominasLength", { length: remesa.nominas.length })}
                            key="tab-nominas"
                            children={<NominasRemesaPago nominas={remesa.nominas} />}
                        />
                        : <Tab label={t("remesa_pago.recibosLength", { length: remesa.recibos.length })}
                            key="tab-recibos"
                            children={<RecibosRemesaPago recibos={remesa.recibos} />}
                        />,
                    <Tab label={t("remesa_pago.pagosLength", { length: remesa.pagos.length })}
                        key="tab-pagos"
                        children={<PagosRemesaPago remesa={remesa} publicar={emitir} />}
                    />,
                ]} />

                {ctx.estado === "PAGANDO" && <PagarRemesaPago remesa={remesa} publicar={emitir} />}

                {ctx.estado === "DESHACIENDO_PAGO" && (
                    <DeshacerPagoRemesaPago remesa={remesa} publicar={emitir} />
                )}
            </div>
        </Detalle>
    );
};

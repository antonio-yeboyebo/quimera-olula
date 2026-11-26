import { Detalle } from "@olula/componentes/detalle/Detalle.tsx";
import { Tab, Tabs } from "@olula/componentes/detalle/tabs/Tabs.tsx";
import { useMaquina } from "@olula/componentes/hook/useMaquina.js";
import { QuimeraAcciones } from "@olula/componentes/moleculas/qacciones.tsx";
import { EmitirEvento } from "@olula/lib/diseño.ts";
import { puede } from "@olula/lib/dominio.ts";
import { useModelo } from "@olula/lib/useModelo.js";
import { useCallback, useEffect } from "react";
import { BorrarAmortizacion } from "../borrar/BorrarAmortizacion.tsx";
import { Amortizacion } from "../diseño.ts";
import { etiquetaAmortizacion, metaAmortizacion } from "../dominio.ts";
import { PartidasCompra } from "./compra/PartidasCompra.tsx";
import { contextoDetalleAmortizacionInicial, guardarAmortizacion } from "./detalle.ts";
import { Dotaciones } from "./dotaciones/Dotaciones.tsx";
import { getMaquina } from "./maquina.ts";
import { Regularizaciones } from "./regularizaciones/Regularizaciones.tsx";
import { TabCierre } from "./TabCierre.tsx";
import { TabGeneral } from "./TabGeneral.tsx";
import { useTContabilidad } from "../../i18n/index.ts";

/** Formulario de Eneboo `co_amortizaciones.ui`: datos generales, dotaciones,
 * compra, regularizaciones y cierre. */
export const DetalleAmortizacion = ({
    id,
    publicar = async () => {},
}: {
    id?: string;
    publicar?: EmitirEvento;
}) => {
    const t = useTContabilidad();
    const { ctx, emitir } = useMaquina(getMaquina, contextoDetalleAmortizacionInicial, publicar);

    const autoGuardar = useCallback(
        async (amortizacion: Amortizacion) => {
            await guardarAmortizacion(ctx, amortizacion);
            await emitir("amortizacion_guardada");
        },
        [ctx, emitir]
    );

    const formModelo = useModelo(metaAmortizacion, ctx.amortizacion, autoGuardar);

    const { estado, amortizacion } = ctx;

    useEffect(() => {
        emitir("amortizacion_id_cambiado", id, true);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    const refrescar = useCallback(() => { emitir("amortizacion_guardada"); }, [emitir]);

    if (!amortizacion.id) return null;

    const acciones = [
        {
            texto: t("amortizacion.borrar"),
            onClick: () => emitir("borrado_solicitado"),
            deshabilitado: !puede("contabilidad.asiento"),
            advertencia: true,
        },
    ];

    return (
        <Detalle
            id={id}
            obtenerTitulo={etiquetaAmortizacion}
            setEntidad={() => {}}
            entidad={amortizacion}
            cerrarDetalle={() => emitir("amortizacion_deseleccionada", null, true)}
        >
            <div className="DetalleAmortizacion">
                <div className="maestro-botones">
                    <QuimeraAcciones acciones={acciones} vertical />
                </div>
                <Tabs children={[
                    <Tab label={t("amortizacion.datosGenerales")} key="tab-general"
                        children={<TabGeneral form={formModelo} amortizacion={amortizacion} />} />,
                    <Tab label={t("amortizacion.dotaciones")} key="tab-dotaciones"
                        children={<Dotaciones key={amortizacion.id} amortizacion={amortizacion}
                            onCambio={refrescar} />} />,
                    <Tab label={t("amortizacion.compra")} key="tab-compra"
                        children={<PartidasCompra key={amortizacion.id} amortizacion={amortizacion} />} />,
                    <Tab label={t("amortizacion.regularizaciones")} key="tab-regularizaciones"
                        children={<Regularizaciones key={amortizacion.id} amortizacion={amortizacion} />} />,
                    <Tab label={t("amortizacion.cierre")} key="tab-cierre"
                        children={<TabCierre key={amortizacion.id} form={formModelo}
                            amortizacion={amortizacion} onCambio={refrescar} />} />,
                ]} />
            </div>

            {estado === "BORRANDO" && (
                <BorrarAmortizacion amortizacion={amortizacion} publicar={emitir} />
            )}
        </Detalle>
    );
};

import { Detalle } from "@olula/componentes/detalle/Detalle.tsx";
import { Tab, Tabs } from "@olula/componentes/detalle/tabs/Tabs.tsx";
import { useMaquina } from "@olula/componentes/hook/useMaquina.js";
import { QuimeraAcciones } from "@olula/componentes/index.js";
import { EmitirEvento } from "@olula/lib/diseño.ts";
import { useModelo } from "@olula/lib/useModelo.js";
import { useCallback, useEffect } from "react";
import { TipoCaja } from "../../diseño.js";
import { BorrarTipoCaja } from "../borrar/BorrarTipoCaja.js";
import { CambiarSkuTipoCaja } from "../cambiar_sku/CambiarSkuTipoCaja.js";
import { contextoDetalleTipoCajaInicial, guardarTipoCaja, metaTipoCaja } from "./detalle.js";
import "./DetalleTipoCaja.css";
import { getMaquina } from "./maquina.js";
import { TabGeneral } from "./TabGeneral.js";
import { useTAlmacen } from "../../../i18n/index.ts";

/**
 * Componente detalle de tipo de caja.
 *
 * - Recibe el ID como prop (string | undefined).
 * - Auto-guardado de descripcion.
 * - Modal BORRANDO → BorrarTipoCaja.
 * - Modal CAMBIANDO_SKU → CambiarSkuTipoCaja.
 */
export const DetalleTipoCaja = ({
    id,
    publicar = async () => {},
}: {
    id?: string;
    publicar?: EmitirEvento;
}) => {

    const tx = useTAlmacen();
    const { ctx, emitir } = useMaquina(
        getMaquina,
        contextoDetalleTipoCajaInicial,
        publicar
    );

    // Auto-guardado: se llama cuando el modelo cambia y es válido
    const autoGuardar = useCallback(
        async (tipoCaja: TipoCaja) => {
            await guardarTipoCaja(ctx, tipoCaja);
            await emitir("tipo_caja_guardado");
        },
        [ctx, emitir]
    );

    const formModelo = useModelo(metaTipoCaja, ctx.tipoCaja, autoGuardar);

    const { estado, tipoCaja } = ctx;

    // Recargar cuando el ID cambia (o se deselecciona con undefined)
    useEffect(() => {
        emitir("tipo_caja_id_cambiado", id, true);
    }, [id]);

    if (!ctx.tipoCaja.id) return null;

    const titulo = (t: TipoCaja) => t.descripcion;

    const acciones = [
        {
            texto: tx("tipo_caja.borrar"),
            onClick: () => emitir("borrado_solicitado"),
            advertencia: true,
        },
    ];

    return (
        <Detalle
            id={id}
            obtenerTitulo={titulo}
            setEntidad={() => {}}
            entidad={tipoCaja}
            cerrarDetalle={() => emitir("tipo_caja_deseleccionado", null, true)}
        >
            <div className="DetalleTipoCaja">
                <QuimeraAcciones acciones={acciones} />
                <Tabs children={[
                    <Tab
                        label={tx("tipo_caja.general")}
                        key="tab-general"
                        children={
                            <TabGeneral
                                form={formModelo}
                                tipoCaja={tipoCaja}
                                publicar={emitir}
                            />
                        }
                    />,
                ]} />
            </div>

            {/* Modales condicionales: se activan según el estado de la máquina */}
            {estado === "BORRANDO" && (
                <BorrarTipoCaja
                    tipoCaja={tipoCaja}
                    publicar={emitir}
                />
            )}
            {estado === "CAMBIANDO_SKU" && (
                <CambiarSkuTipoCaja
                    tipoCaja={tipoCaja}
                    publicar={emitir}
                />
            )}
        </Detalle>
    );
};

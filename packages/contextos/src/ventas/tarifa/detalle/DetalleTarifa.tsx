import { Detalle } from "@olula/componentes/detalle/Detalle.tsx";
import { Tab, Tabs } from "@olula/componentes/detalle/tabs/Tabs.tsx";
import { useMaquina } from "@olula/componentes/hook/useMaquina.js";
import { QuimeraAcciones } from "@olula/componentes/moleculas/qacciones.tsx";
import { EmitirEvento } from "@olula/lib/diseño.ts";
import { useModelo } from "@olula/lib/useModelo.js";
import { useCallback, useEffect } from "react";
import { BorrarTarifa } from "../borrar/BorrarTarifa.js";
import { Tarifa } from "../diseño.js";
import { contextoDetalleTarifaInicial, guardarTarifa, metaTarifa } from "./detalle.js";
import "./DetalleTarifa.css";
import { ArticulosTarifa } from "./lineas/ArticulosTarifa.js";
import { getMaquina } from "./maquina.js";
import { TabGeneral } from "./TabGeneral.js";
import { useTVentas } from "../../i18n/index.ts";

/**
 * Componente detalle de tarifa.
 *
 * Recibe el ID como prop (string | undefined), no la entidad completa.
 * La máquina carga la tarifa y sus artículos cuando cambia el ID.
 *
 * Patrón auto-guardado:
 *   useModelo(meta, entidad, onGuardado) → el tercer argumento se invoca cuando
 *   el modelo tiene cambios válidos y el usuario deja de editar; llama a la API
 *   y emite el evento de resultado a la máquina.
 */
export const DetalleTarifa = ({
    id,
    publicar = async () => { },
}: {
    id?: string;
    publicar?: EmitirEvento;
}) => {
    const t = useTVentas();

    const { ctx, emitir } = useMaquina(
        getMaquina,
        contextoDetalleTarifaInicial,
        publicar
    );

    const autoGuardar = useCallback(
        async (tarifa: Tarifa) => {
            await guardarTarifa(ctx, tarifa);
            await emitir("tarifa_guardada");
        },
        [ctx, emitir]
    );

    const formModelo = useModelo(metaTarifa, ctx.tarifa, autoGuardar);

    const { estado, tarifa, articulos } = ctx;

    // Recargar cuando el ID cambia (o se deselecciona con undefined)
    useEffect(() => {
        emitir("tarifa_id_cambiada", id, true);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    if (!tarifa.id) return null;

    const titulo = (t: Tarifa) => t.nombre;

    const accionesTarifa = [
        {
            texto: t("tarifa.borrar.boton"),
            onClick: () => emitir("borrado_solicitado"),
            advertencia: true,
        },
    ];

    return (
        <Detalle
            id={id}
            obtenerTitulo={titulo}
            setEntidad={() => { }}
            entidad={tarifa}
            cerrarDetalle={() => emitir("tarifa_deseleccionada", null, true)}
        >
            <div className="DetalleTarifa">
                {/* Estándar: las acciones del detalle van siempre en QuimeraAcciones
                    con `vertical` (menú "Acciones"), aunque solo haya una. */}
                <div className="maestro-botones">
                    <QuimeraAcciones acciones={accionesTarifa} vertical />
                </div>
                <Tabs children={[
                    <Tab label={t("tarifa.detalle.general")}
                        key="tab-general"
                        children={
                            <TabGeneral form={formModelo} codigo={tarifa.id} />
                        }
                    />,
                ]} />
                <ArticulosTarifa
                    tarifa={tarifa}
                    articulos={articulos}
                    estado={estado}
                    publicar={emitir}
                />
            </div>

            {/* Modales condicionales: se activan según el estado de la máquina */}
            {estado === "BORRANDO" && (
                <BorrarTarifa
                    tarifa={tarifa}
                    publicar={emitir}
                />
            )}
        </Detalle>
    );
};

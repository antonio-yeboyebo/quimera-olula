import { Detalle } from "@olula/componentes/detalle/Detalle.tsx";
import { Tab, Tabs } from "@olula/componentes/detalle/tabs/Tabs.tsx";
import { useMaquina } from "@olula/componentes/hook/useMaquina.js";
import { QuimeraAcciones } from "@olula/componentes/index.js";
import { EmitirEvento } from "@olula/lib/diseño.ts";
import { puede } from "@olula/lib/dominio.ts";
import { useModelo } from "@olula/lib/useModelo.js";
import { useCallback, useEffect } from "react";
import { BorrarIaMemoria } from "../borrar/BorrarIaMemoria.js";
import { IaMemoria } from "../diseño.js";
import { metaIaMemoria } from "../dominio.js";
import { contextoDetalleIaMemoriaInicial, guardarIaMemoria } from "./detalle.js";
import "./DetalleIaMemoria.css";
import { getMaquina } from "./maquina.js";
import { TabFichero } from "./TabFichero.js";
import { TabGeneral } from "./TabGeneral.js";
import { TabInformacion } from "./TabInformacion.js";
import { useTComun } from "../../i18n/index.ts";

/**
 * Componente detalle de una memoria del asistente de IA.
 *
 * Recibe el ID como prop (string | undefined), no la entidad completa.
 * La máquina carga la entidad cuando cambia el ID.
 *
 * El formulario se auto-guarda (ver metaIaMemoria.editable en dominio.ts,
 * restringido por la regla "comun.ia_memoria").
 */
export const DetalleIaMemoria = ({
    id,
    publicar = async () => {},
}: {
    id?: string;
    publicar?: EmitirEvento;
}) => {

    const t = useTComun();
    const { ctx, emitir } = useMaquina(
        getMaquina,
        contextoDetalleIaMemoriaInicial,
        publicar
    );

    // Auto-guardado: se llama cuando el modelo cambia y es válido
    const autoGuardar = useCallback(
        async (iaMemoria: IaMemoria) => {
            await guardarIaMemoria(ctx, iaMemoria);
            await emitir("ia_memoria_guardada");
        },
        [ctx, emitir]
    );

    const formModelo = useModelo(metaIaMemoria, ctx.iaMemoria, autoGuardar);

    const { estado, iaMemoria } = ctx;

    // Recargar cuando el ID cambia (o se deselecciona con undefined)
    useEffect(() => {
        emitir("id_cambiado", id, true);
    }, [id]);

    if (!ctx.iaMemoria.id) return null;

    const titulo = (m: IaMemoria) => m.titulo;

    // Nota: se usa `emitir` (máquina local) y no la prop `publicar` (que notifica
    // al padre), porque estas acciones transicionan/actualizan el estado local.
    const accionesIaMemoria = [
        {
            texto: t("iaMemoria.guardar"),
            onClick: () => autoGuardar(formModelo.modelo),
            deshabilitado: !puede("comun.ia_memoria") || !formModelo.modificado || !formModelo.valido,
        },
        {
            texto: iaMemoria.activo ? t("iaMemoria.desactivar") : t("iaMemoria.activar"),
            onClick: () => emitir("activo_alternado_solicitado"),
            deshabilitado: !puede("comun.ia_memoria"),
        },
        {
            texto: t("iaMemoria.borrar"),
            onClick: () => emitir("borrado_solicitado"),
            deshabilitado: !puede("comun.ia_memoria"),
            advertencia: true,
        },
    ];

    return (
        <Detalle
            id={id}
            obtenerTitulo={titulo}
            setEntidad={() => {}}
            entidad={ctx.iaMemoria}
            cerrarDetalle={() => emitir("ia_memoria_deseleccionada", null, true)}
        >
            <div className="DetalleIaMemoria">
                <QuimeraAcciones acciones={accionesIaMemoria} />
                <Tabs children={[
                    iaMemoria.origen === 'fichero' || iaMemoria.origen === 'externo'
                        ? <Tab label={iaMemoria.origen === 'externo' ? t("iaMemoria.origen") : t("iaMemoria.fichero")}
                            key="tab-fichero"
                            children={
                                <TabFichero
                                    iaMemoria={iaMemoria}
                                    onReemplazado={() => emitir("fichero_reemplazado")}
                                />
                            }
                        />
                        : <Tab label={t("iaMemoria.general")}
                            key="tab-general"
                            children={<TabGeneral form={formModelo} />}
                        />,
                    <Tab label={t("iaMemoria.informacion")}
                        key="tab-info"
                        children={<TabInformacion iaMemoria={iaMemoria} />}
                    />,
                ]} />
            </div>

            {/* Modales condicionales: se activan según el estado de la máquina */}
            {estado === "BORRANDO" && (
                <BorrarIaMemoria
                    iaMemoria={ctx.iaMemoria}
                    publicar={emitir}
                />
            )}
        </Detalle>
    );
};

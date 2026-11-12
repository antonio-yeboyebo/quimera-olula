import { QEtiqueta } from "@olula/componentes/atomos/qetiqueta.tsx";
import { Detalle } from "@olula/componentes/detalle/Detalle.tsx";
import { Tab, Tabs } from "@olula/componentes/detalle/tabs/Tabs.tsx";
import { useMaquina } from "@olula/componentes/hook/useMaquina.js";
import { QuimeraAcciones } from "@olula/componentes/moleculas/qacciones.tsx";
import { EmitirEvento } from "@olula/lib/diseño.ts";
import { useModelo } from "@olula/lib/useModelo.js";
import { useCallback, useEffect, useRef } from "react";
import { CambiarContrasenaUsuario } from "../cambiar_contrasena/CambiarContrasenaUsuario.js";
import { DarDeBajaTenant } from "../dar_de_baja/DarDeBajaTenant.js";
import { Tenant } from "../diseño.js";
import {
    etiquetaEstadoTenant, migracionesPendientes, puedeDarDeBaja, puedeEliminarBd, puedeReactivar,
    puedeSuspender, varianteEstadoTenant,
} from "../dominio.js";
import { EliminarBdTenant } from "../eliminar_bd/EliminarBdTenant.js";
import { contextoDetalleTenantInicial, guardarTenant, metaTenant } from "./detalle.js";
import "./DetalleTenant.css";
import { getMaquina } from "./maquina.js";
import { TabAuditoria } from "./TabAuditoria.js";
import { TabGeneral } from "./TabGeneral.js";
import { TabHistorial } from "./TabHistorial.js";
import { TabModulos } from "./TabModulos.js";
import { TabUsuarios } from "./TabUsuarios.js";

const INTERVALO_SONDEO_MS = 2000;

export const DetalleTenant = ({
    id,
    publicar = async () => {},
}: {
    id?: string;
    publicar?: EmitirEvento;
}) => {

    const { ctx, emitir } = useMaquina(getMaquina, contextoDetalleTenantInicial, publicar);

    const autoGuardar = useCallback(
        async (tenant: Tenant) => {
            await guardarTenant(ctx, tenant);
            await emitir("tenant_guardado");
        },
        [ctx, emitir]
    );

    const formModelo = useModelo(metaTenant, ctx.tenant, autoGuardar);

    const { estado, tenant } = ctx;

    useEffect(() => {
        emitir("tenant_id_cambiado", id, true);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    // Polling mientras la empresa se provisiona en segundo plano
    const emitirRef = useRef(emitir);
    useEffect(() => { emitirRef.current = emitir; });
    const sondeando = estado === "ABIERTO" && tenant.estado === "provisionando";
    useEffect(() => {
        if (!sondeando) return;
        const timer = setInterval(() => { emitirRef.current("sondeo_solicitado"); }, INTERVALO_SONDEO_MS);
        return () => clearInterval(timer);
    }, [sondeando]);

    if (!tenant.id) return null;

    const operativa = tenant.estado === "activo" || tenant.estado === "suspendido";

    const acciones = [
        puedeSuspender(tenant) && {
            texto: "Suspender",
            onClick: () => emitir("suspender_solicitado"),
        },
        puedeReactivar(tenant) && {
            texto: "Reactivar",
            onClick: () => emitir("reactivar_solicitado"),
        },
        operativa && {
            texto: "Migrar",
            onClick: () => emitir("migrar_solicitado"),
        },
        {
            texto: "Exportar",
            onClick: () => emitir("exportar_solicitado"),
            deshabilitado: tenant.estado === "provisionando",
        },
        puedeDarDeBaja(tenant) && {
            texto: "Dar de baja",
            onClick: () => emitir("baja_solicitada"),
            advertencia: true,
        },
        puedeEliminarBd(tenant) && {
            texto: "Eliminar BD",
            onClick: () => emitir("eliminar_bd_solicitado"),
            advertencia: true,
        },
    ];

    return (
        <Detalle
            id={id}
            obtenerTitulo={(t: Tenant) => `${t.id} · ${t.nombre}`}
            setEntidad={() => {}}
            entidad={tenant}
            cerrarDetalle={() => emitir("tenant_deseleccionado", null, true)}
        >
            <div className="DetalleTenant">
                <div className="estado-tenant">
                    <QEtiqueta variante={varianteEstadoTenant(tenant.estado)}>
                        {etiquetaEstadoTenant[tenant.estado]}
                    </QEtiqueta>
                    {tenant.estado === "provisionando" && <span>Provisionando, espere…</span>}
                    {migracionesPendientes(tenant.versionEsquema) && (
                        <QEtiqueta variante="advertencia">
                            Migraciones pendientes ({tenant.versionEsquema})
                        </QEtiqueta>
                    )}
                </div>

                <div className="maestro-botones">
                    <QuimeraAcciones acciones={acciones} vertical />
                </div>

                <Tabs children={[
                    <Tab label="General" key="tab-general"
                        children={<TabGeneral form={formModelo} />}
                    />,
                    <Tab label="Módulos" key="tab-modulos"
                        children={
                            <TabModulos
                                modulos={tenant.modulos}
                                editable={operativa}
                                publicar={emitir}
                            />
                        }
                    />,
                    <Tab label="Usuarios" key="tab-usuarios"
                        children={
                            <TabUsuarios
                                usuarios={ctx.usuarios}
                                grupos={ctx.grupos}
                                editable={operativa}
                                publicar={emitir}
                            />
                        }
                    />,
                    <Tab label="Historial" key="tab-historial"
                        children={<TabHistorial provisiones={tenant.provisiones} />}
                    />,
                    <Tab label="Auditoría" key="tab-auditoria"
                        children={<TabAuditoria accesos={ctx.accesos} />}
                    />,
                ]} />
            </div>

            {estado === "DANDO_DE_BAJA" && (
                <DarDeBajaTenant tenant={tenant} publicar={emitir} />
            )}
            {estado === "ELIMINANDO_BD" && (
                <EliminarBdTenant tenant={tenant} publicar={emitir} />
            )}
            {estado === "CAMBIANDO_CONTRASENA" && ctx.usuarioContrasena && (
                <CambiarContrasenaUsuario
                    idTenant={tenant.id}
                    usuario={ctx.usuarioContrasena}
                    publicar={emitir}
                />
            )}
        </Detalle>
    );
};

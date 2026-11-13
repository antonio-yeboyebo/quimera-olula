import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { QEtiqueta } from "@olula/componentes/atomos/qetiqueta.tsx";
import { useMaquina } from "@olula/componentes/hook/useMaquina.ts";
import { MetaTabla } from "@olula/componentes/index.js";
import { Listado } from "@olula/componentes/maestro/Listado.js";
import { MaestroDetalle } from "@olula/componentes/maestro/MaestroDetalle.tsx";
import { criteriaDefecto } from "@olula/lib/dominio.js";
import { listaActivaEntidadesInicial } from "@olula/lib/ListaActivaEntidades.js";
import { getUrlParams, useUrlParams } from "@olula/lib/url-params.js";
import { useEffect, useMemo } from "react";
import { CrearTenant } from "../crear/CrearTenant.js";
import { DetalleTenant } from "../detalle/DetalleTenant.js";
import { Tenant } from "../diseño.js";
import { etiquetaEstadoTenant, migracionesPendientes, varianteEstadoTenant } from "../dominio.js";
import { MigrarTodasTenant } from "../migrar_todas/MigrarTodasTenant.js";
import { getMaquina } from "./maquina.js";

const EstadoTenantEtiqueta = ({ tenant }: { tenant: Tenant }) => (
    <>
        <QEtiqueta variante={varianteEstadoTenant(tenant.estado)}>
            {etiquetaEstadoTenant[tenant.estado] ?? tenant.estado}
        </QEtiqueta>
        {migracionesPendientes(tenant.versionEsquema) && (
            <QEtiqueta variante="advertencia">Migraciones pendientes</QEtiqueta>
        )}
    </>
);

const metaTablaTenant: MetaTabla<Tenant> = [
    { id: 'id', cabecera: 'ID' },
    { id: 'nombre', cabecera: 'Nombre' },
    { id: 'nif', cabecera: 'NIF' },
    { id: 'emailContacto', cabecera: 'Email de contacto' },
    { id: 'estado', cabecera: 'Estado', render: (t: Tenant) => <EstadoTenantEtiqueta tenant={t} /> },
    { id: 'versionEsquema', cabecera: 'Esquema' },
    { id: 'fechaAlta', cabecera: 'Alta', tipo: 'fecha' },
];

export const MaestroConDetalleTenant = () => {

    const criteriaBase = useMemo(() => criteriaDefecto, []);
    const { id, criteria } = getUrlParams();
    const criteriaInicial = criteria.filtro.length > 0 ? criteria : criteriaBase;

    const { ctx, emitir } = useMaquina(getMaquina, {
        estado: "INICIAL",
        tenants: listaActivaEntidadesInicial<Tenant>(id, criteriaInicial),
    });

    const { estado, tenants } = ctx;

    useUrlParams(tenants.activo, tenants.criteria);

    useEffect(() => {
        emitir("recarga_de_tenants_solicitada", tenants.criteria);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <div className="Tenant">
            <MaestroDetalle<Tenant>
                Maestro={
                    <>
                        <h2>Empresas</h2>
                        <Listado<Tenant>
                            metaTabla={metaTablaTenant}
                            criteria={tenants.criteria}
                            modoInicial="tarjetas"
                            tarjeta={TarjetaTenant}
                            entidades={tenants.lista}
                            totalEntidades={tenants.total}
                            seleccionada={tenants.activo}
                            renderAcciones={() => (
                                <div className="maestro-botones">
                                    <QBoton onClick={() => emitir("crear_tenant_solicitado")}>
                                        Nueva empresa
                                    </QBoton>
                                    <QBoton variante="borde" onClick={() => emitir("migrar_todas_solicitado")}>
                                        Migrar todas
                                    </QBoton>
                                </div>
                            )}
                            onSeleccion={(payload) => emitir("tenant_seleccionado", payload)}
                            onCriteriaChanged={(payload) => emitir("criteria_cambiado", payload)}
                            onSiguientePagina={(payload) => emitir("siguiente_pagina", payload)}
                        />
                    </>
                }
                Detalle={<DetalleTenant id={tenants.activo} publicar={emitir} />}
                seleccionada={tenants.activo}
                modoDisposicion="maestro-50"
            />

            {estado === "CREANDO" && <CrearTenant publicar={emitir} />}
            {estado === "MIGRANDO_TODAS" && <MigrarTodasTenant publicar={emitir} />}
        </div>
    );
};

const TarjetaTenant = (tenant: Tenant) => (
    <div className="tarjeta-tenant" key={tenant.id}>
        <div className="tarjeta-tenant-nombre">{tenant.nombre}</div>
        <div className="tarjeta-tenant-id">{tenant.id}</div>
        <div className="tarjeta-tenant-estado">
            <EstadoTenantEtiqueta tenant={tenant} />
        </div>
    </div>
);

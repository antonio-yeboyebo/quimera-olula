import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { useMaquina } from "@olula/componentes/hook/useMaquina.ts";
import { MetaTabla } from "@olula/componentes/index.js";
import { Listado } from "@olula/componentes/maestro/Listado.js";
import { MaestroDetalle } from "@olula/componentes/maestro/MaestroDetalle.tsx";
import { criteriaDefecto } from "@olula/lib/dominio.ts";
import { listaActivaEntidadesInicial } from "@olula/lib/ListaActivaEntidades.ts";
import { getUrlParams, useUrlParams } from "@olula/lib/url-params.ts";
import { tCompras, useTCompras } from "#/compras/i18n/index.ts";
import { useEffect, useMemo } from "react";
import { CrearProveedor } from "../crear/CrearProveedor.tsx";
import { DetalleProveedor } from "../detalle/DetalleProveedor.tsx";
import { Proveedor } from "../diseño.ts";
import { getMaquina } from "./maquina.ts";
import { TarjetaProveedor } from "./TarjetaProveedor.tsx";
import "./MaestroConDetalleProveedor.css";

const metaTablaProveedor = (t = tCompras): MetaTabla<Proveedor> => [
    { id: 'id', cabecera: t("comun.campos.id") },
    { id: 'nombre', cabecera: t("comun.campos.nombre") },
    { id: 'idFiscal', cabecera: t("comun.campos.idFiscal") },
    { id: 'telefono1', cabecera: t("comun.campos.telefono") },
    { id: 'email', cabecera: t("comun.campos.email") },
    { id: 'deBaja', cabecera: t("proveedor.maestro.baja"), render: (p: Proveedor) => (p.deBaja ? t("comun.si") : "") },
];

export const MaestroConDetalleProveedor = () => {
    const t = useTCompras();
    const metaTabla = useMemo(() => metaTablaProveedor(t), [t]);
    const criteriaBase = useMemo(() => criteriaDefecto, []);

    const { id, criteria } = getUrlParams();
    const criteriaInicial = criteria.filtro.length > 0 ? criteria : criteriaBase;

    const { ctx, emitir } = useMaquina(getMaquina, {
        estado: "INICIAL",
        proveedores: listaActivaEntidadesInicial<Proveedor>(id, criteriaInicial),
    });

    const { estado, proveedores } = ctx;

    useUrlParams(proveedores.activo, proveedores.criteria);

    useEffect(() => {
        emitir("recarga_de_proveedores_solicitada", proveedores.criteria);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <div className="Proveedor">
            <MaestroDetalle<Proveedor>
                Maestro={
                    <>
                        <h2>{t("proveedor.maestro.titulo")}</h2>
                        <Listado<Proveedor>
                            metaTabla={metaTabla}
                            criteria={proveedores.criteria}
                            modoInicial="tabla"
                            tarjeta={TarjetaProveedor}
                            entidades={proveedores.lista}
                            totalEntidades={proveedores.total}
                            seleccionada={proveedores.activo}
                            renderAcciones={() => (
                                <div className="maestro-botones">
                                    <QBoton onClick={() => emitir("crear_proveedor_solicitado")}>
                                        {t("proveedor.maestro.nuevo")}
                                    </QBoton>
                                </div>
                            )}
                            onSeleccion={(payload) => emitir("proveedor_seleccionado", payload)}
                            onCriteriaChanged={(payload) => emitir("criteria_cambiado", payload)}
                            onSiguientePagina={(payload) => emitir("siguiente_pagina", payload)}
                        />
                    </>
                }
                Detalle={<DetalleProveedor id={proveedores.activo} publicar={emitir} />}
                seleccionada={proveedores.activo}
            />

            {estado === "CREANDO" && <CrearProveedor publicar={emitir} />}
        </div>
    );
};

import { filtroAlmacen } from "#/almacen/comun/componentes/FiltroAlmacen.tsx";
import { criteriaInicialSga } from "#/almacen/comun/preferencias.ts";
import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { QEtiqueta } from "@olula/componentes/atomos/qetiqueta.tsx";
import { QSelect } from "@olula/componentes/atomos/qselect.tsx";
import { MetaTabla } from "@olula/componentes/atomos/qtabla.tsx";
import { useMaquina } from "@olula/componentes/hook/useMaquina.js";
import { Listado } from "@olula/componentes/maestro/Listado.tsx";
import { MaestroDetalle } from "@olula/componentes/maestro/MaestroDetalle.tsx";
import { MetaFiltro } from "@olula/componentes/maestro/maestroFiltros/MaestroFiltrosActivoControlado.js";
import { ClausulaFiltro, Criteria } from "@olula/lib/diseño.ts";
import { criteriaDefecto } from "@olula/lib/dominio.js";
import { listaActivaEntidadesInicial } from "@olula/lib/ListaActivaEntidades.js";
import { getUrlParams, useUrlParams } from "@olula/lib/url-params.js";
import { useEffect, useMemo } from "react";
import { ItemOrdenAlmacen } from "../../diseño.ts";
import {
    ESTADOS_ORDEN_DEFECTO,
    estadosOrdenDesdeFiltro,
    filtroEstadoOrden,
    opcionesEstadoOrden,
    ordenAdquirible,
    usuarioActualId,
} from "../../dominio.ts";
import { CrearOrden } from "../crear/CrearOrden.tsx";
import { DetalleOrden } from "../detalle/DetalleOrden.tsx";
import { ContextoMaestroOrden, getMaquina } from "./maquina.ts";
import { tAlmacen, useTAlmacen } from "../../../i18n/index.ts";

const OPCIONES_RESPONSABLE = [
    { valor: "libres", get descripcion() { return tAlmacen("orden.libres"); } },
    { valor: "mios", get descripcion() { return tAlmacen("orden.mios"); } },
];

const OPCIONES_TIPO = [
    { valor: "ENTRADA", get descripcion() { return tAlmacen("orden.entrada"); } },
    { valor: "SALIDA", get descripcion() { return tAlmacen("orden.salida"); } },
    { valor: "TRASPASO", get descripcion() { return tAlmacen("orden.traspaso"); } },
];

const metaFiltroOrden: MetaFiltro = {
    almacen: filtroAlmacen(),
    estado: {
        id: "estado",
        get label() { return tAlmacen("orden.estado"); },
        tipo: "multiseleccion",
        opciones: opcionesEstadoOrden,
        filtro: filtroEstadoOrden,
        fromFiltro: estadosOrdenDesdeFiltro,
    },
    tipo: {
        id: "tipo",
        campo: "tipo",
        get label() { return tAlmacen("orden.tipo"); },
        filtro: (valor) => {
            if (!valor || valor === "") return null;
            return ["tipo", "=", valor as string];
        },
        fromFiltro: (filtro) => {
            const clausula = filtro.find(c => c[0] === "tipo");
            if (!clausula) return "";
            return clausula[2] ?? "";
        },
        render: (valor, onChange) => (
            <QSelect
                label={tAlmacen("orden.tipo")}
                nombre="tipo"
                valor={(valor as string) ?? ""}
                onChange={(opcion) => onChange(opcion?.valor ?? "")}
                opciones={OPCIONES_TIPO}
                placeholder={tAlmacen("orden.todos")}
            />
        ),
    },
    responsable: {
        id: "responsable",
        campo: "responsable_id",
        get label() { return tAlmacen("orden.responsable"); },
        filtro: (valor) => {
            if (!valor || valor === "") return null;
            if (valor === "libres") return ["responsable_id", "null"];
            if (valor === "mios") {
                const usuarioId = usuarioActualId();
                if (!usuarioId) return null;
                return ["responsable_id", "=", usuarioId];
            }
            return null;
        },
        fromFiltro: (filtro) => {
            const clausula = filtro.find(c => c[0] === "responsable_id");
            if (!clausula) return "";
            if (clausula[1] === "null") return "libres";
            return "mios";
        },
        render: (valor, onChange) => (
            <QSelect
                label={tAlmacen("orden.responsable")}
                nombre="responsable"
                valor={(valor as string) ?? ""}
                onChange={(opcion) => onChange(opcion?.valor ?? "")}
                opciones={OPCIONES_RESPONSABLE}
                placeholder={tAlmacen("orden.todos")}
            />
        ),
    },
};

const metaTablaOrden: MetaTabla<ItemOrdenAlmacen> = [
    { id: "id", cabecera: "ID" },
    { id: "descripcion", get cabecera() { return tAlmacen("orden.orden"); } },
    { id: "fecha", get cabecera() { return tAlmacen("orden.fecha"); }, tipo:"fecha" },
    { id: "estado", get cabecera() { return tAlmacen("orden.estado"); }, render: (orden: ItemOrdenAlmacen) => {
        const variante =
            orden.estado === "PENDIENTE" ? "error"
            : orden.estado === "EN_CURSO" ? "advertencia"
            : orden.estado === "PREPARADA" ? "primario"
            : "exito";
        return <QEtiqueta variante={variante}>{orden.estado}</QEtiqueta>;
    }},
    { id: "idResponsable", get cabecera() { return tAlmacen("orden.responsable"); }},
];

const criteriaOrdenesAbiertas = (): Criteria => ({
    ...criteriaDefecto,
    filtro: [
        ["estado", "in", ESTADOS_ORDEN_DEFECTO as unknown as string],
    ] as ClausulaFiltro[],
});

export const MaestroOrden = () => {
    const t = useTAlmacen();
    const criteriaBase = useMemo(criteriaOrdenesAbiertas, []);
    const { id, criteria } = getUrlParams();
    const criteriaInicial = criteriaInicialSga(criteria, criteriaBase);

    const { ctx, emitir } = useMaquina(getMaquina, {
        estado: "INICIAL",
        ordenes: listaActivaEntidadesInicial<ItemOrdenAlmacen>(id, criteriaInicial),
    } as ContextoMaestroOrden);

    useUrlParams(ctx.ordenes.activo, ctx.ordenes.criteria);

    useEffect(() => {
        emitir("recarga_solicitada", ctx.ordenes.criteria);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const ordenActiva = ctx.ordenes.lista.find((o) => o.id === ctx.ordenes.activo);
    const puedeAdquirir = !!ordenActiva && ordenAdquirible(ordenActiva, usuarioActualId());

    return (
        <div className="OrdenAlmacen">
            <MaestroDetalle<ItemOrdenAlmacen>
                seleccionada={ctx.ordenes.activo}
                modoDisposicion="maestro-50"
                Maestro={
                    <>
                        <h2>{t("orden.ordenes")}</h2>
                        <Listado<ItemOrdenAlmacen>
                            metaTabla={metaTablaOrden}
                            metaFiltro={metaFiltroOrden}
                            criteria={ctx.ordenes.criteria}
                            modoInicial="tabla"
                            tarjeta={TarjetaOrdenAlmacen}
                            entidades={ctx.ordenes.lista}
                            totalEntidades={ctx.ordenes.total}
                            seleccionada={ctx.ordenes.activo}
                            renderAcciones={() => (
                                <div className="maestro-botones">
                                    <QBoton onClick={() => emitir("crear_modulo_solicitado")}>
                                        {t("orden.nuevaOrden2")}
                                    </QBoton>
                                    <QBoton
                                        onClick={() => emitir("adquirir_solicitado")}
                                        deshabilitado={!puedeAdquirir}
                                    >
                                        {t("orden.adquirir")}
                                    </QBoton>
                                </div>
                            )}
                            onSeleccion={(payload) =>
                                emitir("orden_seleccionada", payload)
                            }
                            onCriteriaChanged={(payload) =>
                                emitir("criteria_cambiado", payload)
                            }
                        />
                    </>
                }
                Detalle={
                    <DetalleOrden
                        id={ctx.ordenes.activo}
                        publicar={emitir}
                    />
                }
            />
            {ctx.estado === "CREANDO" && (
                <CrearOrden publicar={emitir} />
            )}
        </div>
    );
};

const TarjetaOrdenAlmacen = (orden: ItemOrdenAlmacen) => {
    return (
        <div className="tarjeta-orden" key={orden.id}>
            <div>{`${orden.tipo} - ${orden.fecha}`}</div>
            <div>{orden.estado}</div>
        </div>
    );
};

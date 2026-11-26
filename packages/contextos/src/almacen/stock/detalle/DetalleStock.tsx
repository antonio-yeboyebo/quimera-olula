import { PLANTILLA_FICHA, urlFicha } from "#/almacen/comun/fichas.ts";
import { MovimientosStockUbicacion } from "#/almacen/comun/componentes/MovimientosStockUbicacion.tsx";
import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { QInput } from "@olula/componentes/atomos/qinput.tsx";
import { MetaTabla } from "@olula/componentes/atomos/qtablacontrolada.tsx";
import { Detalle } from "@olula/componentes/detalle/Detalle.tsx";
import { useMaquina } from "@olula/componentes/hook/useMaquina.ts";
import { ListadoSemiControlado } from "@olula/componentes/maestro/ListadoSemiControlado.tsx";
import { EmitirEvento } from "@olula/lib/diseño.ts";
import { criteriaDefecto, formatearFechaString, formatearNumero } from "@olula/lib/dominio.ts";
import { useEffect } from "react";
import { Stock, StockUbicacion } from "../diseño.ts";
import { BorrarRegularizacionStock } from "../borrar_regularizacion/BorrarRegularizacionStock.tsx";
import { RegularizarStock } from "../regularizar/RegularizarStock.tsx";
import "./DetalleStock.css";
import { contextoDetalleStockInicial } from "./dominio.ts";
import { getMaquina } from "./maquina.ts";
import { RegularizacionesStock } from "./regularizaciones/RegularizacionesStock.tsx";
import { tAlmacen, useTAlmacen } from "../../i18n/index.ts";

const titulo = (stock: Stock) => stock.articulo as string;

const numero = (valor: number | null | undefined) =>
    valor === null || valor === undefined ? "" : formatearNumero(valor);

const fecha = (valor: string | null | undefined) =>
    valor ? formatearFechaString(valor) : "";

const ExpansionMovimientos = ({ entidad }: { entidad: StockUbicacion }) => (
    <MovimientosStockUbicacion stockUbicacionId={entidad.id} />
);

const metaTablaUbicaciones: MetaTabla<StockUbicacion> = {
    cols: [
        { id: "ubicacion", get cabecera() { return tAlmacen("stock.ubicacion"); }, enlace: (u) => urlFicha.ubicacion(u.idUbicacion) },
        { id: "cantidad", get cabecera() { return tAlmacen("stock.cantidad"); }, tipo: "numero" },
    ],
    expansion: ExpansionMovimientos,
};

const UbicacionesStock = ({ ubicaciones }: { ubicaciones: StockUbicacion[] }) => (
    <details className="DetalleStock-ubicaciones">
        <summary>{tAlmacen("stock.ubicacionesLength", { length: ubicaciones.length })}</summary>
        <ListadoSemiControlado
            metaTabla={metaTablaUbicaciones}
            entidades={ubicaciones}
            totalEntidades={ubicaciones.length}
            cargando={false}
            seleccionada={null}
            onSeleccion={() => {}}
            criteriaInicial={criteriaDefecto}
            onCriteriaChanged={() => null}
            modo="tabla"
        />
    </details>
);

export const DetalleStock = ({
    id,
    publicar = async () => {},
}: {
    id?: string;
    publicar?: EmitirEvento;
}) => {
    const t = useTAlmacen();
    const { ctx, emitir } = useMaquina(
        getMaquina,
        contextoDetalleStockInicial,
        publicar
    );

    useEffect(() => {
        emitir("stock_id_cambiado", id, true);
    }, [id]);

    if (!ctx.stock.id) return null;

    const { stock } = ctx;

    return (
        <Detalle
            id={id}
            obtenerTitulo={titulo}
            setEntidad={() => {}}
            entidad={stock}
            cerrarDetalle={() => emitir("stock_deseleccionado", null, true)}
        >
            <div className="DetalleStock">
                <div className="maestro-botones">
                    <QBoton onClick={() => emitir("regularizar_solicitado")}>{t("stock.regularizar")}</QBoton>
                </div>
                <quimera-formulario>
                    <QInput label={t("stock.articulo")}     nombre="articulo"    valor={stock.articulo ?? ""}               soloLectura />
                    <QInput label={t("stock.referencia")}   nombre="articulo_id" valor={String(stock.articuloId ?? "")}     soloLectura enlace={PLANTILLA_FICHA.articulo} />
                    <QInput label={t("stock.almacen")}      nombre="almacen_id"  valor={stock.almacenId ?? ""}              soloLectura enlace={PLANTILLA_FICHA.almacen} />
                    <QInput label={t("stock.nAlmacen")}   nombre="almacen"     valor={stock.almacen ?? ""}                soloLectura />
                    <QInput label={t("stock.cantidadFisica")}     nombre="cantidadFisica"     valor={numero(stock.cantidadFisica)}     soloLectura />
                    <QInput label={t("stock.disponible")}          nombre="cantidadDisponible" valor={numero(stock.cantidadDisponible)} soloLectura />
                    <QInput label={t("stock.reservada")}           nombre="cantidadReservada"  valor={numero(stock.cantidadReservada)}  soloLectura />
                    <QInput label={t("stock.pteRecibir")}        nombre="cantidadPendiente"  valor={numero(stock.cantidadPendiente)}  soloLectura />
                    <QInput label={t("stock.necesidad")}           nombre="necesidad"          valor={numero(stock.necesidad)}          soloLectura />
                    <QInput label={t("stock.stockMinimo")}        nombre="stockMinimo"        valor={numero(stock.stockMinimo)}        soloLectura />
                    <QInput label={t("stock.stockMaximo")}        nombre="stockMaximo"        valor={numero(stock.stockMaximo)}        soloLectura />
                    <QInput label={t("stock.fechaUltRegularizacion")} nombre="fechaUltReg"    valor={fecha(stock.fechaUltimaRegularizacion)}    soloLectura />
                    <QInput label={t("stock.horaUltRegularizacion")}  nombre="horaUltReg"     valor={stock.horaUltimaRegularizacion?.slice(0, 8) ?? ""} soloLectura />
                    <QInput label={t("stock.cantidadUltRegularizacion")} nombre="cantidadUltReg" valor={numero(stock.cantidadUltimaRegularizacion)} soloLectura />
                </quimera-formulario>
                <RegularizacionesStock
                    regularizaciones={ctx.regularizaciones}
                    onBorrar={(r) => emitir("borrar_regularizacion_solicitado", r)}
                />
                <UbicacionesStock ubicaciones={stock.ubicaciones} />
            </div>

            {ctx.estado === "REGULARIZANDO" && (
                <RegularizarStock stock={stock} publicar={emitir} />
            )}
            {ctx.estado === "BORRANDO_REGULARIZACION" && ctx.regularizacionActiva && (
                <BorrarRegularizacionStock
                    regularizacion={ctx.regularizacionActiva}
                    publicar={emitir}
                />
            )}
        </Detalle>
    );
};

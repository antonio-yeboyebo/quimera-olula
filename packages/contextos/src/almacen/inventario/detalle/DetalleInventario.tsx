import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { QInput } from "@olula/componentes/atomos/qinput.tsx";
import { Detalle } from "@olula/componentes/detalle/Detalle.tsx";
import { useMaquina } from "@olula/componentes/hook/useMaquina.js";
import { ContextoError } from "@olula/lib/contexto.ts";
import { EmitirEvento } from "@olula/lib/diseño.ts";
import { formatearFechaString } from "@olula/lib/dominio.ts";
import { useModelo } from "@olula/lib/useModelo.ts";
import { useCallback, useContext, useEffect } from "react";
import { Inventario } from "../diseño.ts";
import { patchInventario } from "../infraestructura.ts";
import { BorrarInventario } from "../borrar/BorrarInventario.tsx";
import { RegularizarRestoInventario } from "../regularizar_resto/RegularizarRestoInventario.tsx";
import "./DetalleInventario.css";
import { contextoDetalleInventarioInicial, metaInventario } from "./dominio.ts";
import { LineasInventario } from "./lineas/LineasInventario.tsx";
import { getMaquina } from "./maquina.ts";
import { tAlmacen, useTAlmacen } from "../../i18n/index.ts";

const titulo = (inventario: Inventario) => tAlmacen("inventario.inventarioId", { id: inventario.id });

const almacen = (inventario: Inventario) =>
    inventario.almacen ? `${inventario.almacenId} · ${inventario.almacen}` : inventario.almacenId;

export const DetalleInventario = ({
    id,
    publicar = async () => {},
}: {
    id?: string;
    publicar?: EmitirEvento;
}) => {
    const t = useTAlmacen();
    const { intentar } = useContext(ContextoError);

    const { ctx, emitir } = useMaquina(getMaquina, contextoDetalleInventarioInicial, publicar);

    const autoGuardar = useCallback(
        async (inventario: Inventario) => {
            await intentar(() =>
                patchInventario(inventario.id, { observaciones: inventario.observaciones })
            );
            await emitir("inventario_guardado");
        },
        [intentar, emitir]
    );

    const modelo = useModelo(metaInventario, ctx.inventario, autoGuardar);

    useEffect(() => {
        emitir("inventario_id_cambiado", id, true);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    if (!ctx.inventario.id) return null;

    const { inventario, lineas, estado, lineaActiva } = ctx;

    return (
        <Detalle
            id={id}
            obtenerTitulo={titulo}
            setEntidad={() => {}}
            entidad={inventario}
            cerrarDetalle={() => emitir("inventario_deseleccionado", null, true)}
        >
            <div className="DetalleInventario">
                <div className="maestro-botones">
                    <QBoton onClick={() => emitir("regularizar_resto_solicitado")}>{t("inventario.restoA0")}</QBoton>
                    <QBoton destructivo onClick={() => emitir("borrado_solicitado")}>{t("inventario.borrarInventario")}</QBoton>
                </div>
                <quimera-formulario>
                    <QInput label={t("inventario.codigo")} nombre="id" valor={inventario.id} soloLectura />
                    <QInput label={t("inventario.almacen")} nombre="almacen" valor={almacen(inventario)} soloLectura />
                    <QInput label={t("inventario.fecha")} nombre="fecha" valor={formatearFechaString(inventario.fecha)} soloLectura />
                    <QInput label={t("inventario.hora")} nombre="hora" valor={inventario.hora?.slice(0, 8) ?? ""} soloLectura />
                    <QInput label={t("inventario.descripcionObservaciones")} {...modelo.uiProps("observaciones")} />
                </quimera-formulario>
                <LineasInventario
                    inventario={inventario}
                    lineas={lineas}
                    lineaActiva={lineaActiva}
                    estado={estado}
                    publicar={emitir}
                />
            </div>

            {estado === "BORRANDO" && (
                <BorrarInventario inventario={inventario} publicar={emitir} />
            )}
            {estado === "REGULARIZANDO_RESTO" && (
                <RegularizarRestoInventario inventario={inventario} publicar={emitir} />
            )}
        </Detalle>
    );
};

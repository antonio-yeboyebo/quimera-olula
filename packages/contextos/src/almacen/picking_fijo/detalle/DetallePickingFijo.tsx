import { urlFicha, urlListado } from "#/almacen/comun/fichas.ts";
import { ValorConEnlace } from "@olula/componentes/atomos/qenlace_ficha.tsx";
import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { QInput } from "@olula/componentes/atomos/qinput.tsx";
import { Detalle } from "@olula/componentes/detalle/Detalle.tsx";
import { useMaquina } from "@olula/componentes/hook/useMaquina.js";
import { ContextoError } from "@olula/lib/contexto.ts";
import { EmitirEvento } from "@olula/lib/diseño.ts";
import { useModelo } from "@olula/lib/useModelo.ts";
import { useCallback, useContext, useEffect } from "react";
import { BorrarPickingFijo } from "../borrar/BorrarPickingFijo.tsx";
import { PickingFijo } from "../diseño.ts";
import { metaPickingFijo } from "../dominio.ts";
import { patchPickingFijo } from "../infraestructura.ts";
import { contextoDetallePickingFijoInicial } from "./detalle.ts";
import "./DetallePickingFijo.css";
import { getMaquina } from "./maquina.ts";
import { useTAlmacen } from "../../i18n/index.ts";

const titulo = (p: PickingFijo) => `${p.articuloId} en ${p.ubicacion}`;

export const DetallePickingFijo = ({
    id,
    publicar = async () => {},
}: {
    id?: string;
    publicar?: EmitirEvento;
}) => {
    const t = useTAlmacen();
    const { intentar } = useContext(ContextoError);

    const { ctx, emitir } = useMaquina(getMaquina, contextoDetallePickingFijoInicial, publicar);

    const autoGuardar = useCallback(
        async (p: PickingFijo) => {
            await intentar(() =>
                patchPickingFijo(p.id, {
                    minimo: p.minimo,
                    maximo: p.maximo,
                    unidadReposicion: p.unidadReposicion,
                })
            );
            await emitir("picking_fijo_guardado");
        },
        [intentar, emitir]
    );

    const modelo = useModelo(metaPickingFijo, ctx.pickingFijo, autoGuardar);

    useEffect(() => {
        emitir("picking_fijo_id_cambiado", id, true);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    if (!ctx.pickingFijo.id) return null;

    const { pickingFijo } = ctx;

    return (
        <Detalle
            id={id}
            obtenerTitulo={titulo}
            setEntidad={() => {}}
            entidad={pickingFijo}
            cerrarDetalle={() => emitir("picking_fijo_deseleccionado", null, true)}
        >
            <div className="DetallePickingFijo">
                <div className="maestro-botones">
                    <QBoton onClick={() => emitir("borrado_solicitado")}>{t("picking_fijo.borrar")}</QBoton>
                </div>
                <dl>
                    <dt>{t("picking_fijo.articulo")}</dt>
                    <dd>
                        <ValorConEnlace href={urlFicha.articulo(pickingFijo.articuloId)} etiqueta={t("picking_fijo.abrirArticuloArticuloid", { articuloId: pickingFijo.articuloId })}>
                            {pickingFijo.articuloId} - {pickingFijo.articulo}
                        </ValorConEnlace>
                    </dd>
                    <dt>{t("picking_fijo.ubicacion")}</dt>
                    <dd>
                        <ValorConEnlace href={urlFicha.ubicacion(pickingFijo.ubicacionId)} etiqueta={t("picking_fijo.abrirUbicacionUbicacion", { ubicacion: pickingFijo.ubicacion })}>
                            {pickingFijo.ubicacion}
                        </ValorConEnlace>
                    </dd>
                    <dt>{t("picking_fijo.stock")}</dt>
                    <dd>
                        <ValorConEnlace href={urlListado.stockDeArticulo(pickingFijo.articuloId)} etiqueta={t("picking_fijo.verElStockDeArticuloid", { articuloId: pickingFijo.articuloId })}>
                            {pickingFijo.stock}
                        </ValorConEnlace>
                    </dd>
                </dl>
                <quimera-formulario>
                    <QInput label={t("picking_fijo.minimo")} {...modelo.uiProps("minimo")} />
                    <QInput label={t("picking_fijo.maximo")} {...modelo.uiProps("maximo")} />
                    <QInput label={t("picking_fijo.unidadDeReposicion")} {...modelo.uiProps("unidadReposicion")} />
                </quimera-formulario>
            </div>

            {ctx.estado === "BORRANDO" && (
                <BorrarPickingFijo publicar={emitir} pickingFijo={pickingFijo} />
            )}
        </Detalle>
    );
};

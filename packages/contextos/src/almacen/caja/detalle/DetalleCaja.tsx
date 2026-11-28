import { urlFicha } from "#/almacen/comun/fichas.ts";
import { ValorConEnlace } from "@olula/componentes/atomos/qenlace_ficha.tsx";
import { Detalle } from "@olula/componentes/detalle/Detalle.tsx";
import { useMaquina } from "@olula/componentes/hook/useMaquina.ts";
import { QuimeraAcciones } from "@olula/componentes/index.js";
import { EmitirEvento } from "@olula/lib/diseño.ts";
import { useModelo } from "@olula/lib/useModelo.ts";
import { useCallback, useEffect } from "react";
import { BorrarCaja } from "../borrar/BorrarCaja.js";
import { Caja } from "../diseño.ts";
import { ArbolContenidoCaja } from "./ArbolContenidoCaja.tsx";
import "./DetalleCaja.css";
import { contextoDetalleCajaInicial, esCajaMonoproducto, guardarCaja, metaCaja } from "./dominio.ts";
import { getMaquina } from "./maquina.ts";
import { tAlmacen, useTAlmacen } from "../../i18n/index.ts";

const titulo = ( caja : Caja ) => tAlmacen("caja.cajaLpnEnUbicacion", { lpn: caja.lpn, ubicacion: caja.ubicacion });

export const DetalleCaja = ({
    id,
    publicar = async () => {},
}: {
    id?: string;
    publicar?: EmitirEvento;
}) => {
    const t = useTAlmacen();
    const { ctx, emitir } = useMaquina(
        getMaquina,
        contextoDetalleCajaInicial,
        publicar
    );

    const autoGuardar = useCallback(
        async (caja: Caja) => {
            await guardarCaja(ctx, caja);
            await emitir("caja_guardada");
        },
        [ctx, emitir]
    );

    // Auto-guardado: useModelo detecta cambios y llama a autoGuardar
    useModelo(metaCaja, ctx.caja, autoGuardar);

    const { estado, caja } = ctx;

    useEffect(() => {
        emitir("caja_id_cambiado", id, true);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    if (!caja.id) return null;

    const accionesCaja = [
        {
            texto: t("caja.borrar"),
            onClick: () => emitir("borrado_solicitado"),
            advertencia: true,
        },
    ];

    return (
        <Detalle
            id={id}
            obtenerTitulo={titulo}
            setEntidad={() => {}}
            entidad={caja}
            cerrarDetalle={() => emitir("caja_deseleccionada", null, true)}
        >
            <div className="DetalleCaja">
                <QuimeraAcciones acciones={accionesCaja} />
                <p className="DetalleCaja-ubicacion">
                    {t("caja.en")}{" "}
                    <ValorConEnlace href={urlFicha.ubicacion(caja.idUbicacion)} etiqueta={t("caja.abrirUbicacionUbicacion", { ubicacion: caja.ubicacion })}>
                        {caja.ubicacion}
                    </ValorConEnlace>
                </p>
                {esCajaMonoproducto(caja)
                    ? (
                        <>
                            <div className="DetalleCaja-monoproducto-info">
                                <span className="DetalleCaja-monoproducto-sku">
                                    <ValorConEnlace href={urlFicha.articulo(caja.sku)} etiqueta={t("caja.abrirArticuloValor", { valor: caja.sku ?? "" })}>
                                        {caja.sku ?? "—"}
                                    </ValorConEnlace>
                                </span>
                                <span className="DetalleCaja-monoproducto-cantidad">{t("caja.cantidadUd", { cantidad: caja.cantidad })}</span>
                                {caja.idLote && (
                                    <span className="DetalleCaja-monoproducto-lote">{t("caja.loteIdlote", { idLote: caja.idLote })}</span>
                                )}
                            </div>
                            <ArbolContenidoCaja contenido={caja.materiales} />
                        </>
                    )
                    : <ArbolContenidoCaja contenido={caja.contenido} />}
            </div>

            {estado === "BORRANDO" && (
                <BorrarCaja
                    caja={ctx.caja}
                    publicar={emitir}
                />
            )}
        </Detalle>
    );
};

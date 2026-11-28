import { Caja } from "#/almacen/comun/componentes/Caja.tsx";
import { Lote } from "#/almacen/comun/componentes/Lote.tsx";
import { buscarCajaPorTexto, buscarUbicacionPorTexto } from "#/almacen/comun/voz_resolvers.ts";
import { OrdenAlmacen, TipoOrden } from "#/almacen/orden/diseño.ts";
import { IndicadorVoz } from "@olula/componentes/atomos/indicador_voz.tsx";
import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { QInput } from "@olula/componentes/atomos/qinput.tsx";
import { QModal } from "@olula/componentes/moleculas/qmodal.tsx";
import { ContextoError } from "@olula/lib/contexto.ts";
import { ProcesarEvento } from "@olula/lib/useMaquina.js";
import { useModelo } from "@olula/lib/useModelo.ts";
import { PreguntaVoz, useFlujoVoz } from "@olula/lib/voz/useFlujoVoz.ts";
import { useCallback, useContext, useEffect, useMemo, useRef } from "react";
import { Articulo } from "../../../../comun/componentes/Articulo.tsx";
import { Ubicacion } from "../../../../comun/componentes/Ubicacion.tsx";
import { plugin } from "@olula/lib/dominio.js";
import { getSkuLote, registrarLecturasOrden } from "../../../infraestructura.ts";
import { getLecturaOrdenVacia, getMetaLecturaOrden } from "./lectura_orden.ts";
import "./LecturaLineaOrden.css";
import { LecturaSkuLote } from "./LecturaSkuLote.tsx";
import { tAlmacen, useTAlmacen } from "../../../../i18n/index.ts";

const preguntaSku: PreguntaVoz = {
    get instruccion() { return tAlmacen("orden.leeElCodigoDeBarras"); },
    tipo: "texto",
    resolver: async (texto) => {
        try {
            return await getSkuLote(texto);
        } catch {
            return null;
        }
    },
    confirmacion: (v) => tAlmacen("orden.articuloDescripcionCorrecto", { descripcion: v.descripcion }),
};

const preguntaCantidad: PreguntaVoz = {
    get instruccion() { return tAlmacen("orden.dimeLaCantidad"); },
    tipo: "numero",
    confirmacion: (v) => tAlmacen("orden.vUnidadesCorrecto", { v }),
};

const preguntaUbicacion = (label: string): PreguntaVoz => ({
    instruccion: tAlmacen("orden.dimeLaLabel", { label }),
    tipo: "texto",
    resolver: async (texto) => {
        const ubi = await buscarUbicacionPorTexto(texto);
        return ubi ? { id: ubi.id, codigo: ubi.codigo } : null;
    },
    confirmacion: (v) => tAlmacen("orden.ubicacionCodigoCorrecto", { codigo: v.codigo }),
});

const preguntaCaja = (label: string): PreguntaVoz => ({
    instruccion: tAlmacen("orden.dimeLaLabel", { label }),
    tipo: "texto",
    resolver: async (texto) => {
        const caja = await buscarCajaPorTexto(texto);
        return caja ? { id: caja.id, lpn: caja.lpn } : null;
    },
    confirmacion: (v) => tAlmacen("orden.cajaLpnCorrecto", { lpn: v.lpn }),
});

export const LecturaOrden = ({
    publicar,
    orden,
    tipo,
    modoVoz = false,
}: {
    publicar: ProcesarEvento;
    orden: OrdenAlmacen;
    tipo: TipoOrden;
    modoVoz?: boolean;
}) => {
    const t = useTAlmacen();
    const { intentar } = useContext(ContextoError);
    const flujoVoz = useFlujoVoz();

    const [lecturaInicial, metaNuevaLecturaOrden] = useMemo(
        () => [
            getLecturaOrdenVacia(orden),
            getMetaLecturaOrden(orden.tipo),
        ],
        [orden]
    );

    const { modelo, uiProps, valido, init, set } = useModelo(
        metaNuevaLecturaOrden,
        lecturaInicial
    );

    const sgaActivo = plugin("sga") === "activo";
    const mostrarOrigen = ["SALIDA", "TRASPASO"].includes(tipo);
    const mostrarDestino = ["ENTRADA", "TRASPASO"].includes(tipo);

    const registrar = useCallback(async () => {
        await intentar(() =>
            registrarLecturasOrden(orden.id, [{
                sku: modelo.sku,
                idLote: modelo.idLote,
                idLinea: null,
                cajaCompleta: false,
                cantidad: modelo.cantidad,
                articulo: modelo.articulo,
                idUbicacionDestino: mostrarDestino
                    ? modelo.idUbicacionDestino
                    : null,
                idCajaDestino: mostrarDestino ? modelo.idCajaDestino : null,
                idUbicacionOrigen: mostrarOrigen
                    ? modelo.idUbicacionOrigen
                    : null,
                idCajaOrigen: mostrarOrigen ? modelo.idCajaOrigen : null,
            }])
        );
        publicar("lectura_registrada");
        init();
    }, [modelo, publicar, orden.id, intentar, init, mostrarDestino, mostrarOrigen]);

    const registrarRef = useRef(registrar);
    registrarRef.current = registrar;
    const setRef = useRef(set);
    setRef.current = set;

    // --- Flujo de voz secuencial ---
    useEffect(() => {
        if (!modoVoz || !flujoVoz.soportado) return;

        let cancelado = false;

        const ejecutar = async () => {
            try {
                // 1. SKU
                const skuResult = await flujoVoz.preguntar(preguntaSku);
                if (cancelado) return;

                const parcial = {
                    ...lecturaInicial,
                    sku: skuResult.sku,
                    articulo: skuResult.descripcion,
                    idLote: skuResult.loteId,
                };

                // 2. Cantidad
                const cantidad = await flujoVoz.preguntar(preguntaCantidad);
                if (cancelado) return;
                parcial.cantidad = cantidad as number;

                // 3. Ubicación origen (si aplica)
                if (sgaActivo && mostrarOrigen) {
                    const ubiOrigen = await flujoVoz.preguntar(preguntaUbicacion(t("orden.ubicacionDeOrigen")));
                    if (cancelado) return;
                    parcial.idUbicacionOrigen = ubiOrigen.id;

                    const cajaOrigen = await flujoVoz.preguntar(preguntaCaja(t("orden.cajaDeOrigen")));
                    if (cancelado) return;
                    parcial.idCajaOrigen = cajaOrigen.id;
                }

                // 4. Ubicación destino (si aplica)
                if (sgaActivo && mostrarDestino) {
                    const ubiDestino = await flujoVoz.preguntar(preguntaUbicacion(t("orden.ubicacionDeDestino")));
                    if (cancelado) return;
                    parcial.idUbicacionDestino = ubiDestino.id;

                    const cajaDestino = await flujoVoz.preguntar(preguntaCaja(t("orden.cajaDeDestino")));
                    if (cancelado) return;
                    parcial.idCajaDestino = cajaDestino.id;
                }

                // 5. Actualizar modelo y registrar
                setRef.current(parcial);
                setTimeout(() => registrarRef.current(), 0);
            } catch (err) {
                if (err instanceof Error && err.message === "cancelado") return;
                console.error("Error en flujo de voz lectura libre:", err);
            }
        };

        ejecutar();

        return () => {
            cancelado = true;
            flujoVoz.cancelar();
        };
    }, [modoVoz]); // eslint-disable-line react-hooks/exhaustive-deps

    const onSkuLoteLeido = useCallback(
        (resultado: { sku: string; descripcion: string; loteId: string | null }) => {
            set({ ...modelo, sku: resultado.sku, articulo: resultado.descripcion, idLote: resultado.loteId });
        },
        [modelo, set]
    );

    return (
        <QModal abierto={true} nombre="lecturaOrden" titulo={modoVoz ? t("orden.lecturaDeArticulosVoz") : t("orden.lecturaDeArticulos")} onCerrar={() => { flujoVoz.cancelar(); publicar("lectura_cancelada"); }}>
            <div className="LecturaOrden">
                {modoVoz && (
                    <IndicadorVoz
                        estado={flujoVoz.estado}
                        textoReconocido={flujoVoz.textoReconocido}
                        interino={flujoVoz.interino}
                    />
                )}
                <quimera-formulario>
                    <LecturaSkuLote nombre="sku-lote" onLectura={onSkuLoteLeido} />
                    <QInput label={t("orden.cantidad")} {...uiProps("cantidad")} />
                    <Articulo
                        {...uiProps("sku", "articulo")}
                    />
                    <Lote
                        sku={modelo.sku}
                        {...uiProps("idLote", "idLote")}
                    />
                    {sgaActivo && mostrarOrigen && (
                        <>
                            <Ubicacion
                                label={t("orden.uOrigen")}
                                {...uiProps("idUbicacionOrigen")}
                            />
                            <Caja
                                label={t("orden.cajaOrigen3")}
                                {...uiProps("idCajaOrigen")}
                            />
                        </>
                    )}
                    {sgaActivo && mostrarDestino && (
                        <>
                            <Ubicacion
                                label={t("orden.uDestino")}
                                {...uiProps("idUbicacionDestino")}
                            />
                            <Caja
                                label={t("orden.cajaDestino3")}
                                {...uiProps("idCajaDestino")}
                            />
                        </>
                    )}
                </quimera-formulario>
                <div className="botones maestro-botones">
                    <QBoton onClick={registrar} deshabilitado={!valido}>
                        {t("orden.registrar")}
                    </QBoton>
                </div>
            </div>
        </QModal>
    );
};

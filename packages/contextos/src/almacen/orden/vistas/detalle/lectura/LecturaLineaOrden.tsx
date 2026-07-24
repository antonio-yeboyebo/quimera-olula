import { Caja } from "#/almacen/comun/componentes/Caja.tsx";
import { Lote } from "#/almacen/comun/componentes/Lote.tsx";
import { OrdenAlmacen, TipoOrden } from "#/almacen/orden/diseño.ts";
import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { QInput } from "@olula/componentes/atomos/qinput.tsx";
import { QModal } from "@olula/componentes/moleculas/qmodal.tsx";
import { ContextoError } from "@olula/lib/contexto.ts";
import { ProcesarEvento } from "@olula/lib/useMaquina.js";
import { useModelo } from "@olula/lib/useModelo.ts";
import { useCallback, useContext, useMemo } from "react";
import { Articulo } from "../../../../comun/componentes/Articulo.tsx";
import { Ubicacion } from "../../../../comun/componentes/Ubicacion.tsx";
import { registrarLecturaOrden } from "../../../infraestructura.ts";
import { getLecturaOrdenVacia, getMetaLecturaOrden } from "./lectura_orden.ts";
import "./LecturaLineaOrden.css";
import { LecturaSkuLote } from "./LecturaSkuLote.tsx";

export const LecturaOrden = ({
    publicar,
    orden,
    tipo,
}: {
    publicar: ProcesarEvento;
    orden: OrdenAlmacen;
    tipo: TipoOrden;
}) => {
    const { intentar } = useContext(ContextoError);

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

    const mostrarOrigen = ["SALIDA", "TRASPASO"].includes(tipo);
    const mostrarDestino = ["ENTRADA", "TRASPASO"].includes(tipo);

    const registrar = useCallback(async () => {

        console.log("modelo"    , modelo);
        await intentar(() =>
            registrarLecturaOrden(orden.id, {
                sku: modelo.sku,
                idLote: modelo.idLote,
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

            })
        );
        publicar("lectura_registrada");
        init();
    }, [modelo, publicar, orden.id, intentar, init, mostrarDestino, mostrarOrigen]);

    const onSkuLoteLeido = useCallback(
        (resultado: { sku: string; descripcion: string; loteId: string | null }) => {
            set({ ...modelo, sku: resultado.sku, articulo: resultado.descripcion, idLote: resultado.loteId });
        },
        [modelo, set]
    );

    return (
        <QModal abierto={true} nombre="lecturaOrden" titulo="Lectura de artículos" onCerrar={() => publicar("lectura_cancelada")}>
            <div className="LecturaOrden">
                <quimera-formulario>
                    <LecturaSkuLote nombre="sku-lote" onLectura={onSkuLoteLeido} />
                    <QInput label="Cantidad" {...uiProps("cantidad")} />
                    <Articulo
                        {...uiProps("sku", "articulo")}
                    />
                    <Lote
                        sku={modelo.sku}
                        {...uiProps("idLote", "idLote")}
                    />
                    {mostrarOrigen && (
                        <>
                            <Ubicacion
                                label={"U. Origen"}
                                {...uiProps("idUbicacionOrigen")}
                            />
                            <Caja
                                label={"Caja Origen"}
                                {...uiProps("idCajaOrigen")}
                            />
                        </>
                    )}
                    {mostrarDestino && (
                        <>
                            <Ubicacion
                                label={"U. Destino"}
                                {...uiProps("idUbicacionDestino")}
                            />
                            <Caja
                                label={"Caja Destino"}
                                {...uiProps("idCajaDestino")}
                            />
                        </>
                    )}
                </quimera-formulario>
                <div className="botones maestro-botones">
                    <QBoton onClick={registrar} deshabilitado={!valido}>
                        Registrar
                    </QBoton>
                    {/* <QBoton onClick={() => publicar("lectura_cancelada")}>
                        Cerrar
                    </QBoton> */}
                </div>
            </div>
        </QModal>
    );
};

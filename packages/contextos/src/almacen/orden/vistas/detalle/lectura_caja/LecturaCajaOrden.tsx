import { Caja } from "#/almacen/comun/componentes/Caja.tsx";
import { Ubicacion } from "#/almacen/comun/componentes/Ubicacion.tsx";
import { OrdenAlmacen, TipoOrden } from "#/almacen/orden/diseño.ts";
import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { QInput } from "@olula/componentes/index.js";
import { QModal } from "@olula/componentes/moleculas/qmodal.tsx";
import { ContextoError } from "@olula/lib/contexto.ts";
import { ProcesarEvento } from "@olula/lib/useMaquina.js";
import { useModelo } from "@olula/lib/useModelo.ts";
import { useCallback, useContext, useMemo } from "react";
import { registrarLecturaCajaOrden } from "../../../infraestructura.ts";
import { getLecturaCajaOrdenVacia, getMetaLecturaCajaOrden } from "./lectura_caja_orden.ts";
import "./LecturaCajaOrden.css";

export const LecturaCajaOrden = ({
    publicar,
    orden,
    tipo,
}: {
    publicar: ProcesarEvento;
    orden: OrdenAlmacen;
    tipo: TipoOrden;
}) => {
    const { intentar } = useContext(ContextoError);

    const [lecturaInicial, metaLecturaCajaOrden] = useMemo(
        () => [
            getLecturaCajaOrdenVacia(orden),
            getMetaLecturaCajaOrden(orden.tipo),
        ],
        [orden]
    );

    const { modelo, uiProps, valido, init } = useModelo(
        metaLecturaCajaOrden,
        lecturaInicial
    );

    const esTraspaso = tipo === "TRASPASO";

    const registrar = useCallback(async () => {
        await intentar(() =>
            registrarLecturaCajaOrden(orden.id, {
                cajaId: modelo.cajaId,
                cajaCompleta: modelo.cajaCompleta,
                idUbicacionDestino: esTraspaso
                    ? modelo.idUbicacionDestino
                    : null,
                idCajaDestino: esTraspaso ? modelo.idCajaDestino : null,
            })
        );
        publicar("lectura_registrada");
        init();
    }, [modelo, publicar, orden.id, intentar, init, esTraspaso]);

    return (
        <QModal abierto={true} nombre="lecturaCajaOrden" titulo="Lectura de caja" onCerrar={() => publicar("lectura_caja_cancelada")}>
            <div className="LecturaCajaOrden">
                <quimera-formulario>
                    <Caja
                        {...uiProps("cajaId")}
                        label="Caja"
                        nombre="cajaId"
                    />
                    <QInput label="Caja completa" {...uiProps("cajaCompleta")} />
                    {esTraspaso && (
                        <>
                            <Ubicacion
                                {...uiProps("idUbicacionDestino")}
                                label="Ubicación destino"
                                nombre="idUbicacionDestino"
                            />
                            <Caja
                                {...uiProps("idCajaDestino")}
                                label="Caja destino"
                                nombre="idCajaDestino"
                            />
                        </>
                    )}
                </quimera-formulario>
                <div className="botones maestro-botones">
                    <QBoton onClick={registrar} deshabilitado={!valido}>
                        Registrar
                    </QBoton>
                    {/* <QBoton onClick={() => publicar("lectura_caja_cancelada")}>
                        Cerrar
                    </QBoton> */}
                </div>
            </div>
        </QModal>
    );
};

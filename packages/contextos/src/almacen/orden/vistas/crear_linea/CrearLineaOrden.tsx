import { Caja } from "#/almacen/comun/componentes/Caja.tsx";
import { Ubicacion } from "#/almacen/comun/componentes/Ubicacion.tsx";
import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { QInput } from "@olula/componentes/atomos/qinput.tsx";
import { QModal } from "@olula/componentes/moleculas/qmodal.tsx";
import { EmitirEvento } from "@olula/lib/diseño.js";
import { useForm } from "@olula/lib/useForm.js";
import { useModelo } from "@olula/lib/useModelo.ts";
import { useCallback, useMemo, useState } from "react";
import { OrdenAlmacen } from "../../diseño.ts";
import { crearLineaSubcajaPalet, postLineasOrden } from "../../infraestructura.ts";
import { nuevaLineaOrdenDesdeOrden } from "./crear_linea.ts";
import { getMetaNuevaLineaOrden } from "./diseño.ts";

export const CrearLineaOrden = ({
    publicar,
    orden,
}: {
    publicar: EmitirEvento;
    orden: OrdenAlmacen;
}) => {
    const [pasos, setPasos] = useState<string | null>(null);

    const meta = getMetaNuevaLineaOrden(orden.tipo);

    const lineaInicial = useMemo(
        () => nuevaLineaOrdenDesdeOrden(orden),
        [orden.idUbicacionOrigen, orden.idCajaOrigen, orden.idUbicacionDestino, orden.idCajaDestino]
    );

    const { modelo, uiProps, valido } = useModelo(
        meta,
        lineaInicial
    );

    const mostrarOrigen = orden.tipo === "SALIDA" || orden.tipo === "TRASPASO";
    const mostrarDestino = orden.tipo === "ENTRADA" || orden.tipo === "TRASPASO";

    const esSubcajaPalet = pasos === "SUBCAJA_PALET";
    const validoSubcaja = !esSubcajaPalet || (!!modelo.idCajaOrigen && !!modelo.idUbicacionDestino);
    const puedeGuardar = valido && validoSubcaja;

    const crear_ = useCallback(async () => {
        if (esSubcajaPalet) {
            await crearLineaSubcajaPalet(orden.id, {
                sku: modelo.sku,
                cantidad: modelo.cantidadPrevista,
                idCajaOrigen: modelo.idCajaOrigen!,
                idUbicacionDestino: modelo.idUbicacionDestino!,
            });
        } else {
            await postLineasOrden(orden.id, [
                {
                    sku: modelo.sku,
                    cantidadPrevista: modelo.cantidadPrevista,
                    loteId: null,
                    idUbicacionOrigen: modelo.idUbicacionOrigen,
                    idCajaOrigen: modelo.idCajaOrigen,
                    idUbicacionDestino: modelo.idUbicacionDestino,
                    idCajaDestino: modelo.idCajaDestino,
                },
            ]);
        }
        publicar("linea_creada");
    }, [modelo, esSubcajaPalet, publicar, orden.id]);

    const cancelar_ = useCallback(() => {
        publicar("alta_de_linea_cancelada");
    }, [publicar]);

    const [crear, cancelar] = useForm(crear_, cancelar_);

    return (
        <QModal
            abierto={true}
            nombre="crearLineaOrden"
            titulo="Nueva línea"
            onCerrar={cancelar}
        >
            <div className="CrearLineaOrden">
                <quimera-formulario>
                    <select
                        value={pasos ?? ""}
                        onChange={(e) => setPasos(e.target.value || null)}
                    >
                        <option value="">Estándar</option>
                        <option value="SUBCAJA_PALET">Subcaja de palé</option>
                    </select>
                    <QInput label="SKU" {...uiProps("sku")} />
                    <QInput label="Cantidad prevista" {...uiProps("cantidadPrevista")} />
                    {!esSubcajaPalet && mostrarOrigen && (
                        <Ubicacion
                            {...uiProps("idUbicacionOrigen")}
                            label="Ubicación origen"
                            nombre="idUbicacionOrigen"
                        />
                    )}
                    {(esSubcajaPalet || mostrarOrigen) && (
                        <Caja
                            {...uiProps("idCajaOrigen")}
                            label={esSubcajaPalet ? "Palé origen" : "Caja origen"}
                            nombre="idCajaOrigen"
                        />
                    )}
                    {(esSubcajaPalet || mostrarDestino) && (
                        <Ubicacion
                            {...uiProps("idUbicacionDestino")}
                            label="Ubicación destino"
                            nombre="idUbicacionDestino"
                        />
                    )}
                    {!esSubcajaPalet && mostrarDestino && (
                        <Caja
                            {...uiProps("idCajaDestino")}
                            label="Caja destino"
                            nombre="idCajaDestino"
                        />
                    )}
                </quimera-formulario>
                <div className="botones maestro-botones">
                    <QBoton onClick={crear} deshabilitado={!puedeGuardar}>
                        Guardar
                    </QBoton>
                </div>
            </div>
        </QModal>
    );
};

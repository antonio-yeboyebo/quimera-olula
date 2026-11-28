import { Caja } from "#/almacen/comun/componentes/Caja.tsx";
import { Sku } from "#/almacen/comun/componentes/Sku.tsx";
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
import { CampoFlujo, camposPendientes, Flujo, flujoPorDefecto } from "../../pasos/flujos.ts";
import { SelectorFlujo } from "../selector_flujo/SelectorFlujo.tsx";
import { nuevaLineaOrdenDesdeOrden } from "./crear_linea.ts";
import { getMetaNuevaLineaOrden } from "./diseño.ts";
import { tAlmacen, useTAlmacen } from "../../../i18n/index.ts";

const meta = getMetaNuevaLineaOrden();

const etiqueta = (flujo: Flujo | null, campo: CampoFlujo, texto: string) =>
    flujo?.campos[campo] === "opcional" ? tAlmacen("orden.textoOpcional", { texto }) : texto;

export const CrearLineaOrden = ({
    publicar,
    orden,
}: {
    publicar: EmitirEvento;
    orden: OrdenAlmacen;
}) => {
    const t = useTAlmacen();
    const [flujo, setFlujo] = useState<Flujo | null>(() => flujoPorDefecto(orden));

    const lineaInicial = useMemo(
        () => nuevaLineaOrdenDesdeOrden(orden),
        [orden.idUbicacionOrigen, orden.idCajaOrigen, orden.idUbicacionDestino, orden.idCajaDestino] // eslint-disable-line react-hooks/exhaustive-deps
    );

    const { modelo, uiProps, valido } = useModelo(meta, lineaInicial);

    const usa = (campo: CampoFlujo) => !!flujo?.campos[campo];
    const pendientes = flujo ? camposPendientes(flujo, modelo) : [];
    const puedeGuardar = valido && !!flujo && pendientes.length === 0;

    const crear_ = useCallback(async () => {
        if (!flujo) return;
        if (flujo.palet) {
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
                    idUbicacionOrigen: usa("ubicacionOrigen") || usa("cajaOrigen") ? modelo.idUbicacionOrigen : null,
                    idCajaOrigen: usa("cajaOrigen") ? modelo.idCajaOrigen : null,
                    idUbicacionDestino: usa("ubicacionDestino") ? modelo.idUbicacionDestino : null,
                    idCajaDestino: usa("cajaDestino") ? modelo.idCajaDestino : null,
                    pasosPick: flujo.pasosPick,
                    pasosDrop: flujo.pasosDrop,
                },
            ]);
        }
        publicar("linea_creada");
    }, [modelo, flujo, publicar, orden.id]); // eslint-disable-line react-hooks/exhaustive-deps

    const cancelar_ = useCallback(() => {
        publicar("alta_de_linea_cancelada");
    }, [publicar]);

    const [crear, cancelar] = useForm(crear_, cancelar_);

    return (
        <QModal
            abierto={true}
            nombre="crearLineaOrden"
            titulo={t("orden.nuevaLinea")}
            onCerrar={cancelar}
        >
            <div className="CrearLineaOrden">
                <quimera-formulario>
                    <SelectorFlujo tipo={orden.tipo} valor={flujo?.codigo ?? null} onChange={setFlujo} />
                    <Sku {...uiProps("sku")} />
                    <QInput label={t("orden.cantidadPrevista")} {...uiProps("cantidadPrevista")} />
                    {usa("paletOrigen") && (
                        <Caja {...uiProps("idCajaOrigen")} label={t("orden.paleOrigen2")} nombre="idCajaOrigen" />
                    )}
                    {usa("ubicacionOrigen") && (
                        <Ubicacion
                            {...uiProps("idUbicacionOrigen")}
                            label={etiqueta(flujo, "ubicacionOrigen", t("orden.ubicacionOrigen2"))}
                            nombre="idUbicacionOrigen"
                        />
                    )}
                    {usa("cajaOrigen") && (
                        <Caja
                            {...uiProps("idCajaOrigen")}
                            label={etiqueta(flujo, "cajaOrigen", t("orden.cajaOrigen2"))}
                            nombre="idCajaOrigen"
                        />
                    )}
                    {usa("ubicacionDestino") && (
                        <Ubicacion
                            {...uiProps("idUbicacionDestino")}
                            label={etiqueta(flujo, "ubicacionDestino", t("orden.ubicacionDestino2"))}
                            nombre="idUbicacionDestino"
                        />
                    )}
                    {usa("cajaDestino") && (
                        <Caja
                            {...uiProps("idCajaDestino")}
                            label={etiqueta(flujo, "cajaDestino", t("orden.cajaDestino2"))}
                            nombre="idCajaDestino"
                        />
                    )}
                </quimera-formulario>
                {pendientes.length > 0 && (
                    <p className="q-texto-secundario">{t("orden.faltaValor", { valor: pendientes.join(", ") })}</p>
                )}
                <div className="botones maestro-botones">
                    <QBoton onClick={crear} deshabilitado={!puedeGuardar}>
                        {t("orden.guardar")}
                    </QBoton>
                </div>
            </div>
        </QModal>
    );
};

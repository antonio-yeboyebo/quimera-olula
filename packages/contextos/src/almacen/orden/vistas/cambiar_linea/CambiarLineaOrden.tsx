import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { DescripcionFlujo, SelectorFlujo } from "../selector_flujo/SelectorFlujo.tsx";
import { QInput } from "@olula/componentes/atomos/qinput.tsx";
import { QModal } from "@olula/componentes/moleculas/qmodal.tsx";
import { EmitirEvento } from "@olula/lib/diseño.js";
import { useForm } from "@olula/lib/useForm.js";
import { useModelo } from "@olula/lib/useModelo.ts";
import { useCallback } from "react";
import { LineaOrdenAlmacen, OrdenAlmacen } from "../../diseño.ts";
import { metaNuevaLinea } from "../../dominio.ts";
import { patchLineaOrden } from "../../infraestructura.ts";
import { flujoDePasos } from "../../pasos/flujos.ts";
import { useTAlmacen } from "../../../i18n/index.ts";

export const CambiarLineaOrden = ({
    publicar,
    linea,
    orden,
}: {
    publicar: EmitirEvento;
    linea: LineaOrdenAlmacen;
    orden: OrdenAlmacen;
}) => {
    const t = useTAlmacen();
    const { modelo, uiProps, valido, set } = useModelo(metaNuevaLinea, linea);

    // El flujo de palé crea cajas al dar de alta la línea: no se puede elegir ni abandonar al editar.
    const flujo = flujoDePasos(orden.tipo, modelo.pasosPick ?? null, modelo.pasosDrop ?? null);
    const flujoEditable = !!flujo && !flujo.palet;

    const guardar_ = useCallback(async () => {
        await patchLineaOrden(orden.id, linea.id, modelo);
        publicar("linea_cambiada", modelo);
    }, [modelo, publicar, orden.id, linea.id]);

    const cancelar_ = useCallback(() => {
        publicar("cambio_de_linea_cancelado");
    }, [publicar]);

    const [guardar, cancelar] = useForm(guardar_, cancelar_);

    return (
        <QModal
            abierto={true}
            nombre="cambiarLineaOrden"
            titulo={t("orden.edicionDeLinea")}
            onCerrar={cancelar}
        >
            <div className="CambiarLineaOrden">
                <quimera-formulario>
                    <QInput label="SKU" {...uiProps("sku")} />
                    <QInput label={t("orden.cantidadPrevista")} {...uiProps("cantidadPrevista")} />
                    <QInput label={t("orden.cantidadReal")} {...uiProps("cantidadReal")} soloLectura />
                    {flujoEditable ? (
                        <SelectorFlujo
                            tipo={orden.tipo}
                            valor={flujo.codigo}
                            excluirPalet
                            onChange={(f) => {
                                if (f) set({ ...modelo, pasosPick: f.pasosPick, pasosDrop: f.pasosDrop });
                            }}
                        />
                    ) : (
                        <DescripcionFlujo
                            flujo={flujo}
                            pasosPick={modelo.pasosPick ?? null}
                            pasosDrop={modelo.pasosDrop ?? null}
                        />
                    )}
                </quimera-formulario>
                <div className="botones maestro-botones">
                    <QBoton onClick={guardar} deshabilitado={!valido}>
                        {t("orden.guardar")}
                    </QBoton>
                </div>
            </div>
        </QModal>
    );
};

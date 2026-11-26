import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { QInput, QModal } from "@olula/componentes/index.js";
import { EmitirEvento } from "@olula/lib/diseño.js";
import { useForm } from "@olula/lib/useForm.js";
import { useModelo } from "@olula/lib/useModelo.ts";
import { useCallback, useState } from "react";
import { Almacen } from "../../../comun/componentes/Almacen.tsx";
import { TipoOrden } from "../../../comun/componentes/TipoOrden.tsx";
import { postOrden } from "../../infraestructura.ts";
import { flujoPorCodigo, flujosDeTipo } from "../../pasos/flujos.ts";
import { SelectorFlujo } from "../selector_flujo/SelectorFlujo.tsx";
import "./CrearOrden.css";
import { nuevaOrdenAlmacenVacia } from "./crear.ts";
import { metaNuevaOrden } from "./diseño.ts";
import { useTAlmacen } from "../../../i18n/index.ts";

export const CrearOrden = ({
    publicar,
}: {
    publicar: EmitirEvento;
}) => {
    const t = useTAlmacen();
    const { modelo, uiProps, valido } = useModelo(
        metaNuevaOrden,
        nuevaOrdenAlmacenVacia
    );

    const [codigoFlujo, setCodigoFlujo] = useState<string | null>(null);
    // Si se cambia el tipo de orden, el flujo elegido deja de valer y se usa el primero del tipo.
    const elegido = flujoPorCodigo(codigoFlujo);
    const flujo = elegido?.tipo === modelo.tipoOrden ? elegido : (flujosDeTipo(modelo.tipoOrden)[0] ?? null);

    const crear_ = useCallback(
        async () => {
            const id = await postOrden({
                ...modelo,
                pasosPick: flujo?.pasosPick ?? null,
                pasosDrop: flujo?.pasosDrop ?? null,
            });
            publicar("modulo_creado", id);
        },
        [modelo, flujo, publicar]
    );

    const cancelar_ = useCallback(
        () => publicar("alta_de_modulo_cancelada"),
        [publicar]
    );

    const [crear, cancelar] = useForm(crear_, cancelar_);

    return (
        <QModal
            abierto={true}
            nombre="crearOrden"
            titulo={t("orden.nuevaOrden")}
            onCerrar={cancelar}
        >
            <div className="CrearOrden">
                <quimera-formulario>
                    <TipoOrden {...uiProps("tipoOrden")} />
                    <Almacen {...uiProps("almacenId")} />
                    <QInput label={t("orden.abierta")} {...uiProps("abierta")} />
                    {flujo && (
                        <SelectorFlujo
                            tipo={modelo.tipoOrden}
                            valor={flujo.codigo}
                            onChange={(f) => setCodigoFlujo(f?.codigo ?? null)}
                            label={t("orden.flujoPorDefectoDeLasLineas")}
                        />
                    )}
                </quimera-formulario>

                <div className="botones maestro-botones">
                    <QBoton onClick={crear} deshabilitado={!valido}>
                        {t("orden.crear")}
                    </QBoton>
                </div>
            </div>
        </QModal>
    );
};

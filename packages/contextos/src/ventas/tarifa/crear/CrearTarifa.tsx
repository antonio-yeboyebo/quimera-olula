import { Divisa } from "#/comun/componentes/divisa.tsx";
import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { QInput } from "@olula/componentes/atomos/qinput.tsx";
import { QModal } from "@olula/componentes/index.js";
import { EmitirEvento } from "@olula/lib/diseño.js";
import { useFocus } from "@olula/lib/useFocus.ts";
import { useForm } from "@olula/lib/useForm.js";
import { useModelo } from "@olula/lib/useModelo.ts";
import { useCallback, useMemo } from "react";
import { postTarifa } from "../infraestructura.js";
import "./CrearTarifa.css";
import { metaNuevaTarifa, nuevaTarifaInicial } from "./crear.js";
import { useTVentas } from "../../i18n/index.ts";

/**
 * Modal de alta de tarifa.
 *
 * Patrón:
 *   - El maestro lo renderiza condicionalmente cuando estado === "CREANDO".
 *   - Llama a postTarifa internamente y emite:
 *       "tarifa_creada"            con el ID devuelto por la API  (éxito)
 *       "alta_de_tarifa_cancelada" sin payload                    (cancelar)
 *   - No recibe prop `activo`; la visibilidad la controla el padre.
 *   - El modelo inicial SIEMPRE va memoizado: useModelo lo reinicia cuando cambia
 *     su identidad, así que pasar `nuevaTarifaInicial()` en línea entra en bucle
 *     infinito en cuanto el usuario escribe.
 */
export const CrearTarifa = ({
    publicar,
}: {
    publicar: EmitirEvento;
}) => {
    const t = useTVentas();
    const inicial = useMemo(nuevaTarifaInicial, []);

    const { modelo: tarifa, uiProps, valido } = useModelo(
        metaNuevaTarifa,
        inicial
    );

    const crear_ = useCallback(
        async () => {
            const id = await postTarifa(tarifa);
            publicar("tarifa_creada", id);
        },
        [tarifa, publicar]
    );

    const cancelar_ = useCallback(
        () => publicar("alta_de_tarifa_cancelada"),
        [publicar]
    );

    const [crear, cancelar] = useForm(crear_, cancelar_);

    const focus = useFocus();

    return (
        <QModal
            abierto={true}
            nombre="crear_tarifa"
            titulo={t("tarifa.crear")}
            onCerrar={cancelar}
        >
            <div className="CrearTarifa">
                <quimera-formulario>
                    <QInput label={t("tarifa.maestro.nombre")} {...uiProps("nombre")} ref={focus} />
                    <Divisa {...uiProps("divisaId")} nombre="tarifa/divisa_id" />
                </quimera-formulario>

                <div className="botones maestro-botones">
                    <QBoton onClick={crear} deshabilitado={!valido}>
                        Crear
                    </QBoton>
                </div>
            </div>
        </QModal>
    );
};

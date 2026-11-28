import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { QInput } from "@olula/componentes/atomos/qinput.tsx";
import { QModal } from "@olula/componentes/index.js";
import { EmitirEvento } from "@olula/lib/diseño.js";
import { useFocus } from "@olula/lib/useFocus.ts";
import { useForm } from "@olula/lib/useForm.js";
import { useModelo } from "@olula/lib/useModelo.ts";
import { useCallback, useMemo } from "react";
import { CamposFormaPago } from "../detalle/CamposFormaPago.tsx";
import { metaNuevaFormaPago, nuevaFormaPagoVacia } from "../dominio.ts";
import { postFormaPago } from "../infraestructura.ts";
import { useTTesoreria } from "../../i18n/index.ts";

/** Alta de forma de pago. Nace con un plazo de 0 días y el 100 % (lo que
 * propone Eneboo al añadir el primer plazo); se cambia con «Editar plazos». */
export const CrearFormaPago = ({ publicar }: { publicar: EmitirEvento }) => {
    const t = useTTesoreria();
    const inicial = useMemo(nuevaFormaPagoVacia, []);

    const { modelo, uiProps, valido } = useModelo(metaNuevaFormaPago, inicial);

    const crear_ = useCallback(async () => {
        const id = await postFormaPago(modelo);
        publicar("forma_pago_creada", id);
    }, [modelo, publicar]);

    const cancelar_ = useCallback(() => publicar("alta_de_forma_pago_cancelada"), [publicar]);

    const [crear, cancelar] = useForm(crear_, cancelar_);

    const focus = useFocus();

    return (
        <QModal abierto={true} nombre="crearFormaPago" titulo={t("forma_pago.nuevaFormaDePago")} onCerrar={cancelar}>
            <div className="CrearFormaPago">
                <quimera-formulario>
                    <QInput label={t("forma_pago.codigo")} {...uiProps("id")} ref={focus} />
                    <CamposFormaPago uiProps={uiProps} />
                </quimera-formulario>
                <div className="botones maestro-botones">
                    <QBoton onClick={crear} deshabilitado={!valido}>
                        {t("forma_pago.crear")}
                    </QBoton>
                </div>
            </div>
        </QModal>
    );
};

import { ejercicioActual } from "#/contabilidad/asiento/dominio.ts";
import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { QCheckbox } from "@olula/componentes/atomos/qcheckbox.tsx";
import { QDate } from "@olula/componentes/atomos/qdate.tsx";
import { QInput } from "@olula/componentes/atomos/qinput.tsx";
import { QModal } from "@olula/componentes/index.js";
import { useForm } from "@olula/lib/useForm.js";
import { useModelo } from "@olula/lib/useModelo.ts";
import { useCallback, useMemo } from "react";
import { Amortizacion } from "../diseño.ts";
import { metaNuevaDotacion, nuevaDotacionVacia } from "../dominio.ts";
import { postDotacion } from "../infraestructura.ts";
import { useTContabilidad } from "../../i18n/index.ts";

/** Alta de una dotación desde la ficha (`co_dotaciones`). Lo que se deja
 * vacío lo propone el servidor como Eneboo: periodo siguiente, cuota del
 * periodo (o lo pendiente) y asiento a fin de periodo. */
export const CrearDotacion = ({
    amortizacion,
    onCreada,
    onCancelar,
}: {
    amortizacion: Amortizacion;
    onCreada: () => void;
    onCancelar: () => void;
}) => {
    const t = useTContabilidad();
    const inicial = useMemo(nuevaDotacionVacia, []);
    const { modelo, uiProps, valido } = useModelo(metaNuevaDotacion, inicial);

    const crear_ = useCallback(async () => {
        await postDotacion(amortizacion.id, modelo, ejercicioActual());
        onCreada();
    }, [amortizacion.id, modelo, onCreada]);

    const [crear, cancelar] = useForm(crear_, onCancelar);

    return (
        <QModal abierto={true} nombre="crearDotacion" titulo={t("amortizacion.nuevaDotacion")} onCerrar={cancelar}>
            <div className="CrearDotacion">
                <p>{t("amortizacion.asientoEnElEjercicioValorVacio", { valor: ejercicioActual() })}</p>
                <quimera-formulario>
                    <QInput label={t("amortizacion.importe")} {...uiProps("importe")} />
                    <QDate label={t("amortizacion.fechaDelAsiento")} {...uiProps("fecha")} />
                    <QCheckbox label={t("amortizacion.ignorarContabilidadSinAsiento")} {...uiProps("noGenerarAsiento")} />
                </quimera-formulario>
                <div className="botones maestro-botones">
                    <QBoton onClick={crear} deshabilitado={!valido}>{t("amortizacion.crear")}</QBoton>
                </div>
            </div>
        </QModal>
    );
};

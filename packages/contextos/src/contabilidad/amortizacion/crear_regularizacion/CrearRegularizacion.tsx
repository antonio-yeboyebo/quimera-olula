import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { QDate } from "@olula/componentes/atomos/qdate.tsx";
import { QInput } from "@olula/componentes/atomos/qinput.tsx";
import { QModal } from "@olula/componentes/index.js";
import { useForm } from "@olula/lib/useForm.js";
import { useModelo } from "@olula/lib/useModelo.ts";
import { useCallback, useMemo } from "react";
import { Amortizacion } from "../diseño.ts";
import { metaNuevaRegularizacion, nuevaRegularizacionVacia } from "../dominio.ts";
import { postRegularizacion } from "../infraestructura.ts";
import { useTContabilidad } from "../../i18n/index.ts";

export const CrearRegularizacion = ({
    amortizacion,
    onCreada,
    onCancelar,
}: {
    amortizacion: Amortizacion;
    onCreada: () => void;
    onCancelar: () => void;
}) => {
    const t = useTContabilidad();
    const inicial = useMemo(nuevaRegularizacionVacia, []);
    const { modelo, uiProps, valido } = useModelo(metaNuevaRegularizacion, inicial);

    const crear_ = useCallback(async () => {
        await postRegularizacion(amortizacion.id, modelo);
        onCreada();
    }, [amortizacion.id, modelo, onCreada]);

    const [crear, cancelar] = useForm(crear_, onCancelar);

    return (
        <QModal abierto={true} nombre="crearRegularizacionValor"
            titulo={t("amortizacion.nuevaRegularizacionDeValor")} onCerrar={cancelar}>
            <div className="CrearRegularizacionValor">
                <quimera-formulario>
                    <QDate label={t("amortizacion.fecha")} {...uiProps("fecha")} />
                    <QInput label={t("amortizacion.descripcion")} {...uiProps("descripcion")} />
                    <QInput label={t("amortizacion.importe")} {...uiProps("importe")} />
                </quimera-formulario>
                <div className="botones maestro-botones">
                    <QBoton onClick={crear} deshabilitado={!valido}>{t("amortizacion.crear")}</QBoton>
                </div>
            </div>
        </QModal>
    );
};

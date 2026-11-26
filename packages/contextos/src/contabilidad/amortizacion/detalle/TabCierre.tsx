import { ejercicioActual } from "#/contabilidad/asiento/dominio.ts";
import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { QCheckbox } from "@olula/componentes/atomos/qcheckbox.tsx";
import { QDate } from "@olula/componentes/atomos/qdate.tsx";
import { QInput } from "@olula/componentes/atomos/qinput.tsx";
import { ContextoError } from "@olula/lib/contexto.ts";
import { FormModelo } from "@olula/lib/dominio.js";
import { useCallback, useContext, useState } from "react";
import { Amortizacion } from "../diseño.ts";
import { esCerrada } from "../dominio.ts";
import {
    fechaAApi,
    patchCerrarAmortizacion,
    patchReabrirAmortizacion,
} from "../infraestructura.ts";
import { useTContabilidad } from "../../i18n/index.ts";

/** Pestaña «Cierre»: botón «Cerrar / reabrir la amortización» con el asiento
 * de cierre (elemento, amortización acumulada y pérdidas). */
export const TabCierre = ({
    form,
    amortizacion,
    onCambio,
}: {
    form: FormModelo;
    amortizacion: Amortizacion;
    onCambio: () => void;
}) => {
    const t = useTContabilidad();
    const { intentar } = useContext(ContextoError);
    const [fecha, setFecha] = useState<Date>(amortizacion.fechaCierre ?? new Date());
    const [ocupado, setOcupado] = useState(false);
    const cerrada = esCerrada(amortizacion);

    const ejecutar = useCallback(async () => {
        if (ocupado) return;
        setOcupado(true);
        try {
            await intentar(() => cerrada
                ? patchReabrirAmortizacion(amortizacion.id)
                : patchCerrarAmortizacion(amortizacion.id, fecha, ejercicioActual()));
            onCambio();
        } finally {
            setOcupado(false);
        }
    }, [amortizacion.id, cerrada, fecha, intentar, ocupado, onCambio]);

    return (
        <div className="TabCierre">
            <quimera-formulario>
                <QDate label={t("amortizacion.fechaDeCierre")} nombre="fecha_cierre" valor={fechaAApi(fecha)}
                    deshabilitado={cerrada}
                    onChange={(valor) => valor && setFecha(new Date(`${valor}T12:00:00`))} />
                <QCheckbox label={t("amortizacion.ignorarContabilidadSinAsientoDeCierre")}
                    {...form.uiProps("noGenerarAsientoCierre")} deshabilitado={cerrada} />
                <QInput label={t("amortizacion.asientoDeCierre")} nombre="asiento_cierre"
                    valor={amortizacion.numeroAsientoCierre
                        ? `${amortizacion.numeroAsientoCierre} (${amortizacion.ejercicioAsientoCierre})`
                        : ""}
                    soloLectura />
                <QCheckbox label={t("amortizacion.vendido")} {...form.uiProps("vendido")} />
            </quimera-formulario>
            <div className="botones maestro-botones">
                <QBoton onClick={ejecutar} deshabilitado={ocupado}>
                    {cerrada ? t("amortizacion.reabrirLaAmortizacion") : t("amortizacion.cerrarLaAmortizacion")}
                </QBoton>
            </div>
            {cerrada
                ? <p>{t("amortizacion.alReabrirSeBorraElAsiento")}</p>
                : <p>{t("amortizacion.elAsientoDeCierreVaAl", { valor: ejercicioActual() })}</p>}
        </div>
    );
};

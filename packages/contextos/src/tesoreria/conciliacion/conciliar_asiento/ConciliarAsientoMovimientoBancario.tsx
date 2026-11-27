import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { QInput } from "@olula/componentes/atomos/qinput.tsx";
import { QModal } from "@olula/componentes/index.js";
import { EmitirEvento } from "@olula/lib/diseño.ts";
import { formatearMoneda } from "@olula/lib/dominio.ts";
import { useForm } from "@olula/lib/useForm.ts";
import { useModelo } from "@olula/lib/useModelo.ts";
import { useMemo } from "react";
import { Subcuenta } from "../../comun/componentes/Subcuenta.tsx";
import { MovimientoBancario } from "../diseño.js";
import {
    datosAsientoVacios,
    ejercicioDelMovimiento,
    metaDatosAsientoMovimiento,
    paramsAsiento,
} from "./dominio.js";
import { useTTesoreria } from "../../i18n/index.ts";

/**
 * Conciliación de tipo asiento manual: pide la subcuenta de contrapartida y el
 * concepto. El servidor genera el asiento con la subcuenta del banco, la de
 * contrapartida, la fecha y el importe del movimiento. La llamada a la API
 * vive en detalle/detalle.ts (onConciliado), que recibe los datos como payload.
 */
export const ConciliarAsientoMovimientoBancario = ({
    movimiento,
    publicar,
}: {
    movimiento: MovimientoBancario;
    publicar: EmitirEvento;
}) => {
    const t = useTTesoreria();
    const inicial = useMemo(() => datosAsientoVacios(movimiento.concepto), [movimiento.concepto]);
    const { modelo, uiProps, valido } = useModelo(metaDatosAsientoMovimiento, inicial);

    const conciliar_ = async () => publicar("conciliacion_confirmada", paramsAsiento(modelo));
    const cancelar_ = () => publicar("conciliacion_cancelada");

    const [conciliar, cancelar] = useForm(conciliar_, cancelar_);

    const entra = movimiento.importe >= 0;
    const importe = formatearMoneda(Math.abs(movimiento.importe), movimiento.divisa ?? "EUR");

    return (
        <QModal abierto={true} nombre="conciliarAsientoMovimientoBancario" titulo={t("conciliacion.asientoManual")} onCerrar={cancelar}>
            <p>
                {t("conciliacion.seGeneraraUnAsientoDeImporte", { importe })}
                {entra ? t("conciliacion.alDebeYLaContrapartidaAl") : t("conciliacion.alHaberYLaContrapartidaAl")}
            </p>
            <quimera-formulario>
                <Subcuenta
                    label={t("conciliacion.subcuentaDeContrapartida")}
                    ejercicioId={ejercicioDelMovimiento(movimiento)}
                    {...uiProps("codigoSubcuenta")}
                />
                <QInput label={t("conciliacion.concepto")} {...uiProps("concepto")} />
            </quimera-formulario>
            <div className="botones maestro-botones">
                <QBoton onClick={conciliar} deshabilitado={!valido}>{t("conciliacion.generarAsiento")}</QBoton>
            </div>
        </QModal>
    );
};

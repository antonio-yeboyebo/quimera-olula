import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { QTextArea } from "@olula/componentes/atomos/qtextarea.tsx";
import { QModal } from "@olula/componentes/index.js";
import { EmitirEvento } from "@olula/lib/diseño.ts";
import { useForm } from "@olula/lib/useForm.ts";
import { useModelo } from "@olula/lib/useModelo.ts";
import { MovimientoBancario } from "../diseño.js";
import { metaMotivoIgnorarMovimiento, motivoIgnorarVacio } from "./dominio.js";
import { useTTesoreria } from "../../i18n/index.ts";

/**
 * El motivo (comisión, traspaso...) es opcional. La llamada a la API
 * (PATCH `.../ignorar`) vive en detalle/detalle.ts (onIgnorado), a la que se
 * le pasa el motivo como payload del evento de confirmación.
 */
export const IgnorarMovimientoBancario = ({
    movimiento,
    publicar,
}: {
    movimiento: MovimientoBancario;
    publicar: EmitirEvento;
}) => {
    const t = useTTesoreria();
    const { modelo, uiProps } = useModelo(metaMotivoIgnorarMovimiento, motivoIgnorarVacio);

    const ignorar_ = async () => publicar("ignorar_confirmado", modelo.motivo);
    const cancelar_ = () => publicar("ignorar_cancelado");

    const [ignorar, cancelar] = useForm(ignorar_, cancelar_);

    return (
        <QModal abierto={true} nombre="ignorarMovimientoBancario" titulo={t("conciliacion.ignorarMovimiento")} onCerrar={cancelar}>
            <p>
                {t("conciliacion.conceptoNoLiquidaraNingunReciboComision", { concepto: movimiento.concepto })}
                {t("conciliacion.puedesIndicarOpcionalmenteElMotivo")}
            </p>
            <quimera-formulario>
                <QTextArea label={t("conciliacion.motivo")} {...uiProps("motivo")} />
            </quimera-formulario>
            <div className="botones maestro-botones">
                <QBoton onClick={ignorar}>{t("conciliacion.ignorar")}</QBoton>
            </div>
        </QModal>
    );
};

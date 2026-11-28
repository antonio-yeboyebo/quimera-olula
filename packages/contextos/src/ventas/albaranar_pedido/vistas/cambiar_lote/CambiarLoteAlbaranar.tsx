import { Lote } from "#/almacen/comun/componentes/Lote.tsx";
import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { QInput } from "@olula/componentes/atomos/qinput.tsx";
import { QModal } from "@olula/componentes/moleculas/qmodal.tsx";
import { EmitirEvento } from "@olula/lib/diseño.ts";
import { MetaModelo } from "@olula/lib/dominio.ts";
import { useForm } from "@olula/lib/useForm.js";
import { useModelo } from "@olula/lib/useModelo.ts";
import { useCallback } from "react";
import { LineaAlbaranar, LoteAlbaranar } from "../../diseño.ts";
import { useTVentas } from "../../../i18n/index.ts";

const metaCambiarLote: MetaModelo<LoteAlbaranar> = {
    campos: {
        idLote: { bloqueado: true },
        cantidad: { tipo: "numero", requerido: true, positivo: true },
    },
};

export const CambiarLoteAlbaranar = ({
    linea,
    lote,
    emitir,
}: {
    linea: LineaAlbaranar;
    lote: LoteAlbaranar;
    emitir: EmitirEvento;
}) => {
    const t = useTVentas();
    const { modelo, uiProps, valido, modificado } = useModelo(metaCambiarLote, lote);

    const cambiar_ = useCallback(async () => {
        await emitir("lote_cambiado", { idLinea: linea.idLinea, lote: modelo });
    }, [emitir, linea.idLinea, modelo]);

    const cancelar_ = useCallback(() => {
        void emitir("cambio_de_lote_cancelado");
    }, [emitir]);

    const [cambiar, cancelar] = useForm(cambiar_, cancelar_);

    return (
        <QModal
            nombre="cambiarLote"
            abierto={true}
            titulo={`Editar lote — ${linea.sku} ${linea.descripcion}`}
            onCerrar={cancelar}
        >
            <quimera-formulario>
                <Lote label={t("pedido.albaranar.lote")} {...uiProps("idLote")} sku={linea.sku} />
                <QInput label={t("documento.formLinea.cantidad")} {...uiProps("cantidad")} />
            </quimera-formulario>
            <div className="botones maestro-botones">
                <QBoton onClick={cambiar} deshabilitado={!valido || !modificado}>
                    Guardar
                </QBoton>
            </div>
        </QModal>
    );
};

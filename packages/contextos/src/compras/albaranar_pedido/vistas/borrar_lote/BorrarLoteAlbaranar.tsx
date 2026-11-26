import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { QModal } from "@olula/componentes/moleculas/qmodal.tsx";
import { EmitirEvento } from "@olula/lib/diseño.ts";
import { useForm } from "@olula/lib/useForm.js";
import { useTCompras } from "#/compras/i18n/index.ts";
import { useCallback } from "react";
import { LineaAlbaranar, LoteAlbaranar } from "../../diseño.ts";

export const BorrarLoteAlbaranar = ({
    linea,
    lote,
    emitir,
}: {
    linea: LineaAlbaranar;
    lote: LoteAlbaranar;
    emitir: EmitirEvento;
}) => {
    const t = useTCompras();
    const borrar_ = useCallback(async () => {
        await emitir("baja_de_lote_confirmada", { idLinea: linea.idLinea, idLote: lote.idLote });
    }, [emitir, linea.idLinea, lote.idLote]);

    const cancelar_ = useCallback(() => {
        void emitir("baja_de_lote_cancelada");
    }, [emitir]);

    const [borrar, cancelar] = useForm(borrar_, cancelar_);

    return (
        <QModal
            nombre="borrarLote"
            abierto={true}
            titulo={t("albaranarPedido.borrarLote", { articulo: `${linea.sku} ${linea.descripcion}` })}
            onCerrar={cancelar}
        >
            <p>{t("albaranarPedido.borrarLoteMensaje", { lote: lote.idLote, cantidad: lote.cantidad })}</p>
            <div className="botones maestro-botones">
                <QBoton onClick={borrar}>
                    {t("comun.botones.borrar")}
                </QBoton>
            </div>
        </QModal>
    );
};

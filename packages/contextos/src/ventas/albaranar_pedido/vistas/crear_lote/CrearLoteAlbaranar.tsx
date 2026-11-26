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

type NuevoLote = { idLote: string; cantidad: number };

const metaNuevoLote: MetaModelo<NuevoLote> = {
    campos: {
        idLote: { requerido: true },
        cantidad: { tipo: "numero", requerido: true, positivo: true },
    },
};

const nuevoLoteVacio: NuevoLote = { idLote: "", cantidad: 0 };

export const CrearLoteAlbaranar = ({
    linea,
    emitir,
}: {
    linea: LineaAlbaranar;
    emitir: EmitirEvento;
}) => {
    const t = useTVentas();
    const { modelo, uiProps, valido } = useModelo(metaNuevoLote, nuevoLoteVacio);

    const crear_ = useCallback(async () => {
        const lote: LoteAlbaranar = { idLote: modelo.idLote, cantidad: modelo.cantidad };
        await emitir("lote_creado", { idLinea: linea.idLinea, lote });
    }, [emitir, linea.idLinea, modelo]);

    const cancelar_ = useCallback(() => {
        void emitir("alta_de_lote_cancelada");
    }, [emitir]);

    const [crear, cancelar] = useForm(crear_, cancelar_);

    return (
        <QModal
            nombre="crearLote"
            abierto={true}
            titulo={`Añadir lote — ${linea.sku} ${linea.descripcion}`}
            onCerrar={cancelar}
        >
            <quimera-formulario>
                <Lote label={t("pedido.albaranar.lote")} {...uiProps("idLote")} sku={linea.sku} />
                <QInput label={t("documento.formLinea.cantidad")} {...uiProps("cantidad")} />
            </quimera-formulario>
            <div className="botones maestro-botones">
                <QBoton onClick={crear} deshabilitado={!valido}>
                    {t("pedido.albaranar.anadir")}
                </QBoton>
            </div>
        </QModal>
    );
};

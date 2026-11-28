import { QModalConfirmacion } from "@olula/componentes/moleculas/qmodalconfirmacion.tsx";
import { EmitirEvento } from "@olula/lib/diseño.ts";
import { useForm } from "@olula/lib/useForm.ts";
import { useCallback } from "react";
import { Factura } from "../diseño.ts";
import { emisionEsReintento } from "../dominio.ts";
import { useTVentas } from "../../i18n/index.ts";

export const EmitirFactura = ({
    factura,
    publicar,
}: {
    factura: Factura;
    publicar: EmitirEvento;
}) => {
    const t = useTVentas();
    const emitir_ = useCallback(async () => {
        publicar("emision_lista");
    }, [publicar]);

    const cancelar_ = useCallback(
        () => publicar("emitir_cancelado"),
        [publicar]
    );

    const [emitirFactura, cancelar] = useForm(emitir_, cancelar_);

    const reintento = emisionEsReintento(factura);

    return (
        <QModalConfirmacion
            nombre="emitirFactura"
            abierto={true}
            titulo={reintento ? t("factura.emitir.tituloReintento") : t("factura.emitir.titulo")}
            mensaje={
                reintento
                    ? t("factura.emitir.mensajeReintento", { codigo: factura.codigo })
                    : t("factura.emitir.mensaje", { codigo: factura.codigo })
            }
            onCerrar={cancelar}
            onAceptar={emitirFactura}
        />
    );
};

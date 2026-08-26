import { QModalConfirmacion } from "@olula/componentes/moleculas/qmodalconfirmacion.tsx";
import { EmitirEvento } from "@olula/lib/diseño.ts";
import { useForm } from "@olula/lib/useForm.ts";
import { useCallback } from "react";
import { Factura } from "../diseño.ts";
import { emisionEsReintento } from "../dominio.ts";

export const EmitirFactura = ({
    factura,
    publicar,
}: {
    factura: Factura;
    publicar: EmitirEvento;
}) => {
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
            titulo={reintento ? "Reintentar emisión" : "Emitir factura"}
            mensaje={
                reintento
                    ? `La firma de la factura ${factura.codigo} falló. ¿Reintentar la emisión?`
                    : `¿Emitir la factura ${factura.codigo}? Dejará de ser un borrador.`
            }
            onCerrar={cancelar}
            onAceptar={emitirFactura}
        />
    );
};

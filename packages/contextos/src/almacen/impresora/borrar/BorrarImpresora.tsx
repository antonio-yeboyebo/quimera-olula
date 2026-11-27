import { QModalConfirmacion } from "@olula/componentes/moleculas/qmodalconfirmacion.tsx";
import { EmitirEvento } from "@olula/lib/diseño.js";
import { useForm } from "@olula/lib/useForm.js";
import { useCallback } from "react";
import { Impresora } from "../diseño.ts";
import { deleteImpresora } from "../infraestructura.ts";

export const BorrarImpresora = ({
    publicar,
    impresora,
}: {
    impresora: Impresora;
    publicar: EmitirEvento;
}) => {
    const borrar_ = useCallback(async () => {
        await deleteImpresora(impresora.id);
        publicar("impresora_borrada", impresora.id);
    }, [publicar, impresora]);

    const cancelar_ = useCallback(() => publicar("borrado_cancelado"), [publicar]);

    const [borrar, cancelar] = useForm(borrar_, cancelar_);

    return (
        <QModalConfirmacion
            nombre="borrarImpresora"
            abierto={true}
            titulo="Borrar impresora"
            mensaje={`¿Está seguro de que desea borrar la impresora "${impresora.codigo}"?`}
            onCerrar={cancelar}
            onAceptar={borrar}
        />
    );
};

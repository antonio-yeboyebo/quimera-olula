import { QModalConfirmacion } from "@olula/componentes/moleculas/qmodalconfirmacion.tsx";
import { EmitirEvento } from "@olula/lib/diseño.js";
import { useForm } from "@olula/lib/useForm.js";
import { useCallback } from "react";
import { CredencialExterna } from "../diseño.js";
import { deleteCredencialExterna } from "../infraestructura.js";
import { useTComun } from "../../i18n/index.ts";

export const BorrarCredencialExterna = ({
    publicar,
    credencial,
}: {
    credencial: CredencialExterna;
    publicar: EmitirEvento;
}) => {
    const t = useTComun();
    const borrar_ = useCallback(
        async () => {
            await deleteCredencialExterna(credencial.id);
            publicar("credencial_externa_borrada", credencial);
        },
        [publicar, credencial]
    );

    const cancelar_ = useCallback(
        () => publicar("borrado_cancelado"),
        [publicar]
    );

    const [borrar, cancelar] = useForm(borrar_, cancelar_);

    return (
        <QModalConfirmacion
            nombre="borrarCredencialExterna"
            abierto={true}
            titulo={t("credencialExterna.borrarCredencial")}
            mensaje={t("credencialExterna.estaSeguroDeQueDeseaBorrar", { nombre: credencial.nombre })}
            onCerrar={cancelar}
            onAceptar={borrar}
        />
    );
};

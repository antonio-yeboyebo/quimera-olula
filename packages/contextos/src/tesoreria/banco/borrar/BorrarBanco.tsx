import { QModalConfirmacion } from "@olula/componentes/moleculas/qmodalconfirmacion.tsx";
import { EmitirEvento } from "@olula/lib/diseño.js";
import { useForm } from "@olula/lib/useForm.js";
import { useCallback } from "react";
import { Banco } from "../diseño.ts";
import { etiquetaBanco } from "../dominio.ts";
import { deleteBanco } from "../infraestructura.ts";
import { useTTesoreria } from "../../i18n/index.ts";

export const BorrarBanco = ({ publicar, banco }: { banco: Banco; publicar: EmitirEvento }) => {
    const t = useTTesoreria();
    const borrar_ = useCallback(async () => {
        await deleteBanco(banco.id);
        publicar("banco_borrado", banco);
    }, [publicar, banco]);

    const cancelar_ = useCallback(() => publicar("borrado_cancelado"), [publicar]);

    const [borrar, cancelar] = useForm(borrar_, cancelar_);

    return (
        <QModalConfirmacion
            nombre="borrarBanco"
            abierto={true}
            titulo={t("banco.borrarBanco")}
            mensaje={t("banco.confirmaBorrarBancoYSusSucursales", { banco: etiquetaBanco(banco) })}
            onCerrar={cancelar}
            onAceptar={borrar}
        />
    );
};

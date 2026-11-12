import { QModalConfirmacion } from "@olula/componentes/moleculas/qmodalconfirmacion.tsx";
import { EmitirEvento } from "@olula/lib/diseño.js";
import { useForm } from "@olula/lib/useForm.js";
import { useCallback } from "react";

export const MigrarTodasTenant = ({ publicar }: { publicar: EmitirEvento }) => {
    const migrar_ = useCallback(
        async () => { await publicar("migracion_confirmada"); },
        [publicar]
    );
    const cancelar_ = useCallback(() => publicar("migracion_cancelada"), [publicar]);

    const [migrar, cancelar] = useForm(migrar_, cancelar_);

    return (
        <QModalConfirmacion
            nombre="migrarTodasTenant"
            abierto={true}
            titulo="Migrar todas las empresas"
            mensaje="Se aplicarán las migraciones pendientes en la base de datos de todas las empresas. ¿Desea continuar?"
            labelAceptar="Migrar todas"
            onCerrar={cancelar}
            onAceptar={migrar}
        />
    );
};

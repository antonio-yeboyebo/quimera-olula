import { QModalConfirmacion } from "@olula/componentes/moleculas/qmodalconfirmacion.tsx";
import { EmitirEvento } from "@olula/lib/diseño.js";
import { useForm } from "@olula/lib/useForm.js";
import { useCallback } from "react";
import { Tenant } from "../diseño.js";
import { deleteBdTenant } from "../infraestructura.js";

export const EliminarBdTenant = ({ publicar, tenant }: { tenant: Tenant; publicar: EmitirEvento }) => {
    const eliminar_ = useCallback(
        async () => {
            await deleteBdTenant(tenant.id);
            publicar("bd_eliminada");
        },
        [publicar, tenant]
    );
    const cancelar_ = useCallback(() => publicar("eliminacion_bd_cancelada"), [publicar]);

    const [eliminar, cancelar] = useForm(eliminar_, cancelar_);

    return (
        <QModalConfirmacion
            nombre="eliminarBdTenant"
            abierto={true}
            titulo="Eliminar base de datos"
            mensaje={`ATENCIÓN: se eliminará de forma IRREVERSIBLE la base de datos "${tenant.nombreBd}" de "${tenant.nombre}".\nSolo es posible una vez transcurrido el periodo de retención. Asegúrese de haber exportado los datos.`}
            labelAceptar="Eliminar definitivamente"
            destructivo
            onCerrar={cancelar}
            onAceptar={eliminar}
        />
    );
};

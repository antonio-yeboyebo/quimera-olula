import { QModalConfirmacion } from "@olula/componentes/moleculas/qmodalconfirmacion.tsx";
import { EmitirEvento } from "@olula/lib/diseño.js";
import { useForm } from "@olula/lib/useForm.js";
import { useCallback } from "react";
import { Tenant } from "../diseño.js";
import { bajaTenant } from "../infraestructura.js";

export const DarDeBajaTenant = ({ publicar, tenant }: { tenant: Tenant; publicar: EmitirEvento }) => {
    const baja_ = useCallback(
        async () => {
            await bajaTenant(tenant.id);
            publicar("baja_confirmada");
        },
        [publicar, tenant]
    );
    const cancelar_ = useCallback(() => publicar("baja_cancelada"), [publicar]);

    const [baja, cancelar] = useForm(baja_, cancelar_);

    return (
        <QModalConfirmacion
            nombre="darDeBajaTenant"
            abierto={true}
            titulo="Dar de baja la empresa"
            mensaje={`¿Seguro que desea dar de baja a "${tenant.nombre}"?\nLos usuarios dejarán de poder acceder.`}
            labelAceptar="Dar de baja"
            destructivo
            onCerrar={cancelar}
            onAceptar={baja}
        />
    );
};

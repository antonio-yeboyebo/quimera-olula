import { QModalConfirmacion } from "@olula/componentes/moleculas/qmodalconfirmacion.tsx";
import { EmitirEvento } from "@olula/lib/diseño.ts";
import { useForm } from "@olula/lib/useForm.ts";
import { useCallback } from "react";
import { useTCompras } from "#/compras/i18n/index.ts";
import { Factura } from "../diseño.ts";

/**
 * Registrar es irreversible: consume número de serie, genera la cartera de
 * pagos y mueve el stock. Por eso se confirma, a diferencia del resto de
 * acciones del detalle.
 */
export const RegistrarFactura = ({
    factura,
    publicar,
}: {
    factura: Factura;
    publicar: EmitirEvento;
}) => {
    const t = useTCompras();
    const registrar_ = useCallback(async () => {
        publicar("registro_listo");
    }, [publicar]);

    const cancelar_ = useCallback(
        () => publicar("registro_cancelado"),
        [publicar]
    );

    const [registrarFactura, cancelar] = useForm(registrar_, cancelar_);

    return (
        <QModalConfirmacion
            nombre="registrarFactura"
            abierto={true}
            titulo={t("factura.registrar.titulo")}
            mensaje={t("factura.registrar.mensaje", { codigo: factura.codigo })}
            onCerrar={cancelar}
            onAceptar={registrarFactura}
        />
    );
};

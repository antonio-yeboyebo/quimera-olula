import { QModalConfirmacion } from "@olula/componentes/moleculas/qmodalconfirmacion.tsx";
import { EmitirEvento } from "@olula/lib/diseño.js";
import { useForm } from "@olula/lib/useForm.js";
import { useCallback } from "react";
import { RegularizacionIva } from "../diseño.ts";
import { etiquetaRegularizacionIva } from "../dominio.ts";
import { deleteRegularizacionIva } from "../infraestructura.ts";
import { useTContabilidad } from "../../i18n/index.ts";

export const BorrarRegularizacionIva = ({
    publicar,
    regularizacion,
}: {
    regularizacion: RegularizacionIva;
    publicar: EmitirEvento;
}) => {
    const t = useTContabilidad();
    const borrar_ = useCallback(async () => {
        await deleteRegularizacionIva(regularizacion.id);
        publicar("regularizacion_iva_borrada", regularizacion);
    }, [publicar, regularizacion]);

    const cancelar_ = useCallback(
        () => publicar("borrado_cancelado"),
        [publicar]
    );

    const [borrar, cancelar] = useForm(borrar_, cancelar_);

    return (
        <QModalConfirmacion
            nombre="borrarRegularizacionIva"
            abierto={true}
            titulo={t("regularizacion_iva.borrarRegularizacionDeIva")}
            mensaje={t("regularizacion_iva.confirmaBorrarLaRegularizacionSeBorrara", { regularizacion: etiquetaRegularizacionIva(regularizacion) })}
            onCerrar={cancelar}
            onAceptar={borrar}
        />
    );
};

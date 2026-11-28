import { QModalConfirmacion } from "@olula/componentes/moleculas/qmodalconfirmacion.tsx";
import { EmitirEvento } from "@olula/lib/diseño.js";
import { useForm } from "@olula/lib/useForm.js";
import { useCallback } from "react";
import { TipoUbicacion } from "../diseño.ts";
import { deleteTipoUbicacion } from "../infraestructura.ts";
import { useTAlmacen } from "../../i18n/index.ts";

export const BorrarTipoUbicacion = ({
    publicar,
    tipoUbicacion,
}: {
    tipoUbicacion: TipoUbicacion;
    publicar: EmitirEvento;
}) => {
    const t = useTAlmacen();
    const borrar_ = useCallback(async () => {
        await deleteTipoUbicacion(tipoUbicacion.id);
        publicar("tipo_ubicacion_borrado", tipoUbicacion.id);
    }, [publicar, tipoUbicacion]);

    const cancelar_ = useCallback(() => publicar("borrado_cancelado"), [publicar]);

    const [borrar, cancelar] = useForm(borrar_, cancelar_);

    return (
        <QModalConfirmacion
            nombre="borrarTipoUbicacion"
            abierto={true}
            titulo={t("tipo_ubicacion.borrarTipoDeUbicacion")}
            mensaje={t("tipo_ubicacion.estaSeguroDeQueDeseaBorrar", { codigo: tipoUbicacion.codigo })}
            onCerrar={cancelar}
            onAceptar={borrar}
        />
    );
};

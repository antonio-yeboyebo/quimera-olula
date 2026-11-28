import { QModalConfirmacion } from "@olula/componentes/moleculas/qmodalconfirmacion.tsx";
import { EmitirEvento } from "@olula/lib/diseño.js";
import { useForm } from "@olula/lib/useForm.js";
import { useCallback } from "react";
import { ClaseAlmacenamiento } from "../diseño.ts";
import { deleteClaseAlmacenamiento } from "../infraestructura.ts";
import { useTAlmacen } from "../../i18n/index.ts";

export const BorrarClaseAlmacenamiento = ({
    publicar,
    clase,
}: {
    clase: ClaseAlmacenamiento;
    publicar: EmitirEvento;
}) => {
    const t = useTAlmacen();
    const borrar_ = useCallback(async () => {
        await deleteClaseAlmacenamiento(clase.id);
        publicar("clase_almacenamiento_borrada", clase.id);
    }, [publicar, clase]);

    const cancelar_ = useCallback(() => publicar("borrado_cancelado"), [publicar]);

    const [borrar, cancelar] = useForm(borrar_, cancelar_);

    return (
        <QModalConfirmacion
            nombre="borrarClaseAlmacenamiento"
            abierto={true}
            titulo={t("clase_almacenamiento.borrarClaseDeAlmacenamiento")}
            mensaje={t("clase_almacenamiento.estaSeguroDeQueDeseaBorrar", { codigo: clase.codigo })}
            onCerrar={cancelar}
            onAceptar={borrar}
        />
    );
};

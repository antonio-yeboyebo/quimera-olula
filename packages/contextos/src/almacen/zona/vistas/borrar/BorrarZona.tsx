import { QModalConfirmacion } from "@olula/componentes/moleculas/qmodalconfirmacion.tsx";
import { EmitirEvento } from "@olula/lib/diseño.js";
import { useForm } from "@olula/lib/useForm.js";
import { useCallback } from "react";
import { Zona } from "../../diseño.ts";
import { deleteZona } from "../../infraestructura.ts";
import { useTAlmacen } from "../../../i18n/index.ts";

export const BorrarZona = ({
    publicar,
    zona,
}: {
    zona: Zona;
    publicar: EmitirEvento;
}) => {
    const t = useTAlmacen();
    const borrar_ = useCallback(async () => {
        await deleteZona(zona.id);
        publicar("zona_borrada", zona);
    }, [publicar, zona]);

    const cancelar_ = useCallback(
        () => publicar("borrado_cancelado"),
        [publicar]
    );

    const [borrar, cancelar] = useForm(borrar_, cancelar_);

    return (
        <QModalConfirmacion
            nombre="borrarZona"
            abierto={true}
            titulo={t("zona.borrarZona")}
            mensaje={t("zona.estaSeguroDeQueDeseaBorrar", { codigo: zona.codigo })}
            onCerrar={cancelar}
            onAceptar={borrar}
        />
    );
};

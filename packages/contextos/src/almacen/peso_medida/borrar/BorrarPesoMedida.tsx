import { QModalConfirmacion } from "@olula/componentes/moleculas/qmodalconfirmacion.tsx";
import { EmitirEvento } from "@olula/lib/diseño.js";
import { useForm } from "@olula/lib/useForm.js";
import { useCallback } from "react";
import { PesoMedida } from "../diseño.ts";
import { deletePesoMedida } from "../infraestructura.ts";
import { useTAlmacen } from "../../i18n/index.ts";

export const BorrarPesoMedida = ({
    publicar,
    pesoMedida,
}: {
    pesoMedida: PesoMedida;
    publicar: EmitirEvento;
}) => {
    const t = useTAlmacen();
    const borrar_ = useCallback(async () => {
        await deletePesoMedida(pesoMedida.id);
        publicar("peso_medida_borrada", pesoMedida.id);
    }, [publicar, pesoMedida]);

    const cancelar_ = useCallback(() => publicar("borrado_cancelado"), [publicar]);

    const [borrar, cancelar] = useForm(borrar_, cancelar_);

    return (
        <QModalConfirmacion
            nombre="borrarPesoMedida"
            abierto={true}
            titulo={t("peso_medida.borrarUnidad")}
            mensaje={t("peso_medida.estaSeguroDeQueDeseaBorrar", { id: pesoMedida.id })}
            onCerrar={cancelar}
            onAceptar={borrar}
        />
    );
};

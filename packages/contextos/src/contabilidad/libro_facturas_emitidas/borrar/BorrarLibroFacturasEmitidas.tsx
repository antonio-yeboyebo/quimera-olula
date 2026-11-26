import { QModalConfirmacion } from "@olula/componentes/moleculas/qmodalconfirmacion.tsx";
import { EmitirEvento } from "@olula/lib/diseño.js";
import { useForm } from "@olula/lib/useForm.js";
import { useCallback } from "react";
import { LibroFacturasEmitidas } from "../diseño.ts";
import { etiquetaLibroFacturasEmitidas } from "../dominio.ts";
import { deleteLibroFacturasEmitidas } from "../infraestructura.ts";
import { useTContabilidad } from "../../i18n/index.ts";

export const BorrarLibroFacturasEmitidas = ({
    publicar,
    informe,
}: {
    informe: LibroFacturasEmitidas;
    publicar: EmitirEvento;
}) => {
    const t = useTContabilidad();
    const borrar_ = useCallback(async () => {
        await deleteLibroFacturasEmitidas(informe.id);
        publicar("informe_borrado", informe);
    }, [publicar, informe]);

    const cancelar_ = useCallback(
        () => publicar("borrado_cancelado"),
        [publicar]
    );

    const [borrar, cancelar] = useForm(borrar_, cancelar_);

    return (
        <QModalConfirmacion
            nombre="borrarLibroFacturasEmitidas"
            abierto={true}
            titulo={t("libro_facturas_emitidas.borrarInforme")}
            mensaje={t("libro_facturas_emitidas.confirmaBorrarInformeSoloSeBorra", { informe: etiquetaLibroFacturasEmitidas(informe) })}
            onCerrar={cancelar}
            onAceptar={borrar}
        />
    );
};

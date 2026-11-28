import { QModalConfirmacion } from "@olula/componentes/moleculas/qmodalconfirmacion.tsx";
import { EmitirEvento } from "@olula/lib/diseño.js";
import { useForm } from "@olula/lib/useForm.js";
import { useCallback } from "react";
import { LibroFacturasRecibidas } from "../diseño.ts";
import { etiquetaLibroFacturasRecibidas } from "../dominio.ts";
import { deleteLibroFacturasRecibidas } from "../infraestructura.ts";
import { useTContabilidad } from "../../i18n/index.ts";

export const BorrarLibroFacturasRecibidas = ({
    publicar,
    informe,
}: {
    informe: LibroFacturasRecibidas;
    publicar: EmitirEvento;
}) => {
    const t = useTContabilidad();
    const borrar_ = useCallback(async () => {
        await deleteLibroFacturasRecibidas(informe.id);
        publicar("informe_borrado", informe);
    }, [publicar, informe]);

    const cancelar_ = useCallback(
        () => publicar("borrado_cancelado"),
        [publicar]
    );

    const [borrar, cancelar] = useForm(borrar_, cancelar_);

    return (
        <QModalConfirmacion
            nombre="borrarLibroFacturasRecibidas"
            abierto={true}
            titulo={t("libro_facturas_recibidas.borrarInforme")}
            mensaje={t("libro_facturas_recibidas.confirmaBorrarInformeSoloSeBorra", { informe: etiquetaLibroFacturasRecibidas(informe) })}
            onCerrar={cancelar}
            onAceptar={borrar}
        />
    );
};

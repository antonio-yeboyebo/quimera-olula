import { QModalConfirmacion } from "@olula/componentes/moleculas/qmodalconfirmacion.tsx";
import { EmitirEvento } from "@olula/lib/diseño.js";
import { useForm } from "@olula/lib/useForm.js";
import { useCallback } from "react";
import { FichaInforme, PestañaInforme } from "../diseño.ts";
import { etiquetaFichaInforme } from "../dominio.ts";
import { deleteFichaInforme } from "../infraestructura.ts";
import { useTComun } from "../../i18n/index.ts";

export const BorrarInforme = ({
    pestaña,
    ficha,
    publicar,
}: {
    pestaña: PestañaInforme;
    ficha: FichaInforme;
    publicar: EmitirEvento;
}) => {
    const t = useTComun();
    const borrar_ = useCallback(async () => {
        await deleteFichaInforme(pestaña, ficha.id);
        publicar("informe_borrado", ficha);
    }, [pestaña, ficha, publicar]);

    const cancelar_ = useCallback(() => publicar("borrado_cancelado"), [publicar]);

    const [borrar, cancelar] = useForm(borrar_, cancelar_);

    return (
        <QModalConfirmacion
            nombre={`borrarInforme-${pestaña.clave}`}
            abierto={true}
            titulo={t("informeDocumentos.borrarInforme")}
            mensaje={t("informeDocumentos.confirmaBorrarPestanaSoloSeBorran", { pestaña: etiquetaFichaInforme(pestaña, ficha) })}
            onCerrar={cancelar}
            onAceptar={borrar}
        />
    );
};

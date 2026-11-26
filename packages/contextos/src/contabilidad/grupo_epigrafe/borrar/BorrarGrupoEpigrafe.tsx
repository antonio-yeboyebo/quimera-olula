import { QModalConfirmacion } from "@olula/componentes/moleculas/qmodalconfirmacion.tsx";
import { EmitirEvento } from "@olula/lib/diseño.js";
import { useForm } from "@olula/lib/useForm.js";
import { useCallback } from "react";
import { GrupoEpigrafe } from "../diseño.ts";
import { etiquetaGrupoEpigrafe } from "../dominio.ts";
import { deleteGrupoEpigrafe } from "../infraestructura.ts";
import { useTContabilidad } from "../../i18n/index.ts";

export const BorrarGrupoEpigrafe = ({
    publicar,
    grupo,
}: {
    grupo: GrupoEpigrafe;
    publicar: EmitirEvento;
}) => {
    const t = useTContabilidad();
    const borrar_ = useCallback(async () => {
        await deleteGrupoEpigrafe(grupo.id);
        publicar("grupo_epigrafe_borrado", grupo);
    }, [publicar, grupo]);

    const cancelar_ = useCallback(
        () => publicar("borrado_cancelado"),
        [publicar]
    );

    const [borrar, cancelar] = useForm(borrar_, cancelar_);

    return (
        <QModalConfirmacion
            nombre="borrarGrupoEpigrafe"
            abierto={true}
            titulo={t("grupo_epigrafe.borrarGrupo")}
            mensaje={t("grupo_epigrafe.confirmaBorrarGrupoSoloEsPosible", { grupo: etiquetaGrupoEpigrafe(grupo) })}
            onCerrar={cancelar}
            onAceptar={borrar}
        />
    );
};

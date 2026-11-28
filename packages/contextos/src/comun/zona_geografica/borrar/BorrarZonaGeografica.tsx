import { QModalConfirmacion } from "@olula/componentes/moleculas/qmodalconfirmacion.tsx";
import { EmitirEvento } from "@olula/lib/diseño.js";
import { useForm } from "@olula/lib/useForm.js";
import { useCallback } from "react";
import { ZonaGeografica } from "../diseño.ts";
import { etiquetaZonaGeografica } from "../dominio.ts";
import { deleteZonaGeografica } from "../infraestructura.ts";
import { useTComun } from "../../i18n/index.ts";

export const BorrarZonaGeografica = ({ publicar, zonaGeografica }: { zonaGeografica: ZonaGeografica; publicar: EmitirEvento }) => {
    const t = useTComun();
    const borrar_ = useCallback(async () => {
        await deleteZonaGeografica(zonaGeografica.id);
        publicar("zona_geografica_borrado", zonaGeografica);
    }, [publicar, zonaGeografica]);

    const cancelar_ = useCallback(() => publicar("borrado_cancelado"), [publicar]);

    const [borrar, cancelar] = useForm(borrar_, cancelar_);

    return (
        <QModalConfirmacion
            nombre="borrarZonaGeografica"
            abierto={true}
            titulo={t("zonaGeografica.borrarZonaGeografica")}
            mensaje={t("zonaGeografica.confirmaBorrarZonageograficaNoSePuede", { zonaGeografica: etiquetaZonaGeografica(zonaGeografica) })}
            onCerrar={cancelar}
            onAceptar={borrar}
        />
    );
};

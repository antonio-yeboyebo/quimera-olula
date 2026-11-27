import { QModalConfirmacion } from "@olula/componentes/moleculas/qmodalconfirmacion.tsx";
import { EmitirEvento } from "@olula/lib/diseño.js";
import { useForm } from "@olula/lib/useForm.js";
import { useCallback } from "react";
import { Pais } from "../diseño.ts";
import { etiquetaPais } from "../dominio.ts";
import { deletePais } from "../infraestructura.ts";
import { useTComun } from "../../i18n/index.ts";

export const BorrarPais = ({ publicar, pais }: { pais: Pais; publicar: EmitirEvento }) => {
    const t = useTComun();
    const borrar_ = useCallback(async () => {
        await deletePais(pais.id);
        publicar("pais_borrado", pais);
    }, [publicar, pais]);

    const cancelar_ = useCallback(() => publicar("borrado_cancelado"), [publicar]);

    const [borrar, cancelar] = useForm(borrar_, cancelar_);

    return (
        <QModalConfirmacion
            nombre="borrarPais"
            abierto={true}
            titulo={t("paises.borrarPais")}
            mensaje={t("paises.confirmaBorrarPaisNoSePuede", { pais: etiquetaPais(pais) })}
            onCerrar={cancelar}
            onAceptar={borrar}
        />
    );
};

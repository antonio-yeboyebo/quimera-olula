import { QModalConfirmacion } from "@olula/componentes/moleculas/qmodalconfirmacion.tsx";
import { EmitirEvento } from "@olula/lib/diseño.js";
import { useForm } from "@olula/lib/useForm.js";
import { useCallback } from "react";
import { Ejercicio } from "../diseño.ts";
import { mensajeReabrir } from "../dominio.ts";
import { patchDeshacerCierre } from "../infraestructura.ts";
import { useTContabilidad } from "../../i18n/index.ts";

/** «Reabrir Ejercicio»: avisa de lo que se borra y pide confirmación. */
export const DeshacerCierreEjercicio = ({
    ejercicio,
    ejercicios,
    publicar,
}: {
    ejercicio: Ejercicio;
    ejercicios: Ejercicio[];
    publicar: EmitirEvento;
}) => {
    const t = useTContabilidad();
    const aceptar_ = useCallback(async () => {
        await patchDeshacerCierre(ejercicio.id);
        publicar("cierre_deshecho");
    }, [ejercicio.id, publicar]);
    const [aceptar, cancelar] = useForm(aceptar_, () => publicar("cancelado"));

    return (
        <QModalConfirmacion
            nombre="reabrirEjercicio"
            abierto={true}
            titulo={t("ejercicio.reabrirEjercicio")}
            mensaje={mensajeReabrir(ejercicio, ejercicios)}
            onCerrar={cancelar}
            onAceptar={aceptar}
        />
    );
};

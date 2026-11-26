import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { QInput } from "@olula/componentes/atomos/qinput.tsx";
import { QModal } from "@olula/componentes/index.js";
import { EmitirEvento } from "@olula/lib/diseño.js";
import { useFocus } from "@olula/lib/useFocus.ts";
import { useForm } from "@olula/lib/useForm.js";
import { useModelo } from "@olula/lib/useModelo.ts";
import { useCallback, useMemo } from "react";
import { postGrupoEpigrafe } from "../infraestructura.ts";
import {
    metaNuevoGrupoEpigrafe,
    nuevoGrupoEpigrafeInicial,
} from "./crear.ts";
import { useTContabilidad } from "../../i18n/index.ts";

export const CrearGrupoEpigrafe = ({
    publicar,
    ejercicioId,
}: {
    publicar: EmitirEvento;
    ejercicioId: string;
}) => {
    const t = useTContabilidad();
    const inicial = useMemo(
        () => nuevoGrupoEpigrafeInicial(ejercicioId),
        [ejercicioId]
    );

    const { modelo: grupo, uiProps, valido } = useModelo(
        metaNuevoGrupoEpigrafe,
        inicial
    );

    const crear_ = useCallback(async () => {
        const id = await postGrupoEpigrafe(grupo);
        publicar("grupo_epigrafe_creado", id);
    }, [grupo, publicar]);

    const cancelar_ = useCallback(
        () => publicar("alta_de_grupo_epigrafe_cancelada"),
        [publicar]
    );

    const [crear, cancelar] = useForm(crear_, cancelar_);

    const focus = useFocus();

    return (
        <QModal
            abierto={true}
            nombre="crearGrupoEpigrafe"
            titulo={t("grupo_epigrafe.nuevoGrupo")}
            onCerrar={cancelar}
        >
            <div className="CrearGrupoEpigrafe">
                <quimera-formulario>
                    <QInput
                        label={t("grupo_epigrafe.ejercicio")}
                        nombre="ejercicioId"
                        valor={grupo.ejercicioId}
                        soloLectura
                    />
                    <QInput label={t("grupo_epigrafe.codigo")} {...uiProps("codigo")} ref={focus} />
                    <QInput label={t("grupo_epigrafe.descripcion")} {...uiProps("descripcion")} />
                </quimera-formulario>

                <div className="botones maestro-botones">
                    <QBoton onClick={crear} deshabilitado={!valido}>
                        {t("grupo_epigrafe.crear")}
                    </QBoton>
                </div>
            </div>
        </QModal>
    );
};

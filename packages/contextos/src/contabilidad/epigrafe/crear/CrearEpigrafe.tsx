import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { QInput } from "@olula/componentes/atomos/qinput.tsx";
import { QModal } from "@olula/componentes/index.js";
import { EmitirEvento } from "@olula/lib/diseño.js";
import { useFocus } from "@olula/lib/useFocus.ts";
import { useForm } from "@olula/lib/useForm.js";
import { useModelo } from "@olula/lib/useModelo.ts";
import { useCallback, useMemo } from "react";
import { GrupoEpigrafeSelector } from "#/contabilidad/comun/componentes/GrupoEpigrafeSelector.tsx";
import { postEpigrafe } from "../infraestructura.ts";
import { metaNuevoEpigrafe, nuevoEpigrafeInicial } from "./crear.ts";
import { useTContabilidad } from "../../i18n/index.ts";

export const CrearEpigrafe = ({
    publicar,
    ejercicioId,
}: {
    publicar: EmitirEvento;
    ejercicioId: string;
}) => {
    const t = useTContabilidad();
    const inicial = useMemo(
        () => nuevoEpigrafeInicial(ejercicioId),
        [ejercicioId]
    );

    const form = useModelo(metaNuevoEpigrafe, inicial);
    const { modelo: epigrafe, uiProps, valido } = form;

    const crear_ = useCallback(async () => {
        const id = await postEpigrafe(epigrafe);
        publicar("epigrafe_creado", id);
    }, [epigrafe, publicar]);

    const cancelar_ = useCallback(
        () => publicar("alta_de_epigrafe_cancelada"),
        [publicar]
    );

    const [crear, cancelar] = useForm(crear_, cancelar_);

    const focus = useFocus();

    return (
        <QModal
            abierto={true}
            nombre="crearEpigrafe"
            titulo={t("epigrafe.nuevoSubgrupo")}
            onCerrar={cancelar}
        >
            <div className="CrearEpigrafe">
                <quimera-formulario>
                    <QInput
                        label={t("epigrafe.ejercicio")}
                        nombre="ejercicioId"
                        valor={epigrafe.ejercicioId}
                        soloLectura
                    />
                    <QInput label={t("epigrafe.codigo")} {...uiProps("codigo")} ref={focus} />
                    <QInput label={t("epigrafe.descripcion")} {...uiProps("descripcion")} />
                    <GrupoEpigrafeSelector
                        ejercicioId={ejercicioId}
                        {...uiProps("grupoId")}
                        onChange={(op) =>
                            form.set(
                                { ...epigrafe, grupoId: op?.valor ?? "" },
                                "grupoId",
                            )
                        }
                    />
                </quimera-formulario>

                <div className="botones maestro-botones">
                    <QBoton onClick={crear} deshabilitado={!valido}>
                        {t("epigrafe.crear")}
                    </QBoton>
                </div>
            </div>
        </QModal>
    );
};

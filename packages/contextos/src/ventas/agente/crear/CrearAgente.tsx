import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { QInput } from "@olula/componentes/atomos/qinput.tsx";
import { QModal } from "@olula/componentes/index.js";
import { EmitirEvento } from "@olula/lib/diseño.js";
import { useFocus } from "@olula/lib/useFocus.ts";
import { useForm } from "@olula/lib/useForm.js";
import { useModelo } from "@olula/lib/useModelo.ts";
import { useCallback, useMemo } from "react";
import { postAgente } from "../infraestructura.js";
import { metaNuevoAgente, nuevoAgenteInicial } from "./crear.js";
import { useTVentas } from "../../i18n/index.ts";

export const CrearAgente = ({
    publicar,
}: {
    publicar: EmitirEvento;
}) => {
    const t = useTVentas();
    const inicial = useMemo(nuevoAgenteInicial, []);

    const { modelo: agente, uiProps, valido } = useModelo(
        metaNuevoAgente,
        inicial
    );

    const crear_ = useCallback(
        async () => {
            const id = await postAgente(agente);
            publicar("agente_creado", id);
        },
        [agente, publicar]
    );

    const cancelar_ = useCallback(
        () => publicar("alta_de_agente_cancelada"),
        [publicar]
    );

    const [crear, cancelar] = useForm(crear_, cancelar_);

    const focus = useFocus();

    return (
        <QModal
            abierto={true}
            nombre="crearAgente"
            titulo={t("agente.maestro.nuevo")}
            onCerrar={cancelar}
        >
            <div className="CrearAgente">
                <quimera-formulario>
                    <QInput label={t("agente.campos.nombrePila")} {...uiProps("nombre_pila")} ref={focus} />
                    <QInput label={t("agente.campos.apellidos")} {...uiProps("apellidos")} />
                    <QInput label={t("agente.campos.idFiscal")} {...uiProps("id_fiscal")} />
                    <QInput label={t("agente.campos.comision")} {...uiProps("por_comision")} />
                    <QInput label={t("agente.campos.telefono")} {...uiProps("telefono")} />
                    <QInput label={t("agente.campos.email")} {...uiProps("email")} />
                </quimera-formulario>

                <div className="botones maestro-botones">
                    <QBoton onClick={crear} deshabilitado={!valido}>
                        Crear
                    </QBoton>
                    <QBoton tipo="reset" variante="texto" onClick={cancelar}>
                        Cancelar
                    </QBoton>
                </div>
            </div>
        </QModal>
    );
};

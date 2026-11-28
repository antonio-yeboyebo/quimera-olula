import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { QInput } from "@olula/componentes/atomos/qinput.tsx";
import { QModal } from "@olula/componentes/index.js";
import { EmitirEvento } from "@olula/lib/diseño.js";
import { useFocus } from "@olula/lib/useFocus.ts";
import { useForm } from "@olula/lib/useForm.js";
import { useModelo } from "@olula/lib/useModelo.ts";
import { useCallback, useMemo } from "react";
import { postCuenta } from "../infraestructura.ts";
import { metaNuevaCuenta, nuevaCuentaInicial } from "./crear.ts";
import { useTContabilidad } from "../../i18n/index.ts";

export const CrearCuenta = ({
    publicar,
    ejercicioId,
}: {
    publicar: EmitirEvento;
    ejercicioId: string;
}) => {
    // Memoizado: useModelo reinicia el formulario cada vez que cambia la
    // identidad del inicial, así que pasarlo en línea entra en bucle.
    const t = useTContabilidad();
    const inicial = useMemo(
        () => nuevaCuentaInicial(ejercicioId),
        [ejercicioId]
    );

    const { modelo: cuenta, uiProps, valido } = useModelo(
        metaNuevaCuenta,
        inicial
    );

    const crear_ = useCallback(async () => {
        const id = await postCuenta(cuenta);
        publicar("cuenta_creada", id);
    }, [cuenta, publicar]);

    const cancelar_ = useCallback(
        () => publicar("alta_de_cuenta_cancelada"),
        [publicar]
    );

    const [crear, cancelar] = useForm(crear_, cancelar_);

    const focus = useFocus();

    return (
        <QModal
            abierto={true}
            nombre="crearCuenta"
            titulo={t("cuenta.nuevaCuentaPgc")}
            onCerrar={cancelar}
        >
            <div className="CrearCuenta">
                <quimera-formulario>
                    <QInput
                        label={t("cuenta.ejercicio")}
                        nombre="ejercicioId"
                        valor={cuenta.ejercicioId}
                        soloLectura
                    />
                    <QInput
                        label={t("cuenta.codigoEpigrafe")}
                        {...uiProps("codigoEpigrafe")}
                        ref={focus}
                    />
                    <QInput label={t("cuenta.codigoCuenta")} {...uiProps("codigo")} />
                    <QInput label={t("cuenta.descripcion")} {...uiProps("nombre")} />
                </quimera-formulario>

                <div className="botones maestro-botones">
                    <QBoton onClick={crear} deshabilitado={!valido}>
                        {t("cuenta.crear")}
                    </QBoton>
                </div>
            </div>
        </QModal>
    );
};

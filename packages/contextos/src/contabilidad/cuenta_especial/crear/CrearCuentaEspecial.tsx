import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { QInput } from "@olula/componentes/atomos/qinput.tsx";
import { QModal } from "@olula/componentes/index.js";
import { EmitirEvento } from "@olula/lib/diseño.js";
import { useFocus } from "@olula/lib/useFocus.ts";
import { useForm } from "@olula/lib/useForm.js";
import { useModelo } from "@olula/lib/useModelo.ts";
import { useCallback, useMemo } from "react";
import { postCuentaEspecial } from "../infraestructura.ts";
import {
    metaNuevaCuentaEspecial,
    nuevaCuentaEspecialInicial,
} from "./crear.ts";
import { useTContabilidad } from "../../i18n/index.ts";

export const CrearCuentaEspecial = ({
    publicar,
}: {
    publicar: EmitirEvento;
}) => {
    const t = useTContabilidad();
    const inicial = useMemo(nuevaCuentaEspecialInicial, []);

    const { modelo: cuentaEspecial, uiProps, valido } = useModelo(
        metaNuevaCuentaEspecial,
        inicial
    );

    const crear_ = useCallback(async () => {
        const id = await postCuentaEspecial(cuentaEspecial);
        publicar("cuenta_especial_creada", id);
    }, [cuentaEspecial, publicar]);

    const cancelar_ = useCallback(
        () => publicar("alta_de_cuenta_especial_cancelada"),
        [publicar]
    );

    const [crear, cancelar] = useForm(crear_, cancelar_);

    const focus = useFocus();

    return (
        <QModal
            abierto={true}
            nombre="crearCuentaEspecial"
            titulo={t("cuenta_especial.nuevaCuentaEspecial")}
            onCerrar={cancelar}
        >
            <div className="CrearCuentaEspecial">
                <quimera-formulario>
                    <QInput label={t("cuenta_especial.codigo")} {...uiProps("id")} ref={focus} />
                    <QInput label={t("cuenta_especial.descripcion")} {...uiProps("descripcion")} />
                    <QInput label={t("cuenta_especial.cuenta")} {...uiProps("codigoCuenta")} />
                    <QInput label={t("cuenta_especial.subcuenta")} {...uiProps("codigoSubcuenta")} />
                </quimera-formulario>

                <div className="botones maestro-botones">
                    <QBoton onClick={crear} deshabilitado={!valido}>
                        {t("cuenta_especial.crear")}
                    </QBoton>
                </div>
            </div>
        </QModal>
    );
};

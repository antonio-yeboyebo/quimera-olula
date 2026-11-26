import { QInput } from "@olula/componentes/atomos/qinput.tsx";
import { FormModelo } from "@olula/lib/dominio.js";
import { Cuenta } from "../diseño.ts";
import { tContabilidad } from "../../i18n/index.ts";

interface TabGeneralProps {
    form: FormModelo;
    cuenta: Cuenta;
}

export const TabGeneral = ({ form, cuenta }: TabGeneralProps) => {

    const { uiProps } = form;

    return (
        <div className="TabGeneral">
            <quimera-formulario>
                <QInput
                    label={tContabilidad("cuenta.codigo")}
                    nombre="codigo"
                    valor={cuenta.codigo}
                    soloLectura
                />
                <QInput label={tContabilidad("cuenta.descripcion")} {...uiProps("nombre")} />
                <QInput
                    label={tContabilidad("cuenta.epigrafe")}
                    nombre="codigo_epigrafe"
                    valor={cuenta.codigoEpigrafe ?? ""}
                    soloLectura
                />
                <QInput
                    label={tContabilidad("cuenta.ejercicio")}
                    nombre="ejercicio_id"
                    valor={cuenta.ejercicioId}
                    soloLectura
                />
                <QInput
                    label={tContabilidad("cuenta.cuentaEspecial")}
                    nombre="cuenta_especial_id"
                    valor={cuenta.cuentaEspecialId}
                    soloLectura
                />
            </quimera-formulario>
        </div>
    );
};

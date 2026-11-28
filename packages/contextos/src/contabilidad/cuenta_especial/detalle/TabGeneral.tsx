import { QInput } from "@olula/componentes/atomos/qinput.tsx";
import { FormModelo } from "@olula/lib/dominio.js";
import { CuentaEspecial } from "../diseño.ts";
import { tContabilidad } from "../../i18n/index.ts";

interface TabGeneralProps {
    form: FormModelo;
    cuentaEspecial: CuentaEspecial;
}

export const TabGeneral = ({ form, cuentaEspecial }: TabGeneralProps) => {

    const { uiProps } = form;

    return (
        <div className="TabGeneral">
            <quimera-formulario>
                <QInput
                    label={tContabilidad("cuenta_especial.codigo")}
                    nombre="id"
                    valor={cuentaEspecial.id}
                    soloLectura
                />
                <QInput label={tContabilidad("cuenta_especial.descripcion")} {...uiProps("descripcion")} />
                <QInput label={tContabilidad("cuenta_especial.cuenta")} {...uiProps("codigoCuenta")} />
                <QInput label={tContabilidad("cuenta_especial.subcuenta")} {...uiProps("codigoSubcuenta")} />
            </quimera-formulario>
        </div>
    );
};

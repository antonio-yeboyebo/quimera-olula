import { QInput } from "@olula/componentes/atomos/qinput.tsx";
import { FormModelo } from "@olula/lib/dominio.js";
import { Subcuenta } from "../diseño.ts";
import { tContabilidad } from "../../i18n/index.ts";

interface TabGeneralProps {
    form: FormModelo;
    subcuenta: Subcuenta;
}

export const TabGeneral = ({ form, subcuenta }: TabGeneralProps) => {

    const { uiProps } = form;

    return (
        <div className="TabGeneral">
            <quimera-formulario>
                <QInput
                    label={tContabilidad("subcuenta.codigo")}
                    nombre="codigo"
                    valor={subcuenta.codigo}
                    soloLectura
                />
                <QInput label={tContabilidad("subcuenta.descripcion")} {...uiProps("nombre")} />
                <QInput
                    label={tContabilidad("subcuenta.cuentaPlan")}
                    nombre="codigo_cuenta"
                    valor={subcuenta.codigoCuenta}
                    soloLectura
                />
                <QInput
                    label={tContabilidad("subcuenta.ejercicio")}
                    nombre="ejercicio_id"
                    valor={subcuenta.ejercicioId}
                    soloLectura
                />
                <QInput
                    label={tContabilidad("subcuenta.grupoDeIva")}
                    nombre="impuesto_id"
                    valor={subcuenta.impuestoId}
                    soloLectura
                />
                <QInput
                    label={tContabilidad("subcuenta.iVA")}
                    nombre="iva"
                    valor={String(subcuenta.iva)}
                    soloLectura
                />
                <QInput
                    label={tContabilidad("subcuenta.rEquivalencia")}
                    nombre="recargo"
                    valor={String(subcuenta.recargo)}
                    soloLectura
                />
                <QInput
                    label={tContabilidad("subcuenta.cuentaEspecial")}
                    nombre="cuenta_especial_id"
                    valor={subcuenta.cuentaEspecialId}
                    soloLectura
                />
            </quimera-formulario>
        </div>
    );
};

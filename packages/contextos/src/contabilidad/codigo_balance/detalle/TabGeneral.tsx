import { QInput } from "@olula/componentes/atomos/qinput.tsx";
import { FormModelo } from "@olula/lib/dominio.js";
import { CodigoBalance } from "../diseño.ts";
import { CamposCodigoBalance } from "./CamposCodigoBalance.tsx";
import { tContabilidad } from "../../i18n/index.ts";

export const TabGeneral = ({
    form,
    codigoBalance,
}: {
    form: FormModelo;
    codigoBalance: CodigoBalance;
}) => (
    <div className="TabGeneral">
        <quimera-formulario>
            <QInput label={tContabilidad("codigo_balance.codigo")} nombre="id" valor={codigoBalance.id} soloLectura />
            <CamposCodigoBalance uiProps={form.uiProps} />
        </quimera-formulario>
    </div>
);

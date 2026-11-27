import { CuentaBancariaSelect } from "#/tesoreria/comun/componentes/cuenta_bancaria_select.tsx";
import { QCheckbox } from "@olula/componentes/atomos/qcheckbox.tsx";
import { QInput } from "@olula/componentes/atomos/qinput.tsx";
import { QSelect } from "@olula/componentes/atomos/qselect.tsx";
import { FormModelo } from "@olula/lib/dominio.js";
import { opcionesGeneraRecibos, opcionesTipoPagoFacturae } from "../dominio.ts";
import { tTesoreria } from "../../i18n/index.ts";

type UiProps = FormModelo["uiProps"];

/** Campos del grupo «Forma de Pago» de Eneboo `formaspago.ui`. */
export const CamposFormaPago = ({ uiProps }: { uiProps: UiProps }) => (
    <>
        <QInput label={tTesoreria("forma_pago.descripcion")} {...uiProps("descripcion")} />
        <QSelect
            label={tTesoreria("forma_pago.generarRecibosComo")}
            opciones={opcionesGeneraRecibos}
            {...uiProps("generaRecibos")}
        />
        <CuentaBancariaSelect label={tTesoreria("forma_pago.cuenta")} {...uiProps("cuentaId")} />
        <QCheckbox label={tTesoreria("forma_pago.pagoPorDomiciliacion")} {...uiProps("domiciliado")} />
        <QSelect
            label={tTesoreria("forma_pago.pagoFacturaE")}
            opciones={opcionesTipoPagoFacturae}
            {...uiProps("tipoPagoFacturae")}
        />
    </>
);

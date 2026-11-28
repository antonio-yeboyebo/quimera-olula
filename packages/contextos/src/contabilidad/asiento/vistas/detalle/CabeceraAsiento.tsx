import { QInput } from "@olula/componentes/atomos/qinput.tsx";
import { formatearFechaDate } from "@olula/lib/dominio.ts";
import { Asiento } from "../../diseño.ts";
import "./CabeceraAsiento.css";
import { tContabilidad } from "../../../i18n/index.ts";

/** Cabecera del asiento. `sinDatosDocumento` quita tipo de documento,
 * documento y concepto: en la pestaña Contabilidad de una factura sobran,
 * porque el documento es la propia factura. */
export const CabeceraAsiento = ({
    asiento,
    sinDatosDocumento = false,
}: {
    asiento: Asiento;
    sinDatosDocumento?: boolean;
}) => (
    <div className="CabeceraAsiento">
        <quimera-formulario>
            <QInput label={tContabilidad("asiento.ejercicio")} nombre="ejercicio" valor={asiento.ejercicioId} soloLectura />
            <QInput label={tContabilidad("asiento.numero")} nombre="numero" valor={String(asiento.numero)} soloLectura />
            <QInput
                label={tContabilidad("asiento.fecha")}
                nombre="fecha"
                valor={formatearFechaDate(asiento.fecha)}
                soloLectura
            />
            <QInput
                label={tContabilidad("asiento.origen")}
                nombre="manual"
                valor={asiento.manual ? tContabilidad("asiento.manual") : tContabilidad("asiento.automatico")}
                soloLectura
            />
            {!sinDatosDocumento && (
                <>
                    <QInput
                        label={tContabilidad("asiento.tipoDeDocumento")}
                        nombre="tipoDocumento"
                        valor={asiento.tipoDocumento}
                        soloLectura
                    />
                    <QInput
                        label={tContabilidad("asiento.documento")}
                        nombre="documento"
                        valor={asiento.documento}
                        soloLectura
                    />
                    <QInput label={tContabilidad("asiento.concepto")} nombre="concepto" valor={asiento.concepto} soloLectura />
                </>
            )}
        </quimera-formulario>
    </div>
);

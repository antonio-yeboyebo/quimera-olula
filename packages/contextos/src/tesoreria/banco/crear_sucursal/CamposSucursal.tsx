import { PaisSelector } from "#/comun/componentes/pais/pais.tsx";
import { QInput } from "@olula/componentes/atomos/qinput.tsx";
import { QTextArea } from "@olula/componentes/atomos/qtextarea.tsx";
import { FormModelo } from "@olula/lib/dominio.js";
import { tTesoreria } from "../../i18n/index.ts";

type UiProps = FormModelo["uiProps"];

/** Campos de Eneboo `sucursales.mtd`. */
export const CamposSucursal = ({ uiProps }: { uiProps: UiProps }) => (
    <>
        <QInput label={tTesoreria("banco.nDeOficina")} {...uiProps("agencia")} />
        <QInput label={tTesoreria("banco.nombre")} {...uiProps("nombre")} />
        <QInput label={tTesoreria("banco.direccion")} {...uiProps("direccion")} />
        <QInput label={tTesoreria("banco.codigoPostal")} {...uiProps("codigoPostal")} />
        <QInput label={tTesoreria("banco.apdoDeCorreos")} {...uiProps("apartado")} />
        <QInput label={tTesoreria("banco.poblacion")} {...uiProps("poblacion")} />
        <QInput label={tTesoreria("banco.provincia")} {...uiProps("provincia")} />
        <PaisSelector label={tTesoreria("banco.pais")} {...uiProps("paisId")} />
        <QInput label={tTesoreria("banco.telefono")} {...uiProps("telefono")} />
        <QInput label={tTesoreria("banco.fax")} {...uiProps("fax")} />
        <QInput label={tTesoreria("banco.contacto")} {...uiProps("contacto")} />
        <QTextArea label={tTesoreria("banco.observaciones")} {...uiProps("observaciones")} />
    </>
);

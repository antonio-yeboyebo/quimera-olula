import { Proveedor } from "#/compras/comun/componentes/proveedor.tsx";
import { QInput } from "@olula/componentes/atomos/qinput.tsx";
import { FormModelo } from "@olula/lib/dominio.js";
import { tTesoreria } from "../../i18n/index.ts";

type UiProps = FormModelo["uiProps"];

/** Campos del grupo «Banco» de Eneboo `bancos.ui`. */
export const CamposBanco = ({
    uiProps,
    nombreProveedor = "",
}: {
    uiProps: UiProps;
    nombreProveedor?: string;
}) => (
    <>
        <QInput label={tTesoreria("banco.nombre")} {...uiProps("nombre")} />
        <Proveedor label={tTesoreria("banco.acreedor")} descripcion={nombreProveedor} {...uiProps("proveedorId")} />
        <QInput label={tTesoreria("banco.bicPorDefecto")} {...uiProps("bicDefecto")} />
    </>
);

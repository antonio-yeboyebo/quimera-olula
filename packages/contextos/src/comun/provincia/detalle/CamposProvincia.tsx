import { PaisSelector } from "#/comun/componentes/pais/pais.tsx";
import { QInput } from "@olula/componentes/atomos/qinput.tsx";
import { FormModelo } from "@olula/lib/dominio.js";
import { tComun } from "../../i18n/index.ts";

type UiProps = FormModelo["uiProps"];

/** Campos de Eneboo `provincias.ui`. */
export const CamposProvincia = ({
    uiProps,
    nombrePais = "",
}: {
    uiProps: UiProps;
    nombrePais?: string;
}) => (
    <>
        <QInput label={tComun("provincia.provincia")} {...uiProps("nombre")} />
        <QInput label={tComun("provincia.codigo")} {...uiProps("codigo")} />
        <PaisSelector label={tComun("provincia.pais")} descripcion={nombrePais} {...uiProps("paisId")} />
    </>
);

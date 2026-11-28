import { FechaInforme } from "#/contabilidad/comun/componentes/FechaInforme.tsx";
import { FilaFormulario } from "#/contabilidad/comun/componentes/FilaFormulario.tsx";
import { QSelect } from "@olula/componentes/index.js";
import { QCheckbox } from "@olula/componentes/atomos/qcheckbox.tsx";
import { QInput } from "@olula/componentes/atomos/qinput.tsx";
import { FormModelo } from "@olula/lib/dominio.js";
import { useFocus } from "@olula/lib/useFocus.ts";
import { CampoInforme, FichaInforme, PestañaInforme } from "../diseño.ts";
import { tComun } from "../../i18n/index.ts";

const Campo = ({
    campo,
    uiProps,
    ficha,
}: {
    campo: CampoInforme;
    uiProps: FormModelo["uiProps"];
    ficha: FichaInforme;
}) => {
    const props = uiProps(campo.id);
    const soloLectura = campo.activo ? !campo.activo(ficha) : false;

    switch (campo.tipo) {
        case "casilla":
            return <QCheckbox label={campo.label} {...props} soloLectura={soloLectura} />;
        case "fecha":
            return <FechaInforme label={campo.label} {...props} deshabilitado={soloLectura || props.deshabilitado} />;
        case "opciones":
            return (
                <QSelect
                    label={campo.label}
                    {...props}
                    opciones={campo.opciones ?? []}
                    soloLectura={soloLectura}
                />
            );
        case "propio":
            return campo.Control ? (
                <campo.Control label={campo.label} {...props} soloLectura={soloLectura} />
            ) : null;
        default:
            return <QInput label={campo.label} {...props} soloLectura={soloLectura} opcional />;
    }
};

/** Criterios de una ficha, iguales en el alta y en la pestaña Criterios: la
 * descripción y después las filas de la pestaña. */
export const CamposInforme = ({
    pestaña,
    uiProps,
    ficha,
    refDescripcion,
}: {
    pestaña: PestañaInforme;
    uiProps: FormModelo["uiProps"];
    ficha: FichaInforme;
    refDescripcion?: ReturnType<typeof useFocus>;
}) => (
    <>
        <QInput label={tComun("informeDocumentos.descripcion")} {...uiProps("descripcion")} ref={refDescripcion} />
        {pestaña.filas.map((fila, indice) => (
            <FilaFormulario key={indice}>
                {fila.map((campo) => (
                    <Campo key={campo.id} campo={campo} uiProps={uiProps} ficha={ficha} />
                ))}
            </FilaFormulario>
        ))}
    </>
);

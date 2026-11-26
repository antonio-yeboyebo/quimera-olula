import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { QInput } from "@olula/componentes/atomos/qinput.tsx";
import { QSelect } from "@olula/componentes/atomos/qselect.tsx";
import { QModal } from "@olula/componentes/index.js";
import { EmitirEvento } from "@olula/lib/diseño.js";
import { MetaModelo } from "@olula/lib/dominio.js";
import { useForm } from "@olula/lib/useForm.js";
import { useModelo } from "@olula/lib/useModelo.ts";
import { useCallback, useMemo } from "react";
import { Ejercicio, GenerarPgc } from "../diseño.ts";
import { etiquetaEjercicio } from "../dominio.ts";
import { patchGenerarPgc } from "../infraestructura.ts";
import { useTContabilidad } from "../../i18n/index.ts";

const metaGenerarPgc: MetaModelo<GenerarPgc> = {
    campos: {
        ejercicioOrigenId: { requerido: false, tipo: "selector" },
        digitosSubcuenta: { requerido: true, tipo: "numero" },
    },
};

/** Botón «PGC» de Eneboo: copiar el plan de otro ejercicio o generar el 2008. */
export const GenerarPgcEjercicio = ({
    ejercicio,
    ejercicios,
    publicar,
}: {
    ejercicio: Ejercicio;
    ejercicios: Ejercicio[];
    publicar: EmitirEvento;
}) => {
    const t = useTContabilidad();
    const conPgc = useMemo(
        () => ejercicios.filter((e) => e.tienePgc && e.id !== ejercicio.id),
        [ejercicios, ejercicio.id]
    );
    const inicial = useMemo((): GenerarPgc => ({
        ejercicioOrigenId: conPgc[0]?.id ?? "",
        digitosSubcuenta: ejercicio.digitosSubcuenta,
    }), [conPgc, ejercicio.digitosSubcuenta]);
    const { modelo, uiProps, valido } = useModelo(metaGenerarPgc, inicial);

    const aceptar_ = useCallback(async () => {
        await patchGenerarPgc(ejercicio.id, modelo);
        publicar("pgc_generado");
    }, [ejercicio.id, modelo, publicar]);
    const [aceptar, cancelar] = useForm(aceptar_, () => publicar("cancelado"));

    const opciones = [
        { valor: "", descripcion: t("ejercicio.generarPgc2008Nuevo") },
        ...conPgc.map((e) => ({ valor: e.id, descripcion: t("ejercicio.copiarDeE", { e: etiquetaEjercicio(e) }) })),
    ];

    return (
        <QModal abierto={true} nombre="generarPgc" titulo={t("ejercicio.planGeneralContable")} onCerrar={cancelar}>
            <quimera-formulario>
                <QSelect label={t("ejercicio.planContable")} opciones={opciones} {...uiProps("ejercicioOrigenId")} />
                {!modelo.ejercicioOrigenId && (
                    <QInput label={t("ejercicio.digitosDeSubcuenta")} {...uiProps("digitosSubcuenta")} />
                )}
            </quimera-formulario>
            <div className="botones maestro-botones">
                <QBoton onClick={aceptar} deshabilitado={!valido}>{t("ejercicio.generar")}</QBoton>
            </div>
        </QModal>
    );
};

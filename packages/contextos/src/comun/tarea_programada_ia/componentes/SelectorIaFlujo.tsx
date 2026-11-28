import { QSelect, QSelectProps } from "@olula/componentes/atomos/qselect.tsx";
import { criteriaDefecto } from "@olula/lib/dominio.ts";
import { useEffect, useState } from "react";
import { getIaFlujos } from "../../ia_flujo/infraestructura.js";
import { tComun } from "../../i18n/index.ts";

type Opcion = { valor: string; descripcion: string };

/**
 * Selector de flujo de trabajo de IA activo — usado tanto en el alta como en
 * la tab General del detalle de una tarea programada. Carga la lista de
 * `ia_flujo` una vez al montar; no hay tantos flujos como para justificar
 * búsqueda incremental.
 */
export const SelectorIaFlujo = ({
    label = tComun("tareaProgramadaIa.flujoDeTrabajo"),
    ...props
}: Omit<QSelectProps, "opciones" | "label"> & { label?: string }) => {
    const [opciones, setOpciones] = useState<Opcion[]>([]);

    useEffect(() => {
        getIaFlujos(criteriaDefecto).then((respuesta) => {
            setOpciones(
                respuesta.datos
                    .filter((flujo) => flujo.activo)
                    .map((flujo) => ({ valor: flujo.id, descripcion: flujo.nombre }))
            );
        });
    }, []);

    return (
        <QSelect
            label={label}
            {...props}
            opciones={opciones}
        />
    );
};

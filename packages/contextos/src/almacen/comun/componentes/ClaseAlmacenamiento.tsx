import { PLANTILLA_FICHA } from "#/almacen/comun/fichas.ts";
import { QSelect, QSelectProps } from "@olula/componentes/atomos/qselect.tsx";
import { criteriaDefecto } from "@olula/lib/dominio.js";
import { useEffect, useState } from "react";
import { getClasesAlmacenamiento } from "../../clase_almacenamiento/infraestructura.ts";
import { tAlmacen } from "../../i18n/index.ts";

type ClaseAlmacenamientoProps = Omit<QSelectProps, "opciones" | "label" | "nombre"> & {
    label?: string;
    nombre?: string;
};

type OpcionClase = { valor: string; descripcion: string };

const SIN_CLASE: OpcionClase = { valor: "", get descripcion() { return tAlmacen("comun.sinClase"); } };

export const ClaseAlmacenamiento = ({
    enlace = PLANTILLA_FICHA.claseAlmacenamiento,
    valor,
    nombre = "clase_almacenamiento_id",
    label = tAlmacen("comun.claseDeAlmacenamiento"),
    onChange,
    ...props
}: ClaseAlmacenamientoProps) => {
    const [opciones, setOpciones] = useState<OpcionClase[]>([SIN_CLASE]);

    useEffect(() => {
        getClasesAlmacenamiento(criteriaDefecto).then((resultado) =>
            setOpciones([
                SIN_CLASE,
                ...resultado.datos.map((c) => ({ valor: c.id, descripcion: c.codigo })),
            ])
        );
    }, []);

    return (
        <QSelect
            label={label}
            nombre={nombre}
            enlace={enlace}
            valor={valor}
            onChange={onChange}
            opciones={opciones}
            {...props}
        />
    );
};

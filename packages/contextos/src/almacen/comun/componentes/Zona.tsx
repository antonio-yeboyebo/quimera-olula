import { PLANTILLA_FICHA } from "#/almacen/comun/fichas.ts";
import { QSelect } from "@olula/componentes/index.js";
import { QAutocompletarProps } from "@olula/componentes/moleculas/qautocompletar.tsx";
import { criteriaDefecto } from "@olula/lib/dominio.js";
import { useEffect, useState } from "react";
import { getZonas } from "../../zona/infraestructura.ts";
import { tAlmacen } from "../../i18n/index.ts";

type ZonaProps = Omit<QAutocompletarProps, "obtenerOpciones" | "label"> & { label?: string };

type OpcionZona = {
    valor: string;
    descripcion: string;
};

export const Zona = ({
  enlace = PLANTILLA_FICHA.zona,
    valor,
    nombre = "zona_id",
    label = tAlmacen("comun.zona"),
    onChange,
    ...props
}: ZonaProps) => {
    const [opciones, setOpciones] = useState<OpcionZona[]>([]);

    useEffect(() => {
        getZonas(criteriaDefecto).then((resultado) =>
            setOpciones(resultado.datos.map((z) => ({ valor: z.id, descripcion: z.codigo })))
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

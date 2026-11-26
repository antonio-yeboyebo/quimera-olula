import { PLANTILLA_FICHA } from "#/almacen/comun/fichas.ts";
import { QSelect } from "@olula/componentes/index.js";
import { QAutocompletarProps } from "@olula/componentes/moleculas/qautocompletar.tsx";
import { criteriaDefecto } from "@olula/lib/dominio.js";
import { useEffect, useState } from "react";
import { getTiposUbicacion } from "../../tipo_ubicacion/infraestructura.ts";
import { tAlmacen } from "../../i18n/index.ts";

type TipoUbicacionProps = Omit<QAutocompletarProps, "obtenerOpciones" | "label"> & { label?: string };

type OpcionTipo = { valor: string; descripcion: string };

const SIN_TIPO: OpcionTipo = { valor: "", get descripcion() { return tAlmacen("comun.sinTipo"); } };

export const TipoUbicacion = ({
  enlace = PLANTILLA_FICHA.tipoUbicacion,
    valor,
    nombre = "tipo_ubicacion_id",
    label = tAlmacen("comun.tipoDeUbicacion"),
    onChange,
    ...props
}: TipoUbicacionProps) => {
    const [opciones, setOpciones] = useState<OpcionTipo[]>([SIN_TIPO]);

    useEffect(() => {
        getTiposUbicacion(criteriaDefecto).then((resultado) =>
            setOpciones([
                SIN_TIPO,
                ...resultado.datos.map((t) => ({ valor: t.id, descripcion: t.codigo })),
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

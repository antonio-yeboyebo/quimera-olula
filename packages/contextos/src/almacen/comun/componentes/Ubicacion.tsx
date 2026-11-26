import { PLANTILLA_FICHA } from "#/almacen/comun/fichas.ts";
import { QAutocompletar } from "@olula/componentes/moleculas/qautocompletar.tsx";
import { RestAPI } from "@olula/lib/api/rest_api.js";
import { Criteria } from "@olula/lib/diseño.ts";
import { criteriaDefecto } from "@olula/lib/dominio.js";
import { tAlmacen } from "../../i18n/index.ts";


interface UbicacionProps {
  /** Plantilla de la URL de su ficha (↗); "" para no enlazar. */
  enlace?: string;
  descripcion?: string;
  valor: string;
  nombre?: string;
  label?: string;
  autoFocus?: boolean;
  ref?: React.RefObject<HTMLInputElement | null>;
  onChange: (opcion: { valor: string; descripcion: string } | null) => void;
}

export const Ubicacion = ({
  enlace = PLANTILLA_FICHA.ubicacion,
  descripcion = "",
  valor,
  nombre = "ubicacion_id2",
  label = tAlmacen("comun.ubicacion"),
  onChange,
  ...props
}: UbicacionProps) => {

    const obtenerOpciones = async (texto: string, id?: string) => {
        const criteria: Criteria = {
            ...criteriaDefecto,
            filtro: id
                ? [["id", "=", id]]
                : [["codigo", "~", texto]],
            orden: ["codigo", "ASC"],
        };

        const ubicaciones = await getTagsUbicacion(criteria);

        return ubicaciones.map((ubicacion) => ({
            valor: ubicacion.id,
            descripcion: ubicacion.codigo,
        }));
    };

    return (
        <QAutocompletar
            label={`${label} ${valor}`}
            nombre={nombre}
      enlace={enlace}
            onChange={onChange}
            valor={valor}
            obtenerOpciones={obtenerOpciones}
            descripcion={descripcion}
            {...props}
        />
    );
};

// INFRAESTRUCTURA
interface TagUbicacionApi {
    id: string;
    codigo: string;
}

const url = `/almacen/ubicacion`;


const getTagsUbicacion = async (criteria: Criteria): Promise<TagUbicacionApi[]> => {

    const respuesta = await RestAPI.getQuery<TagUbicacionApi, TagUbicacionApi>(
        url,
        criteria,
    )
    return respuesta.datos
};

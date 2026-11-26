import { PLANTILLA_FICHA } from "#/almacen/comun/fichas.ts";
import { QAutocompletar } from "@olula/componentes/moleculas/qautocompletar.tsx";
import { RestAPI } from "@olula/lib/api/rest_api.js";
import { Criteria } from "@olula/lib/diseño.ts";
import { criteriaDefecto } from "@olula/lib/dominio.js";
import { tAlmacen } from "../../i18n/index.ts";


type TagCajaOpcion = { valor: string; descripcion: string } & TagCaja;

interface CajaProps {
  /** Plantilla de la URL de su ficha (↗); "" para no enlazar. */
  enlace?: string;
  descripcion?: string;
  valor: string;
  nombre?: string;
  label?: string;
  autoFocus?: boolean;
  ref?: React.RefObject<HTMLInputElement | null>;
  onChange: (opcion: TagCajaOpcion | null) => void;
}

export const Caja = ({
  enlace = PLANTILLA_FICHA.caja,
  descripcion = "",
  valor,
  nombre = "cajaId",
  label = tAlmacen("comun.caja"),
  onChange,
  ...props
}: CajaProps) => {

    const obtenerOpciones = async (texto: string) => {
        const criteria: Criteria = {
            ...criteriaDefecto,
            filtro: [["lpn", "~", texto]],
            orden: ["lpn", "ASC"],
        };

        const cajas = await getCajas(criteria);

        return cajas.map((caja) => ({
            valor: caja.id,
            descripcion: caja.lpn,
            // descripcionOpcion: caja.lpn,
            ...caja,
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
interface TagCajaApi {
    id: string;
    lpn: string;
    ubicacion_id: string;
    contenedor_id: string | null;
    sku?: string | null;
    lote_id?: string | null;
    cantidad: number | null;
    capacidad?: number | null;
}

interface TagCaja {
    id: string;
    lpn: string;
    idUbicacion: string;
    idConenedor: string | null;
    sku?: string | null;
    idLote?: string | null;
    cantidad: number | null;
    capacidad?: number | null;
}

const url = `/almacen/caja`;

const tagCajaApiATagCaja = (caja: TagCajaApi): TagCaja => ({
    id: caja.id,
    lpn: caja.lpn,
    idUbicacion: caja.ubicacion_id,
    idConenedor: caja.contenedor_id,
    sku: caja.sku,
    idLote: caja.lote_id,
    cantidad: caja.cantidad,
    capacidad: caja.capacidad,
})


const getCajas = async (criteria: Criteria): Promise<TagCaja[]> => {

    const respuesta = await RestAPI.getQuery<TagCaja, TagCajaApi>(
        url,
        criteria,
        tagCajaApiATagCaja,
    )
    return respuesta.datos
};

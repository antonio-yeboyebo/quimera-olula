import { QAutocompletar } from "@olula/componentes/moleculas/qautocompletar.tsx";
import { RestAPI } from "@olula/lib/api/rest_api.js";
import { Criteria, Filtro } from "@olula/lib/diseño.ts";
import { criteriaDefecto } from "@olula/lib/dominio.js";
import { tAlmacen } from "../../i18n/index.ts";


interface TagLoteApi {
    id: string;
    sku: string;
    caducidad: string | null;
}

interface TagLote {
    id: string;
    sku: string;
    caducidad: string | null;
}

export type TagLoteOpcion = { valor: string; descripcion: string } & TagLote;

interface LoteProps {
  valor: string;
  sku?: string;
  nombre?: string;
  label?: string;
  autoFocus?: boolean;
  ref?: React.RefObject<HTMLInputElement | null>;
  permitirNuevo?: boolean;
  onChange: (opcion: TagLoteOpcion | null) => void;
}

export const Lote = ({
  valor,
  sku,
  nombre = "lote_id",
  label = tAlmacen("comun.lote"),
  permitirNuevo = false,
  onChange,
  ...props
}: LoteProps) => {

    const obtenerOpciones = async (texto: string) => {

        const filtro: Filtro = sku
            ? {
                and: [
                    ['sku', "=", sku],
                    ["id", "~", texto]
                ]
            }
            : [["id", "~", texto]]

        const criteria: Criteria = {
            ...criteriaDefecto,
            filtro,
            orden: ["id", "ASC"],
        };

        const lotes = await getTagsLote(criteria);

        return lotes.map((lote) => ({
            valor: lote.id,
            descripcion: lote.id,
            ...lote,
        }));
    };

    return (
        <QAutocompletar
            label={sku ? `${label} SKU ${sku}` : label}
            nombre={nombre}
            onChange={onChange}
            valor={valor}
            obtenerOpciones={obtenerOpciones}
            descripcion={valor}
            permitirValorLibre={permitirNuevo}
            {...props}
        />
    );
};


const url = `/almacen/lote`;

const tagLoteApiATagLote = (api: TagLoteApi): TagLote => ({
    id: api.id,
    sku: api.sku,
    caducidad: api.caducidad ?? null,
});

const getTagsLote = async (criteria: Criteria): Promise<TagLote[]> => {

    const respuesta = await RestAPI.getQuery<TagLote, TagLoteApi>(
        url,
        criteria,
        tagLoteApiATagLote,
    )
    return respuesta.datos
};

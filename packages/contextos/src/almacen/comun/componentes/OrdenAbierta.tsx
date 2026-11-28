import { PLANTILLA_FICHA } from "#/almacen/comun/fichas.ts";
import { ESTADOS_ORDEN_DEFECTO } from "#/almacen/orden/dominio.ts";
import { getOrdenes } from "#/almacen/orden/infraestructura.ts";
import { QAutocompletar } from "@olula/componentes/moleculas/qautocompletar.tsx";
import { ClausulaFiltro, Filtro } from "@olula/lib/diseño.ts";
import { tAlmacen } from "../../i18n/index.ts";

/**
 * Una orden abierta (pendiente, en curso o preparada) del almacén, buscando por su código o su
 * descripción. Para elegir la orden del recorrido en el mapa.
 */
export const OrdenAbierta = ({ almacenId, valor, label = tAlmacen("comun.orden"), nombre = "ordenId", deshabilitado, onChange }: {
    almacenId: string;
    valor: string;
    label?: string;
    nombre?: string;
    deshabilitado?: boolean;
    onChange: (ordenId: string) => void;
}) => {
    const obtenerOpciones = async (texto: string, id?: string) => {
        const filtro: ClausulaFiltro[] = id
            ? [["id", "=", id]]
            : [
                ["almacen_id", "=", almacenId],
                ["estado", "in", ESTADOS_ORDEN_DEFECTO as unknown as string],
                ...(texto ? [["id", "~", texto] as ClausulaFiltro] : []),
            ];
        const { datos } = await getOrdenes(filtro as Filtro, ["fecha", "DESC"], { limite: 20, pagina: 1 });
        return datos.map((o) => ({
            valor: o.id,
            descripcion: o.descripcion ? `${o.id} · ${o.descripcion}` : o.id,
        }));
    };

    return (
        <QAutocompletar
            label={label}
            nombre={nombre}
            valor={valor}
            enlace={PLANTILLA_FICHA.orden}
            deshabilitado={deshabilitado}
            obtenerOpciones={obtenerOpciones}
            onChange={(opcion) => onChange(opcion?.valor ?? "")}
        />
    );
};

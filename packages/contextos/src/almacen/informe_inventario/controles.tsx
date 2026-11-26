import { PropsControlInforme } from "#/comun/informe_documentos/diseño.ts";
import { QSelect } from "@olula/componentes/atomos/qselect.tsx";
import { Filtro, Orden } from "@olula/lib/diseño.ts";
import { useEffect, useState } from "react";
import { obtenerAlmacenes } from "../almacen/infraestructura.ts";
import { getFamilias } from "../familia/infraestructura.ts";
import { tAlmacen } from "../i18n/index.ts";

type Opcion = { valor: string; descripcion: string };

/**
 * Selectores de almacén y familia de los criterios. Pasan todas las props del
 * modelo al QSelect (como los combos de la ficha) para que el cambio se
 * guarde al momento, y empiezan con «Todos»/«Todas» (vacío = sin filtro: el
 * hueco vacío del QSelect va oculto y no se podría volver a elegir).
 */
const useOpciones = (cargar: () => Promise<Opcion[]>, todos: string) => {
    const [opciones, setOpciones] = useState<Opcion[]>([{ valor: "", descripcion: todos }]);
    useEffect(() => {
        cargar().then((leidas) => setOpciones([{ valor: "", descripcion: todos }, ...leidas]));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    return opciones;
};

const cargarAlmacenes = async () =>
    (await obtenerAlmacenes(undefined as unknown as Filtro, undefined as unknown as Orden)).map((a) => ({
        valor: a.id,
        descripcion: `${a.id} · ${a.nombre}`,
    }));

const cargarFamilias = async () =>
    (await getFamilias([], ["descripcion"] as Orden, { limite: 1000, pagina: 1 })).datos.map((f) => ({
        valor: f.id,
        descripcion: f.descripcion,
    }));

export const ControlAlmacen = (props: PropsControlInforme) => (
    <QSelect {...props} opciones={useOpciones(cargarAlmacenes, tAlmacen("informe_inventario.todos"))} />
);

export const ControlFamilia = (props: PropsControlInforme) => (
    <QSelect {...props} opciones={useOpciones(cargarFamilias, tAlmacen("informe_inventario.todas"))} />
);

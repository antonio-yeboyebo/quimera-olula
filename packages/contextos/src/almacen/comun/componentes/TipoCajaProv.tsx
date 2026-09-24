import { QSelect, QSelectProps } from "@olula/componentes/atomos/qselect.tsx";
import { RestAPI } from "@olula/lib/api/rest_api.ts";
import { ValorControl } from "@olula/lib/useModelo.ts";
import { useEffect, useState } from "react";
import { PALET_ID } from "../dominio.ts";

type TipoCajaProvProps = Omit<QSelectProps, "opciones" | "label" | "onChange"> & {
    label?: string;
    idProveedor: string;
    idArticulo: string;
    onChange?: (val: ValorControl) => void;
    /** Llamado al seleccionar una opción, con el ID y la capacidad (unidades/caja) del tipo. */
    onSeleccionar?: (id: string, capacidad: number | null) => void;
};

type OpcionTipoCajaProv = {
    valor: string;
    descripcion: string;
    capacidad: number | null;
};

interface TipoCajaProvApi {
    id: string;
    descripcion: string;
    capacidad: number | null;
}


const OPCIONES_DEFECTO: OpcionTipoCajaProv[] = [
    { valor: "", descripcion: "Sin Caja", capacidad: null },
    { valor: PALET_ID, descripcion: "Palet", capacidad: null },
];

export const TipoCajaProv = ({
    valor,
    nombre = "tipo_caja_prov",
    label = "Tipo de caja",
    idProveedor,
    idArticulo,
    onChange,
    onSeleccionar,
    ...props
}: TipoCajaProvProps) => {
    const [opciones, setOpciones] = useState<OpcionTipoCajaProv[]>(OPCIONES_DEFECTO);

    useEffect(() => {
        setOpciones(OPCIONES_DEFECTO);
        if (!idProveedor || !idArticulo) return;
        RestAPI.get<{ datos: TipoCajaProvApi[] }>(
            `/almacen/tipo_caja_prov/${idProveedor}/articulo_id/${idArticulo}`
        ).then((respuesta) => {
            const opcionesApi = respuesta.datos.map((t) => ({
                valor: t.id,
                descripcion: t.descripcion,
                capacidad: t.capacidad,
            }));
            setOpciones([...OPCIONES_DEFECTO, ...opcionesApi]);
            const primera = opcionesApi[0];
            if (primera) {
                onChange?.({ valor: primera.valor, descripcion: primera.descripcion });
                onSeleccionar?.(primera.valor, primera.capacidad);
            }
        });
        // onChange y onSeleccionar son callbacks estables; no se incluyen en deps
        // para evitar que un cambio de referencia dispare una nueva carga
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [idProveedor, idArticulo]);

    return (
        <QSelect
            label={label}
            nombre={nombre}
            valor={valor}
            onChange={(opcion) => {
                const tipoCaja = opcion as OpcionTipoCajaProv | null;
                const val: ValorControl = tipoCaja ? { valor: tipoCaja.valor, descripcion: tipoCaja.descripcion } : null;
                onChange?.(val);
                onSeleccionar?.(tipoCaja?.valor ?? "", tipoCaja?.capacidad ?? null);
            }}
            opciones={opciones}
            {...props}
        />
    );
};

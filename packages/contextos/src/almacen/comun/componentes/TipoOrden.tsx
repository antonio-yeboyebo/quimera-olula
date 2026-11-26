import { QSelect } from "@olula/componentes/index.js";
import { QAutocompletarProps } from "@olula/componentes/moleculas/qautocompletar.tsx";
import { tAlmacen } from "../../i18n/index.ts";

type TipoOrdenProps = Omit<QAutocompletarProps, "obtenerOpciones" | "label"> & { label?: string };

const TIPOS_ORDEN = [
    { valor: "ENTRADA", get descripcion() { return tAlmacen("comun.entrada"); } },
    { valor: "SALIDA", get descripcion() { return tAlmacen("comun.salida"); } },
    { valor: "TRASPASO", get descripcion() { return tAlmacen("comun.traspaso"); } },
];

export const TipoOrden = ({
    valor,
    nombre = "tipoOrden",
    label = tAlmacen("comun.tipoDeOrden"),
    onChange,
    ...props
}: TipoOrdenProps) => {
    return (
        <QSelect
            label={label}
            nombre={nombre}
            valor={valor}
            onChange={onChange}
            opciones={TIPOS_ORDEN}
            {...props}
        />
    );
};

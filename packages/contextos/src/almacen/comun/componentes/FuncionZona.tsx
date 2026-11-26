import { QSelect } from "@olula/componentes/index.js";
import { QAutocompletarProps } from "@olula/componentes/moleculas/qautocompletar.tsx";
import { funcionesZona } from "../../zona/dominio.ts";
import { tAlmacen } from "../../i18n/index.ts";

type FuncionZonaProps = Omit<QAutocompletarProps, "obtenerOpciones" | "label"> & { label?: string };

export const FuncionZona = ({
    valor,
    nombre = "funcion",
    label = tAlmacen("comun.funcion"),
    onChange,
    ...props
}: FuncionZonaProps) => (
    <QSelect
        label={label}
        nombre={nombre}
        valor={valor}
        onChange={onChange}
        opciones={funcionesZona}
        {...props}
    />
);

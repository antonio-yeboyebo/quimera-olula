import { QSelect } from "@olula/componentes/index.js";
import { QAutocompletarProps } from "@olula/componentes/moleculas/qautocompletar.tsx";
import { tContabilidad } from "../../i18n/index.ts";

type OpcionFijaProps = Omit<
    QAutocompletarProps,
    "obtenerOpciones" | "label" | "nombre"
> & {
    label?: string;
    nombre?: string;
};

/**
 * `co_i_mayor.orden1` solo ofrece asiento o fecha, a diferencia del libro
 * diario. Los valores son los literales que guarda Eneboo.
 */
const CRITERIOS_ORDEN_MAYOR = [
    { valor: "Fecha", get descripcion() { return tContabilidad("comun.fecha"); } },
    { valor: "Asiento", get descripcion() { return tContabilidad("comun.asiento"); } },
];

export const CriterioOrdenMayor = ({
    valor,
    nombre = "orden",
    label = tContabilidad("comun.criterio"),
    onChange,
    ...props
}: OpcionFijaProps) => (
    <QSelect
        label={label}
        nombre={nombre}
        valor={valor}
        onChange={onChange}
        opciones={CRITERIOS_ORDEN_MAYOR}
        {...props}
    />
);

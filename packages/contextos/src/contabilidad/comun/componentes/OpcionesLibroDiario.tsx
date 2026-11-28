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
 * Los valores son los literales que guarda `co_i_diario` en Eneboo, que son
 * con los que habla la API. No se traducen: cambiarlos rompería la
 * compatibilidad con los informes dados de alta desde el ERP de escritorio.
 */
const CRITERIOS_ORDEN = [
    { valor: "No ordenar", get descripcion() { return tContabilidad("comun.noOrdenar"); } },
    { valor: "Asiento", get descripcion() { return tContabilidad("comun.asiento"); } },
    { valor: "Fecha", get descripcion() { return tContabilidad("comun.fecha"); } },
    { valor: "Subcuenta", get descripcion() { return tContabilidad("comun.subcuenta"); } },
];

const SENTIDOS_ORDEN = [
    { valor: "Ascendente", get descripcion() { return tContabilidad("comun.ascendente"); } },
    { valor: "Descendente", get descripcion() { return tContabilidad("comun.descendente"); } },
];

export const CriterioOrdenInforme = ({
    valor,
    nombre = "orden1",
    label = tContabilidad("comun.criterio"),
    onChange,
    ...props
}: OpcionFijaProps) => (
    <QSelect
        label={label}
        nombre={nombre}
        valor={valor}
        onChange={onChange}
        opciones={CRITERIOS_ORDEN}
        {...props}
    />
);

export const SentidoOrdenInforme = ({
    valor,
    nombre = "tipoOrden1",
    label = tContabilidad("comun.orden"),
    onChange,
    ...props
}: OpcionFijaProps) => (
    <QSelect
        label={label}
        nombre={nombre}
        valor={valor}
        onChange={onChange}
        opciones={SENTIDOS_ORDEN}
        {...props}
    />
);

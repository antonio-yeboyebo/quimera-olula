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
 * Los valores son los literales que guarda `co_i_cuentasanuales` en Eneboo,
 * que son con los que habla la API. No se traducen: cambiarlos rompería la
 * compatibilidad con los informes dados de alta desde el ERP de escritorio.
 */
const TIPOS_CUENTAS_ANUALES = [
    { valor: "Situacion", get descripcion() { return tContabilidad("comun.situacion"); } },
    { valor: "Perdidas y ganancias", get descripcion() { return tContabilidad("comun.perdidasYGanancias"); } },
    { valor: "Ingresos y gastos", get descripcion() { return tContabilidad("comun.ingresosYGastos"); } },
];

const FORMATOS_CUENTAS_ANUALES = [
    { valor: "Normal", get descripcion() { return tContabilidad("comun.normal"); } },
    { valor: "Abreviado", get descripcion() { return tContabilidad("comun.abreviado"); } },
];

const NIVELES_DESGLOSE = [
    { valor: "No desglosar", get descripcion() { return tContabilidad("comun.noDesglosar"); } },
    { valor: "Cuenta", get descripcion() { return tContabilidad("comun.cuenta"); } },
    { valor: "Subcuenta", get descripcion() { return tContabilidad("comun.subcuenta"); } },
];

export const TipoCuentasAnuales = ({
    valor,
    nombre = "tipo",
    label = tContabilidad("comun.tipoDeInforme"),
    onChange,
    ...props
}: OpcionFijaProps) => (
    <QSelect
        label={label}
        nombre={nombre}
        valor={valor}
        onChange={onChange}
        opciones={TIPOS_CUENTAS_ANUALES}
        {...props}
    />
);

export const FormatoCuentasAnuales = ({
    valor,
    nombre = "formato",
    label = tContabilidad("comun.formato"),
    onChange,
    ...props
}: OpcionFijaProps) => (
    <QSelect
        label={label}
        nombre={nombre}
        valor={valor}
        onChange={onChange}
        opciones={FORMATOS_CUENTAS_ANUALES}
        {...props}
    />
);

export const NivelDesgloseCuentasAnuales = ({
    valor,
    nombre = "nivelDesglose",
    label = tContabilidad("comun.desglose"),
    onChange,
    ...props
}: OpcionFijaProps) => (
    <QSelect
        label={label}
        nombre={nombre}
        valor={valor}
        onChange={onChange}
        opciones={NIVELES_DESGLOSE}
        {...props}
    />
);

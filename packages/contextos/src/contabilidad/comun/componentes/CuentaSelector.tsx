import { QAutocompletar } from "@olula/componentes/moleculas/qautocompletar.tsx";
import { Cuenta } from "#/contabilidad/cuenta/diseño.ts";
import { buscarCuentas, codigoYNombre, cuentaPorCodigo } from "../busqueda_plan_contable.ts";
import { tContabilidad } from "../../i18n/index.ts";

/** El valor de la opción es el CÓDIGO de la cuenta, no su id: es lo que pide
 * el alta de subcuenta (`codigo_cuenta`). */
export type OpcionCuenta = {
    valor: string;
    descripcion: string;
    descripcionOpcion: string;
};

interface CuentaSelectorProps {
    ejercicioId: string;
    valor: string;
    descripcion?: string;
    nombre?: string;
    label?: string;
    opcional?: boolean;
    evaluarCambio?: () => void;
    onChange: (opcion: OpcionCuenta | null) => void;
}

const opcionDesdeCuenta = (c: Cuenta): OpcionCuenta => ({
    valor: c.codigo,
    descripcion: c.codigo,
    descripcionOpcion: codigoYNombre(c.codigo, c.nombre),
});

export const CuentaSelector = ({
    ejercicioId,
    valor,
    descripcion = "",
    nombre = "codigo_cuenta",
    label = tContabilidad("comun.cuentaDelPlan"),
    onChange,
    evaluarCambio,
    ...props
}: CuentaSelectorProps) => {
    const obtenerOpciones = async (texto: string, id?: string) => {
        // El valor es el código: se resuelve dentro del ejercicio (la ruta
        // /cuenta/{id} espera el idcuenta, no el código).
        if (id) {
            const cuenta = await cuentaPorCodigo(ejercicioId, id).catch(() => null);
            return cuenta ? [opcionDesdeCuenta(cuenta)] : [];
        }

        return (await buscarCuentas(ejercicioId, texto)).map(opcionDesdeCuenta);
    };

    return (
        <QAutocompletar<OpcionCuenta>
            label={label}
            nombre={nombre}
            valor={valor}
            descripcion={descripcion || valor}
            onChange={onChange}
            obtenerOpciones={obtenerOpciones}
            longitudMinima={0}
            evaluarCambio={evaluarCambio}
            {...props}
        />
    );
};

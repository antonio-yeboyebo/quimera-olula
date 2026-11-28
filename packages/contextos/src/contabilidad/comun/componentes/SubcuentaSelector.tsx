import { QAutocompletar } from "@olula/componentes/moleculas/qautocompletar.tsx";
import { Subcuenta } from "#/contabilidad/subcuenta/diseño.ts";
import { getSubcuenta } from "#/contabilidad/subcuenta/infraestructura.ts";
import { buscarSubcuentas, codigoYNombre } from "../busqueda_plan_contable.ts";
import { tContabilidad } from "../../i18n/index.ts";

/** La opción lleva el `esIva` de la subcuenta: quien la elige necesita saber
 * si es de IVA sin volver a consultarla (ver EditorPartidasManual). */
export type OpcionSubcuenta = {
    valor: string;
    descripcion: string;
    descripcionOpcion: string;
    esIva: boolean;
};

interface SubcuentaSelectorProps {
    ejercicioId: string;
    valor: string;
    descripcion?: string;
    nombre?: string;
    label?: string;
    opcional?: boolean;
    onChange: (opcion: OpcionSubcuenta | null) => void;
}

const opcionDesdeSubcuenta = (sc: Subcuenta): OpcionSubcuenta => ({
    valor: sc.id,
    descripcion: sc.codigo,
    descripcionOpcion: codigoYNombre(sc.codigo, sc.nombre),
    esIva: sc.esIva,
});

export const SubcuentaSelector = ({
    ejercicioId,
    valor,
    descripcion = "",
    nombre = "subcuenta_id",
    label = tContabilidad("comun.subcuenta"),
    onChange,
    ...props
}: SubcuentaSelectorProps) => {
    const obtenerOpciones = async (texto: string, id?: string) => {
        if (id) {
            try {
                const sc = await getSubcuenta(id);
                return [opcionDesdeSubcuenta(sc)];
            } catch {
                return [];
            }
        }

        return (await buscarSubcuentas(ejercicioId, texto)).map(opcionDesdeSubcuenta);
    };

    return (
        <QAutocompletar<OpcionSubcuenta>
            label={label}
            nombre={nombre}
            valor={valor}
            descripcion={descripcion}
            onChange={onChange}
            obtenerOpciones={obtenerOpciones}
            longitudMinima={1}
            {...props}
        />
    );
};

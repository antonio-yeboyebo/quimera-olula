import { QAutocompletar } from "@olula/componentes/moleculas/qautocompletar.tsx";
import { Criteria, Filtro } from "@olula/lib/diseño.ts";
import { criteriaDefecto } from "@olula/lib/dominio.js";
import { Subcuenta as SubcuentaContable } from "#/contabilidad/subcuenta/diseño.ts";
import { getSubcuentas } from "#/contabilidad/subcuenta/infraestructura.ts";
import { tTesoreria } from "../../i18n/index.ts";

/** El valor es el código de la subcuenta, no su id: tesorería guarda y envía
 * códigos (el servidor los resuelve en el ejercicio de la fecha del asiento). */
export type OpcionSubcuenta = {
    valor: string;
    descripcion: string;
};

interface SubcuentaProps {
    ejercicioId: string;
    valor: string;
    descripcion?: string;
    nombre?: string;
    label?: string;
    opcional?: boolean;
    deshabilitado?: boolean;
    soloLectura?: boolean;
    onChange?: (opcion: OpcionSubcuenta | null) => void;
    // Se usa con "{...uiProps(...)}": evaluarCambio dispara la validación y el
    // guardado al perder el foco, hay que reenviarlo a QAutocompletar.
    evaluarCambio?: () => void;
}

const opcionDesdeSubcuenta = (sc: SubcuentaContable): OpcionSubcuenta => ({
    valor: sc.codigo,
    descripcion: `${sc.codigo} — ${sc.nombre}`,
});

export const Subcuenta = ({
    ejercicioId,
    valor,
    descripcion = "",
    nombre = "codigo_subcuenta",
    label = tTesoreria("comun.subcuenta"),
    onChange,
    ...props
}: SubcuentaProps) => {
    const obtenerOpciones = async (texto: string, codigo?: string) => {
        if (!ejercicioId) {
            return [];
        }

        const filtro: Filtro = codigo
            ? [["ejercicio_id", ejercicioId], ["codigo", codigo]]
            : texto.trim().length
              ? {
                    and: [
                        ["ejercicio_id", ejercicioId],
                        {
                            or: [
                                ["codigo", "~", texto],
                                ["nombre", "~", texto],
                            ],
                        },
                    ],
                }
              : [["ejercicio_id", ejercicioId]];

        const criteria: Criteria = {
            ...criteriaDefecto,
            filtro,
            orden: ["codigo", "ASC"],
            paginacion: { pagina: 1, limite: 20 },
        };

        const { datos } = await getSubcuentas(criteria);
        return datos.map(opcionDesdeSubcuenta);
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

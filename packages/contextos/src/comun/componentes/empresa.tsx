import { QAutocompletar } from "@olula/componentes/moleculas/qautocompletar.tsx";
import { ClausulaFiltro } from "@olula/lib/diseño.ts";
import { criteriaDefecto } from "@olula/lib/dominio.ts";
import { getEmpresas } from "../../empresa/empresa/infraestructura.js";
import { tComun } from "../i18n/index.ts";

interface EmpresaProps {
    descripcion?: string;
    valor: string;
    nombre?: string;
    label?: string;
    deshabilitado?: boolean;
    soloLectura?: boolean;
    onChange?: (opcion: { valor: string; descripcion: string } | null) => void;
}

/**
 * Selector con búsqueda de empresa (patrón QAutocompletar, ver
 * comun/componentes/usuario.tsx para el mismo patrón sobre usuarios).
 */
export const Empresa = ({
    descripcion = "",
    valor,
    nombre = "empresa_id",
    label = tComun("componentes.empresa"),
    deshabilitado = false,
    onChange,
    ...props
}: EmpresaProps) => {
    const obtenerOpciones = async (texto: string) => {
        const criteria = {
            ...criteriaDefecto,
            filtro: ["nombre", "~", texto] as ClausulaFiltro,
            orden: ["nombre"],
        };

        const { datos } = await getEmpresas(criteria);

        return datos.map((empresa) => ({
            valor: empresa.id,
            descripcion: empresa.nombre,
        }));
    };

    return (
        <QAutocompletar
            label={label}
            nombre={nombre}
            onChange={onChange}
            valor={valor}
            obtenerOpciones={obtenerOpciones}
            descripcion={descripcion}
            deshabilitado={deshabilitado}
            {...props}
        />
    );
};

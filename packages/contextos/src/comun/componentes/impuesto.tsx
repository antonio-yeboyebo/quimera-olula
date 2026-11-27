import { QSelect } from "@olula/componentes/atomos/qselect.tsx";
import { obtenerDatosSelector } from "@olula/lib/infraestructura.ts";
import { useEffect, useState } from "react";
import { tComun } from "../i18n/index.ts";

interface ImpuestoProps {
    valor: string;
    label?: string;
    nombre?: string;
    opcional?: boolean;
    onChange: (opcion: { valor: string; descripcion: string } | null) => void;
}

/** Selector del maestro de impuestos (`impuestos`): código, descripción y porcentaje de IVA. */
export const Impuesto = ({
    valor,
    label = tComun("componentes.impuesto"),
    nombre = "impuesto_id",
    opcional,
    onChange,
}: ImpuestoProps) => {
    const [opciones, setOpciones] = useState<{ valor: string; descripcion: string }[]>([]);

    useEffect(() => {
        const cargarOpciones = async () => {
            const datos = await obtenerDatosSelector("impuesto")();
            setOpciones(
                datos.map((impuesto) => ({
                    valor: String(impuesto.id ?? ""),
                    descripcion: `${impuesto.descripcion ?? impuesto.id} (${impuesto.iva ?? 0} %)`,
                }))
            );
        };

        cargarOpciones();
    }, []);

    return (
        <QSelect
            label={label}
            nombre={nombre}
            valor={valor}
            opcional={opcional}
            onChange={onChange}
            opciones={opciones}
        />
    );
};

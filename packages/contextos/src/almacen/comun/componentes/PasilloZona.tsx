import { QSelect } from "@olula/componentes/index.js";
import { QAutocompletarProps } from "@olula/componentes/moleculas/qautocompletar.tsx";
import { useEffect, useState } from "react";
import { getPasillosZona } from "../../pasillo/infraestructura.ts";
import { tAlmacen } from "../../i18n/index.ts";

type PasilloZonaProps = Omit<QAutocompletarProps, "obtenerOpciones" | "label"> & {
    label?: string;
    zonaId: string | null | undefined;
};

type OpcionPasillo = { valor: string; descripcion: string };

const SIN_PASILLO: OpcionPasillo = { valor: "", get descripcion() { return tAlmacen("comun.sinPasillo"); } };

/** Selector de pasillo restringido a los pasillos de una zona. */
export const PasilloZona = ({
    zonaId,
    valor,
    nombre = "pasillo_id",
    label = tAlmacen("comun.pasillo"),
    onChange,
    ...props
}: PasilloZonaProps) => {
    const [opciones, setOpciones] = useState<OpcionPasillo[]>([SIN_PASILLO]);

    useEffect(() => {
        if (!zonaId) {
            setOpciones([SIN_PASILLO]);
            return;
        }
        let cancelado = false;
        getPasillosZona(zonaId).then((pasillos) => {
            if (!cancelado) {
                setOpciones([SIN_PASILLO, ...pasillos.map((p) => ({ valor: p.id, descripcion: p.codigo }))]);
            }
        });
        return () => {
            cancelado = true;
        };
    }, [zonaId]);

    return (
        <QSelect
            label={label}
            nombre={nombre}
            valor={valor}
            onChange={onChange}
            opciones={opciones}
            {...props}
        />
    );
};

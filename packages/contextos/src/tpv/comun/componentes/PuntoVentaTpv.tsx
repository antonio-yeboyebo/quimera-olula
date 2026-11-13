import { PuntoVentaTpv as TipoPuntoVentaTpv } from "#/tpv/punto_de_venta/diseño.ts";
import { getPuntosVentaTpv } from "#/tpv/punto_de_venta/infraestructura.ts";
import { QSelect, QSelectProps } from "@olula/componentes/index.js";
import { Criteria } from "@olula/lib/diseño.js";
import { useEffect, useState } from "react";

type OpcionPuntoVenta = {
    valor: string;
    descripcion: string;
    punto: TipoPuntoVentaTpv;
};

type PuntoVentaProps = Omit<QSelectProps, "opciones" | "label" | "nombre" | "onChange"> & {
    label?: string;
    nombre?: string;
    onChange: (opcion: OpcionPuntoVenta | null) => void;
};

export const PuntoVentaTpv = ({
    nombre = "punto_venta_tpv",
    label = "Punto de venta",
    onChange,
    ...props
}: PuntoVentaProps) => {

    const [puntos, setPuntos] = useState<OpcionPuntoVenta[]>([]);

    useEffect(() => {
        const obtenerOpciones = async () => {
            const criteria: Criteria = {
                filtro: [],
                orden: ["nombre"],
                paginacion: { limite: 1000, pagina: 1 },
            };

            const puntos_ = await getPuntosVentaTpv(criteria);

            setPuntos(
                puntos_.datos.map((punto) => ({
                    valor: punto.id,
                    descripcion: punto.nombre,
                    punto: punto,
                }))
            );
        };
        obtenerOpciones();
    }, []);

    return (
        <QSelect
            label={label}
            nombre={nombre}
            onChange={(opcion) => onChange(opcion as OpcionPuntoVenta | null)}
            opciones={puntos}
            {...props}
        />
    );
};

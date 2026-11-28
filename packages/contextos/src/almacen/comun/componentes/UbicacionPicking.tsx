import { QAutocompletar } from "@olula/componentes/moleculas/qautocompletar.tsx";
import { Criteria } from "@olula/lib/diseño.ts";
import { criteriaDefecto } from "@olula/lib/dominio.js";
import { useRef } from "react";
import { getUbicaciones } from "../../ubicacion/infraestructura.ts";
import { getZonas } from "../../zona/infraestructura.ts";
import { tAlmacen } from "../../i18n/index.ts";

interface UbicacionPickingProps {
    descripcion?: string;
    valor: string;
    nombre?: string;
    label?: string;
    autoFocus?: boolean;
    ref?: React.RefObject<HTMLInputElement | null>;
    onChange: (opcion: { valor: string; descripcion: string } | null) => void;
}

/** Selector de ubicaciones restringido a las zonas de función PICKING. */
export const UbicacionPicking = ({
    descripcion = "",
    valor,
    nombre = "ubicacion_id",
    label = tAlmacen("comun.ubicacionDePicking"),
    onChange,
    ...props
}: UbicacionPickingProps) => {
    const zonasPicking = useRef<Promise<string[]> | null>(null);

    const obtenerZonasPicking = () => {
        if (!zonasPicking.current) {
            zonasPicking.current = getZonas({ ...criteriaDefecto, paginacion: { limite: 1000, pagina: 1 } }).then(
                (r) => r.datos.filter((z) => z.funcion === "PICKING").map((z) => z.id)
            );
        }
        return zonasPicking.current;
    };

    const obtenerOpciones = async (texto: string, id?: string) => {
        const zonas = await obtenerZonasPicking();
        const criteria: Criteria = { ...criteriaDefecto, orden: ["codigo", "ASC"] };
        const consultas = id
            ? [getUbicaciones([["id", "=", id]], criteria.orden)]
            : zonas.map((z) =>
                  getUbicaciones([["zona_id", "=", z], ["codigo", "~", texto]], criteria.orden, criteria.paginacion)
              );
        const resultados = await Promise.all(consultas);
        return resultados
            .flatMap((r) => r.datos)
            .map((u) => ({ valor: u.id, descripcion: u.codigo }));
    };

    return (
        <QAutocompletar
            label={label}
            nombre={nombre}
            onChange={onChange}
            valor={valor}
            obtenerOpciones={obtenerOpciones}
            descripcion={descripcion}
            {...props}
        />
    );
};

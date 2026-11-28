import { QSelect } from "@olula/componentes/atomos/qselect.tsx";
import { criteriaDefecto } from "@olula/lib/dominio.js";
import { useEffect, useState } from "react";
import { getZonasGeograficasMaestro } from "../infraestructura.ts";
import { tComun } from "../../i18n/index.ts";

type Opcion = { valor: string; descripcion: string };

interface ZonaGeograficaSelectProps {
    valor?: string;
    nombre?: string;
    label?: string;
    deshabilitado?: boolean;
    onChange?: (opcion: Opcion | null) => void;
}

/** Selector de zona geográfica (`zonasgeo`), para la ficha de país. */
export const ZonaGeograficaSelect = ({
    valor,
    nombre = "zona_id",
    label = tComun("zonaGeografica.zonaGeografica"),
    deshabilitado = false,
    onChange,
    ...props
}: ZonaGeograficaSelectProps) => {
    const [opciones, setOpciones] = useState<Opcion[]>([]);

    useEffect(() => {
        const cargar = async () => {
            const { datos } = await getZonasGeograficasMaestro({
                ...criteriaDefecto,
                filtro: [],
                orden: ["id", "ASC"],
                paginacion: { pagina: 1, limite: 200 },
            });
            setOpciones(datos.map((z) => ({ valor: z.id, descripcion: z.descripcion || z.id })));
        };
        cargar();
    }, []);

    return (
        <QSelect
            {...props}
            label={label}
            nombre={nombre}
            valor={valor}
            deshabilitado={deshabilitado}
            opciones={opciones}
            onChange={onChange}
        />
    );
};

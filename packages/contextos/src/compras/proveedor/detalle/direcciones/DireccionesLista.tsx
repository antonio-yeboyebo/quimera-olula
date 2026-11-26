import { MetaTabla } from "@olula/componentes/atomos/qtabla.tsx";
import { ListadoSemiControlado } from "@olula/componentes/maestro/ListadoSemiControlado.tsx";
import { EmitirEvento } from "@olula/lib/diseño.ts";
import { criteriaDefecto } from "@olula/lib/dominio.ts";
import { DireccionProveedor } from "../../diseño.ts";
import { useMemo } from "react";
import { tCompras, useTCompras } from "#/compras/i18n/index.ts";

const metaTablaDirecciones = (t = tCompras): MetaTabla<DireccionProveedor> => [
    {
        id: "principal",
        cabecera: t("proveedor.direcciones.principal"),
        render: (d: DireccionProveedor) => (d.principal ? t("comun.si") : ""),
    },
    { id: "tipoVia", cabecera: t("proveedor.direcciones.tipoVia") },
    { id: "nombreVia", cabecera: t("proveedor.direcciones.nombreVia") },
    { id: "numero", cabecera: t("comun.direccion.numero") },
    { id: "codPostal", cabecera: t("proveedor.direcciones.cp") },
    { id: "ciudad", cabecera: t("comun.direccion.ciudad") },
    { id: "provincia", cabecera: t("comun.direccion.provincia") },
    { id: "telefono", cabecera: t("comun.direccion.telefono") },
];

export const DireccionesLista = ({
    direcciones,
    seleccionada,
    publicar,
}: {
    direcciones: DireccionProveedor[];
    seleccionada?: string;
    publicar: EmitirEvento;
}) => {
    const t = useTCompras();
    const metaTabla = useMemo(() => metaTablaDirecciones(t), [t]);
    return (
        <ListadoSemiControlado
            metaTabla={metaTabla}
            entidades={direcciones}
            totalEntidades={direcciones.length}
            cargando={false}
            seleccionada={direcciones.find((d) => d.id === seleccionada) ?? null}
            onSeleccion={(direccion: DireccionProveedor) =>
                publicar("direccion_seleccionada", direccion)
            }
            criteriaInicial={criteriaDefecto}
            onCriteriaChanged={() => null}
            modo="tabla"
        />
    );
};

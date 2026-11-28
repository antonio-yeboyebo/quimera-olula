import { ListadoSemiControlado } from "@olula/componentes/maestro/ListadoSemiControlado.tsx";
import { QuimeraAcciones } from "@olula/componentes/moleculas/qacciones.tsx";
import { EmitirEvento } from "@olula/lib/diseño.ts";
import { criteriaDefecto } from "@olula/lib/dominio.ts";
import { LineaAlbaran } from "../../diseño.ts";
import { metaTablaLineaAlbaran } from "./metatabla_linea_albaran.tsx";
import { useTCompras } from "#/compras/i18n/index.ts";

export const LineasLista = ({
    lineas,
    divisa,
    seleccionada,
    acciones,
    publicar,
}: {
    lineas: LineaAlbaran[];
    divisa?: string;
    seleccionada?: string;
    acciones?: Parameters<typeof QuimeraAcciones>[0]["acciones"];
    publicar: EmitirEvento;
}) => {
    const t = useTCompras();
    return (
    <ListadoSemiControlado
        metaTabla={metaTablaLineaAlbaran(divisa, t)}
        entidades={lineas}
        totalEntidades={lineas.length}
        cargando={false}
        seleccionada={lineas.find((linea) => linea.id === seleccionada) ?? null}
        onSeleccion={(linea: LineaAlbaran) => publicar("linea_seleccionada", linea)}
        criteriaInicial={criteriaDefecto}
        onCriteriaChanged={() => null}
        modo="tabla"
        renderAcciones={() =>
            acciones && acciones.length > 0 ? (
                <div className="botones maestro-botones">
                    <QuimeraAcciones acciones={acciones} />
                </div>
            ) : null
        }
    />
    );
};

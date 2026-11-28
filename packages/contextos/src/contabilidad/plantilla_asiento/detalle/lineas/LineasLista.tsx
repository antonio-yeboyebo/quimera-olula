import { MetaTabla } from "@olula/componentes/atomos/qtabla.tsx";
import { ListadoSemiControlado } from "@olula/componentes/maestro/ListadoSemiControlado.tsx";
import { EmitirEvento } from "@olula/lib/diseño.ts";
import { criteriaDefecto } from "@olula/lib/dominio.js";
import { PartidaPlantilla } from "../../diseño.ts";
import { resumenConcepto, resumenImporte, resumenSubcuenta } from "../../dominio.ts";
import { tContabilidad } from "../../../i18n/index.ts";

const metaTablaPartidas: MetaTabla<PartidaPlantilla> = [
    { id: "numeroOrden", get cabecera() { return tContabilidad("plantilla_asiento.n"); } },
    { id: "codigoSubcuenta", get cabecera() { return tContabilidad("plantilla_asiento.subcuenta"); }, render: resumenSubcuenta },
    { id: "debeHaber", get cabecera() { return tContabilidad("plantilla_asiento.dH"); } },
    { id: "importe", get cabecera() { return tContabilidad("plantilla_asiento.importe"); }, render: resumenImporte },
    { id: "concepto", get cabecera() { return tContabilidad("plantilla_asiento.concepto"); }, render: resumenConcepto },
];

export const LineasLista = ({
    partidas,
    seleccionada,
    publicar,
}: {
    partidas: PartidaPlantilla[];
    seleccionada?: string;
    publicar: EmitirEvento;
}) => (
    <ListadoSemiControlado
        metaTabla={metaTablaPartidas}
        entidades={partidas}
        totalEntidades={partidas.length}
        cargando={false}
        seleccionada={partidas.find((p) => p.id === seleccionada) ?? null}
        onSeleccion={(partida: PartidaPlantilla) => publicar("linea_seleccionada", partida)}
        criteriaInicial={criteriaDefecto}
        onCriteriaChanged={() => null}
        modo="tabla"
    />
);

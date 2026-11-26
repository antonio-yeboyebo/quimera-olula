import { MetaTabla } from "@olula/componentes/atomos/qtabla.tsx";
import { ListadoSemiControlado } from "@olula/componentes/maestro/ListadoSemiControlado.tsx";
import { useEsMovil } from "@olula/componentes/maestro/useEsMovil.ts";
import { Criteria } from "@olula/lib/diseño.ts";
import { criteriaDefecto, formatearMoneda } from "@olula/lib/dominio.ts";
import { PartidaAsiento } from "../../diseño.ts";
import { descuadrePartidas, totalDebe, totalHaber } from "../../dominio.ts";
import "./PartidasAsientoLista.css";
import { tContabilidad, useTContabilidad } from "../../../i18n/index.ts";

const metaTablaPartida: MetaTabla<PartidaAsiento> = [
    {
        id: "codigoSubcuenta",
        get cabecera() { return tContabilidad("asiento.subcuenta"); },
        prioridad: "alta",
        render: (p) => p.codigoSubcuenta || String(p.subcuentaId),
    },
    { id: "debe", get cabecera() { return tContabilidad("asiento.debe"); }, tipo: "moneda", prioridad: "alta" },
    { id: "haber", get cabecera() { return tContabilidad("asiento.haber"); }, tipo: "moneda", prioridad: "alta" },
    { id: "concepto", get cabecera() { return tContabilidad("asiento.concepto"); }, prioridad: "baja" },
    {
        id: "esIva",
        cabecera: "IVA",
        prioridad: "media",
        render: (p) => (p.esIva ? "SI" : "NO"),
    },
];

// Las partidas vienen embebidas en el asiento, así que se ordenan y paginan en
// memoria: no hay consulta que lanzar al servidor.
const criteriaPartidasDefecto: Criteria = { ...criteriaDefecto };

/** `simple`: sin el título «Partidas», siempre en tabla (sin el cambio
 * tabla/tarjetas) y sin el recuadro de totales Debe/Haber (pestaña
 * Contabilidad de las facturas). */
export const PartidasAsientoLista = ({
    partidas,
    simple = false,
}: {
    partidas: PartidaAsiento[];
    simple?: boolean;
}) => {
    const t = useTContabilidad();
    const esMovil = useEsMovil();
    const descuadre = descuadrePartidas(partidas);

    return (
        <div className="PartidasAsientoLista">
            {!simple && <h3>{t("asiento.partidas")}</h3>}
            <ListadoSemiControlado
                metaTabla={metaTablaPartida}
                entidades={partidas}
                totalEntidades={partidas.length}
                seleccionada={null}
                onSeleccion={() => {}}
                criteriaInicial={criteriaPartidasDefecto}
                modoInicial={simple || !esMovil ? "tabla" : "tarjetas"}
                modosDisponibles={simple ? ["tabla"] : undefined}
                onCriteriaChanged={(_: Criteria) => null}
            />
            {!simple && (
                <div className="totales-asiento">
                    <div className="totales-asiento-item">
                        <label>{t("asiento.debe2")}</label>
                        <span>{formatearMoneda(totalDebe(partidas), "EUR")}</span>
                    </div>
                    <div className="totales-asiento-item">
                        <label>{t("asiento.haber3")}</label>
                        <span>{formatearMoneda(totalHaber(partidas), "EUR")}</span>
                    </div>
                    {Math.abs(descuadre) >= 0.005 && (
                        <div className="totales-asiento-item totales-asiento-item--descuadre">
                            <label>{t("asiento.descuadre2")}</label>
                            <span>{formatearMoneda(descuadre, "EUR")}</span>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

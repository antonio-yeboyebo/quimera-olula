import { QAviso } from "@olula/componentes/atomos/qaviso.tsx";
import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { QCheckbox } from "@olula/componentes/atomos/qcheckbox.tsx";
import { QInput } from "@olula/componentes/atomos/qinput.tsx";
import { EmitirEvento } from "@olula/lib/diseño.ts";
import { useState } from "react";
import {
    CandidatoConciliacion,
    CandidatoListaConciliacion,
    MovimientoBancario,
    PartidaHuerfana,
    RemesaCandidata,
    TipoFiltroCandidato,
} from "../../diseño.js";
import {
    BloqueoConciliarMovimiento,
    FILTROS_CANDIDATO,
    filtrarCandidatosPorTipo,
    listaCandidatosConciliacion,
} from "../../dominio.js";
import "./CandidatosConciliacion.css";
import { SeleccionCandidatos } from "./SeleccionCandidatos.js";
import { TarjetaCandidato } from "./TarjetaCandidato.js";
import { useTTesoreria } from "../../../i18n/index.ts";

/**
 * Candidatos para conciliar a mano, en una sola lista ordenada por fecha descendente:
 * - Recibos (GET `.../candidatos`) por el importe del movimiento (conciliación
 *   completa), mayores (parcial) o menores (solo sumados a otros).
 * - Remesas (GET `.../remesas`): de cobro en un ingreso, de pago en un cargo.
 * - Partidas contables de la subcuenta bancaria sin movimiento equivalente,
 *   que se vinculan sin modal (`asiento_vinculado_confirmado`).
 *
 * El buscador recarga los recibos en la API y filtra remesas y partidas con el
 * mismo texto (ver listaCandidatosConciliacion). Las casillas de tipo filtran la lista
 * ya cargada, sin volver a la API; sin ninguna marcada se ven todos. No son sub-recursos persistidos:
 * se recalculan en cada carga, así que no usan ListaEntidades, solo los arrays de detalle.ts.
 *
 * Con la casilla de cada tarjeta los candidatos pasan a la zona de selección, encima
 * de la lista, para conciliarlos juntos si suman el movimiento (ver SeleccionCandidatos).
 */
export const CandidatosConciliacion = ({
    movimiento,
    candidatos,
    remesas,
    partidas,
    texto,
    seleccion,
    bloqueo,
    publicar,
}: {
    movimiento: MovimientoBancario;
    candidatos: CandidatoConciliacion[];
    remesas: RemesaCandidata[];
    partidas: PartidaHuerfana[];
    texto: string;
    seleccion: CandidatoListaConciliacion[];
    bloqueo: BloqueoConciliarMovimiento;
    publicar: EmitirEvento;
}) => {
    const tx = useTTesoreria();
    const [textoLocal, setTextoLocal] = useState(texto);
    const [tipos, setTipos] = useState<TipoFiltroCandidato[]>([]);

    const cambiarTipo = (tipo: TipoFiltroCandidato, marcado: boolean) =>
        setTipos((actuales) => marcado ? [...actuales, tipo] : actuales.filter((t) => t !== tipo));

    const buscar = () => publicar("candidatos_buscados", textoLocal);

    const lista = filtrarCandidatosPorTipo(
        listaCandidatosConciliacion(candidatos, remesas, partidas, texto, seleccion), tipos
    );
    const divisa = movimiento.divisa ?? "EUR";

    return (
        <div className="CandidatosConciliacion">
            {bloqueo.bloqueado && <QAviso variante="advertencia">{bloqueo.motivo}</QAviso>}

            <div className="botones">
                <QBoton variante="borde" deshabilitado={bloqueo.bloqueado}
                    onClick={() => publicar("asiento_solicitado")}>
                    {tx("conciliacion.asientoManual")}
                </QBoton>
                <QBoton variante="texto" onClick={() => publicar("ignorar_solicitado")}>
                    {tx("conciliacion.ignorarMovimiento")}
                </QBoton>
            </div>

            <h4>{tx("conciliacion.buscarCandidatos")}</h4>
            <div className="filtros-candidatos">
                {FILTROS_CANDIDATO.map(({ tipo, etiqueta }) => (
                    <QCheckbox
                        key={tipo}
                        label={etiqueta}
                        nombre={`filtro-candidatos-${tipo}`}
                        valor={tipos.includes(tipo)}
                        condensado
                        onChange={(valor) => cambiarTipo(tipo, valor === "true")}
                    />
                ))}
            </div>
            <div id="buscador-candidatos">
                <QInput
                    label=""
                    placeholder={tx("conciliacion.buscarPorReciboFacturaTerceroNif")}
                    nombre="textoCandidatos"
                    valor={textoLocal}
                    onChange={(valor) => setTextoLocal(valor)}
                    onEnterKeyUp={buscar}
                    condensado
                />
                <QBoton tamaño="pequeño" variante="borde" onClick={buscar}>
                    {tx("conciliacion.buscar")}
                </QBoton>
            </div>

            {seleccion.length > 0 && (
                <SeleccionCandidatos movimiento={movimiento} seleccion={seleccion} divisa={divisa}
                    bloqueado={bloqueo.bloqueado} publicar={publicar} />
            )}

            {lista.length === 0 ? (
                <p className="sin-candidatos">
                    {tipos.length > 0
                        ? tx("conciliacion.noHayCandidatosDeLosTipos")
                        : tx("conciliacion.noHayRecibosRemesasNiPartidas")}
                </p>
            ) : (
                <ul className="lista-candidatos">
                    {lista.map((c) => (
                        <TarjetaCandidato key={c.id} candidato={c} movimiento={movimiento} divisa={divisa}
                            bloqueado={bloqueo.bloqueado} publicar={publicar} />
                    ))}
                </ul>
            )}
        </div>
    );
};

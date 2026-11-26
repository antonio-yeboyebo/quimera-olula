import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { QEtiqueta } from "@olula/componentes/atomos/qetiqueta.tsx";
import { QInput } from "@olula/componentes/atomos/qinput.tsx";
import { EmitirEvento } from "@olula/lib/diseño.ts";
import { formatearMoneda, plugin } from "@olula/lib/dominio.ts";
import { useModelo } from "@olula/lib/useModelo.ts";

import { LineaAlbaranar, LoteAlbaranar } from "../../../diseño.ts";
import { calcularEnviada, metaLinea } from "../../../dominio.ts";
import { BorrarLoteAlbaranar } from "../../borrar_lote/BorrarLoteAlbaranar.tsx";
import { CambiarLoteAlbaranar } from "../../cambiar_lote/CambiarLoteAlbaranar.tsx";
import { CrearLoteAlbaranar } from "../../crear_lote/CrearLoteAlbaranar.tsx";
import { EstadoAlbaranar } from "../diseño.ts";
import "./LineasAlbaranar.css";
import { useTVentas } from "../../../../i18n/index.ts";

// ---------------------------------------------------------------------------
// Fila de línea
// ---------------------------------------------------------------------------

const FilaLinea = ({
    linea,
    conLotes,
    emitir,
}: {
    linea: LineaAlbaranar;
    conLotes: boolean;
    emitir: EmitirEvento;
}) => {
    const t = useTVentas();
    const { uiProps } = useModelo(metaLinea, linea, async (lineaActualizada) => {
        await emitir("enviada_cambiada", {
            idLinea: lineaActualizada.idLinea,
            enviada: lineaActualizada.enviada as number,
        });
    });

    return (
        <>
            <tr>
                <td>
                    <span>{linea.sku}</span>{" "}
                    <span>{linea.descripcion}</span>{" "}
                    <span>{`(${formatearMoneda(linea.pvpTotal, "EUR")})`}</span>
                </td>
                <td className="num">
                    <QEtiqueta
                        variante={
                            linea.servida === 0
                                ? "error"
                                : linea.servida < linea.cantidad
                                  ? "advertencia"
                                  : "exito"
                        }
                    >
                        {linea.servida} / {linea.cantidad}
                    </QEtiqueta>
                </td>
                <td className="num">
                    {linea.porLotes ? (
                        <span>{calcularEnviada(linea)}</span>
                    ) : (
                        <QInput label="" {...uiProps("enviada")} />
                    )}
                </td>
                {conLotes && <td>{linea.porLotes ? t("pedido.albaranar.si") : t("pedido.albaranar.no")}</td>}
                <td>
                    {conLotes && linea.porLotes && (
                        <QBoton
                            tamaño="pequeño"
                            onClick={() => emitir("alta_lote_solicitada", linea.idLinea)}
                        >
                            {t("pedido.albaranar.anadirLote")}
                        </QBoton>
                    )}
                </td>
            </tr>
            {conLotes && linea.porLotes && linea.lotes.length > 0 && (
                <tr>
                    <td colSpan={conLotes ? 5 : 4} className="lotes-celda">
                        <table>
                            <thead>
                                <tr>
                                    <th>{t("pedido.albaranar.lote")}</th>
                                    <th className="num">{t("documento.formLinea.cantidad")}</th>
                                    <th></th>
                                    <th></th>
                                </tr>
                            </thead>
                            <tbody>
                                {linea.lotes.map((lote) => (
                                    <FilaLote
                                        key={lote.idLote}
                                        linea={linea}
                                        lote={lote}
                                        emitir={emitir}
                                    />
                                ))}
                            </tbody>
                        </table>
                    </td>
                </tr>
            )}
        </>
    );
};

const FilaLote = ({
    linea,
    lote,
    emitir,
}: {
    linea: LineaAlbaranar;
    lote: LoteAlbaranar;
    emitir: EmitirEvento;
}) => {
  const t = useTVentas();
  return (
    <tr>
        <td>{lote.idLote}</td>
        <td className="num">{lote.cantidad}</td>
        <td>
            <QBoton
                tamaño="pequeño"
                onClick={() =>
                    emitir("cambio_lote_solicitado", { idLinea: linea.idLinea, lote })
                }
            >
                {t("documento.lineas.editar")}
            </QBoton>
        </td>
        <td>
            <QBoton
                tamaño="pequeño"
                onClick={() =>
                    emitir("baja_lote_solicitada", { idLinea: linea.idLinea, lote })
                }
            >
                {t("documento.detalle.borrar")}
            </QBoton>
        </td>
    </tr>
  );
};

// ---------------------------------------------------------------------------
// Orquestador principal
// ---------------------------------------------------------------------------

export const LineasAlbaranar = ({
    lineas,
    estado,
    lineaActiva,
    loteActivo,
    emitir,
}: {
    lineas: LineaAlbaranar[];
    estado: EstadoAlbaranar;
    lineaActivaId: string | null;
    loteActivo: LoteAlbaranar | null;
    lineaActiva: LineaAlbaranar | null;
    emitir: EmitirEvento;
}) => {
    const t = useTVentas();
    const conLotes = plugin("trazabilidad") === "activa";
    return (
    <div className="LineasAlbaranar">
        <table>
            <thead>
                <tr>
                    <th>{t("pedido.albaranar.articulo")}</th>
                    <th className="num">{t("pedido.albaranar.enviada")}</th>
                    <th className="num">{t("pedido.albaranar.aEnviar")}</th>
                    {conLotes && <th>{t("pedido.albaranar.porLotes")}</th>}
                    <th></th>
                </tr>
            </thead>
            <tbody>
                {lineas.map((linea) => (
                    <FilaLinea
                        key={linea.idLinea}
                        linea={linea}
                        conLotes={conLotes}
                        emitir={emitir}
                    />
                ))}
            </tbody>
        </table>

        {estado === "CREANDO_LOTE" && lineaActiva && (
            <CrearLoteAlbaranar linea={lineaActiva} emitir={emitir} />
        )}
        {estado === "CAMBIANDO_LOTE" && lineaActiva && loteActivo && (
            <CambiarLoteAlbaranar
                linea={lineaActiva}
                lote={loteActivo}
                emitir={emitir}
            />
        )}
        {estado === "BORRANDO_LOTE" && lineaActiva && loteActivo && (
            <BorrarLoteAlbaranar
                linea={lineaActiva}
                lote={loteActivo}
                emitir={emitir}
            />
        )}
    </div>
    );
};

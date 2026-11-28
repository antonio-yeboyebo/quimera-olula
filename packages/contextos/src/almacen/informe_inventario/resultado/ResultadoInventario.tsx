import { PropsResultadoInforme } from "#/comun/informe_documentos/diseño.ts";
import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { descargarDocumento } from "@olula/lib/api/documentos.ts";
import { ContextoError } from "@olula/lib/contexto.ts";
import { useCallback, useContext, useState } from "react";
import { FormatoHoja, GrupoInventario, ResultadoInventario as Resultado } from "../diseño.ts";
import { cantidad, criteriosResultado, importe, nombreFicheroInventario } from "../dominio.ts";
import { getHojaInventario, getReportInventario, getResultadoInventario } from "../infraestructura.ts";
import "./ResultadoInventario.css";
import { tAlmacen, useTAlmacen } from "../../i18n/index.ts";

type Ocupado = "calcular" | "pdf" | FormatoHoja | null;

/**
 * Pestaña Resultado de los informes de inventario: «Calcular» enseña el stock
 * agrupado por almacén (con precio, valor y totales en el valorado) y los
 * botones descargan el PDF y la hoja (Excel u ODS) de los criterios guardados.
 */
export const ResultadoInventario = ({ pestaña, ficha }: PropsResultadoInforme) => {
    const t = useTAlmacen();
    const { intentar } = useContext(ContextoError);
    const [resultado, setResultado] = useState<Resultado | null>(null);
    const [ocupado, setOcupado] = useState<Ocupado>(null);

    const ejecutar = useCallback(
        async (accion: Exclude<Ocupado, null>, f: () => Promise<void>) => {
            if (ocupado) return;
            setOcupado(accion);
            try {
                await f();
            } catch {
                // intentar ya enseña el error.
            } finally {
                setOcupado(null);
            }
        },
        [ocupado]
    );

    const calcular = () =>
        ejecutar("calcular", async () => {
            setResultado(await intentar(() => getResultadoInventario(pestaña.url, ficha.id)));
        });

    const descargar = (extension: "pdf" | FormatoHoja) =>
        ejecutar(extension, async () => {
            const blob = await intentar(() =>
                extension === "pdf"
                    ? getReportInventario(pestaña.url, ficha.id)
                    : getHojaInventario(pestaña.url, ficha.id, extension)
            );
            await descargarDocumento(blob, nombreFicheroInventario(pestaña, ficha, extension));
        });

    return (
        <div className="ResultadoInventario">
            <div className="maestro-botones">
                <QBoton onClick={calcular} deshabilitado={!!ocupado}>
                    {ocupado === "calcular" ? t("informe_inventario.calculando") : t("informe_inventario.calcular")}
                </QBoton>
                <QBoton variante="borde" onClick={() => descargar("pdf")} deshabilitado={!!ocupado}>
                    {t("informe_inventario.pdf")}
                </QBoton>
                <QBoton variante="borde" onClick={() => descargar("xlsx")} deshabilitado={!!ocupado}>
                    {t("informe_inventario.excel")}
                </QBoton>
                <QBoton variante="borde" onClick={() => descargar("ods")} deshabilitado={!!ocupado}>
                    {t("informe_inventario.ods")}
                </QBoton>
            </div>

            {!resultado && <p className="ayuda">{t("informe_inventario.pulsaCalcularParaVerElInventario")}</p>}

            {resultado && (
                <>
                    <h3>{resultado.titulo}</h3>
                    <p className="criterios">{criteriosResultado(resultado)}</p>
                    {resultado.grupos.length === 0 && <p>{t("informe_inventario.noHayStockConEstosCriterios")}</p>}
                    {resultado.grupos.map((grupo) => (
                        <GrupoAlmacen key={grupo.almacenId} grupo={grupo} valorado={resultado.valorado} />
                    ))}
                    {resultado.valorado && resultado.grupos.length > 0 && (
                        <p className="total-inventario">
                            {t("informe_inventario.totalInventario")}{" "}<span>{importe(resultado.total)}</span>
                        </p>
                    )}
                </>
            )}
        </div>
    );
};

const GrupoAlmacen = ({ grupo, valorado }: { grupo: GrupoInventario; valorado: boolean }) => {
    const direccion = [grupo.direccion, grupo.poblacion].filter(Boolean).join(" · ");
    return (
        <section className="grupo-almacen">
            <h4>
                {grupo.almacenId} · {grupo.almacen ?? ""}
                {direccion && <small>{direccion}</small>}
            </h4>
            <table>
                <thead>
                    <tr>
                        <th>{tAlmacen("informe_inventario.referencia")}</th>
                        <th>{tAlmacen("informe_inventario.descripcion")}</th>
                        <th className="numero">{tAlmacen("informe_inventario.cantidad")}</th>
                        {valorado && <th className="numero">{tAlmacen("informe_inventario.precio")}</th>}
                        {valorado && <th className="numero">{tAlmacen("informe_inventario.valor")}</th>}
                    </tr>
                </thead>
                <tbody>
                    {grupo.filas.map((fila) => (
                        <tr key={fila.referencia}>
                            <td>{fila.referencia}</td>
                            <td>{fila.descripcion ?? ""}</td>
                            <td className="numero">{cantidad(fila.cantidad)}</td>
                            {valorado && <td className="numero">{importe(fila.precio)}</td>}
                            {valorado && <td className="numero">{importe(fila.valor)}</td>}
                        </tr>
                    ))}
                </tbody>
                {valorado && (
                    <tfoot>
                        <tr>
                            <td colSpan={4}>{tAlmacen("informe_inventario.totalAlmacen")}</td>
                            <td className="numero">{importe(grupo.total)}</td>
                        </tr>
                    </tfoot>
                )}
            </table>
        </section>
    );
};

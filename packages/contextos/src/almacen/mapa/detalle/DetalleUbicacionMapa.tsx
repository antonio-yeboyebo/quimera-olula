import { urlFicha, urlListado } from "#/almacen/comun/fichas.ts";
import { ValorConEnlace } from "@olula/componentes/atomos/qenlace_ficha.tsx";
import { InsigniaClase } from "#/almacen/slotting/Slotting.tsx";
import { StockUbicacionItem } from "#/almacen/ubicacion/diseño.ts";
import { getStocksUbicacion } from "#/almacen/ubicacion/infraestructura.ts";
import { StocksUbicacion } from "#/almacen/ubicacion/vistas/detalle/stocks/StocksUbicacion.tsx";
import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { QEtiqueta } from "@olula/componentes/atomos/qetiqueta.tsx";
import { useEffect, useState } from "react";
import { UbicacionMapa } from "../diseño.ts";
import { textoDistancias } from "../dominio.ts";
import { useTAlmacen } from "../../i18n/index.ts";

const fmt = (n: number) => n.toLocaleString("es-ES");

/** Panel de la ubicación pulsada: qué contiene, su picking fijo, sus clases y su stock con movimientos. */
export const DetalleUbicacionMapa = ({ ubicacion, onCerrar }: { ubicacion: UbicacionMapa; onCerrar: () => void }) => {
    const t = useTAlmacen();
    const [stocks, setStocks] = useState<StockUbicacionItem[] | null>(null);

    useEffect(() => {
        setStocks(null);
        getStocksUbicacion(ubicacion.ubicacionId).then(setStocks);
    }, [ubicacion.ubicacionId]);

    const conStock = (stocks ?? []).filter((s) => s.cantidadFisica !== 0);
    const descripcion = (articuloId: string) => stocks?.find((s) => s.articuloId === articuloId)?.articulo;
    const pf = ubicacion.pickingFijo;

    return (
        <section className="mapa-panel mapa-detalle-ubicacion">
            <div className="mapa-panel-cabecera">
                <h3>
                    <ValorConEnlace href={urlFicha.ubicacion(ubicacion.ubicacionId)} etiqueta={`Abrir ubicación ${ubicacion.ubicacion}`}>
                        {t("mapa.ubicacionUbicacion", { ubicacion: ubicacion.ubicacion })}
                    </ValorConEnlace>
                    {ubicacion.bloqueada && <> <QEtiqueta variante="error">{t("mapa.bloqueada")}</QEtiqueta></>}
                </h3>
                <QBoton variante="texto" onClick={onCerrar}>{t("mapa.cerrar")}</QBoton>
            </div>

            <ul className="mapa-detalle-articulos">
                {stocks === null ? <li>{t("mapa.cargandoStock")}</li>
                    : conStock.length === 0 ? <li>{t("mapa.vacia")}</li>
                        : conStock.map((s) => (
                            <li key={s.id}>
                                <ValorConEnlace href={urlFicha.articulo(s.articuloId)} etiqueta={t("mapa.abrirArticuloArticuloid", { articuloId: s.articuloId })}>
                                    <strong>{s.articuloId}</strong>
                                </ValorConEnlace>{" "}
                                {s.articulo}
                                <span className="mapa-detalle-stock">{t("mapa.stock")}{" "}<strong>{fmt(s.cantidadFisica)}</strong></span>
                            </li>
                        ))}
                {pf && (
                    <li>
                        <ValorConEnlace href={urlListado.pickingFijoDeArticulo(pf.articuloId)} etiqueta={t("mapa.abrirElPickingFijoDeArticuloid", { articuloId: pf.articuloId })}>
                            {t("mapa.pickingFijoDe")}{" "}<strong>{pf.articuloId}</strong>
                        </ValorConEnlace>{" "}
                        {descripcion(pf.articuloId) ?? ""}
                        <span className="mapa-detalle-stock">
                            {t("mapa.minValorMaxValor2", { valor: fmt(pf.minimo), valor2: fmt(pf.maximo) })}
                        </span>
                    </li>
                )}
            </ul>

            <dl className="mapa-detalle-clases">
                <div>
                    <dt>{t("mapa.abcHueco")}</dt>
                    <dd>{ubicacion.claseUbicacion ? <InsigniaClase clase={ubicacion.claseUbicacion} /> : "—"}</dd>
                </div>
                <div>
                    <dt>{t("mapa.abcArticulo")}</dt>
                    <dd>{ubicacion.claseArticulo ? <InsigniaClase clase={ubicacion.claseArticulo} /> : "—"}</dd>
                </div>
                <div>
                    <dt>{t("mapa.clase")}</dt>
                    <dd>{ubicacion.clasesAlmacenamiento.length ? ubicacion.clasesAlmacenamiento.join(", ") : "—"}</dd>
                </div>
            </dl>

            {textoDistancias(ubicacion) && <p className="mapa-detalle-distancia">{textoDistancias(ubicacion)}</p>}

            {conStock.length > 0 && <StocksUbicacion stocks={conStock} />}
        </section>
    );
};

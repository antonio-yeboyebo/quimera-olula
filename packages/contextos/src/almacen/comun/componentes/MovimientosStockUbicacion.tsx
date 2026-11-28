import { urlFicha } from "#/almacen/comun/fichas.ts";
import { ValorConEnlace } from "@olula/componentes/atomos/qenlace_ficha.tsx";
import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { Fragment, useEffect, useState } from "react";
import { DesgloseCajaStockUbicacion, MoviStockUbicacion } from "#/almacen/ubicacion/diseño.ts";
import { getDesgloseCajaStockUbicacion, getStockUbicacion } from "#/almacen/ubicacion/infraestructura.ts";
import { tAlmacen, useTAlmacen } from "../../i18n/index.ts";

type ModoVista = "plana" | "cajas";

type GrupoCaja = {
    idCaja: string | null;
    caja: string | null;
    cantidad: number;
    movimientos: MoviStockUbicacion[];
};

const claveCaja = (idCaja: string | null) => idCaja ?? "__sin_caja";

// El desglose viene por caja y lote: se suma por caja. Solo incluye cajas con
// saldo != 0 en la ubicación, así que las que ya salieron no aparecen.
const agruparPorCaja = (
    desglose: DesgloseCajaStockUbicacion[],
    movimientos: MoviStockUbicacion[],
): GrupoCaja[] => {
    const mapa = new Map<string, GrupoCaja>();
    for (const d of desglose) {
        const clave = claveCaja(d.idCaja);
        if (!mapa.has(clave)) {
            mapa.set(clave, {
                idCaja: d.idCaja,
                caja: d.caja,
                cantidad: 0,
                movimientos: movimientos.filter((m) => m.idCaja === d.idCaja),
            });
        }
        mapa.get(clave)!.cantidad += d.cantidad;
    }
    return Array.from(mapa.values()).filter((g) => g.cantidad !== 0);
};

const TablaMovimientosPlana = ({ movimientos }: { movimientos: MoviStockUbicacion[] }) => (
    <table>
        <thead>
            <tr>
                <th>{tAlmacen("comun.fechaHora")}</th>
                <th>{tAlmacen("comun.lote")}</th>
                <th>{tAlmacen("comun.caja")}</th>
                <th>{tAlmacen("comun.concepto")}</th>
                <th>{tAlmacen("comun.cantidad")}</th>
            </tr>
        </thead>
        <tbody>
            {movimientos.map((m) => (
                <tr key={m.id}>
                    <td>{m.fechaHora.toLocaleString("es-ES")}</td>
                    <td>{m.lote}</td>
                    <td>
                        {m.caja
                            ? <ValorConEnlace href={urlFicha.caja(m.idCaja)} etiqueta={tAlmacen("comun.abrirCajaCaja", { caja: m.caja })}>{m.caja}</ValorConEnlace>
                            : tAlmacen("comun.sinCaja")}
                    </td>
                    <td>{m.concepto}</td>
                    <td>{m.cantidad.toLocaleString("es-ES")}</td>
                </tr>
            ))}
        </tbody>
    </table>
);

const CajasArticulo = ({
    desglose,
    movimientos,
}: {
    desglose: DesgloseCajaStockUbicacion[];
    movimientos: MoviStockUbicacion[];
}) => {
    const t = useTAlmacen();
    const grupos = agruparPorCaja(desglose, movimientos);
    const [desplegadas, setDesplegadas] = useState<Set<string>>(new Set());

    const alternar = (clave: string) =>
        setDesplegadas((actuales) => {
            const nuevas = new Set(actuales);
            if (nuevas.has(clave)) nuevas.delete(clave);
            else nuevas.add(clave);
            return nuevas;
        });

    if (!grupos.length) return <p>{t("comun.sinCajasConStock")}</p>;

    return (
        <table className="cajas-articulo">
            <thead>
                <tr>
                    <th>{t("comun.caja")}</th>
                    <th>{t("comun.cantidad")}</th>
                    <th></th>
                </tr>
            </thead>
            <tbody>
                {grupos.map((grupo) => {
                    const clave = claveCaja(grupo.idCaja);
                    const desplegada = desplegadas.has(clave);
                    return (
                        <Fragment key={clave}>
                            <tr>
                                <td>
                                    {grupo.caja
                                        ? <ValorConEnlace href={urlFicha.caja(grupo.idCaja)} etiqueta={t("comun.abrirCajaCaja", { caja: grupo.caja })}>{grupo.caja}</ValorConEnlace>
                                        : t("comun.sinCaja")}
                                </td>
                                <td>{grupo.cantidad.toLocaleString("es-ES")}</td>
                                <td>
                                    <QBoton
                                        tamaño="pequeño"
                                        variante="borde"
                                        onClick={() => alternar(clave)}
                                    >
                                        {desplegada ? t("comun.ocultarMovimientos") : t("comun.verMovimientos")}
                                    </QBoton>
                                </td>
                            </tr>
                            {desplegada && (
                                <tr>
                                    <td colSpan={3}>
                                        <TablaMovimientosPlana movimientos={grupo.movimientos} />
                                    </td>
                                </tr>
                            )}
                        </Fragment>
                    );
                })}
            </tbody>
        </table>
    );
};

/**
 * Movimientos de un artículo en una ubicación (un stock por ubicación), en lista plana o
 * agrupados por caja. Pensado para la expansión de una fila de tabla.
 */
export const MovimientosStockUbicacion = ({ stockUbicacionId }: { stockUbicacionId: string }) => {
    const t = useTAlmacen();
    const [movimientos, setMovimientos] = useState<MoviStockUbicacion[]>([]);
    const [desglose, setDesglose] = useState<DesgloseCajaStockUbicacion[]>([]);
    const [cargando, setCargando] = useState(true);
    const [modo, setModo] = useState<ModoVista>("plana");

    useEffect(() => {
        setCargando(true);
        Promise.all([getStockUbicacion(stockUbicacionId), getDesgloseCajaStockUbicacion(stockUbicacionId)])
            .then(([stock, desgloseCajas]) => {
                setMovimientos(stock.movimientos);
                setDesglose(desgloseCajas);
            })
            .finally(() => setCargando(false));
    }, [stockUbicacionId]);

    if (cargando) return <p>{t("comun.cargandoMovimientos")}</p>;
    if (!movimientos.length) return <p>{t("comun.sinMovimientos")}</p>;

    return (
        <div className="ExpansionMovimientos">
            <div className="expansion-movimientos-barra">
                <QBoton
                    tamaño="pequeño"
                    variante={modo === "plana" ? "solido" : "borde"}
                    onClick={() => setModo("plana")}
                >
                    {t("comun.listaPlana")}
                </QBoton>
                <QBoton
                    tamaño="pequeño"
                    variante={modo === "cajas" ? "solido" : "borde"}
                    onClick={() => setModo("cajas")}
                >
                    {t("comun.porCajas")}
                </QBoton>
            </div>
            {modo === "plana" ? (
                <TablaMovimientosPlana movimientos={movimientos} />
            ) : (
                <CajasArticulo desglose={desglose} movimientos={movimientos} />
            )}
        </div>
    );
};

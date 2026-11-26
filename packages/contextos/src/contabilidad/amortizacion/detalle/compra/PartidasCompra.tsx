import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { QTabla } from "@olula/componentes/atomos/qtabla.tsx";
import { ContextoError } from "@olula/lib/contexto.ts";
import { useCallback, useContext, useEffect, useState } from "react";
import { AsociarPartidaCompra } from "../../asociar_partida/AsociarPartidaCompra.tsx";
import { metaTablaPartidasCompra } from "../../asociar_partida/meta.ts";
import { Amortizacion, PartidaCompra } from "../../diseño.ts";
import { deleteQuitarPartida, getPartidasCompra } from "../../infraestructura.ts";
import { useTContabilidad } from "../../../i18n/index.ts";

/** Pestaña «Compra»: partidas de facturas de proveedor asociadas al activo
 * (`co_partidas.codactivo`); el informe de amortizaciones las usa como coste. */
export const PartidasCompra = ({ amortizacion }: { amortizacion: Amortizacion }) => {
    const t = useTContabilidad();
    const { intentar } = useContext(ContextoError);
    const [partidas, setPartidas] = useState<PartidaCompra[]>([]);
    const [cargando, setCargando] = useState(true);
    const [activa, setActiva] = useState<PartidaCompra | null>(null);
    const [asociando, setAsociando] = useState(false);

    const recargar = useCallback(async () => {
        setCargando(true);
        try {
            setPartidas(await getPartidasCompra(amortizacion.id, false));
        } finally {
            setCargando(false);
        }
    }, [amortizacion.id]);

    useEffect(() => { recargar(); }, [recargar]);

    const quitar = useCallback(async () => {
        if (!activa) return;
        await intentar(() => deleteQuitarPartida(amortizacion.id, activa.id));
        setActiva(null);
        await recargar();
    }, [activa, amortizacion.id, intentar, recargar]);

    return (
        <div className="PartidasCompra">
            <div className="botones maestro-botones">
                <QBoton onClick={() => setAsociando(true)}>{t("amortizacion.asociarFactura")}</QBoton>
                <QBoton onClick={quitar} deshabilitado={!activa}>{t("amortizacion.quitarFactura")}</QBoton>
            </div>
            <QTabla metaTabla={metaTablaPartidasCompra} datos={partidas} cargando={cargando}
                seleccionadaId={activa?.id} onSeleccion={setActiva}
                orden={["fecha", "DESC"]} totalEntidades={partidas.length} />
            {asociando && (
                <AsociarPartidaCompra
                    amortizacion={amortizacion}
                    onAsociada={async () => { setAsociando(false); await recargar(); }}
                    onCancelar={() => setAsociando(false)}
                />
            )}
        </div>
    );
};

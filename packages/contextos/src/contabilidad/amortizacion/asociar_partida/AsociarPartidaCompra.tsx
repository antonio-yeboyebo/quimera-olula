import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { QTabla } from "@olula/componentes/atomos/qtabla.tsx";
import { QModal } from "@olula/componentes/index.js";
import { ContextoError } from "@olula/lib/contexto.ts";
import { useCallback, useContext, useEffect, useState } from "react";
import { Amortizacion, PartidaCompra } from "../diseño.ts";
import { metaTablaPartidasCompra } from "./meta.ts";
import { getPartidasCompra, postAsociarPartida } from "../infraestructura.ts";
import { useTContabilidad } from "../../i18n/index.ts";


/** `pbnAsociarFact_clicked`: partidas de la subcuenta de elemento del grupo
 * en facturas de proveedor, al debe y sin activo. */
export const AsociarPartidaCompra = ({
    amortizacion,
    onAsociada,
    onCancelar,
}: {
    amortizacion: Amortizacion;
    onAsociada: () => void;
    onCancelar: () => void;
}) => {
    const t = useTContabilidad();
    const { intentar } = useContext(ContextoError);
    const [candidatas, setCandidatas] = useState<PartidaCompra[]>([]);
    const [cargando, setCargando] = useState(true);
    const [elegida, setElegida] = useState<PartidaCompra | null>(null);

    useEffect(() => {
        getPartidasCompra(amortizacion.id, true)
            .then(setCandidatas)
            .finally(() => setCargando(false));
    }, [amortizacion.id]);

    const asociar = useCallback(async () => {
        if (!elegida) return;
        await intentar(() => postAsociarPartida(amortizacion.id, elegida.id));
        onAsociada();
    }, [amortizacion.id, elegida, intentar, onAsociada]);

    return (
        <QModal abierto={true} nombre="asociarPartidaCompra" titulo={t("amortizacion.asociarFacturaDeCompra")}
            onCerrar={onCancelar}>
            <div className="AsociarPartidaCompra">
                {!cargando && candidatas.length === 0 && (
                    <p>{t("amortizacion.noHayFacturasDeProveedorCon")}</p>
                )}
                <QTabla
                    metaTabla={metaTablaPartidasCompra}
                    datos={candidatas}
                    cargando={cargando}
                    seleccionadaId={elegida?.id}
                    onSeleccion={setElegida}
                    orden={["fecha", "DESC"]}
                    totalEntidades={candidatas.length}
                />
                <div className="botones maestro-botones">
                    <QBoton onClick={asociar} deshabilitado={!elegida}>{t("amortizacion.asociar")}</QBoton>
                </div>
            </div>
        </QModal>
    );
};

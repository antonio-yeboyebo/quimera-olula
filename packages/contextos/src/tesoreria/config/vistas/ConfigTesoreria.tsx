import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { QRadio } from "@olula/componentes/atomos/qradio.tsx";
import { ContextoError } from "@olula/lib/contexto.ts";
import { useContext, useEffect, useState } from "react";
import { ConfigTesoreria as Config, ModoPagoRemesa, TipoRemesa } from "../diseño.ts";
import { conRemesasPago, explicacionModoPagoRemesa, opcionesModoPagoRemesa } from "../dominio.ts";
import { getConfigTesoreria, patchConfigTesoreria } from "../infraestructura.ts";
import "./ConfigTesoreria.css";
import { useTTesoreria } from "../../i18n/index.ts";

const CAMPO: Record<TipoRemesa, keyof Config> = { cobro: "modoCobro", pago: "modoPago" };

/**
 * Configuración de tesorería: cómo se pagan y contabilizan las remesas de cobro y
 * de pago (equivalente a "Datos generales" de tesorería del escritorio). Se guarda
 * a mano y no al cambiar, porque el modo decide los asientos de las remesas nuevas.
 */
export const ConfigTesoreria = () => {
    const t = useTTesoreria();
    const { intentar } = useContext(ContextoError);
    const [guardada, setGuardada] = useState<Config | null>(null);
    const [config, setConfig] = useState<Config | null>(null);
    const [guardando, setGuardando] = useState(false);

    useEffect(() => {
        intentar(async () => {
            const leida = await getConfigTesoreria();
            setGuardada(leida);
            setConfig(leida);
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    if (!config || !guardada) return null;

    const cambiada = config.modoCobro !== guardada.modoCobro
        || (conRemesasPago() && config.modoPago !== guardada.modoPago);

    const guardar = async () => {
        setGuardando(true);
        await intentar(async () => {
            await patchConfigTesoreria(config);
            setGuardada(config);
        });
        setGuardando(false);
    };

    const modoRemesa = (tipo: TipoRemesa, titulo: string) => {
        const modo = config[CAMPO[tipo]];
        return (
            <section className="modo-remesa">
                <h3>{titulo}</h3>
                <QRadio
                    label={t("config.modoDePago")}
                    nombre={`modo-${tipo}`}
                    opciones={opcionesModoPagoRemesa}
                    valor={modo}
                    onChange={(opcion) =>
                        opcion && setConfig({ ...config, [CAMPO[tipo]]: opcion.valor as ModoPagoRemesa })}
                />
                <p className="explicacion-modo">{explicacionModoPagoRemesa(tipo, modo)}</p>
            </section>
        );
    };

    return (
        <div className="ConfigTesoreria">
            <h2>{t("config.configuracionDeTesoreria")}</h2>
            <p className="aviso-modo">
                {t("config.elModoSeAplicaALas")}
            </p>
            {modoRemesa("cobro", t("config.remesasDeCobro"))}
            {conRemesasPago() && modoRemesa("pago", t("config.remesasDePago"))}
            <div className="botones">
                <QBoton deshabilitado={!cambiada || guardando} onClick={guardar}>
                    {guardando ? t("config.guardando") : t("config.guardar")}
                </QBoton>
            </div>
        </div>
    );
};

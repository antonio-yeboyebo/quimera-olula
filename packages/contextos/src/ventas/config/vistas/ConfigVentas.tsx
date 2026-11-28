import { PantallaConfig } from "#/comun/componentes/pantalla_config/PantallaConfig.tsx";
import { useConfig } from "#/comun/componentes/pantalla_config/useConfig.ts";
import { QCheckbox } from "@olula/componentes/atomos/qcheckbox.tsx";
import { QInput } from "@olula/componentes/atomos/qinput.tsx";
import { QSelect } from "@olula/componentes/atomos/qselect.tsx";
import { SiNoPreguntar } from "../diseño.ts";
import { correoCopiasValido, opcionesSiNoPreguntar } from "../dominio.ts";
import { getConfigVentas, patchConfigVentas } from "../infraestructura.ts";
import { useTVentas } from "../../i18n/index.ts";

/**
 * Configuración de ventas: las opciones de ventas de los datos generales de
 * facturación del escritorio (`facturac_general`).
 */
export const ConfigVentas = () => {
    const t = useTVentas();
    const { config, cambiar, cambiada, guardando, guardar } = useConfig(getConfigVentas, patchConfigVentas);

    if (!config) return null;

    const correoValido = correoCopiasValido(config.correoCopias);

    return (
        <PantallaConfig
            titulo={t("config.titulo")}
            descripcion={t("config.subtitulo")}
            onGuardar={guardar}
            cambiada={cambiada && correoValido}
            guardando={guardando}
        >
            <section className="grupo-config">
                <h3>{t("config.documentos")}</h3>
                <QCheckbox
                    label={t("config.mostrarObservaciones")}
                    nombre="mostrar_observaciones_cliente"
                    valor={config.mostrarObservacionesCliente}
                    onChange={(valor) => cambiar("mostrarObservacionesCliente", valor === "true")}
                />
                <QSelect
                    label={t("config.facturarAlbaranesBorrador")}
                    nombre="facturar_albaranes_borrador"
                    opciones={opcionesSiNoPreguntar()}
                    valor={config.facturarAlbaranesBorrador}
                    onChange={(opcion) =>
                        opcion && cambiar("facturarAlbaranesBorrador", opcion.valor as SiNoPreguntar)}
                />
                <QSelect
                    label={t("config.crearFacturasBorrador")}
                    nombre="crear_facturas_borrador"
                    opciones={opcionesSiNoPreguntar()}
                    valor={config.crearFacturasBorrador}
                    onChange={(opcion) =>
                        opcion && cambiar("crearFacturasBorrador", opcion.valor as SiNoPreguntar)}
                />
            </section>
            {/* Sin la columna `correocopias` en la BD (p. ej. almafiber) no hay copia de correos. */}
            {!config.noDisponibles?.includes("correo_copias") && (
            <section className="grupo-config">
                <h3>{t("config.correo")}</h3>
                <QInput
                    label={t("config.correoCopias")}
                    nombre="correo_copias"
                    tipo="email"
                    opcional
                    valor={config.correoCopias}
                    erroneo={!correoValido}
                    textoValidacion={correoValido ? "" : t("config.correoNoValido")}
                    onChange={(valor) => cambiar("correoCopias", valor)}
                />
            </section>
            )}
        </PantallaConfig>
    );
};

import { PantallaConfig } from "#/comun/componentes/pantalla_config/PantallaConfig.tsx";
import { useConfig } from "#/comun/componentes/pantalla_config/useConfig.ts";
import { QSelect } from "@olula/componentes/atomos/qselect.tsx";
import { ActualizarArticulosProveedor } from "../diseño.ts";
import { explicacionActualizarArticulosProveedor, opcionesActualizarArticulosProveedor } from "../dominio.ts";
import { getConfigCompras, patchConfigCompras } from "../infraestructura.ts";
import { useTCompras } from "#/compras/i18n/index.ts";

/**
 * Configuración de compras: las opciones de compras de los datos generales de
 * facturación del escritorio (`facturac_general`).
 */
export const ConfigCompras = () => {
    const t = useTCompras();
    const { config, cambiar, cambiada, guardando, guardar } = useConfig(getConfigCompras, patchConfigCompras);

    if (!config) return null;

    return (
        <PantallaConfig
            titulo={t("config.titulo")}
            descripcion={t("config.descripcion")}
            onGuardar={guardar}
            cambiada={cambiada}
            guardando={guardando}
        >
            <section className="grupo-config">
                <h3>{t("config.articulosProveedor")}</h3>
                <QSelect
                    label={t("config.actualizarDesde")}
                    nombre="actualizar_articulos_proveedor"
                    opciones={opcionesActualizarArticulosProveedor(t)}
                    valor={config.actualizarArticulosProveedor}
                    onChange={(opcion) => opcion && cambiar(
                        "actualizarArticulosProveedor", opcion.valor as ActualizarArticulosProveedor)}
                />
                <p className="descripcion-config">
                    {explicacionActualizarArticulosProveedor(config.actualizarArticulosProveedor, t)}
                </p>
            </section>
        </PantallaConfig>
    );
};

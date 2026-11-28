import { preferenciasPantalla } from "#/almacen/comun/preferencias.ts";
import { Tab, Tabs } from "@olula/componentes/index.js";
import { puede } from "@olula/lib/dominio.ts";
import { useState } from "react";
import { MaestroConDetalleClaseAlmacenamiento } from "../clase_almacenamiento/maestro/MaestroConDetalleClaseAlmacenamiento.tsx";
import { MaestroConDetalleTipoCaja } from "../tipo_caja/vistas/maestro/MaestroConDetalleTipoCaja.tsx";
import { MaestroConDetalleTipoUbicacion } from "../tipo_ubicacion/maestro/MaestroConDetalleTipoUbicacion.tsx";
import { useTAlmacen } from "../i18n/index.ts";

const preferencias = preferenciasPantalla("configuracion", { pestana: 0 });

/**
 * Almacén/Configuración (doc sga_ergonomia.md, punto 2): las tablas que se configuran una vez, en
 * pestañas como «CRM/Otros». Las rutas de cada una siguen existiendo para los enlaces a ficha.
 */
export const ConfiguracionAlmacen = () => {
    const t = useTAlmacen();
    const pestanas = [
        { label: t("configuracion.tiposDeUbicacion"), regla: "almacen.tipo_ubicacion", Maestro: MaestroConDetalleTipoUbicacion },
        { label: t("configuracion.tiposDeCaja"), regla: "almacen.tipo_caja", Maestro: MaestroConDetalleTipoCaja },
        { label: t("configuracion.clasesDeAlmacenamiento"), regla: "almacen.clase_almacenamiento", Maestro: MaestroConDetalleClaseAlmacenamiento },
    ].filter((p) => puede(p.regla));
    const [inicial] = useState(() => Math.min(preferencias.obtener().pestana, Math.max(pestanas.length - 1, 0)));

    // Cada listado guarda su ficha abierta en la URL (?id=): al cambiar de pestaña se limpia para
    // que la nueva no intente abrir un id de otra tabla.
    const cambiar = (indice: number) => {
        preferencias.guardar({ pestana: indice });
        window.history.replaceState(window.history.state, "", window.location.pathname);
    };

    return (
        // Sin h2 propio: cada pestaña ya trae el suyo (el del maestro) y repetiría el título tres veces.
        // El nombre de la página queda como región para lectores de pantalla.
        <section className="ConfiguracionAlmacen" aria-label={t("configuracion.configuracionDelAlmacen")}>
            <Tabs
                tabInicial={inicial}
                onCambio={cambiar}
                children={pestanas.map(({ label, Maestro }) => (
                    <Tab key={label} label={label}>
                        <Maestro />
                    </Tab>
                ))}
            />
        </section>
    );
};

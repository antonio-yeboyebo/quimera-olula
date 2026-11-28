import { Tab, Tabs } from "@olula/componentes/detalle/tabs/Tabs.tsx";
import { puede } from "@olula/lib/dominio.ts";
import { MaestroConDetalleCodigoBalance } from "../codigo_balance/maestro/MaestroConDetalleCodigoBalance.tsx";
import { MaestroConDetalleCuenta } from "../cuenta/maestro/MaestroConDetalleCuenta.tsx";
import { MaestroConDetalleCuentaEspecial } from "../cuenta_especial/maestro/MaestroConDetalleCuentaEspecial.tsx";
import { MaestroConDetalleEpigrafe } from "../epigrafe/maestro/MaestroConDetalleEpigrafe.tsx";
import { MaestroConDetalleGrupoEpigrafe } from "../grupo_epigrafe/maestro/MaestroConDetalleGrupoEpigrafe.tsx";
import { MaestroConDetalleSubcuenta } from "../subcuenta/maestro/MaestroConDetalleSubcuenta.tsx";
import { indicePestanaPgc, PestanaPgc, tituloPestanaPgc } from "./pestanas.ts";
import { tContabilidad } from "../i18n/index.ts";

/**
 * Plan General Contable: una sola pantalla con las vistas del plan, incluidos
 * los códigos de balance 2008 (antes una entrada de menú propia; su ruta
 * `/contabilidad/codigo_balance` abre ahora esta pantalla en esa pestaña).
 *
 * Carga perezosa: `Tabs` renderiza únicamente la pestaña activa
 * (`{tabs[indice]}`), así que el maestro de Cuentas no se monta —y por tanto
 * no pide datos— hasta que se pulsa su pestaña. No hace falta nada más.
 *
 * Contrapartida: al cambiar de pestaña la anterior se desmonta y pierde su
 * selección y sus filtros. Si algún día hay que conservarlos, la solución es
 * subir las listas a este contenedor, NO volver a los url-params: los dos
 * maestros comparten ruta y se pisarían el `id` y los filtros del query string.
 */
export const PantallaPgc = ({ pestanaInicial }: { pestanaInicial?: PestanaPgc }) => {
    // crearRouter no comprueba permisos, así que la pantalla se monta aunque
    // se llegue por URL: la guarda tiene que estar aquí.
    if (!puede("contabilidad.asiento")) {
        return <p>{tContabilidad("pgc.noTienesPermisoParaVerEl")}</p>;
    }

    return (
        <div className="PantallaPgc">
            <Tabs tabInicial={indicePestanaPgc(pestanaInicial)} children={[
                <Tab label={tituloPestanaPgc("subcuentas")}
                    key="tab-subcuentas"
                    children={<MaestroConDetalleSubcuenta />}
                />,
                <Tab label={tituloPestanaPgc("cuentas")}
                    key="tab-cuentas"
                    children={<MaestroConDetalleCuenta />}
                />,
                <Tab label={tituloPestanaPgc("cuentas_especiales")}
                    key="tab-cuentas-especiales"
                    children={<MaestroConDetalleCuentaEspecial />}
                />,
                <Tab label={tituloPestanaPgc("subgrupos")}
                    key="tab-subgrupos"
                    children={<MaestroConDetalleEpigrafe />}
                />,
                <Tab label={tituloPestanaPgc("grupos")}
                    key="tab-grupos"
                    children={<MaestroConDetalleGrupoEpigrafe />}
                />,
                <Tab label={tituloPestanaPgc("codigos_balance")}
                    key="tab-codigos-balance"
                    children={<MaestroConDetalleCodigoBalance />}
                />,
            ]} />
        </div>
    );
};

/** Ruta antigua `/contabilidad/codigo_balance`: el PGC abierto en la pestaña
 * de códigos de balance 2008, para no romper enlaces ni favoritos. */
export const PantallaPgcCodigosBalance = () => <PantallaPgc pestanaInicial="codigos_balance" />;

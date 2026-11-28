import { PantallaConfig } from "#/comun/componentes/pantalla_config/PantallaConfig.tsx";
import { useConfig } from "#/comun/componentes/pantalla_config/useConfig.ts";
import { QInput } from "@olula/componentes/atomos/qinput.tsx";
import { QSelect } from "@olula/componentes/atomos/qselect.tsx";
import { useTAuth } from "../../i18n/index.ts";
import { idiomaDesde, opcionesIdioma } from "../dominio.ts";
import { getMiCuenta, guardarMiCuenta } from "../infraestructura.ts";

/**
 * Mi cuenta: los datos del usuario autenticado. Nombre y email solo se ven; el
 * idioma se elige y se guarda con el botón Guardar, como las pantallas de
 * configuración. Al guardar, la interfaz cambia a ese idioma sin recargar.
 */
export const MiCuenta = () => {
    const t = useTAuth();
    const { config: cuenta, cambiar, cambiada, guardando, guardar } = useConfig(getMiCuenta, guardarMiCuenta);

    if (!cuenta) return null;

    return (
        <PantallaConfig
            titulo={t("miCuenta.titulo")}
            descripcion={t("miCuenta.descripcion")}
            onGuardar={guardar}
            cambiada={cambiada}
            guardando={guardando}
        >
            <section className="grupo-config">
                <h3>{t("miCuenta.datos")}</h3>
                <QInput label={t("miCuenta.nombre")} nombre="nombre" valor={cuenta.nombre} deshabilitado />
                <QInput label={t("miCuenta.email")} nombre="email" valor={cuenta.email ?? ""} deshabilitado />
            </section>
            <section className="grupo-config">
                <h3>{t("miCuenta.preferencias")}</h3>
                <QSelect
                    label={t("miCuenta.idioma")}
                    nombre="idioma"
                    opciones={opcionesIdioma()}
                    valor={cuenta.idioma}
                    onChange={(opcion) => opcion && cambiar("idioma", idiomaDesde(opcion.valor))}
                />
            </section>
        </PantallaConfig>
    );
};

export default MiCuenta;

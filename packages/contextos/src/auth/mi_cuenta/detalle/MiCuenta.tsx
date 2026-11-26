import { PantallaConfig } from "#/comun/componentes/pantalla_config/PantallaConfig.tsx";
import { useConfig } from "#/comun/componentes/pantalla_config/useConfig.ts";
import { QInput } from "@olula/componentes/atomos/qinput.tsx";
import { QSelect } from "@olula/componentes/atomos/qselect.tsx";
import { idiomaDesde, opcionesIdioma } from "../dominio.ts";
import { getMiCuenta, patchMiCuenta } from "../infraestructura.ts";

/**
 * Mi cuenta: los datos del usuario autenticado. Nombre y email solo se ven; el
 * idioma se elige y se guarda con el botón Guardar, como las pantallas de
 * configuración. De momento solo se guarda la preferencia: la interfaz no se
 * traduce.
 */
export const MiCuenta = () => {
    const { config: cuenta, cambiar, cambiada, guardando, guardar } = useConfig(getMiCuenta, patchMiCuenta);

    if (!cuenta) return null;

    return (
        <PantallaConfig
            titulo="Mi cuenta"
            descripcion="Tus datos de usuario y tus preferencias."
            onGuardar={guardar}
            cambiada={cambiada}
            guardando={guardando}
        >
            <section className="grupo-config">
                <h3>Datos del usuario</h3>
                <QInput label="Nombre" nombre="nombre" valor={cuenta.nombre} deshabilitado />
                <QInput label="Email" nombre="email" valor={cuenta.email ?? ""} deshabilitado />
            </section>
            <section className="grupo-config">
                <h3>Preferencias</h3>
                <QSelect
                    label="Idioma"
                    nombre="idioma"
                    opciones={opcionesIdioma}
                    valor={cuenta.idioma}
                    onChange={(opcion) => opcion && cambiar("idioma", idiomaDesde(opcion.valor))}
                />
            </section>
        </PantallaConfig>
    );
};

export default MiCuenta;

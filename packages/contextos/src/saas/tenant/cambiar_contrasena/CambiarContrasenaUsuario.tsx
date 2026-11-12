import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { QInput } from "@olula/componentes/atomos/qinput.tsx";
import { QModal } from "@olula/componentes/index.js";
import { EmitirEvento } from "@olula/lib/diseño.js";
import { useFocus } from "@olula/lib/useFocus.ts";
import { useForm } from "@olula/lib/useForm.js";
import { useModelo } from "@olula/lib/useModelo.ts";
import { useCallback } from "react";
import { UsuarioSoporte } from "../diseño.js";
import { patchContrasenaUsuario } from "../infraestructura.js";
import { metaNuevaContrasena, nuevaContrasenaVacia } from "./cambiar_contrasena.js";

export const CambiarContrasenaUsuario = ({
    publicar,
    idTenant,
    usuario,
}: {
    publicar: EmitirEvento;
    idTenant: string;
    usuario: UsuarioSoporte;
}) => {
    const { modelo, uiProps, valido } = useModelo(metaNuevaContrasena, nuevaContrasenaVacia);

    const cambiar_ = useCallback(
        async () => {
            await patchContrasenaUsuario(idTenant, usuario.id, modelo.contrasena);
            publicar("contrasena_cambiada");
        },
        [idTenant, usuario, modelo, publicar]
    );
    const cancelar_ = useCallback(() => publicar("cambio_contrasena_cancelado"), [publicar]);

    const [cambiar, cancelar] = useForm(cambiar_, cancelar_);

    const focus = useFocus();

    return (
        <QModal
            abierto={true}
            nombre="cambiarContrasenaUsuario"
            titulo={`Restablecer contraseña de ${usuario.email || usuario.nombre}`}
            onCerrar={cancelar}
        >
            <quimera-formulario>
                <QInput label="Nueva contraseña" {...uiProps("contrasena")} tipo="contraseña" ref={focus} />
            </quimera-formulario>
            <div className="botones maestro-botones">
                <QBoton onClick={cambiar} deshabilitado={!valido}>
                    Cambiar contraseña
                </QBoton>
            </div>
        </QModal>
    );
};

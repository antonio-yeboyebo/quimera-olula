import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { QInput } from "@olula/componentes/atomos/qinput.tsx";
import { QModal } from "@olula/componentes/index.js";
import { EmitirEvento } from "@olula/lib/diseño.js";
import { useFocus } from "@olula/lib/useFocus.ts";
import { useForm } from "@olula/lib/useForm.js";
import { useModelo } from "@olula/lib/useModelo.ts";
import { useCallback } from "react";
import { nuevoTenantVacio } from "../dominio.js";
import { postTenant } from "../infraestructura.js";
import { metaNuevoTenant } from "./crear.js";
import "./CrearTenant.css";

/**
 * Modal de alta de empresa. La empresa se provisiona en segundo plano:
 * el detalle hace polling hasta que sale del estado "provisionando".
 */
export const CrearTenant = ({ publicar }: { publicar: EmitirEvento }) => {
    const { modelo: tenant, uiProps, valido } = useModelo(metaNuevoTenant, nuevoTenantVacio);

    const crear_ = useCallback(
        async () => {
            const id = await postTenant(tenant);
            publicar("tenant_creado", id);
        },
        [tenant, publicar]
    );

    const cancelar_ = useCallback(() => publicar("alta_de_tenant_cancelada"), [publicar]);

    const [crear, cancelar] = useForm(crear_, cancelar_);

    const focus = useFocus();

    return (
        <QModal abierto={true} nombre="crearTenant" titulo="Nueva empresa" onCerrar={cancelar}>
            <div className="CrearTenant">
                <quimera-formulario>
                    <QInput label="Identificador" {...uiProps("id")} ref={focus} />
                    <QInput label="Nombre" {...uiProps("nombre")} />
                    <QInput label="NIF" {...uiProps("nif")} />
                    <QInput label="Email de contacto" {...uiProps("emailContacto")} />
                    <h4>Usuario administrador</h4>
                    <QInput label="Nombre" {...uiProps("adminNombre")} />
                    <QInput label="Email" {...uiProps("adminEmail")} />
                    <QInput label="Contraseña" {...uiProps("adminContrasena")} tipo="contraseña" />
                </quimera-formulario>

                <div className="botones maestro-botones">
                    <QBoton onClick={crear} deshabilitado={!valido}>
                        Crear
                    </QBoton>
                </div>
            </div>
        </QModal>
    );
};

import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { QModal } from "@olula/componentes/index.js";
import { EmitirEvento } from "@olula/lib/diseño.js";
import { useForm } from "@olula/lib/useForm.js";
import { useCallback, useState } from "react";
import { CamposSecreto } from "../componentes/CamposSecreto.js";
import { secretoConCambios } from "../dominio.js";
import { CredencialExterna, SecretoCredencialExterna } from "../diseño.js";
import { rotarSecretoCredencialExterna } from "../infraestructura.js";
import "./RotarCredencialExterna.css";
import { useTComun } from "../../i18n/index.ts";

/**
 * Modal de edición de los campos del secreto de una credencial ya existente
 * (API key/contraseña, pero también campos no sensibles que viajan junto a
 * ella, como el "modelo" de un LLM o el host/puerto de un conector). No
 * reutiliza el auto-guardado de la tab General porque el secreto nunca llega
 * desde la API (ver diseño.ts) — es un flujo de escritura explícito y aislado.
 *
 * El formulario empieza en blanco (no hay forma de mostrar el valor ya
 * guardado) y solo hace falta rellenar los campos que se quieran cambiar: el
 * backend fusiona lo enviado con el secreto persistido, así que un campo
 * vacío conserva su valor actual — ver `secretoConCambios` en dominio.ts.
 */
export const RotarCredencialExterna = ({
    publicar,
    credencial,
}: {
    credencial: CredencialExterna;
    publicar: EmitirEvento;
}) => {
    const t = useTComun();
    const [secreto, setSecreto] = useState<SecretoCredencialExterna>({});

    const rotar_ = useCallback(
        async () => {
            await rotarSecretoCredencialExterna(credencial.id, secreto);
            publicar("credencial_externa_rotada");
        },
        [credencial.id, secreto, publicar]
    );

    const cancelar_ = useCallback(
        () => publicar("rotacion_cancelada"),
        [publicar]
    );

    const [rotar, cancelar] = useForm(rotar_, cancelar_);

    return (
        <QModal
            abierto={true}
            nombre="rotarCredencialExterna"
            titulo={t("credencialExterna.editarCredencialNombre", { nombre: credencial.nombre })}
            onCerrar={cancelar}
        >
            <div className="RotarCredencialExterna">
                <p>
                    {t("credencialExterna.rellenaSoloLosCamposQueQuieras")}
                </p>
                <quimera-formulario>
                    <CamposSecreto
                        proveedor={credencial.proveedor}
                        tipoAuth={credencial.tipoAuth}
                        valor={secreto}
                        onChange={setSecreto}
                    />
                </quimera-formulario>

                <div className="botones maestro-botones">
                    <QBoton
                        onClick={rotar}
                        deshabilitado={!secretoConCambios(secreto)}
                    >
                        {t("credencialExterna.guardarCambios")}
                    </QBoton>
                </div>
            </div>
        </QModal>
    );
};

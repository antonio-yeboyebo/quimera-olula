import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { QInput } from "@olula/componentes/atomos/qinput.tsx";
import { useModelo } from "@olula/lib/useModelo.ts";
import { useCallback, useMemo, useState } from "react";
import { Link } from "react-router";
import { ErrorRegistro, postRegistro } from "../infraestructura.ts";
import { Captcha } from "./Captcha.tsx";
import { captchaActivo } from "./captcha.ts";
import { metaNuevoRegistro, nuevoRegistroInicial } from "./registro.ts";
import estilos from "./Registro.module.css";

/**
 * Registro público de una empresa en Olula. Tras enviar el formulario la empresa
 * queda pendiente de verificar el email; el enlace del correo lleva a
 * /registro/verificar, que crea la empresa.
 */
export const Registro = () => {
    const inicial = useMemo(nuevoRegistroInicial, []);
    const { modelo, uiProps, valido } = useModelo(metaNuevoRegistro, inicial);
    const [captcha, setCaptcha] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [enviando, setEnviando] = useState(false);
    const [enviadoA, setEnviadoA] = useState<string | null>(null);

    const enviar = useCallback(async () => {
        setError(null);
        setEnviando(true);
        try {
            const resultado = await postRegistro(modelo, captcha);
            setEnviadoA(resultado.email);
        } catch (e) {
            setError(e instanceof ErrorRegistro ? e.message : "No se ha podido completar el registro");
        } finally {
            setEnviando(false);
        }
    }, [modelo, captcha]);

    if (enviadoA) {
        return (
            <section className={estilos.login}>
                <div className="title"><h1>Revisa tu correo</h1></div>
                <div className={estilos.loginForm}>
                    <p>
                        Te hemos enviado un enlace a <strong>{enviadoA}</strong> para confirmar tu email.
                        Al confirmarlo crearemos tu empresa. El enlace caduca en 24 horas.
                    </p>
                </div>
            </section>
        );
    }

    return (
        <section className={estilos.login}>
            <div className="title"><h1>Empieza con Olula</h1></div>
            <div className={estilos.loginForm}>
                <quimera-formulario>
                    <QInput label="Nombre de la empresa" {...uiProps("nombreEmpresa")} />
                    <QInput label="NIF" {...uiProps("nif")} />
                    <QInput label="Tu nombre" {...uiProps("nombre")} />
                    <QInput label="Email" {...uiProps("email")} tipo="email" />
                    <QInput label="Contraseña" {...uiProps("contraseña")} tipo="contraseña" />
                    <QInput label="Repite la contraseña" {...uiProps("repetirContraseña")} tipo="contraseña" />
                    <Captcha onToken={setCaptcha} />
                    {error && <div role="alert" style={{ color: "var(--color-error, #b91c1c)" }}>{error}</div>}
                    <div>
                        <QBoton tamaño="mediano" ancho onClick={enviar}
                            deshabilitado={!valido || enviando || (captchaActivo && !captcha)}>
                            {enviando ? "Enviando…" : "Crear cuenta"}
                        </QBoton>
                    </div>
                </quimera-formulario>
                <p style={{ textAlign: "center", marginTop: "1rem" }}>
                    ¿Ya tienes cuenta? <Link to="/login">Inicia sesión</Link>
                </p>
            </div>
        </section>
    );
};

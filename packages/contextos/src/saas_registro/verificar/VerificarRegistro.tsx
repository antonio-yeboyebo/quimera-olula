import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router";
import { EstadoRegistro } from "../diseño.ts";
import { ErrorRegistro, getEstadoRegistro, postVerificar } from "../infraestructura.ts";
import estilos from "../registro/Registro.module.css";

const INTERVALO_MS = 2000;

const MENSAJES: Record<string, string> = {
    provisionando: "Estamos creando tu empresa. Tarda unos segundos…",
    activo: "¡Tu empresa está lista! Ya puedes iniciar sesión con tu email y tu contraseña.",
    error: "No hemos podido crear tu empresa. Nuestro equipo ya está avisado y te contactará.",
};

/**
 * Destino del enlace del correo de verificación: confirma el email (lo que lanza
 * la creación de la empresa) y muestra el progreso hasta que está lista.
 */
export const VerificarRegistro = () => {
    const [params] = useSearchParams();
    const token = params.get("token") ?? "";
    const [estado, setEstado] = useState<EstadoRegistro | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!token) {
            setError("El enlace no es válido");
            return;
        }
        postVerificar(token)
            .then(setEstado)
            .catch((e) => setError(e instanceof ErrorRegistro ? e.message : "El enlace no es válido"));
    }, [token]);

    useEffect(() => {
        if (estado?.estado !== "provisionando") return;
        const temporizador = setTimeout(() => {
            getEstadoRegistro(token).then(setEstado).catch(() => undefined);
        }, INTERVALO_MS);
        return () => clearTimeout(temporizador);
    }, [estado, token]);

    const texto = error ?? (estado ? MENSAJES[estado.estado] ?? `Estado: ${estado.estado}` : "Comprobando el enlace…");

    return (
        <section className={estilos.login}>
            <div className="title"><h1>Activar cuenta</h1></div>
            <div className={estilos.loginForm}>
                <p role="status">{texto}</p>
                {estado?.estado === "activo" && (
                    <Link to="/login"><QBoton tamaño="mediano" ancho>Iniciar sesión</QBoton></Link>
                )}
                {error && <p><Link to="/registro">Volver al registro</Link></p>}
            </div>
        </section>
    );
};

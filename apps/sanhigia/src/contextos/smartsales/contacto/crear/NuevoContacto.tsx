import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { QInput } from "@olula/componentes/atomos/qinput.tsx";
import { ContextoError } from "@olula/lib/contexto.ts";
import { useContext, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";
import { rutasSmartsales } from "../../comun/rutas.ts";
import { useAgenteSeguido } from "../../comun/useAgenteSeguido.ts";
import { LayoutSmartsales } from "../../comun/componentes/LayoutSmartsales.tsx";
import { EstadoEmail, FormularioContacto } from "../diseño.ts";
import { altaParaAPI, emailValido, erroresAlta, formularioVacio } from "../dominio.ts";
import { crearContacto, getContactoPorEmail } from "../infraestructura.ts";
import { CamposContacto } from "../detalle/CamposContacto.tsx";
import "../detalle/Contacto.css";

const ESPERA_EMAIL = 1000;

const textoEstadoEmail: Partial<Record<EstadoEmail, string>> = {
    invalido: "Formato de e-mail no válido",
    comprobando: "Comprobando…",
    libre: "E-mail disponible",
};

export const NuevoContacto = () => {
    const { intentar } = useContext(ContextoError);
    const navigate = useNavigate();
    const { usuario } = useAgenteSeguido();

    const [formulario, setFormulario] = useState<FormularioContacto>(formularioVacio);
    const [estadoEmail, setEstadoEmail] = useState<EstadoEmail>("vacio");
    const [existente, setExistente] = useState<string | null>(null);
    const [errores, setErrores] = useState<string[]>([]);
    const [guardando, setGuardando] = useState(false);

    const cambiar = (cambios: Partial<FormularioContacto>) => setFormulario((actual) => ({ ...actual, ...cambios }));

    useEffect(() => {
        const email = formulario.email.trim();
        setExistente(null);
        if (!email) return setEstadoEmail("vacio");
        if (!emailValido(email)) return setEstadoEmail("invalido");
        setEstadoEmail("comprobando");
        let activo = true;
        const espera = setTimeout(() => {
            getContactoPorEmail(email)
                .then((codigo) => {
                    if (!activo) return;
                    setExistente(codigo);
                    setEstadoEmail(codigo ? "existe" : "libre");
                })
                .catch(() => activo && setEstadoEmail("vacio"));
        }, ESPERA_EMAIL);
        return () => {
            activo = false;
            clearTimeout(espera);
        };
    }, [formulario.email]);

    const guardar = async () => {
        const encontrados = [...erroresAlta(formulario), ...(existente ? ["Ya existe un contacto con ese e-mail"] : [])];
        setErrores(encontrados);
        if (encontrados.length > 0) return;

        setGuardando(true);
        try {
            const codigo = await intentar(() => crearContacto(altaParaAPI(formulario, usuario?.empresa ?? null)));
            navigate(rutasSmartsales.contacto(codigo));
        } catch {
            setGuardando(false);
        }
    };

    return (
        <LayoutSmartsales>
            <div className="Contacto">
                <header>
                    <h1>Nuevo contacto</h1>
                </header>

                <QInput label="Nombre" nombre="nombre" valor={formulario.nombre} onChange={(nombre) => cambiar({ nombre })} />
                <QInput
                    label="E-mail"
                    nombre="email"
                    valor={formulario.email}
                    erroneo={estadoEmail === "invalido"}
                    advertido={estadoEmail === "existe"}
                    valido={estadoEmail === "libre"}
                    textoValidacion={textoEstadoEmail[estadoEmail]}
                    onChange={(email) => cambiar({ email })}
                />
                {estadoEmail === "existe" && existente && (
                    <p className="aviso">
                        El contacto ya existe. <Link to={rutasSmartsales.contacto(existente)}>Ir al contacto</Link>
                    </p>
                )}

                <CamposContacto formulario={formulario} cambiar={cambiar} />

                {errores.length > 0 && (
                    <ul className="errores">
                        {errores.map((error) => (
                            <li key={error}>{error}</li>
                        ))}
                    </ul>
                )}

                <div className="acciones">
                    <QBoton variante="borde" onClick={() => navigate(-1)}>
                        Cancelar
                    </QBoton>
                    <QBoton deshabilitado={guardando || estadoEmail === "comprobando"} onClick={() => guardar()}>
                        Crear contacto
                    </QBoton>
                </div>
            </div>
        </LayoutSmartsales>
    );
};

import { QIcono } from "@olula/componentes/atomos/qicono.tsx";
import { PropsWithChildren, useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router";
import { rutasSmartsales } from "../rutas.ts";
import "./LayoutSmartsales.css";

type Destino = {
    texto: string;
    icono: string;
    ruta: string;
};

const izquierda: Destino[] = [
    { texto: "Hoy", icono: "casa", ruta: rutasSmartsales.hoy },
    { texto: "Agenda", icono: "calendario_mes", ruta: rutasSmartsales.agenda },
];

const derecha: Destino[] = [
    { texto: "Clientes", icono: "usuarios", ruta: rutasSmartsales.clientes },
    { texto: "Campañas", icono: "estrella", ruta: rutasSmartsales.campanias },
];

const accionesRapidas: Destino[] = [
    { texto: "Nuevo trato", icono: "documento_nuevo", ruta: rutasSmartsales.nuevoTrato },
    { texto: "Nueva tarea o visita", icono: "calendario_evento", ruta: rutasSmartsales.nuevaTarea },
    { texto: "Nuevo contacto", icono: "usuario", ruta: rutasSmartsales.nuevoContacto },
    { texto: "Nueva campaña", icono: "estrella", ruta: rutasSmartsales.nuevaCampania },
];

const principales: string[] = [
    rutasSmartsales.hoy,
    rutasSmartsales.agenda,
    rutasSmartsales.clientes,
    rutasSmartsales.campanias,
    rutasSmartsales.tratos,
    rutasSmartsales.rendimiento,
    rutasSmartsales.objetivos,
    rutasSmartsales.mapa,
];

const EnlaceBarra = ({ texto, icono, ruta }: Destino) => (
    <NavLink to={ruta} className="destino">
        <QIcono nombre={icono} />
        <span>{texto}</span>
    </NavLink>
);

export const LayoutSmartsales = ({ children }: PropsWithChildren) => {
    const [menuAbierto, setMenuAbierto] = useState(false);
    const navigate = useNavigate();
    const { pathname } = useLocation();
    const conVolver = !principales.includes(pathname.replace(/\/$/, ""));

    const volver = () => (window.history.state?.idx > 0 ? navigate(-1) : navigate(rutasSmartsales.hoy));

    return (
        <div className="LayoutSmartsales">
            <main className="contenido">
                {conVolver && (
                    <button type="button" className="volver" onClick={volver}>
                        <QIcono nombre="atras" />
                        <span>Volver</span>
                    </button>
                )}
                {children}
            </main>
            {menuAbierto && (
                <div className="fondo-acciones" onClick={() => setMenuAbierto(false)}>
                    <ul className="acciones-rapidas" aria-label="Acciones rápidas">
                        {accionesRapidas.map(({ texto, icono, ruta }) => (
                            <li key={ruta}>
                                <Link to={ruta}>
                                    <QIcono nombre={icono} />
                                    <span>{texto}</span>
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
            <nav className="barra-inferior" aria-label="Navegación de SmartSales">
                {izquierda.map((destino) => (
                    <EnlaceBarra key={destino.ruta} {...destino} />
                ))}
                <button
                    type="button"
                    className="boton-mas"
                    aria-label="Acciones rápidas"
                    aria-expanded={menuAbierto}
                    onClick={() => setMenuAbierto(!menuAbierto)}
                >
                    <QIcono nombre={menuAbierto ? "cerrar" : "crear"} tamaño="lg" />
                </button>
                {derecha.map((destino) => (
                    <EnlaceBarra key={destino.ruta} {...destino} />
                ))}
            </nav>
        </div>
    );
};

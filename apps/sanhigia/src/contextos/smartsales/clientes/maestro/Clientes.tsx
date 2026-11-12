import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { QEtiqueta } from "@olula/componentes/atomos/qetiqueta.tsx";
import { QInput } from "@olula/componentes/atomos/qinput.tsx";
import { ContextoError } from "@olula/lib/contexto.ts";
import { useContext, useEffect, useState } from "react";
import { Link } from "react-router";
import { rutasSmartsales } from "../../comun/rutas.ts";
import { LayoutSmartsales } from "../../comun/componentes/LayoutSmartsales.tsx";
import { ClienteLista, ContactoLista } from "../diseño.ts";
import { getClientes, getContactos } from "../infraestructura.ts";
import "./Clientes.css";

type Pestaña = "clientes" | "contactos";

const ESPERA_BUSQUEDA = 300;

export const Clientes = () => {
    const { intentar } = useContext(ContextoError);
    const [pestaña, setPestaña] = useState<Pestaña>("clientes");
    const [texto, setTexto] = useState("");
    const [clientes, setClientes] = useState<ClienteLista[]>([]);
    const [contactos, setContactos] = useState<ContactoLista[]>([]);

    useEffect(() => {
        const temporizador = setTimeout(() => {
            const cargar = async () => {
                if (pestaña === "clientes") setClientes(await intentar(() => getClientes(texto)));
                else setContactos(await intentar(() => getContactos(texto)));
            };
            cargar().catch(() => undefined);
        }, ESPERA_BUSQUEDA);
        return () => clearTimeout(temporizador);
    }, [intentar, pestaña, texto]);

    return (
        <LayoutSmartsales>
            <div className="Clientes">
                <header>
                    <h1>Clientes</h1>
                    {pestaña === "contactos" ? (
                        <QBoton enlace={rutasSmartsales.nuevoContacto} tamaño="pequeño">
                            + Nuevo contacto
                        </QBoton>
                    ) : (
                        <QBoton enlace={rutasSmartsales.mapa} variante="borde" tamaño="pequeño">
                            Mapa
                        </QBoton>
                    )}
                </header>

                <div className="pestañas" role="tablist">
                    {(["clientes", "contactos"] as Pestaña[]).map((valor) => (
                        <button key={valor} type="button" role="tab" aria-selected={pestaña === valor} onClick={() => setPestaña(valor)}>
                            {valor === "clientes" ? "Clientes" : "Contactos"}
                        </button>
                    ))}
                </div>

                <QInput label="Buscar" nombre="buscar" valor={texto} placeholder="Nombre" onChange={setTexto} />

                <ul className="lista">
                    {pestaña === "clientes" &&
                        clientes.map((cliente) => (
                            <li key={cliente.codigo}>
                                <Link to={rutasSmartsales.fichaCliente(cliente.codigo)} className="cliente">
                                    <span className="datos">
                                        <strong>{cliente.nombre}</strong>
                                        <span className="secundario">{cliente.codigo}</span>
                                    </span>
                                    <QEtiqueta variante={cliente.activo ? "exito" : "gris"}>{cliente.activo ? "Activo" : "Inactivo"}</QEtiqueta>
                                </Link>
                            </li>
                        ))}
                    {pestaña === "contactos" &&
                        contactos.map((contacto) => (
                            <li key={contacto.codigo}>
                                <Link to={rutasSmartsales.contacto(contacto.codigo)}>
                                    <strong>{contacto.nombre}</strong>
                                    <span className="secundario">{[contacto.email, contacto.telefono].filter(Boolean).join(" · ")}</span>
                                    {contacto.numTratos > 0 && <span className="secundario">{contacto.numTratos} tratos</span>}
                                </Link>
                            </li>
                        ))}
                </ul>
            </div>
        </LayoutSmartsales>
    );
};

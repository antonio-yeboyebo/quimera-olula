import { FactoryCtx } from "@olula/lib/factory_ctx.tsx";
import { useContext } from "react";
import { Link } from "react-router";
import { QIcono } from "../atomos/qicono.tsx";
import "./Cabecera.css";

function toggleMenu(selector: string) {
  const menu = document.querySelector(selector);
  if (menu) {
    menu.classList.toggle("activo");
  }
}

export const Cabecera = () => {
  const { app } = useContext(FactoryCtx);
  const AccionesCabecera = app.Componentes
    ?.cabecera_acciones as () => React.ReactNode;

  return (
    <>
      <header>
        <button
          id="boton-menu-lateral"
          aria-label="Abrir menú lateral"
          onClick={() => toggleMenu("menu-lateral")}
        ></button>

        <label htmlFor="boton-menu-lateral" id="etiqueta-menu-abierto" />
        <Link to="/">
          <img src="/olula_header_blanco.png" alt="Olula | Inicio" />
        </Link>
        <div id="cabecera-acciones-extra">
          {AccionesCabecera ? <AccionesCabecera /> : null}
        </div>
        <button
          id="boton-menu-usuario"
          aria-label="Abrir menú usuario"
          onClick={() => toggleMenu("menu-usuario")}
        ></button>
        <label htmlFor="boton-menu-usuario" id="etiqueta-menu-usuario-abierto">
          <QIcono nombre="perfil" tamaño="sm" />
        </label>
      </header>
    </>
  );
};

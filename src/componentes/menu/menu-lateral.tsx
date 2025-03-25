import "./menu-lateral.css";

import { useState } from "react";
import { Link } from "react-router";
import {
  ElementoMenu,
  ElementoMenuPadre,
  elementosDelMenu,
} from "../../contextos/comun/menu";
import { QIcono } from "../atomos/qicono.tsx";
import { QInput } from "../atomos/qinput.tsx";

export const MenuLateral = () => {
  const [busqueda, setBusqueda] = useState("");

  const renderBuscador = () => {
    return (
      <div id="buscador">
        <QIcono nombre="buscar" tamaño="sm" />
        <QInput
          nombre="buscador"
          label=""
          condensado
          placeholder="Buscar..."
          valor={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />
      </div>
    );
  };

  const renderizaElemento = (elemento: ElementoMenu, filtro: string) => {
    const icono = elemento.icono ? (
      <QIcono nombre={elemento.icono} tamaño="sm" />
    ) : null;
    const cumpleFiltro = elemento.nombre.toLowerCase().includes(filtro);

    if ("url" in elemento && elemento.url) {
      if (!cumpleFiltro) return null;

      return (
        <li key={elemento.nombre}>
          <Link to={elemento.url}>
            {icono} {elemento.nombre}
          </Link>
        </li>
      );
    }

    const subelementos = (elemento as ElementoMenuPadre).subelementos
      .map((subelemento) =>
        renderizaElemento(subelemento, cumpleFiltro ? "" : filtro)
      )
      .filter(Boolean);
    if (!subelementos.length) return null;

    return (
      <details key={elemento.nombre} open>
        <summary>
          {icono} {elemento.nombre}
        </summary>
        <ul>{subelementos}</ul>
      </details>
    );
  };

  const elementos = elementosDelMenu.map((elemento) =>
    renderizaElemento(elemento, busqueda.toLocaleLowerCase())
  );

  return (
    <menu-lateral>
      <aside id="menu-principal">
        {renderBuscador()}
        <nav>
          <ul>{elementos}</ul>
        </nav>
        {/* {renderMenuUsuario()} */}
      </aside>
    </menu-lateral>
  );
};

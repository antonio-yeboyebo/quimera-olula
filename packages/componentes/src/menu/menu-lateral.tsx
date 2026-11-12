import { disponibleEnSaas, ElementoMenu, ElementoMenuHijo, pluginsActivos } from "@olula/lib/menu.ts";
import { puedeAlguna } from "@olula/lib/dominio.ts";
import { usePreferencia } from "@olula/lib/usePreferencia.ts";
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router";
import { QIcono } from "../atomos/qicono.tsx";
import { QInput } from "../atomos/qinput.tsx";
import { useEsMovil } from "../maestro/useEsMovil.ts";
import { useMenuControl } from "../plantilla/useMenuControl";
import {
  agruparPorArea,
  esPadre,
  normalizar,
  PantallaMenu,
  partesCoincidencia,
} from "./dominio.ts";
import "./menu-lateral.css";
import { usePantallasMenu } from "./usePantallasMenu.ts";

const ICONO_GRUPO = "menu_grupo";

type Grupo = {
  nombre: string;
  icono: string;
  area?: string;
  /** Hoja de primer nivel (p. ej. Inicio): enlace directo, sin desplegable. */
  url?: string;
  items: ElementoMenuHijo[];
};

const Resaltado = ({ texto, filtro }: { texto: string; filtro: string }) => {
  const { antes, coincide, despues } = partesCoincidencia(texto, filtro);
  return (
    <>
      {antes}
      {coincide && <mark>{coincide}</mark>}
      {despues}
    </>
  );
};

export const MenuLateral = () => {
  const control = useMenuControl();
  const esMovil = useEsMovil();
  const { menu, urlActual, favoritos, recientes } = usePantallasMenu();
  const [filtro, setFiltro] = useState("");
  const [gruposAbiertos, setGruposAbiertos] = usePreferencia<
    Record<string, boolean>
  >("menu.lateral.grupos-abiertos", {});
  const [flyout, setFlyout] = useState<{ grupo: string; top: number } | null>(
    null
  );
  const refCarril = useRef<HTMLElement>(null);

  const expandido = esMovil || control.lateralExpandido;
  const q = normalizar(filtro.trim());

  // El desplegable del carril se cierra al navegar, al pulsar fuera o con Esc.
  useEffect(() => setFlyout(null), [urlActual, expandido]);
  useEffect(() => {
    if (!flyout) return;
    const fuera = (e: MouseEvent) => {
      if (!refCarril.current?.contains(e.target as Node)) setFlyout(null);
    };
    const esc = (e: KeyboardEvent) => e.key === "Escape" && setFlyout(null);
    document.addEventListener("mousedown", fuera);
    document.addEventListener("keydown", esc);
    return () => {
      document.removeEventListener("mousedown", fuera);
      document.removeEventListener("keydown", esc);
    };
  }, [flyout]);

  const visible = (e: ElementoMenu) =>
    (!e.regla || puedeAlguna(e.regla)) && pluginsActivos(e) && disponibleEnSaas(e);
  const grupos: Grupo[] = menu.filter(visible).flatMap((e): Grupo[] => {
    if (!esPadre(e)) {
      const hoja = e as ElementoMenuHijo;
      return [{ nombre: hoja.nombre, icono: hoja.icono ?? ICONO_GRUPO, url: hoja.url, items: [] }];
    }
    const items = e.subelementos.filter(visible);
    return items.length
      ? [{ nombre: e.nombre, icono: e.icono ?? ICONO_GRUPO, area: e.area, items }]
      : [];
  });

  const coincide = (texto: string) => !q || normalizar(texto).includes(q);
  const gruposFiltrados = grupos
    .map((g) => ({
      ...g,
      items:
        coincide(g.nombre) || !q ? g.items : g.items.filter((i) => coincide(i.nombre)),
    }))
    .filter((g) => (g.url ? coincide(g.nombre) : g.items.length > 0));

  const contieneActual = (g: Grupo) =>
    g.url ? g.url === urlActual : g.items.some((i) => i.url === urlActual);
  const cerrarEnMovil = () => control.cerrarMenu("lateral");

  const alternarGrupo = (nombre: string) =>
    setGruposAbiertos({ ...gruposAbiertos, [nombre]: !gruposAbiertos[nombre] });

  const fila = (p: PantallaMenu, icono: string) => (
    <li key={`${icono}-${p.url}`}>
      <Link
        to={p.url}
        className="menu-fila"
        aria-current={p.url === urlActual ? "page" : undefined}
        onClick={cerrarEnMovil}
      >
        <QIcono nombre={icono} tamaño="sm" />
        <span className="menu-fila-texto">{p.nombre}</span>
        {p.grupo && <span className="menu-fila-grupo">{p.grupo}</span>}
      </Link>
    </li>
  );

  const renderGrupo = (g: Grupo) => {
    const actual = contieneActual(g);
    if (g.url) {
      return (
        <li key={g.nombre}>
          <Link
            to={g.url}
            className="menu-grupo"
            data-actual={actual || undefined}
            aria-current={actual ? "page" : undefined}
            onClick={cerrarEnMovil}
          >
            <QIcono nombre={g.icono} tamaño="md" />
            <span className="menu-grupo-nombre">
              <Resaltado texto={g.nombre} filtro={filtro} />
            </span>
          </Link>
        </li>
      );
    }
    const abierto = q ? true : !!gruposAbiertos[g.nombre];
    const idLista = `menu-grupo-${normalizar(g.nombre).replace(/\W+/g, "-")}`;
    return (
      <li key={g.nombre}>
        <button
          type="button"
          className="menu-grupo"
          data-actual={actual || undefined}
          aria-expanded={abierto}
          aria-controls={idLista}
          onClick={() => alternarGrupo(g.nombre)}
        >
          <QIcono nombre={g.icono} tamaño="md" />
          <span className="menu-grupo-nombre">
            <Resaltado texto={g.nombre} filtro={filtro} />
          </span>
          {actual && !abierto && (
            <span className="menu-grupo-punto" title="Contiene la pantalla actual" />
          )}
          <span className="menu-grupo-cuenta">{g.items.length}</span>
          <span className="menu-grupo-flecha" aria-hidden="true">
            <QIcono nombre="derecha" tamaño="xs" />
          </span>
        </button>
        {abierto && (
          <ul id={idLista} className="menu-pantallas">
            {g.items.map((i) => {
              const esFavorito = control.favoritos.includes(i.url);
              return (
                <li key={i.url}>
                  <Link
                    to={i.url}
                    className="menu-pantalla"
                    aria-current={i.url === urlActual ? "page" : undefined}
                    onClick={cerrarEnMovil}
                  >
                    <Resaltado texto={i.nombre} filtro={filtro} />
                  </Link>
                  <button
                    type="button"
                    className="menu-estrella"
                    data-favorito={esFavorito || undefined}
                    aria-pressed={esFavorito}
                    aria-label={
                      esFavorito
                        ? `Quitar ${i.nombre} de favoritos`
                        : `Añadir ${i.nombre} a favoritos`
                    }
                    onClick={() => control.alternarFavorito(i.url)}
                  >
                    <QIcono
                      nombre={esFavorito ? "estrella_rellena" : "estrella"}
                      tamaño="xs"
                    />
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </li>
    );
  };

  const renderExpandido = () => (
    <>
      <div className="menu-filtro">
        <QIcono nombre="buscar" tamaño="sm" />
        <QInput
          nombre="filtro_menu"
          label=""
          condensado
          placeholder="Filtrar el menú…"
          valor={filtro}
          onChange={(v) => setFiltro(v)}
        />
      </div>
      <nav className="menu-cuerpo" aria-label="Menú principal">
        {!q && favoritos.length > 0 && (
          <section className="menu-seccion" aria-labelledby="menu-favoritos">
            <h2 id="menu-favoritos">Favoritos</h2>
            <ul>{favoritos.map((p) => fila(p, "estrella_rellena"))}</ul>
          </section>
        )}
        {!q && recientes.length > 0 && (
          <section className="menu-seccion" aria-labelledby="menu-recientes">
            <h2 id="menu-recientes">Recientes</h2>
            <ul>{recientes.map((p) => fila(p, "reloj"))}</ul>
          </section>
        )}
        {agruparPorArea(gruposFiltrados).map(({ area, grupos: delArea }) => (
          <section
            key={area || "sin-area"}
            className="menu-seccion"
            aria-label={area || "General"}
          >
            {area && <h2>{area}</h2>}
            <ul>{delArea.map(renderGrupo)}</ul>
          </section>
        ))}
        {gruposFiltrados.length === 0 && (
          <div className="menu-sin-resultados">
            <span>Ninguna pantalla contiene «{filtro}».</span>
            <button type="button" onClick={control.abrirBusqueda}>
              Buscar en todo (Ctrl K)
            </button>
          </div>
        )}
      </nav>
      {!esMovil && (
        <div className="menu-pie">
          <button
            type="button"
            className="menu-fila"
            onClick={control.alternarLateralExpandido}
          >
            <QIcono nombre="menu_contraer" tamaño="sm" />
            Contraer menú
          </button>
        </div>
      )}
    </>
  );

  const grupoFlyout = grupos.find((g) => g.nombre === flyout?.grupo);
  // El carril sigue el mismo orden que el menú expandido (por áreas).
  const gruposCarril = agruparPorArea(grupos).flatMap((a) => a.grupos);

  const renderCarril = () => (
    <nav className="menu-carril" aria-label="Menú principal" ref={refCarril}>
      <button
        type="button"
        className="menu-carril-boton"
        aria-label="Buscar (Ctrl K)"
        title="Buscar (Ctrl K)"
        onClick={control.abrirBusqueda}
      >
        <QIcono nombre="buscar" tamaño="md" />
      </button>
      <span className="menu-carril-separador" aria-hidden="true" />
      {gruposCarril.map((g) =>
        g.url ? (
          <Link
            key={g.nombre}
            to={g.url}
            className="menu-carril-boton"
            data-actual={contieneActual(g) || undefined}
            aria-label={g.nombre}
            title={g.nombre}
          >
            <QIcono nombre={g.icono} tamaño="md" />
          </Link>
        ) : (
          <button
            key={g.nombre}
            type="button"
            className="menu-carril-boton"
            data-actual={contieneActual(g) || undefined}
            data-abierto={flyout?.grupo === g.nombre || undefined}
            aria-label={g.nombre}
            aria-expanded={flyout?.grupo === g.nombre}
            title={g.nombre}
            onClick={(e) =>
              setFlyout(
                flyout?.grupo === g.nombre
                  ? null
                  : { grupo: g.nombre, top: e.currentTarget.offsetTop }
              )
            }
          >
            <QIcono nombre={g.icono} tamaño="md" />
          </button>
        )
      )}
      <button
        type="button"
        className="menu-carril-boton menu-carril-expandir"
        aria-label="Expandir menú"
        title="Expandir menú"
        onClick={control.alternarLateralExpandido}
      >
        <QIcono nombre="menu_expandir" tamaño="md" />
      </button>
      {grupoFlyout && flyout && (
        <div
          className="menu-flyout"
          role="dialog"
          aria-label={grupoFlyout.nombre}
          style={{ top: flyout.top }}
        >
          <span className="menu-flyout-titulo">{grupoFlyout.nombre}</span>
          <ul>
            {grupoFlyout.items.map((i) => (
              <li key={i.url}>
                <Link
                  to={i.url}
                  className="menu-pantalla"
                  aria-current={i.url === urlActual ? "page" : undefined}
                >
                  {i.nombre}
                  {control.favoritos.includes(i.url) && (
                    <QIcono nombre="estrella_rellena" tamaño="xs" />
                  )}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </nav>
  );

  return (
    <menu-lateral
      className={control.menuAbierto.lateral ? "activo" : ""}
      data-modo={expandido ? "expandido" : "contraido"}
    >
      <aside id="menu-principal">
        {expandido ? renderExpandido() : renderCarril()}
      </aside>
    </menu-lateral>
  );
};

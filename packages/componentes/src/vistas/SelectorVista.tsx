import { useCallback, useEffect, useRef, useState } from "react";
import { QIcono } from "../atomos/qicono.tsx";
import { VistaGuardada } from "./diseño.ts";
import { MenuFlotante, OpcionMenu } from "./MenuFlotante.tsx";
import "./SelectorVista.css";

const ORIGEN: Record<VistaGuardada["origen"], string | null> = {
  usuario: null,
  grupo: "de tu grupo",
  empresa: "de la empresa",
};

const nombreDe = (vista: VistaGuardada) => vista.nombre ?? vista.vista;

/**
 * Selector de vista del listado: la vista por defecto y las vistas con nombre
 * (filtro, columnas, orden y modo guardados), propias, del grupo o de la
 * empresa. Permite guardar la actual como vista nueva, guardar en la activa el
 * filtro de ahora y borrar las propias (con confirmación).
 */
export const SelectorVista = ({
  vistas,
  activa,
  puedeGuardar,
  filtroCambiado,
  onElegir,
  onGuardarComo,
  onGuardarFiltro,
  onBorrar,
  onAbrir,
  error,
}: {
  vistas: VistaGuardada[];
  /** Id de la vista activa ('' = por defecto). */
  activa: string;
  /** Se pueden crear y cambiar vistas propias (servidor disponible y sin bloqueo). */
  puedeGuardar: boolean;
  /** El filtro del listado no es el que guarda la vista activa. */
  filtroCambiado: boolean;
  onElegir: (vista: string) => void;
  onGuardarComo: (nombre: string) => void;
  onGuardarFiltro: () => void;
  onBorrar: (vista: string) => void;
  /** Al abrir el menú (p. ej. para quitar un error anterior). */
  onAbrir?: () => void;
  /** Lo último que se intentó (guardar, borrar) falló. */
  error?: string | null;
}) => {
  const boton = useRef<HTMLButtonElement>(null);
  const [panel, setPanel] = useState<"menu" | "nueva" | "borrar" | null>(null);
  const [nombre, setNombre] = useState("");
  const cerrar = useCallback(() => {
    setPanel(null);
    setNombre("");
  }, []);

  const actual = vistas.find((v) => v.vista === activa);
  const propia = actual?.origen === "usuario";
  const titulo = actual ? nombreDe(actual) : "Vista por defecto";
  const conCambios = activa !== "" && filtroCambiado;

  // Anuncio para lectores de pantalla al cambiar de vista (no al cargar).
  const [anuncio, setAnuncio] = useState("");
  const vistaAnterior = useRef(activa);
  useEffect(() => {
    if (vistaAnterior.current === activa) return;
    vistaAnterior.current = activa;
    setAnuncio(`Vista «${titulo}» aplicada`);
  }, [activa, titulo]);

  const abrir = () => {
    onAbrir?.();
    setPanel("menu");
  };

  const guardarComo = () => {
    const limpio = nombre.trim();
    if (!limpio) return;
    onGuardarComo(limpio);
    cerrar();
  };

  const repetido = vistas.some(
    (v) => nombreDe(v).trim().toLowerCase() === nombre.trim().toLowerCase()
  );

  return (
    <>
      <button
        ref={boton}
        type="button"
        className="selector-vista"
        data-activa={activa !== "" || undefined}
        aria-label={`Vista: ${titulo}${conCambios ? ", con cambios sin guardar" : ""}`}
        aria-haspopup="menu"
        aria-expanded={panel !== null}
        onClick={() => (panel ? cerrar() : abrir())}
        onKeyDown={(e) => {
          if (e.key === "ArrowDown" && !panel) {
            e.preventDefault();
            abrir();
          }
        }}
      >
        <QIcono nombre="vista" tamaño="sm" />
        <span className="selector-vista-nombre">{titulo}</span>
        {conCambios && <span className="selector-vista-cambios" aria-hidden="true" />}
        <QIcono nombre="abajo" tamaño="xs" />
      </button>
      <span className="selector-vista-anuncio" role="status">
        {anuncio}
      </span>
      {error && (
        <span className="selector-vista-error" role="alert">
          {error}
        </span>
      )}

      {panel === "menu" && boton.current && (
        <MenuFlotante ancla={boton.current} onCerrar={cerrar} etiqueta="Vistas">
          <div role="group" aria-label="Vistas disponibles">
            <OpcionMenu
              marcada={activa === ""}
              icono={
                activa === "" ? (
                  <QIcono nombre="check" tamaño="sm" />
                ) : (
                  <span className="selector-vista-hueco" />
                )
              }
              onClick={() => {
                cerrar();
                onElegir("");
              }}
            >
              Vista por defecto
            </OpcionMenu>
            {vistas.map((vista) => (
              <OpcionMenu
                key={vista.vista}
                marcada={vista.vista === activa}
                icono={
                  vista.vista === activa ? (
                    <QIcono nombre="check" tamaño="sm" />
                  ) : (
                    <span className="selector-vista-hueco" />
                  )
                }
                onClick={() => {
                  cerrar();
                  onElegir(vista.vista);
                }}
              >
                {nombreDe(vista)}
                {ORIGEN[vista.origen] && (
                  <small className="selector-vista-origen"> · {ORIGEN[vista.origen]}</small>
                )}
              </OpcionMenu>
            ))}
          </div>
          {puedeGuardar && (
            <>
              <hr className="menu-flotante-separador" />
              <OpcionMenu
                icono={<QIcono nombre="guardar" tamaño="sm" />}
                onClick={() => setPanel("nueva")}
              >
                Guardar como vista nueva…
              </OpcionMenu>
              {propia && (
                <OpcionMenu
                  icono={<QIcono nombre="filtro" tamaño="sm" />}
                  deshabilitado={!filtroCambiado}
                  onClick={() => {
                    cerrar();
                    onGuardarFiltro();
                  }}
                >
                  {filtroCambiado
                    ? `Guardar el filtro actual en «${titulo}»`
                    : `El filtro de «${titulo}» ya está guardado`}
                </OpcionMenu>
              )}
              {propia && (
                <OpcionMenu
                  icono={<QIcono nombre="eliminar" tamaño="sm" />}
                  destructiva
                  onClick={() => setPanel("borrar")}
                >
                  Borrar la vista «{titulo}»…
                </OpcionMenu>
              )}
            </>
          )}
        </MenuFlotante>
      )}

      {panel === "nueva" && boton.current && (
        <MenuFlotante
          ancla={boton.current}
          onCerrar={cerrar}
          etiqueta="Guardar como vista nueva"
          rol="dialog"
        >
          <form
            className="selector-vista-dialogo"
            onSubmit={(e) => {
              e.preventDefault();
              guardarComo();
            }}
          >
            <label>
              <span>Nombre de la vista (hasta 60 caracteres)</span>
              <input
                name="nombre-vista"
                value={nombre}
                maxLength={60}
                autoComplete="off"
                spellCheck={false}
                placeholder="Mis pendientes"
                onChange={(e) => setNombre(e.target.value)}
              />
            </label>
            <p className="selector-vista-ayuda">
              Guarda el filtro, las columnas, el orden y el modo de ahora. Las columnas que
              cambies después se guardan solas en la vista; el filtro, con «Guardar el filtro
              actual».
            </p>
            {repetido && (
              <p className="selector-vista-ayuda">Ya hay una vista con ese nombre.</p>
            )}
            <div className="selector-vista-botones">
              <button type="button" onClick={cerrar}>
                Cancelar
              </button>
              <button type="submit" disabled={!nombre.trim()}>
                Guardar
              </button>
            </div>
          </form>
        </MenuFlotante>
      )}

      {panel === "borrar" && boton.current && (
        <MenuFlotante
          ancla={boton.current}
          onCerrar={cerrar}
          etiqueta={`Borrar la vista «${titulo}»`}
          rol="dialog"
        >
          <div className="selector-vista-dialogo">
            <p>
              ¿Borrar la vista «{titulo}»? No se puede deshacer. Si la has compartido, lo
              compartido se queda.
            </p>
            <div className="selector-vista-botones">
              <button type="button" data-foco-inicial onClick={cerrar}>
                Cancelar
              </button>
              <button
                type="button"
                className="selector-vista-borrar"
                onClick={() => {
                  cerrar();
                  onBorrar(activa);
                }}
              >
                Borrar
              </button>
            </div>
          </div>
        </MenuFlotante>
      )}
    </>
  );
};

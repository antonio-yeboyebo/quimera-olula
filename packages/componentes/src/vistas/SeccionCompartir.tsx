import { useCallback, useEffect, useId, useRef, useState } from "react";
import { ConfigVista, VistaCompartida } from "./diseño.ts";
import {
  borrarVistaCompartida,
  getGrupos,
  getVistasCompartidas,
  guardarVistaCompartida,
} from "./infraestructura.ts";

/** Regla que permite compartir vistas con la empresa o con un grupo. */
export const REGLA_VISTA_COMPARTIDA = "comun.vista_compartida";

type Grupo = { id: string; nombre: string };

/**
 * Parte del panel «Personalizar pantalla» para quien administra las vistas:
 * compartir la vista que ve ahora con toda la empresa o con un grupo (los
 * demás la ven como punto de partida, encima pueden personalizar lo suyo),
 * quitar lo compartido y bloquear la personalización de la pantalla.
 */
export const SeccionCompartir = ({
  pantalla,
  vista,
  nombreVista,
  paraCompartir,
  onCambio,
}: {
  pantalla: string;
  /** Vista activa ('' = la de por defecto). */
  vista: string;
  nombreVista: string;
  /** La configuración que se comparte (la de ahora). */
  paraCompartir: () => ConfigVista;
  /** Lo compartido cambió: lo que ve el usuario puede ser otro. */
  onCambio: () => void;
}) => {
  const [compartidas, setCompartidas] = useState<VistaCompartida[] | null>(null);
  const [grupos, setGrupos] = useState<Grupo[]>([]);
  // Sin elegir destino no se comparte: un clic no debe cambiar la pantalla de todos.
  const [destino, setDestino] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [aviso, setAviso] = useState("");
  // Mientras hay una petición en curso, nada se puede pulsar otra vez.
  const [ocupado, setOcupado] = useState(false);
  const titulo = useRef<HTMLHeadingElement>(null);
  const idAyudaBloqueo = useId();

  // `puede` deja pasar las reglas que no conoce: quien decide es el servidor.
  // Si no deja leer lo compartido (sin la regla), la sección no aparece.
  const [permitido, setPermitido] = useState<boolean | null>(null);
  const cargar = useCallback(
    () =>
      Promise.resolve()
        .then(() => getVistasCompartidas(pantalla))
        .then((lista) => {
          setCompartidas(lista);
          setPermitido(true);
        })
        .catch(() => setPermitido((antes) => antes ?? false)),
    [pantalla]
  );

  useEffect(() => {
    void cargar();
    // Sin permiso para listar grupos, solo se comparte con la empresa.
    Promise.resolve()
      .then(() => getGrupos())
      .then((lista) => setGrupos(Array.isArray(lista) ? lista : []))
      .catch(() => setGrupos([]));
  }, [cargar]);

  const nombreGrupo = (id: string | null) =>
    id === null ? "toda la empresa" : `el grupo ${grupos.find((g) => g.id === id)?.nombre ?? id}`;
  const nombreCompartida = (c: VistaCompartida) =>
    c.nombre ?? (c.vista ? c.vista : "Vista por defecto");

  const ejecutar = (accion: () => Promise<unknown>, hecho: string, despues?: () => void) => {
    if (ocupado) return;
    setError(null);
    setAviso("");
    setOcupado(true);
    void accion()
      .then(() => cargar())
      .then(() => {
        setAviso(hecho);
        despues?.();
        onCambio();
      })
      .catch(() => setError("No se ha podido guardar. Inténtalo de nuevo."))
      .finally(() => setOcupado(false));
  };

  const empresaPorDefecto = compartidas?.find((c) => c.grupo_id === null && c.vista === "");
  const bloqueada = !!empresaPorDefecto?.bloqueada;
  const grupoDestino = destino === "empresa" ? null : destino;

  const compartir = () =>
    ejecutar(
      () =>
        guardarVistaCompartida(pantalla, {
          vista,
          grupo_id: grupoDestino,
          config: paraCompartir(),
          // Al compartir la vista por defecto con la empresa se conserva el bloqueo.
          ...(vista === "" && grupoDestino === null ? { bloqueada } : {}),
        }),
      `«${nombreVista}» compartida con ${nombreGrupo(grupoDestino)}.`
    );

  const alternarBloqueo = () =>
    ejecutar(
      () =>
        guardarVistaCompartida(pantalla, {
          vista: "",
          grupo_id: null,
          config: empresaPorDefecto?.config ?? {},
          bloqueada: !bloqueada,
        }),
      bloqueada ? "Pantalla desbloqueada." : "Pantalla bloqueada para toda la empresa."
    );

  if (!permitido) return null;

  return (
    <>
      <h4 ref={titulo} tabIndex={-1}>
        Compartir
      </h4>
      <p className="panel-personalizar-ayuda">
        {vista
          ? `Comparte «${nombreVista}» tal como la ves ahora: filtro, columnas, orden y modo.`
          : "Comparte la vista por defecto tal como la ves ahora: columnas, orden, modo y tarjeta (el filtro no: para eso, guarda una vista con nombre)."}{" "}
        Quien la reciba la verá como punto de partida y podrá personalizarla para sí.
      </p>
      <label className="panel-personalizar-campo">
        <span>Compartir con</span>
        <select value={destino} onChange={(e) => setDestino(e.target.value)}>
          <option value="" disabled>
            Elige con quién…
          </option>
          <option value="empresa">Toda la empresa</option>
          {grupos.map((grupo) => (
            <option key={grupo.id} value={grupo.id}>
              Grupo {grupo.nombre}
            </option>
          ))}
        </select>
      </label>
      <button
        type="button"
        className="panel-personalizar-boton"
        disabled={!destino || ocupado}
        onClick={compartir}
      >
        {destino ? `Compartir con ${nombreGrupo(grupoDestino)}` : "Compartir"}
      </button>

      <label className="panel-personalizar-casilla">
        <input
          type="checkbox"
          checked={bloqueada}
          disabled={ocupado}
          aria-describedby={idAyudaBloqueo}
          onChange={alternarBloqueo}
        />
        <span>Bloquear la personalización de esta pantalla para toda la empresa</span>
      </label>
      <p id={idAyudaBloqueo} className="panel-personalizar-ayuda">
        Nadie de la empresa podrá cambiar columnas, botones ni vistas propias: verán lo
        compartido con la empresa y con su grupo
        {empresaPorDefecto ? "" : " (aún no hay nada compartido con la empresa: verán la pantalla tal como viene)"}
        . Puedes desbloquearla aquí.
      </p>

      {compartidas && compartidas.length > 0 && (
        <>
          <h5 className="panel-personalizar-subtitulo">Compartido ahora</h5>
          <ul className="panel-personalizar-compartidas">
            {compartidas.map((c) => (
              <li key={`${c.grupo_id ?? ""}:${c.vista}`}>
                <span>
                  {nombreCompartida(c)}
                  <small> · con {nombreGrupo(c.grupo_id)}</small>
                  {c.bloqueada && <small> · bloqueada</small>}
                </span>
                <button
                  type="button"
                  className="panel-personalizar-enlace"
                  disabled={ocupado}
                  aria-label={`Quitar «${nombreCompartida(c)}», compartida con ${nombreGrupo(c.grupo_id)}`}
                  onClick={() =>
                    ejecutar(
                      () => borrarVistaCompartida(pantalla, c.vista, c.grupo_id),
                      `Ya no se comparte «${nombreCompartida(c)}» con ${nombreGrupo(c.grupo_id)}.`,
                      // El botón desaparece: el foco vuelve al título de la sección.
                      () => titulo.current?.focus()
                    )
                  }
                >
                  Quitar
                </button>
              </li>
            ))}
          </ul>
        </>
      )}
      <p className="panel-personalizar-aviso" role="status">
        {aviso}
      </p>
      {error && (
        <p className="panel-personalizar-error" role="alert">
          {error}
        </p>
      )}
    </>
  );
};

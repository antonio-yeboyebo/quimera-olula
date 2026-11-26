import { useTComponentes } from "../i18n/textos.ts";

type ModoListado = "tabla" | "tarjetas" | "kanban";

/** Control segmentado para elegir el modo de vista del listado. */
export const SelectorModo = <M extends ModoListado>({
  modos,
  modo,
  onCambio,
}: {
  modos: M[];
  modo: M;
  onCambio: (modo: M) => void;
}) => {
  const t = useTComponentes();
  return (
  <div className="selector-modo" role="group" aria-label={t("listado.modoVista")}>
    {modos.map((opcion) => (
      <button
        key={opcion}
        type="button"
        aria-pressed={opcion === modo}
        onClick={() => opcion !== modo && onCambio(opcion)}
      >
        {t(`listado.modos.${opcion}`)}
      </button>
    ))}
  </div>
  );
};

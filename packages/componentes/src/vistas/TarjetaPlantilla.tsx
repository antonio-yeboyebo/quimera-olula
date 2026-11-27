import { Entidad } from "@olula/lib/diseño.ts";
import { MetaColumna, MetaTabla, obtenerCols } from "../atomos/qtablacontrolada.tsx";
import { ContenidoConEnlace } from "../atomos/qenlace_ficha.tsx";
import { etiquetaEnlace } from "../atomos/url_enlace.ts";
import { valorColumna } from "../moleculas/valor_columna.tsx";
import { ConfigTarjeta } from "./diseño.ts";
import "./TarjetaPlantilla.css";

/**
 * Tarjeta de un listado con la plantilla que eligió el usuario: título,
 * subtítulo, etiqueta (arriba a la derecha) y hasta tres campos, todos
 * columnas del catálogo de la tabla (también las ocultas).
 */
export const TarjetaPlantilla = <T extends Entidad>({
  entidad,
  metaTabla,
  plantilla,
}: {
  entidad: T;
  metaTabla: MetaTabla<T>;
  plantilla: ConfigTarjeta;
}) => {
  const cols = obtenerCols(metaTabla);
  const columna = (id?: string) => (id ? cols.find((c) => c.id === id) : undefined);
  // Como en la tarjeta genérica: con el enlace a la ficha si la columna lo tiene.
  const valor = (c: MetaColumna<T>) => (
    <ContenidoConEnlace
      href={c.enlace?.(entidad)}
      etiqueta={etiquetaEnlace(c.cabecera, entidad[c.id])}
    >
      {valorColumna(entidad, c, "—")}
    </ContenidoConEnlace>
  );
  // Valor completo al pasar el ratón por los que se recortan («…»).
  const texto = (c: MetaColumna<T>) => {
    const bruto = entidad[c.id];
    return typeof bruto === "string" || typeof bruto === "number" ? String(bruto) : undefined;
  };

  const titulo = columna(plantilla.titulo);
  const subtitulo = columna(plantilla.subtitulo);
  const etiqueta = columna(plantilla.etiqueta);
  const campos = plantilla.campos
    .map((id) => columna(id))
    .filter((c): c is MetaColumna<T> => c !== undefined);

  return (
    <article className="tarjeta-plantilla">
      {(titulo || subtitulo || etiqueta) && (
        <header className="tarjeta-plantilla-cabecera">
          <div className="tarjeta-plantilla-titulos">
            {titulo && <strong className="tarjeta-plantilla-titulo">{valor(titulo)}</strong>}
            {subtitulo && (
              <span className="tarjeta-plantilla-subtitulo" title={texto(subtitulo)}>
                {valor(subtitulo)}
              </span>
            )}
          </div>
          {etiqueta && (
            <div className="tarjeta-plantilla-etiqueta" title={texto(etiqueta)}>
              {valor(etiqueta)}
            </div>
          )}
        </header>
      )}
      {campos.length > 0 && (
        <dl className="tarjeta-plantilla-campos">
          {campos.map((c) => (
            <div key={c.id}>
              <dt>{c.cabecera}</dt>
              <dd title={texto(c)}>{valor(c)}</dd>
            </div>
          ))}
        </dl>
      )}
    </article>
  );
};

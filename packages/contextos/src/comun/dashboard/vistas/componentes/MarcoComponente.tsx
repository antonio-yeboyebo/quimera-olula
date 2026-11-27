import { ReactNode } from "react";
import { tComun } from "../../../i18n/index.ts";

/**
 * Marco común: título (con el periodo de los datos, para saber de qué fechas son),
 * estados de carga/error/sin datos y el contenido.
 */
export const MarcoComponente = ({
  titulo,
  periodo,
  cargando,
  error,
  vacio,
  aviso,
  pie,
  children,
}: {
  titulo: string;
  periodo?: string;
  cargando?: boolean;
  error?: string | null;
  vacio?: boolean;
  /** Texto cuando el componente aún no está configurado del todo. */
  aviso?: string | null;
  pie?: ReactNode;
  children?: ReactNode;
}) => (
  <section className="dashboard-componente" aria-busy={cargando || undefined}>
    {titulo && (
      <h2 className="dashboard-componente-titulo">
        {titulo}
        {periodo && <span className="dashboard-componente-periodo"> · {periodo}</span>}
      </h2>
    )}
    <div className="dashboard-componente-cuerpo">
      {aviso ? (
        <p className="dashboard-componente-estado">{aviso}</p>
      ) : error ? (
        <p className="dashboard-componente-estado" data-error>
          {error}
        </p>
      ) : cargando ? (
        <div className="dashboard-componente-cargando" aria-label={tComun("dashboard.cargando")} />
      ) : vacio ? (
        <p className="dashboard-componente-estado">{tComun("dashboard.sinDatosParaEstePeriodo")}</p>
      ) : (
        children
      )}
    </div>
    {pie && !aviso && !error && <div className="dashboard-componente-pie">{pie}</div>}
  </section>
);

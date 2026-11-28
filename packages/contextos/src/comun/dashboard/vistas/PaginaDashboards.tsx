import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";
import { ResumenDashboard } from "../diseño.ts";
import { crearDashboard, getDashboards } from "../infraestructura.ts";
import { useIaDisponible } from "../useIaDisponible.ts";
import "./Dashboard.css";
import { NuevoDashboard } from "./NuevoDashboard.tsx";
import { tComun, useTComun } from "../../i18n/index.ts";

/** Mis dashboards y los que ha compartido el resto de la empresa. */
export const PaginaDashboards = () => {
  const t = useTComun();
  const [dashboards, setDashboards] = useState<ResumenDashboard[] | null>(null);
  const [eligiendo, setEligiendo] = useState(false);
  const navegar = useNavigate();
  const conIA = useIaDisponible();

  useEffect(() => {
    getDashboards().then(setDashboards).catch(() => setDashboards([]));
  }, []);

  const abrir = (id: string) => navegar(`/comun/dashboard/${id}?editar`);

  // Con un modelo de IA activo se puede pedir que lo proponga; si no, en blanco.
  const nuevo = async () => {
    if (conIA) {
      setEligiendo(true);
      return;
    }
    abrir(await crearDashboard({ nombre: t("dashboard.nuevoDashboard"), componentes: [] }));
  };

  // Las versiones personales de los dashboards de módulo se abren desde su módulo.
  const propios = (dashboards ?? []).filter((d) => d.esPropio && d.clave === null);
  const compartidos = (dashboards ?? []).filter((d) => !d.esPropio);

  return (
    <div className="pagina-dashboard" aria-busy={dashboards === null || undefined}>
      <header className="pagina-dashboard-cabecera">
        <div className="pagina-dashboard-titulo">
          <h1>{t("dashboard.dashboards")}</h1>
        </div>
        <div className="pagina-dashboard-botones">
          <QBoton onClick={nuevo}>{t("dashboard.nuevoDashboard")}</QBoton>
        </div>
      </header>

      {dashboards !== null && (
        <div className="lista-dashboards">
          <ListaDashboards
            titulo={t("dashboard.misDashboards")}
            dashboards={propios}
            vacio={t("dashboard.aunNoHasCreadoNinguno")}
          />
          <ListaDashboards
            titulo={t("dashboard.compartidosPorLaEmpresa")}
            dashboards={compartidos}
            vacio={t("dashboard.nadieHaCompartidoNingunoTodavia")}
          />
        </div>
      )}

      {eligiendo && (
        <NuevoDashboard onCreado={abrir} onCancelar={() => setEligiendo(false)} />
      )}
    </div>
  );
};

const ListaDashboards = ({
  titulo,
  dashboards,
  vacio,
}: {
  titulo: string;
  dashboards: ResumenDashboard[];
  vacio: string;
}) => (
  <section>
    <h2>{titulo}</h2>
    {dashboards.length === 0 ? (
      <p className="lista-dashboards-vacio">{vacio}</p>
    ) : (
      <ul>
        {dashboards.map((d) => (
          <li key={d.id}>
            <Link to={`/comun/dashboard/${d.id}`}>
              <strong>{d.nombre}</strong>
              <span>
                {d.esPropio
                  ? d.compartido
                    ? tComun("dashboard.compartidoConLaEmpresa")
                    : tComun("dashboard.privado")
                  : tComun("dashboard.dePropietario", { propietario: d.propietario })}
                {" · "}
                {new Date(d.actualizadoEn).toLocaleDateString("es-ES")}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    )}
  </section>
);

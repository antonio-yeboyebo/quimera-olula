import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { QIcono } from "@olula/componentes/atomos/qicono.tsx";
import { QInput } from "@olula/componentes/atomos/qinput.tsx";
import { useMaquina } from "@olula/componentes/hook/useMaquina.ts";
import { QModalConfirmacion } from "@olula/componentes/moleculas/qmodalconfirmacion.tsx";
import { QRejilla } from "@olula/componentes/rejilla/QRejilla.tsx";
import { useCallback, useEffect } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router";
import { ComponenteDashboard, Dashboard } from "../../diseño.ts";
import { ALTO_FILA_DASHBOARD, MAX_COMPONENTES } from "../../dominio.ts";
import { crearDashboard } from "../../infraestructura.ts";
import { useIaDisponible } from "../../useIaDisponible.ts";
import { CatalogoComponentes } from "../CatalogoComponentes.tsx";
import { Componente } from "../componentes/Componente.tsx";
import { ConfigurarComponente } from "../ConfigurarComponente.tsx";
import { PreguntarIA } from "../PreguntarIA.tsx";
import "../Dashboard.css";
import { getMaquina } from "./maquina.ts";
import { contextoDashboardInicial } from "./pagina.ts";
import { tComun, useTComun } from "../../../i18n/index.ts";

/**
 * Página de un dashboard: verlo, editarlo (su propietario), compartirlo, exportarlo.
 * Con `clave`, uno de módulo o la Inicio: la versión del usuario o el de por defecto.
 */
export const PaginaDashboard = ({ clave }: { clave?: string }) => {
  const t = useTComun();
  const { id } = useParams();
  const [parametros] = useSearchParams();
  const navegar = useNavigate();
  const conIA = useIaDisponible();

  const publicar = useCallback(
    async (evento: string) => {
      if (evento === "dashboard_borrado") navegar("/comun/dashboard");
    },
    [navegar]
  );

  const { ctx, emitir } = useMaquina(getMaquina, contextoDashboardInicial, publicar);
  const { estado, dashboard, borrador, configurando } = ctx;

  useEffect(() => {
    const editar = parametros.has("editar");
    if (clave) emitir("clave_cambiada", { clave, editar }, true);
    else if (id) emitir("id_cambiado", { id, editar }, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, clave]);

  if (estado === "NO_ENCONTRADO") {
    return (
      <div className="pagina-dashboard">
        <p className="pagina-dashboard-vacio">
          {clave
            ? t("dashboard.noHayUnDashboardParaEsta")
            : t("dashboard.esteDashboardNoExisteONo")}{" "}
          <QBoton variante="texto" enlace="/comun/dashboard">
            {t("dashboard.verMisDashboards")}
          </QBoton>
        </p>
      </div>
    );
  }
  if (!dashboard) return <div className="pagina-dashboard" aria-busy="true" />;

  const editando = estado === "EDITANDO" || estado === "CONFIGURANDO";
  const componentes = editando ? borrador : dashboard.componentes;

  const duplicar = async () => {
    const nuevo = await crearDashboard({
      nombre: t("dashboard.nombreCopia", { nombre: dashboard.nombre }),
      componentes: dashboard.componentes,
    });
    navegar(`/comun/dashboard/${nuevo}`);
  };

  const renderizar = (componente: ComponenteDashboard) =>
    editando ? (
      <div className="pagina-dashboard-editable">
        <Componente componente={componente} />
        <div className="pagina-dashboard-acciones-componente">
          <button
            type="button"
            aria-label={t("dashboard.configurarValor", { valor: componente.titulo || componente.tipo })}
            title={t("dashboard.configurar")}
            onClick={() => emitir("componente_configurado", componente.id)}
          >
            <QIcono nombre="editar" tamaño="sm" />
          </button>
          <button
            type="button"
            data-destructivo
            aria-label={t("dashboard.quitarValor", { valor: componente.titulo || componente.tipo })}
            title={t("dashboard.quitar")}
            onClick={() => emitir("componente_quitado", componente.id)}
          >
            <QIcono nombre="eliminar" tamaño="sm" />
          </button>
        </div>
      </div>
    ) : (
      <Componente componente={componente} />
    );

  return (
    <div className="pagina-dashboard" data-editando={editando || undefined}>
      <header className="pagina-dashboard-cabecera">
        <div className="pagina-dashboard-titulo">
          {editando ? (
            <QInput
              label={t("dashboard.nombreDelDashboard")}
              nombre="nombre_dashboard"
              valor={ctx.nombre}
              maxLength={80}
              onChange={(nombre) => emitir("nombre_cambiado", nombre)}
            />
          ) : (
            <h1>{dashboard.nombre}</h1>
          )}
          <span className="pagina-dashboard-subtitulo">{subtitulo(dashboard)}</span>
        </div>

        <div className="pagina-dashboard-botones">
          {editando ? (
            <>
              <QBoton variante="borde" onClick={() => emitir("edicion_cancelada")}>
                {t("dashboard.cancelar")}
              </QBoton>
              <QBoton onClick={() => emitir("edicion_guardada")}>{t("dashboard.guardar")}</QBoton>
            </>
          ) : (
            <>
              <QBoton variante="borde" onClick={() => window.print()}>
                {t("dashboard.exportarPdf")}
              </QBoton>
              <QBoton variante="borde" onClick={duplicar}>
                {t("dashboard.duplicar")}
              </QBoton>
              {dashboard.esPropio && dashboard.clave === null && (
                <QBoton variante="borde" onClick={() => emitir("compartido_alternado")}>
                  {dashboard.compartido ? t("dashboard.dejarDeCompartir") : t("dashboard.compartirConLaEmpresa")}
                </QBoton>
              )}
              {dashboard.esPropio && dashboard.id !== "" && (
                <QBoton variante="borde" destructivo onClick={() => emitir("borrado_solicitado")}>
                  {dashboard.clave ? t("dashboard.restaurarPorDefecto") : t("dashboard.borrar")}
                </QBoton>
              )}
              {dashboard.esPropio && (
                <QBoton onClick={() => emitir("edicion_iniciada")}>
                  {dashboard.id ? t("dashboard.editar") : t("dashboard.personalizar")}
                </QBoton>
              )}
            </>
          )}
        </div>
      </header>

      {dashboard.esPropio && dashboard.componentesOcultos > 0 && (
        <p className="pagina-dashboard-aviso" role="status">
          <QIcono nombre="candado" tamaño="sm" />
          {dashboard.componentesOcultos === 1
            ? t("dashboard.hay1ComponenteQueNoPuedes")
            : t("dashboard.hayComponentesocultosComponentesQueNoPue", { componentesOcultos: dashboard.componentesOcultos })}
        </p>
      )}

      <div className="pagina-dashboard-cuerpo">
        <div className="pagina-dashboard-rejilla">
          {componentes.length === 0 ? (
            <div className="pagina-dashboard-vacio">
              {editando
                ? t("dashboard.anadeComponentesDesdeElPanel")
                : t("dashboard.esteDashboardAunNoTieneComponentes")}
            </div>
          ) : (
            <QRejilla
              elementos={componentes}
              editable={editando}
              altoFila={ALTO_FILA_DASHBOARD}
              renderizar={renderizar}
              etiqueta={(c) => c.titulo || c.tipo}
              onCambiar={(nuevos) => emitir("disposicion_cambiada", nuevos)}
            />
          )}
        </div>

        {editando && (
          <CatalogoComponentes
            lleno={borrador.length >= MAX_COMPONENTES}
            conIA={conIA}
            onElegir={(tipo) => emitir("componente_añadido", tipo)}
          />
        )}
      </div>

      {estado === "CONFIGURANDO" && configurando?.tipo === "pregunta_ia" && (
        <PreguntarIA
          componente={configurando}
          onGuardar={(componente) => emitir("configuracion_aplicada", componente)}
          onAjustar={(componente) => emitir("configuracion_ajustada", componente)}
          onCancelar={() => emitir("configuracion_cancelada")}
        />
      )}

      {estado === "CONFIGURANDO" && configurando && configurando.tipo !== "pregunta_ia" && (
        <ConfigurarComponente
          componente={configurando}
          onGuardar={(componente) => emitir("configuracion_aplicada", componente)}
          onCancelar={() => emitir("configuracion_cancelada")}
        />
      )}

      <QModalConfirmacion
        nombre="borrar-dashboard"
        abierto={estado === "BORRANDO"}
        titulo={dashboard.clave ? t("dashboard.restaurarPorDefecto") : t("dashboard.borrarDashboard")}
        mensaje={
          dashboard.clave
            ? t("dashboard.seDescartaraTuVersionYVolveras")
            : t("dashboard.seBorraraNombreValor", { nombre: dashboard.nombre, valor: dashboard.compartido ? t("dashboard.tambienParaElRestoDeLa") : "" })
        }
        onCerrar={() => emitir("borrado_cancelado")}
        onAceptar={() => emitir("borrado_confirmado")}
      />
    </div>
  );
};

const subtitulo = (dashboard: Dashboard) => {
  if (dashboard.clave) {
    return dashboard.id
      ? tComun("dashboard.tuVersionPersonalizada")
      : tComun("dashboard.porDefectoPersonalizaloYSeGuardara");
  }
  if (!dashboard.esPropio) return tComun("dashboard.compartidoPorPropietario", { propietario: dashboard.propietario });
  return dashboard.compartido ? tComun("dashboard.compartidoConTodaLaEmpresa") : tComun("dashboard.soloLoVesTu");
};

/** Dashboard de un módulo (`/dashboard/:clave`). */
export const PaginaDashboardModulo = () => {
  const { clave } = useParams();
  return <PaginaDashboard clave={clave} />;
};

/** La Inicio de la app: el dashboard global. */
export const PaginaInicio = () => <PaginaDashboard clave="inicio" />;

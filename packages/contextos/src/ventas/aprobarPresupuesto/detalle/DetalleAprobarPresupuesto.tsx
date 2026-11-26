import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { QModal } from "@olula/componentes/moleculas/qmodal.tsx";
import { useMaquina } from "@olula/componentes/hook/useMaquina.js";
import { FactoryCtx } from "@olula/lib/factory_ctx.tsx";
import { useContext, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router";
import "./DetalleAprobarPresupuesto.css";
import { contextoVacio, hayPendiente, puedeAprobar } from "./dominio.ts";
import { Lineas } from "./Lineas/Lineas.tsx";
import { getMaquina } from "./maquina.ts";
import { useTVentas } from "../../i18n/index.ts";

type UrlPorId = (id: string) => string;

export const DetalleAprobarPresupuesto = () => {
  const t = useTVentas();
  const params = useParams();
  const navigate = useNavigate();
  const presupuestoId = params.id;
  const presupuestoIdCargadoRef = useRef<string | null>(null);

  // Las rutas de retorno dependen de la app: olula usa rutas propias
  // (singular), mientras que las apps con legacy (p.ej. cabrera) navegan a las
  // vistas legacy (plural). Se resuelven por factory con fallback a olula.
  const { app } = useContext(FactoryCtx);
  const urlPresupuesto =
    (app.Ventas?.presupuesto_url_presupuesto as UrlPorId | undefined) ??
    ((id: string) => `/ventas/presupuesto?id=${id}`);
  const urlPedido =
    (app.Ventas?.presupuesto_url_pedido as UrlPorId | undefined) ??
    ((id: string) => `/ventas/pedido?id=${id}`);

  const { ctx, emitir } = useMaquina(getMaquina, contextoVacio, async () => {});

  const { presupuesto, lineas, pedidoCreado, estado } = ctx;

  useEffect(() => {
    if (presupuestoId && presupuestoId !== presupuestoIdCargadoRef.current) {
      presupuestoIdCargadoRef.current = presupuestoId;
      void emitir("cargar", presupuestoId, true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [presupuestoId]);

  if (estado === "INICIAL" || estado === "VACIO" || estado === "CARGANDO") {
    return <div className="AprobarPresupuesto">Cargando...</div>;
  }

  return (
    <div className="AprobarPresupuesto">
      <div className="aprobar-bloque">
        <h2>
          {t("presupuesto.aprobarParcial.titulo", {
            cliente: presupuesto.cliente.nombre_cliente,
            codigo: presupuesto.codigo,
          })}
        </h2>
        <div className="botones maestro-botones">
          <QBoton
            onClick={() => emitir("todas_las_lineas_aprobadas")}
            deshabilitado={!hayPendiente(lineas)}
          >
            {t("presupuesto.aprobarParcial.aprobarTodo")}
          </QBoton>
          <QBoton
            onClick={() => emitir("aprobacion_solicitada")}
            deshabilitado={
              !puedeAprobar({ presupuesto, lineas }) || estado !== "LISTO"
            }
          >
            {t("presupuesto.aprobarParcial.generarPedido")}
          </QBoton>
        </div>

        <Lineas
          presupuestoId={presupuesto.id}
          lineas={lineas}
          estado={estado}
          publicar={emitir}
        />
      </div>

      {estado === "PEDIDO_CREADO" && pedidoCreado && (
        <QModal
          nombre="pedidoCreado"
          abierto={true}
          titulo={t("presupuesto.aprobar.pedidoGenerado")}
          onCerrar={() => emitir("pedido_creado_cerrado")}
        >
          <p>
            {t("presupuesto.aprobarParcial.pedidoGeneradoCodigo", { codigo: pedidoCreado.codigo })}
          </p>
          <div className="botones maestro-botones">
            <QBoton
              variante="texto"
              onClick={() =>
                presupuestoId && navigate(urlPresupuesto(presupuestoId))
              }
            >
              {t("presupuesto.aprobarParcial.volverAlPresupuesto")}
            </QBoton>
            <QBoton onClick={() => navigate(urlPedido(pedidoCreado.id))}>
              {t("presupuesto.aprobar.irAlPedido", { codigo: pedidoCreado.codigo })}
            </QBoton>
          </div>
        </QModal>
      )}
    </div>
  );
};

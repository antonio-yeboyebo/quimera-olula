import { BorrarPresupuesto } from "#/ventas/presupuesto/borrar/BorrarPresupuesto.tsx";
import { Presupuesto } from "#/ventas/presupuesto/diseño.ts";
import { getPresupuesto } from "#/ventas/presupuesto/infraestructura.ts";
import { TarjetaPresupuesto } from "#/ventas/presupuesto/vistas/TarjetaPresupuesto.tsx";
import { useMaquina } from "@olula/componentes/hook/useMaquina.js";
import { ListadoSemiControlado } from "@olula/componentes/maestro/ListadoSemiControlado.tsx";
import { QuimeraAcciones } from "@olula/componentes/moleculas/qacciones.tsx";
import { listaEntidadesInicial } from "@olula/lib/ListaEntidades.js";
import { criteriaDefecto } from "@olula/lib/dominio.js";
import { HookModelo } from "@olula/lib/useModelo.ts";
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { OportunidadVenta } from "../../diseño.ts";
import { crearPresupuestoOportunidad } from "../../infraestructura.ts";
import { getMaquina } from "./maquina.ts";
import { metaTablaPresupuesto } from "./presupuestos.ts";
import { useTCrm } from "../../../i18n/index.ts";

export const Presupuestos = ({
  oportunidad,
}: {
  oportunidad: HookModelo<OportunidadVenta>;
}) => {
  const t = useTCrm();
  const navigate = useNavigate();
  const [cargando, setCargando] = useState(false);

  const { ctx, emitir } = useMaquina(getMaquina, {
    estado: "INICIAL",
    presupuestos: listaEntidadesInicial<Presupuesto>(),
  });

  const { modelo } = oportunidad;

  const crearPresupuesto = async () => {
    const nuevoPresupuestoId = await crearPresupuestoOportunidad(
      modelo.id,
      modelo.cliente_id || ""
    );
    const nuevoPresupuesto = await getPresupuesto(nuevoPresupuestoId);
    await emitir("presupuesto_creado", nuevoPresupuesto);
  };

  const recargar = useCallback(async () => {
    setCargando(true);
    await emitir("recarga_de_presupuestos_solicitada", modelo.id);
    setCargando(false);
  }, [emitir, setCargando, modelo.id]);

  useEffect(() => {
    recargar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modelo.id]);

  return (
    <div className="TabPresupuestos">
      {ctx.estado === "BORRANDO" && ctx.presupuestos.activo && (
        <BorrarPresupuesto
          publicar={emitir}
          presupuesto={ctx.presupuestos.activo}
        />
      )}

      <ListadoSemiControlado
        metaTabla={metaTablaPresupuesto}
        tarjeta={TarjetaPresupuesto}
        modosDisponibles={["tarjetas"]}
        entidades={ctx.presupuestos.lista}
        totalEntidades={ctx.presupuestos.lista.length}
        cargando={cargando}
        renderAcciones={() => (
          <QuimeraAcciones
            acciones={[
              {
                texto: t("oportunidadventa.nuevo"),
                onClick: () => crearPresupuesto(),
              },
              {
                texto: t("oportunidadventa.editar"),
                onClick: () => {
                  if (ctx.presupuestos.activo?.id) {
                    navigate(
                      `/ventas/presupuesto?id=${ctx.presupuestos.activo.id}`
                    );
                  }
                },
                deshabilitado: !ctx.presupuestos.activo,
              },
              {
                texto: t("oportunidadventa.borrar"),
                onClick: () => emitir("borrado_presupuesto_solicitado"),
                deshabilitado: !ctx.presupuestos.activo,
              },
            ]}
          />
        )}
        seleccionada={ctx.presupuestos.activo ?? null}
        onSeleccion={(presupuesto) =>
          emitir("presupuesto_seleccionado", presupuesto)
        }
        criteriaInicial={criteriaDefecto}
        onCriteriaChanged={() => null}
      />
    </div>
  );
};

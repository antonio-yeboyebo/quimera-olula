import { BorrarOportunidadVenta } from "#/crm/oportunidadventa/borrar/BorrarOportunidadVenta.tsx";
import { nuevaOportunidadVentaVacia } from "#/crm/oportunidadventa/crear/crear.ts";
import { CrearOportunidadVenta } from "#/crm/oportunidadventa/crear/CrearOportunidadVenta.tsx";
import { DetalleOportunidadVenta } from "#/crm/oportunidadventa/detalle/DetalleOportunidadVenta.tsx";
import { OportunidadVenta } from "#/crm/oportunidadventa/diseño.ts";
import { metaTablaOportunidadVenta } from "#/crm/oportunidadventa/maestro/maestro.ts";
import { TarjetaOportunidadVenta } from "#/crm/oportunidadventa/maestro/TarjetaOportunidadVenta.tsx";
import { useMaquina } from "@olula/componentes/hook/useMaquina.js";
import { ListadoSemiControlado } from "@olula/componentes/maestro/ListadoSemiControlado.tsx";
import { QuimeraAcciones } from "@olula/componentes/moleculas/qacciones.tsx";
import { QModal } from "@olula/componentes/moleculas/qmodal.tsx";
import type { Criteria, Orden } from "@olula/lib/diseño.ts";
import { criteriaDefecto } from "@olula/lib/dominio.js";
import { listaEntidadesInicial } from "@olula/lib/ListaEntidades.js";
import { HookModelo } from "@olula/lib/useModelo.ts";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Contacto } from "../../diseño.ts";
import { getMaquina } from "./maquina.ts";
import { useTCrm } from "../../../i18n/index.ts";

export const Oportunidades = ({
  contacto,
}: {
  contacto: HookModelo<Contacto>;
}) => {
  const t = useTCrm();
  const [cargando, setCargando] = useState(false);
  const criteriaInicial = useMemo(
    () => ({
      ...criteriaDefecto,
      orden: ["probabilidad", "DESC"] as unknown as Orden,
    }),
    []
  );
  const [criteria, setCriteria] = useState<Criteria>(criteriaInicial);

  const { ctx, emitir } = useMaquina(getMaquina, {
    estado: "INICIAL",
    oportunidades: listaEntidadesInicial<OportunidadVenta>(),
  });

  const { modelo } = contacto;

  const recargar = useCallback(async () => {
    setCargando(true);
    await emitir("recarga_de_oportunidades_solicitada", {
      contactoId: modelo.id,
      criteria,
    });
    setCargando(false);
  }, [criteria, emitir, setCargando, modelo.id]);

  useEffect(() => {
    setCriteria(criteriaInicial);
  }, [criteriaInicial, modelo.id]);

  useEffect(() => {
    recargar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modelo.id, criteria]);

  const publicarDetalle = useCallback(
    async (evento: string, payload?: unknown) => {
      await emitir(evento, payload);
    },
    [emitir]
  );

  return (
    <div className="TabOportunidades">
      {ctx.estado === "CREANDO" && (
        <CrearOportunidadVenta
          publicar={emitir}
          ocultarOrigen
          modeloVacio={{
            ...nuevaOportunidadVentaVacia,
            contacto_id: modelo.id,
          }}
        />
      )}

      {ctx.estado === "BORRANDO" && ctx.oportunidades.activo && (
        <BorrarOportunidadVenta
          publicar={emitir}
          oportunidad={ctx.oportunidades.activo}
        />
      )}

      <ListadoSemiControlado
        metaTabla={metaTablaOportunidadVenta}
        tarjeta={TarjetaOportunidadVenta}
        modosDisponibles={["tarjetas"]}
        entidades={ctx.oportunidades.lista}
        totalEntidades={ctx.oportunidades.total}
        cargando={cargando}
        idReiniciarCriteria={modelo.id}
        renderAcciones={() => (
          <QuimeraAcciones
            acciones={[
              {
                texto: t("contacto.nueva"),
                onClick: () => emitir("creacion_de_oportunidad_solicitada"),
              },
              {
                texto: t("contacto.editar"),
                onClick: () => emitir("edicion_oportunidad_solicitada"),
                deshabilitado: !ctx.oportunidades.activo,
              },
              {
                texto: t("contacto.borrar"),
                onClick: () => emitir("borrado_oportunidad_solicitado"),
                deshabilitado: !ctx.oportunidades.activo,
              },
            ]}
          />
        )}
        seleccionada={ctx.oportunidades.activo ?? null}
        onSeleccion={(oportunidad) =>
          emitir("oportunidad_seleccionada", oportunidad)
        }
        criteriaInicial={criteriaInicial}
        onCriteriaChanged={(nuevoCriteria) => setCriteria(nuevoCriteria)}
      />

      <QModal
        nombre="editarOportunidad"
        abierto={
          ctx.estado === "EDITANDO" && Boolean(ctx.oportunidades.activo?.id)
        }
        titulo={t("contacto.editarOportunidad")}
        onCerrar={() => publicarDetalle("oportunidad_deseleccionada")}
        mostrarBotonCerrar={false}
        mostrarCabecera={false}
        anchoEstable
      >
        {ctx.oportunidades.activo?.id && (
          <DetalleOportunidadVenta
            id={ctx.oportunidades.activo.id}
            publicar={publicarDetalle}
          />
        )}
      </QModal>
    </div>
  );
};

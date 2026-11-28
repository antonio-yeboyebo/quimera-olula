import { Cliente } from "#/crm/comun/componentes/cliente_con_nombre.tsx";
import { LeadSelector } from "#/crm/comun/componentes/lead.tsx";
import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { QInput } from "@olula/componentes/atomos/qinput.tsx";
import { QModal } from "@olula/componentes/index.js";
import { ProcesarEvento } from "@olula/lib/useMaquina.js";
import { useForm } from "@olula/lib/useForm.js";
import { useModelo } from "@olula/lib/useModelo.ts";
import { useCallback } from "react";
import {
  getOportunidadVenta,
  postOportunidadVenta,
} from "../infraestructura.ts";
import "./CrearOportunidadVenta.css";
import {
  metaNuevaOportunidadVenta,
  nuevaOportunidadVentaVacia,
} from "./crear.ts";
import { NuevaOportunidadVenta } from "./diseño.ts";
import { useTCrm } from "../../i18n/index.ts";

export const CrearOportunidadVenta = ({
  publicar,
  modeloVacio = nuevaOportunidadVentaVacia,
  ocultarOrigen = false,
}: {
  publicar: ProcesarEvento;
  modeloVacio?: NuevaOportunidadVenta;
  ocultarOrigen?: boolean;
}) => {
  const t = useTCrm();
  const { modelo, uiProps, valido, set } = useModelo(
    metaNuevaOportunidadVenta,
    modeloVacio
  );

  const seleccionarCliente = useCallback(
    (opcion: { valor: string; descripcion: string } | null) => {
      set({
        ...modelo,
        cliente_id: opcion?.valor ?? "",
        nombre_cliente: opcion?.descripcion ?? "",
        tarjeta_id: opcion?.valor ? "" : modelo.tarjeta_id,
        nombre_tarjeta: opcion?.valor ? "" : modelo.nombre_tarjeta,
      });
    },
    [modelo, set]
  );

  const seleccionarTarjeta = useCallback(
    (opcion: { valor: string; descripcion: string } | null) => {
      set({
        ...modelo,
        tarjeta_id: opcion?.valor ?? "",
        nombre_tarjeta: opcion?.descripcion ?? "",
        cliente_id: opcion?.valor ? "" : modelo.cliente_id,
        nombre_cliente: opcion?.valor ? "" : modelo.nombre_cliente,
      });
    },
    [modelo, set]
  );

  const crear_ = useCallback(async () => {
    const id = await postOportunidadVenta(modelo);
    const oportunidad = await getOportunidadVenta(id);
    publicar("oportunidad_creada", oportunidad);
  }, [modelo, publicar]);

  const cancelar_ = useCallback(() => {
    publicar("creacion_oportunidad_cancelada");
  }, [publicar]);

  const [crear, cancelar] = useForm(crear_, cancelar_);

  return (
    <QModal
      abierto={true}
      nombre="mostrar"
      titulo={t("oportunidadventa.nuevaOportunidadDeVenta")}
      onCerrar={cancelar}
    >
      <div className="CrearOportunidadVenta">
        <quimera-formulario>
          <QInput label={t("oportunidadventa.descripcion")} {...uiProps("descripcion")} />
          {!ocultarOrigen && (
            <>
              {!modelo.tarjeta_id && (
                <Cliente
                  {...uiProps("cliente_id", "nombre_cliente")}
                  label={t("oportunidadventa.cliente")}
                  valor={modelo.cliente_id ?? ""}
                  descripcion={modelo.nombre_cliente ?? ""}
                  onChange={seleccionarCliente}
                  erroneo={false}
                  opcional
                />
              )}
              {!modelo.cliente_id && (
                <LeadSelector
                  {...uiProps("tarjeta_id")}
                  label={t("oportunidadventa.lead")}
                  valor={modelo.tarjeta_id ?? ""}
                  descripcion={modelo.nombre_tarjeta ?? ""}
                  onChange={seleccionarTarjeta}
                  erroneo={false}
                  opcional
                />
              )}
            </>
          )}
          {/* Pendiente: permitir nombre_cliente manual para clientes no registrados. */}
          <QInput label={t("oportunidadventa.total")} {...uiProps("importe")} />
        </quimera-formulario>

        <div className="botones">
          <QBoton onClick={crear} deshabilitado={!valido}>
            {t("oportunidadventa.guardar")}
          </QBoton>
          <QBoton onClick={cancelar} variante="texto">
            {t("oportunidadventa.cancelar")}
          </QBoton>
        </div>
      </div>
    </QModal>
  );
};

import { CamposDireccionVenta } from "#/ventas/comun/componentes/CamposDireccionVenta.tsx";
import { Cliente } from "#/ventas/comun/componentes/cliente.tsx";
import { DirCliente } from "#/ventas/comun/componentes/dirCliente.tsx";
import { ClienteVenta } from "#/ventas/venta/diseño.ts";
import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { QInput, QModal } from "@olula/componentes/index.js";
import { Modelo } from "@olula/lib/diseño.js";
import { HookModelo, useModelo } from "@olula/lib/useModelo.ts";
import { useMemo } from "react";
import "./CambioClienteVenta.css";
import { CambioCliente } from "./diseño.ts";
import { metaCambioCliente, metaCambioClienteNoRegistrado } from "./dominio.ts";
import { useTVentas } from "../../../../i18n/index.ts";

export interface VentaConCliente extends Modelo {
  id: string;
  cliente: ClienteVenta;
}

export interface CambioClienteProps<T extends VentaConCliente> {
  venta: HookModelo<T>;
  activo?: boolean;
  onGuardar: (cambios: CambioCliente) => Promise<void>;
  onCancelar?: () => void;
  titulo?: string;
  permitirClienteNoRegistrado?: boolean;
}

const esClienteRegistrado = (clienteId: string | null | undefined) =>
  !!clienteId && clienteId !== "None";

export const CambioClienteVenta = <T extends VentaConCliente>({
  venta,
  activo = true,
  onGuardar,
  onCancelar,
  titulo: tituloProp,
  permitirClienteNoRegistrado = true,
}: CambioClienteProps<T>) => {
  const t = useTVentas();
  const titulo = tituloProp ?? t("comun.cambiarCliente");
  const { cliente_id, nombre_cliente, direccion_id, id_fiscal, direccion } =
    venta.modelo.cliente;

  /*
   * Memoizado campo a campo: `venta.modelo.cliente` cambia de identidad en
   * cada refresco del documento y `useModelo` reinicia el formulario cuando el
   * modelo inicial cambia, así que un objeto nuevo por render borraría lo
   * tecleado al salir de cualquier campo.
   */
  const cambioInicial = useMemo(
    (): CambioCliente => ({
      cliente_id: cliente_id ?? "",
      nombre_cliente: nombre_cliente ?? "",
      direccion_id: direccion_id ?? "",
      id_fiscal: id_fiscal ?? "",
      tipo_via: direccion?.tipo_via ?? "",
      nombre_via: direccion?.nombre_via ?? "",
      numero: direccion?.numero ?? "",
      otros: direccion?.otros ?? "",
      cod_postal: direccion?.cod_postal ?? "",
      ciudad: direccion?.ciudad ?? "",
      provincia: direccion?.provincia ?? "",
      pais_id: direccion?.pais_id ?? "",
      apartado: direccion?.apartado ?? "",
      telefono: direccion?.telefono ?? "",
    }),
    [
      cliente_id,
      nombre_cliente,
      direccion_id,
      id_fiscal,
      direccion?.tipo_via,
      direccion?.nombre_via,
      direccion?.numero,
      direccion?.otros,
      direccion?.cod_postal,
      direccion?.ciudad,
      direccion?.provincia,
      direccion?.pais_id,
      direccion?.apartado,
      direccion?.telefono,
    ]
  );

  const clienteRegistrado = esClienteRegistrado(cliente_id);
  const clienteNoRegistrado = !clienteRegistrado && permitirClienteNoRegistrado;

  const { modelo, uiProps, valido } = useModelo(
    clienteRegistrado ? metaCambioCliente : metaCambioClienteNoRegistrado,
    cambioInicial
  );

  const cambiosClienteRegistrado = (): CambioCliente => ({
    cliente_id: modelo.cliente_id,
    direccion_id: modelo.direccion_id,
  });

  const cambiosClienteNoRegistrado = (): CambioCliente => ({
    nombre_cliente: modelo.nombre_cliente,
    id_fiscal: modelo.id_fiscal,
    tipo_via: modelo.tipo_via,
    nombre_via: modelo.nombre_via,
    numero: modelo.numero,
    otros: modelo.otros,
    cod_postal: modelo.cod_postal,
    ciudad: modelo.ciudad,
    provincia: modelo.provincia,
    pais_id: modelo.pais_id,
    apartado: modelo.apartado,
    telefono: modelo.telefono,
  });

  const guardar = async () => {
    await onGuardar(
      clienteRegistrado ? cambiosClienteRegistrado() : cambiosClienteNoRegistrado()
    );
  };

  return (
    <QModal
      abierto={activo}
      nombre="mostrar"
      titulo={titulo}
      onCerrar={onCancelar}
    >
      <div className="CambioCliente campos-direccion">
        <quimera-formulario>
          {clienteNoRegistrado ? (
            <>
              <QInput
                label={t("comun.campos.nombreCliente")}
                {...uiProps("nombre_cliente")}
              />
              <QInput label={t("comun.campos.idFiscalCliente")} {...uiProps("id_fiscal")} />
              <CamposDireccionVenta uiProps={uiProps} />
            </>
          ) : (
            <>
              <Cliente
                {...uiProps("cliente_id", "nombre_cliente")}
                nombre="cliente_id_cambio"
                avisarObservaciones
              />
              <DirCliente
                clienteId={modelo.cliente_id}
                {...uiProps("direccion_id")}
              />
            </>
          )}
        </quimera-formulario>

        <div className="botones maestro-botones">
          <QBoton onClick={guardar} deshabilitado={!valido}>
            {t("comun.guardar")}
          </QBoton>
        </div>
      </div>
    </QModal>
  );
};

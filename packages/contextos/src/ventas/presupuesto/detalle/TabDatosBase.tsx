import { Almacen } from "#/almacen/comun/componentes/Almacen.tsx";
import { BotonCambiar } from "#/ventas/comun/componentes/BotonCambiar.tsx";
import { TotalDivisaEmpresa } from "#/ventas/venta/vistas/TotalDivisaEmpresa.tsx";
import { QDate } from "@olula/componentes/atomos/qdate.tsx";
import { QInput } from "@olula/componentes/atomos/qinput.tsx";
import { HookModelo } from "@olula/lib/useModelo.ts";
import { Agente } from "../../comun/componentes/agente.tsx";
import { Divisa } from "#/comun/componentes/divisa.tsx";
import { FormaPago } from "#/comun/componentes/formapago.tsx";
import { GrupoIvaNegocio } from "#/comun/componentes/grupo_iva_negocio.tsx";
import {
  grupoIvaNegocioEnDocumento,
  puedeCambiarDivisa,
} from "../../venta/dominio.ts";
import { Presupuesto } from "../diseño.ts";
import { EstadoPresupuesto } from "./diseño.ts";
import "./TabDatos.css";
import { aprobado } from "../dominio.ts";
import { useTVentas } from "../../i18n/index.ts";

export interface TabDatosProps {
  presupuesto: HookModelo<Presupuesto>;
  estado?: EstadoPresupuesto;
  publicar?: (evento: string, payload?: unknown) => void;
}

export const TabDatosBase = ({
  presupuesto,
  estado,
  publicar = () => {},
}: TabDatosProps) => {
  const t = useTVentas();
  const { uiProps, modelo } = presupuesto;
  const mostrarBotonesCambio = estado === "ABIERTO" && !aprobado(modelo);

  return (
    <div className="TabDatos">
      <quimera-formulario>
        <QDate label={t("documento.detalle.fecha")} {...uiProps("fecha")} />
        <QDate
          label={t("presupuesto.detalle.fechaSalida")}
          {...uiProps("fecha_salida")}
        />
        <Almacen {...uiProps("almacen_id")} />
        <Divisa {...uiProps("divisa_id")} />
        <QInput
          label={t("documento.detalle.tasaConversion")}
          {...uiProps("tasa_conversion")}
        />
        {mostrarBotonesCambio && (
          <div className="TabDatos-accion TabDatos-accion--divisa">
            <BotonCambiar
              titulo={t("documento.detalle.cambiarDivisa")}
              onClick={() => publicar("cambio_divisa_solicitado")}
              deshabilitado={!puedeCambiarDivisa(modelo)}
            />
          </div>
        )}
        <Agente {...uiProps("agente_id", "nombre_agente")} />
        <QInput
          label={t("documento.detalle.porComision")}
          {...uiProps("por_comision")}
        />
        {mostrarBotonesCambio && (
          <div className="TabDatos-accion TabDatos-accion--agente">
            <BotonCambiar
              titulo={t("documento.detalle.cambiarAgente")}
              onClick={() => publicar("cambio_agente_solicitado")}
            />
          </div>
        )}
        <TotalDivisaEmpresa venta={modelo} />
        <FormaPago {...uiProps("forma_pago_id", "nombre_forma_pago")} />
        {grupoIvaNegocioEnDocumento() && (
          <GrupoIvaNegocio {...uiProps("grupo_iva_negocio_id")} />
        )}
        {/* Solo lectura: la serie se fija al crear el documento (ver metaVenta). */}
        <QInput label={t("documento.detalle.serie")} {...uiProps("serie_id")} />
      </quimera-formulario>
    </div>
  );
};

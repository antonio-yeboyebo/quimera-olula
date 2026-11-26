import { Almacen } from "#/almacen/comun/componentes/Almacen.tsx";
import { Divisa } from "#/comun/componentes/divisa.tsx";
import { BotonCambiar } from "#/ventas/comun/componentes/BotonCambiar.tsx";
import { FormaPago } from "#/comun/componentes/formapago.tsx";
import { GrupoIvaNegocio } from "#/comun/componentes/grupo_iva_negocio.tsx";
import { QInput } from "@olula/componentes/atomos/qinput.tsx";
import { EmitirEvento } from "@olula/lib/diseño.ts";
import { HookModelo } from "@olula/lib/useModelo.ts";
import { Pedido } from "../diseño.ts";
import { pedidoPendiente } from "../dominio.ts";
import "./TabDatos.css";
import { useTCompras } from "#/compras/i18n/index.ts";

export const TabDatos = ({
  form,
  publicar,
}: {
  form: HookModelo<Pedido>;
  publicar: EmitirEvento;
}) => {
  const t = useTCompras();
  const { uiProps, modelo } = form;
  const puedeCambiarDivisa = pedidoPendiente(modelo);

  return (
    <div className="TabDatos">
      <quimera-formulario>
        <Almacen
          {...uiProps("almacenId", "nombreAlmacen")}
          nombre="almacenId"
        />
        <Divisa {...uiProps("divisaId")} nombre="divisaId" />
        <QInput label={t("comun.campos.tasaConversion")} {...uiProps("tasaConversion")} />
        {puedeCambiarDivisa && (
          <div className="TabDatos-accion">
            <BotonCambiar
              titulo={t("comun.documento.cambiarDivisa")}
              onClick={() => publicar("cambio_divisa_solicitado")}
            />
          </div>
        )}
        <FormaPago
          {...uiProps("formaPagoId", "nombreFormaPago")}
          nombre="formaPagoId"
        />
        <GrupoIvaNegocio
          {...uiProps("grupoIvaNegocioId")}
          nombre="grupoIvaNegocioId"
        />
        {/* Solo lectura: la serie se fija al crear el documento (ver metaPedido). */}
        <QInput label={t("comun.campos.serie")} {...uiProps("serieId")} />
      </quimera-formulario>
    </div>
  );
};

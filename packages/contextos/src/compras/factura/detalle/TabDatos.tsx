import { Almacen } from "#/almacen/comun/componentes/Almacen.tsx";
import { Divisa } from "#/comun/componentes/divisa.tsx";
import { BotonCambiar } from "#/ventas/comun/componentes/BotonCambiar.tsx";
import { FormaPago } from "#/comun/componentes/formapago.tsx";
import { GrupoIvaNegocio } from "#/comun/componentes/grupo_iva_negocio.tsx";
import { QCheckbox } from "@olula/componentes/atomos/qcheckbox.tsx";
import { QInput } from "@olula/componentes/atomos/qinput.tsx";
import { EmitirEvento } from "@olula/lib/diseño.ts";
import { plugin } from "@olula/lib/dominio.ts";
import { HookModelo } from "@olula/lib/useModelo.ts";
import { Factura } from "../diseño.ts";
import { facturaEditable } from "../dominio.ts";
import { descripcionOrigenFactura } from "../dominio.ts";
import "./TabDatos.css";
import { useTCompras } from "#/compras/i18n/index.ts";

export const TabDatos = ({
    form,
    publicar,
}: {
    form: HookModelo<Factura>;
    publicar: EmitirEvento;
}) => {
    const t = useTCompras();
    const { uiProps, modelo } = form;
    const puedeCambiarDivisa = facturaEditable(modelo);

    return (
        <div className="TabDatos">
            <quimera-formulario>
                <QInput label={t("comun.campos.codigo")} {...uiProps("codigo")} />
                <QInput
                    label={t("factura.detalle.origen")}
                    {...uiProps("automatica")}
                    valor={descripcionOrigenFactura(modelo)}
                    deshabilitado={true}
                />
                <Almacen {...uiProps("almacenId", "nombreAlmacen")} nombre="almacenId" />
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
                {/* Solo lectura: la serie se fija al crear la factura (ver metaFactura). */}
                <QInput label={t("comun.campos.serie")} {...uiProps("serieId")} />
                <QInput label={t("comun.documento.rectificaA")} {...uiProps("codigoRectificativa")} />
                <QCheckbox label={t("factura.detalle.deAbono")} {...uiProps("deAbono")} />
                <QCheckbox label={t("factura.detalle.servicios")} {...uiProps("servicios")} />
                <QCheckbox label={t("factura.detalle.noGenerarAsiento")} {...uiProps("noGenerarAsiento")} />
                {/* Eneboo contauto_isp: solo con el plugin activo. */}
                {plugin("contauto_isp") === "activo" && (
                    <QCheckbox label={t("factura.detalle.isp")} {...uiProps("inversionSujetoPasivo")} />
                )}
            </quimera-formulario>
        </div>
    );
};

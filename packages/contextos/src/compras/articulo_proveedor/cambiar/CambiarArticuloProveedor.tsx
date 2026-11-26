import { Divisa } from "#/comun/componentes/divisa.tsx";
import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { QInput } from "@olula/componentes/atomos/qinput.tsx";
import { QModal } from "@olula/componentes/index.js";
import { EmitirEvento } from "@olula/lib/diseño.ts";
import { useForm } from "@olula/lib/useForm.ts";
import { useModelo } from "@olula/lib/useModelo.ts";
import { useCallback } from "react";
import { ArticuloProveedor } from "../diseño.ts";
import { metaArticuloProveedor } from "../dominio.ts";
import { patchArticuloProveedor } from "../infraestructura.ts";
import "./CambiarArticuloProveedor.css";
import { useTCompras } from "#/compras/i18n/index.ts";

export const CambiarArticuloProveedor = ({
  precio,
  publicar,
}: {
  precio: ArticuloProveedor;
  publicar: EmitirEvento;
}) => {
  const t = useTCompras();
  const { modelo, uiProps, valido } = useModelo(metaArticuloProveedor, precio);

  const cambiar_ = useCallback(async () => {
    await patchArticuloProveedor(precio.id, {
      coste: modelo.coste,
      divisaId: modelo.divisaId,
      dto: modelo.dto,
      refProveedor: modelo.refProveedor,
    });
    publicar("precio_cambiado", precio.id);
  }, [modelo, precio.id, publicar]);

  const cancelar_ = useCallback(
    () => publicar("cambio_de_precio_cancelado"),
    [publicar]
  );

  const [cambiar, cancelar] = useForm(cambiar_, cancelar_);

  return (
    <QModal
      abierto={true}
      nombre="cambiar_articulo_proveedor"
      titulo={t("articulo.precios.cambiarTitulo", { proveedor: precio.proveedor })}
      onCerrar={cancelar}
    >
      <div className="CambiarArticuloProveedor">
        <quimera-formulario>
          <QInput
            label={t("comun.campos.proveedor")}
            nombre="proveedor"
            valor={precio.proveedor}
            soloLectura
          />
          <Divisa {...uiProps("divisaId")} />
          <QInput label={t("proveedor.articulos.coste")} {...uiProps("coste")} />
          <QInput label={t("proveedor.articulos.dto")} {...uiProps("dto")} />
          <QInput label={t("proveedor.articulos.refProveedor")} {...uiProps("refProveedor")} />
        </quimera-formulario>
        <div className="botones maestro-botones">
          <QBoton onClick={cambiar} deshabilitado={!valido}>
            {t("comun.botones.guardar")}
          </QBoton>
        </div>
      </div>
    </QModal>
  );
};

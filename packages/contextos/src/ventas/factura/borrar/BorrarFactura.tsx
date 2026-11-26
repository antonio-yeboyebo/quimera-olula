import { QModalConfirmacion } from "@olula/componentes/moleculas/qmodalconfirmacion.tsx";
import { Factura } from "../diseño.ts";
import { borrarFactura } from "../infraestructura.ts";
import { useTVentas } from "../../i18n/index.ts";

export const BorrarFactura = ({
  publicar,
  factura,
}: {
  publicar: (evento: string, payload?: unknown) => void;
  factura: Factura;
}) => {
  const t = useTVentas();
  const borrar = async () => {
    if (factura.id) {
      await borrarFactura(factura.id);
    }
    publicar("borrado_de_factura_listo");
  };

  return (
    <QModalConfirmacion
      nombre="confirmarBorrarFactura"
      abierto={true}
      titulo={t("documento.detalle.confirmarBorrar")}
      mensaje={t("factura.borrar.mensaje")}
      onCerrar={() => publicar("borrar_cancelado")}
      onAceptar={borrar}
    />
  );
};

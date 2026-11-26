import { Proveedor } from "#/compras/comun/componentes/proveedor.tsx";
import { Divisa } from "#/comun/componentes/divisa.tsx";
import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { QInput } from "@olula/componentes/atomos/qinput.tsx";
import { QModal } from "@olula/componentes/index.js";
import { EmitirEvento } from "@olula/lib/diseño.ts";
import { useForm } from "@olula/lib/useForm.ts";
import { useModelo } from "@olula/lib/useModelo.ts";
import { useCallback, useMemo } from "react";
import { metaNuevoArticuloProveedor, nuevoArticuloProveedorVacio } from "../dominio.ts";
import { postArticuloProveedor } from "../infraestructura.ts";
import "./CrearArticuloProveedor.css";
import { useTCompras } from "#/compras/i18n/index.ts";

export const CrearArticuloProveedor = ({
  articuloId,
  publicar,
}: {
  articuloId: string;
  publicar: EmitirEvento;
}) => {
  const t = useTCompras();
  const inicial = useMemo(
    () => nuevoArticuloProveedorVacio(articuloId),
    [articuloId]
  );

  const { modelo, uiProps, valido } = useModelo(
    metaNuevoArticuloProveedor,
    inicial
  );

  const crear_ = useCallback(async () => {
    const id = await postArticuloProveedor(modelo);
    publicar("precio_creado", id);
  }, [modelo, publicar]);

  const cancelar_ = useCallback(
    () => publicar("alta_de_precio_cancelada"),
    [publicar]
  );

  const [crear, cancelar] = useForm(crear_, cancelar_);

  return (
    <QModal
      abierto={true}
      nombre="crear_articulo_proveedor"
      titulo={t("articulo.precios.nuevoTitulo")}
      onCerrar={cancelar}
    >
      <div className="CrearArticuloProveedor">
        <quimera-formulario>
          <Proveedor {...uiProps("proveedorId", "proveedor")} />
          <Divisa {...uiProps("divisaId")} />
          <QInput label={t("proveedor.articulos.coste")} {...uiProps("coste")} />
          <QInput label={t("proveedor.articulos.dto")} {...uiProps("dto")} />
          <QInput label={t("proveedor.articulos.refProveedor")} {...uiProps("refProveedor")} />
        </quimera-formulario>
      </div>
      <div className="botones maestro-botones">
        <QBoton onClick={crear} deshabilitado={!valido}>
          {t("comun.botones.crear")}
        </QBoton>
      </div>
    </QModal>
  );
};

import { PanelComprasArticulo } from "#/compras/articulo/detalle/PanelComprasArticulo.tsx";
import { TabFabricacionArticulo } from "#/produccion/articulo/detalle/TabFabricacionArticulo.tsx";
import { PanelVentasArticulo } from "#/ventas/articulo/detalle/PanelVentasArticulo.tsx";
import { Detalle } from "@olula/componentes/detalle/Detalle.tsx";
import { Tab, Tabs } from "@olula/componentes/detalle/tabs/Tabs.tsx";
import { useMaquina } from "@olula/componentes/hook/useMaquina.ts";
import { QuimeraAcciones } from "@olula/componentes/moleculas/qacciones.tsx";
import { EmitirEvento } from "@olula/lib/diseño.ts";
import { plugin, puede } from "@olula/lib/dominio.ts";
import { useModelo } from "@olula/lib/useModelo.ts";
import { useCallback, useEffect } from "react";
import { useNavigate, useParams } from "react-router";
import { urlListado } from "#/almacen/comun/fichas.ts";
import { BorrarArticulo } from "../borrar/BorrarArticulo.tsx";
import { BorrarCajaProveedor } from "../borrar_caja_proveedor/BorrarCajaProveedor.tsx";
import { CambiarCajaProveedor } from "../cambiar_caja_proveedor/CambiarCajaProveedor.tsx";
import { CrearCajaProveedor } from "../crear_caja_proveedor/CrearCajaProveedor.tsx";
import { Articulo } from "../diseño.ts";
import "./DetalleArticulo.css";
import {
  contextoArticuloInicial,
  guardarArticulo,
  metaArticulo,
} from "./dominio.ts";
import { getMaquina } from "./maquina.ts";
import { TabAlmacenaje } from "./TabAlmacenaje.tsx";
import { TabGeneral } from "./TabGeneral.tsx";
import { useTAlmacen } from "../../i18n/index.ts";

const titulo = (articulo: Articulo) => articulo.descripcion;

export const DetalleArticulo = ({
  id,
  publicar = async () => {},
}: {
  id?: string;
  publicar?: EmitirEvento;
}) => {
  const t = useTAlmacen();
  const params = useParams();
  const articuloId = id ?? params.id;

  const { ctx, emitir } = useMaquina(
    getMaquina,
    contextoArticuloInicial,
    publicar
  );

  const autoGuardar = useCallback(
    async (articulo: Articulo) => {
      await guardarArticulo(ctx, articulo);
      await emitir("articulo_guardado");
    },
    [ctx, emitir]
  );

  const form = useModelo(metaArticulo, ctx.articulo, autoGuardar);

  useEffect(() => {
    emitir("articulo_id_cambiado", articuloId, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [articuloId]);

  const navigate = useNavigate();
  const { estado, articulo, cajaProveedorActiva } = ctx;

  if (!articulo.id) return null;

  const acciones = [
    {
      texto: t("articulo.verStock"),
      onClick: () => navigate(urlListado.stockDeArticulo(articulo.id)),
    },
    {
      texto: articulo.seVende ? t("articulo.quitarDeVenta") : t("articulo.habilitarParaVenta"),
      onClick: () => emitir("venta_alternada_solicitada"),
    },
    {
      texto: articulo.seCompra ? t("articulo.quitarDeCompra") : t("articulo.habilitarParaCompra"),
      onClick: () => emitir("compra_alternada_solicitada"),
    },
    {
      icono: "eliminar",
      texto: t("articulo.borrar"),
      onClick: () => emitir("borrado_solicitado"),
      advertencia: true,
    },
  ];

  return (
    <Detalle
      id={articulo.id}
      obtenerTitulo={titulo}
      setEntidad={() => {}}
      entidad={articulo}
      cerrarDetalle={() => emitir("articulo_deseleccionado", null)}
    >
      <div className="DetalleArticulo">
        <div className="maestro-botones">
          <QuimeraAcciones acciones={acciones} vertical />
        </div>
        <Tabs
          children={[
            <Tab
              key="tab-general"
              label={t("articulo.general")}
              children={<TabGeneral form={form} articulo={articulo} publicar={emitir}/>}
            />,
            plugin("sga") === "activo" && (
              <Tab
                key="tab-almacenaje"
                label={t("articulo.almacenaje")}
                children={<TabAlmacenaje form={form} articuloId={articulo.id} />}
              />
            ),
            puede("ventas.articulo") && articulo.seVende && (
              <Tab
                key="tab-ventas"
                label={t("articulo.ventas")}
                children={<PanelVentasArticulo articuloId={articulo.id} />}
              />
            ),
            puede("compras.articulo") && articulo.seCompra && (
              <Tab
                key="tab-compras"
                label={t("articulo.compras")}
                children={<PanelComprasArticulo articuloId={articulo.id} />}
              />
            ),
            plugin("produccion") === "activo" && puede("produccion.articulo") && (
              <Tab
                key="tab-fabricacion"
                label={t("articulo.fabricacion")}
                children={<TabFabricacionArticulo articuloId={articulo.id} />}
              />
            ),
          ]}
        />
        {estado === "BORRANDO_ARTICULO" && (
          <BorrarArticulo
            articuloId={articulo.id}
            publicar={emitir}
            onCancelar={() => emitir("borrado_cancelado")}
          />
        )}
        {cajaProveedorActiva && estado === "CREANDO_CAJA_PROVEEDOR" && (
          <CrearCajaProveedor
            articuloId={articulo.id}
            proveedorId={cajaProveedorActiva.proveedorId}
            publicar={emitir}
          />
        )}
        {cajaProveedorActiva?.caja && estado === "CAMBIANDO_CAJA_PROVEEDOR" && (
          <CambiarCajaProveedor
            articuloId={articulo.id}
            proveedorId={cajaProveedorActiva.proveedorId}
            caja={cajaProveedorActiva.caja}
            publicar={emitir}
          />
        )}
        {cajaProveedorActiva?.caja && estado === "BORRANDO_CAJA_PROVEEDOR" && (
          <BorrarCajaProveedor
            articuloId={articulo.id}
            proveedorId={cajaProveedorActiva.proveedorId}
            caja={cajaProveedorActiva.caja}
            publicar={emitir}
          />
        )}
      </div>
    </Detalle>
  );
};

import { Detalle } from "@olula/componentes/detalle/Detalle.tsx";
import { Tab, Tabs } from "@olula/componentes/detalle/tabs/Tabs.tsx";
import { useMaquina } from "@olula/componentes/hook/useMaquina.ts";
import { QuimeraAcciones } from "@olula/componentes/moleculas/qacciones.tsx";
import { EmitirEvento } from "@olula/lib/diseño.ts";
import { useModelo } from "@olula/lib/useModelo.ts";
import { useCallback, useEffect } from "react";
import { useNavigate } from "react-router";
import { Articulo } from "../diseño.ts";
import {
  contextoDetalleArticuloInicial,
  guardarArticulo,
  metaArticulo,
} from "./detalle.ts";
import "./DetalleArticulo.css";
import { getMaquina } from "./maquina.ts";
import { TabCompras } from "./TabCompras.tsx";
import { TabGeneral } from "./TabGeneral.tsx";
import { useTCompras } from "#/compras/i18n/index.ts";

const titulo = (articulo: Articulo) => articulo.descripcion;

export const DetalleArticulo = ({
  id,
  publicar = async () => {},
}: {
  id?: string;
  publicar?: EmitirEvento;
}) => {
  const t = useTCompras();
  const { ctx, emitir } = useMaquina(
    getMaquina,
    contextoDetalleArticuloInicial,
    publicar
  );

  const navigate = useNavigate();

  const autoGuardar = useCallback(
    async (articulo: Articulo) => {
      await guardarArticulo(ctx, articulo);
      await emitir("articulo_guardado");
    },
    [ctx, emitir]
  );

  const form = useModelo(metaArticulo, ctx.articulo, autoGuardar);

  const { estado, articulo, precios } = ctx;

  useEffect(() => {
    emitir("articulo_id_cambiado", id, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (!articulo.id) return null;

  const acciones = [
    {
      texto: t("articulo.detalle.verEnAlmacen"),
      onClick: () => navigate(`/almacen/articulo?id=${articulo.id}`),
    },
  ];

  return (
    <Detalle
      id={id}
      obtenerTitulo={titulo}
      setEntidad={() => {}}
      entidad={articulo}
      cerrarDetalle={() => emitir("articulo_deseleccionado", null, true)}
    >
      <div className="DetalleArticulo">
        <div className="maestro-botones">
          <QuimeraAcciones acciones={acciones} vertical />
        </div>
        <Tabs
          children={[
            <Tab
              key="tab-general"
              label={t("articulo.detalle.general")}
              children={<TabGeneral form={form} articuloId={articulo.id} />}
            />,
            <Tab
              key="tab-compras"
              label={t("articulo.detalle.compras")}
              children={
                <TabCompras
                  form={form}
                  articulo={articulo}
                  precios={precios}
                  estado={estado}
                  publicar={emitir}
                />
              }
            />,
          ]}
        />
      </div>
    </Detalle>
  );
};

import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { QIcono } from "@olula/componentes/atomos/qicono.tsx";
import { MetaTabla } from "@olula/componentes/atomos/qtabla.tsx";
import { ListadoSemiControlado } from "@olula/componentes/maestro/ListadoSemiControlado.tsx";
import { QuimeraAcciones } from "@olula/componentes/moleculas/qacciones.tsx";
import { EmitirEvento } from "@olula/lib/diseño.ts";
import { criteriaDefecto } from "@olula/lib/dominio.ts";
import { ArticuloProveedor } from "../../../articulo_proveedor/diseño.ts";
import { tCompras, useTCompras } from "#/compras/i18n/index.ts";

const metaTablaPrecios = (t = tCompras): MetaTabla<ArticuloProveedor> => [
  {
    id: "por_defecto",
    cabecera: "",
    ancho: "2.5rem",
    render: (p) =>
      p.porDefecto ? (
        <QIcono
          nombre="estrella"
          tamaño="sm"
          color="var(--color-exito)"
          relleno="var(--color-exito)"
        />
      ) : (
        ""
      ),
  },
  { id: "proveedor", cabecera: t("comun.campos.proveedor") },
  {
    id: "coste",
    cabecera: t("proveedor.articulos.coste"),
    tipo: "moneda",
    divisa: (p) => p.divisaId,
  },
  { id: "dto", cabecera: t("proveedor.articulos.dto"), tipo: "numero" },
  {
    id: "ref_proveedor",
    cabecera: t("proveedor.articulos.refProveedor"),
    render: (p) => p.refProveedor,
  },
];

export const PreciosProveedorLista = ({
  precios,
  seleccionada,
  publicar,
}: {
  precios: ArticuloProveedor[];
  seleccionada: ArticuloProveedor | null;
  publicar: EmitirEvento;
}) => {
  const t = useTCompras();
  const acciones = [
    {
      texto: t("articulo.precios.marcarPorDefecto"),
      onClick: () => publicar("por_defecto_solicitado", seleccionada?.id),
      deshabilitado: !seleccionada || seleccionada.porDefecto,
    },
    {
      icono: "eliminar",
      texto: t("comun.botones.borrar"),
      advertencia: true,
      onClick: () => publicar("baja_precio_solicitada"),
      deshabilitado: !seleccionada,
    },
  ];

  return (
    <ListadoSemiControlado
      metaTabla={metaTablaPrecios(t)}
      entidades={precios}
      totalEntidades={precios.length}
      cargando={false}
      seleccionada={seleccionada}
      onSeleccion={(precio: ArticuloProveedor) =>
        publicar("precio_seleccionado", precio)
      }
      criteriaInicial={criteriaDefecto}
      onCriteriaChanged={() => null}
      modo="tabla"
      renderAcciones={() => (
        <div className="maestro-botones">
          <QBoton onClick={() => publicar("alta_precio_solicitada")}>
            {t("articulo.precios.nuevo")}
          </QBoton>
          <QBoton
            variante="borde"
            deshabilitado={!seleccionada}
            onClick={() => publicar("cambio_precio_solicitado")}
          >
            {t("comun.botones.editar")}
          </QBoton>
          <QuimeraAcciones acciones={acciones} vertical />
        </div>
      )}
    />
  );
};

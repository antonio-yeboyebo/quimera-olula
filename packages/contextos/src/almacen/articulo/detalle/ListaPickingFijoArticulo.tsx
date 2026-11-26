import { urlFicha, urlListado } from "#/almacen/comun/fichas.ts";
import { ValorConEnlace } from "@olula/componentes/atomos/qenlace_ficha.tsx";
import { criteriaDefecto } from "@olula/lib/dominio.js";
import { useEffect, useState } from "react";
import { PickingFijo } from "../../picking_fijo/diseño.ts";
import { getPickingsFijos } from "../../picking_fijo/infraestructura.ts";
import { useTAlmacen } from "../../i18n/index.ts";

/** Huecos de picking fijo de un artículo. */
export const ListaPickingFijoArticulo = ({ articuloId }: { articuloId: string }) => {
  const t = useTAlmacen();
  const [huecos, setHuecos] = useState<PickingFijo[]>([]);

  useEffect(() => {
    let vigente = true;
    getPickingsFijos({ ...criteriaDefecto, filtro: [["articulo_id", "=", articuloId]] })
      .then((r) => vigente && setHuecos(r.datos))
      .catch(() => vigente && setHuecos([]));
    return () => {
      vigente = false;
    };
  }, [articuloId]);

  if (huecos.length === 0) return null;

  return (
    <div className="ListaPickingFijoArticulo">
      <h4>
        <ValorConEnlace href={urlListado.pickingFijoDeArticulo(articuloId)} etiqueta={t("articulo.verElPickingFijoDeArticuloid", { articuloId })}>
          {t("articulo.pickingFijo")}
        </ValorConEnlace>
      </h4>
      <table>
        <thead>
          <tr>
            <th>{t("articulo.ubicacion")}</th>
            <th>{t("articulo.min")}</th>
            <th>{t("articulo.max")}</th>
            <th>{t("articulo.unidad")}</th>
            <th>{t("articulo.stock")}</th>
          </tr>
        </thead>
        <tbody>
          {huecos.map((h) => (
            <tr key={h.id}>
              <td>
                <ValorConEnlace href={urlFicha.ubicacion(h.ubicacionId)} etiqueta={t("articulo.abrirUbicacionUbicacion", { ubicacion: h.ubicacion })}>
                  {h.ubicacion}
                </ValorConEnlace>
              </td>
              <td>{h.minimo}</td>
              <td>{h.maximo}</td>
              <td>{h.unidadReposicion}</td>
              <td>
                <ValorConEnlace href={urlListado.stockDeArticulo(articuloId)} etiqueta={t("articulo.verElStockDeArticuloid", { articuloId })}>
                  {h.stock}
                </ValorConEnlace>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

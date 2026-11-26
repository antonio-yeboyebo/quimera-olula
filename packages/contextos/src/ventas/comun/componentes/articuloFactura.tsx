import { QSelect } from "@olula/componentes/atomos/qselect.tsx";
import { useEffect, useState } from "react";
import { LineaFactura } from "../../factura/diseño.ts";
import { getLineas } from "../../factura/infraestructura.ts";
import { articuloDeLineaVenta } from "./linea_venta_texto.ts";
import { useTVentas } from "../../i18n/index.ts";

/** Línea que sí lleva artículo: las de texto libre no son seleccionables. */
type LineaConArticulo = LineaFactura & { referencia: string };

export type OpcionArticuloFactura = {
  /** Id de la línea: cada línea de la factura es una opción, aunque repita artículo. */
  valor: string;
  /** Texto de la opción en el desplegable: lo genera renderOpcion. */
  descripcion: string;
  /** Descripción del artículo de la línea. */
  descripcionArticulo: string;
  /** Referencia del artículo, para quien guarde el artículo en vez de la línea. */
  referencia: string;
  cantidad: number;
  pvpUnitario: number;
  /** Total de la línea, con los descuentos ya aplicados. */
  pvpTotal: number;
  linea: LineaFactura;
};

interface ArticuloFacturaProps {
  /** Factura de cuyas líneas se sacan los artículos. Vacía = todavía no hay factura elegida. */
  facturaId: string;
  /** Divisa con la que se formatean importes; la línea no la lleva. */
  divisa?: string;
  /** Id de la línea o referencia del artículo, según lo que guarde el consumidor. */
  valor: string;
  nombre?: string;
  label?: string;
  deshabilitado?: boolean;
  opcional?: boolean;
  ref?: React.RefObject<HTMLInputElement | null>;
  renderOpcion?: (linea: LineaFactura) => string;
  onChange?: (opcion: OpcionArticuloFactura | null) => void;
}

export const ArticuloFactura = ({
  facturaId,
  divisa = "EUR",
  valor,
  nombre = "linea_factura_id",
  label: labelProp,
  deshabilitado = false,
  renderOpcion,
  onChange,
  ...props
}: ArticuloFacturaProps) => {
  const t = useTVentas();
  const label = labelProp ?? t("comun.campos.articuloFactura");
  const [lineas, setLineas] = useState<LineaConArticulo[]>([]);
  const hayFactura = !!facturaId && facturaId.trim() !== "";

  useEffect(() => {
    if (!hayFactura) {
      setLineas([]);
      return;
    }

    let cancelado = false;
    getLineas(facturaId)
      .then((todas) => {
        const conArticulo = todas.filter(
          (linea): linea is LineaConArticulo => !!linea.referencia
        );
        // Orden por referencia ASC; el de las líneas de la factura desempata, porque
        // Array.sort es estable y un mismo artículo puede estar en varias líneas.
        conArticulo.sort((una, otra) =>
          una.referencia.localeCompare(otra.referencia)
        );
        if (!cancelado) setLineas(conArticulo);
      })
      .catch((error) => console.error("Error cargando líneas de factura:", error));

    return () => {
      cancelado = true;
    };
  }, [facturaId, hayFactura]);

  const describir =
    renderOpcion ?? ((linea: LineaFactura) => articuloDeLineaVenta(linea, divisa));

  const opciones: OpcionArticuloFactura[] = lineas.map((linea) => ({
    valor: linea.id,
    descripcion: describir(linea),
    descripcionArticulo: linea.descripcion,
    referencia: linea.referencia,
    cantidad: linea.cantidad,
    pvpUnitario: linea.pvp_unitario,
    pvpTotal: linea.pvp_total,
    linea,
  }));

  // El valor puede ser el id de la línea o la referencia del artículo (la ficha de
  // incidencia, por ejemplo, guarda la referencia): se marca la línea que le corresponda.
  const seleccionada =
    opciones.find((opcion) => opcion.valor === valor) ??
    opciones.find((opcion) => opcion.referencia === valor);

  const handleChange = (opcion: { valor: string } | null) => {
    onChange?.(opciones.find((o) => o.valor === opcion?.valor) ?? null);
  };

  return (
    <QSelect
      label={label}
      nombre={nombre}
      valor={seleccionada?.valor ?? ""}
      opciones={opciones}
      onChange={handleChange}
      deshabilitado={deshabilitado || !hayFactura}
      placeholder={hayFactura ? undefined : "Selecciona antes la factura"}
      {...props}
    />
  );
};

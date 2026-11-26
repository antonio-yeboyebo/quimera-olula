import { MetaTabla } from "@olula/componentes/atomos/qtabla.tsx";
import { ListadoSemiControlado } from "@olula/componentes/maestro/ListadoSemiControlado.tsx";
import { criteriaDefecto } from "@olula/lib/dominio.js";
import { useEffect, useState } from "react";
import { ReciboFactura } from "../diseño.ts";
import { getRecibosFactura } from "../infraestructura.ts";
import { tCompras, useTCompras } from "#/compras/i18n/index.ts";

interface TabRecibosProps {
  facturaId: string;
}

export const TabRecibos = ({ facturaId }: TabRecibosProps) => {
  const t = useTCompras();
  const [recibos, setRecibos] = useState<ReciboFactura[]>([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    setCargando(true);
    getRecibosFactura(facturaId)
      .then(setRecibos)
      .finally(() => setCargando(false));
  }, [facturaId]);

  return (
    <ListadoSemiControlado
      metaTabla={metaTablaRecibos(t)}
      entidades={recibos}
      totalEntidades={recibos.length}
      cargando={cargando}
      seleccionada={null}
      onSeleccion={() => {}}
      criteriaInicial={criteriaDefecto}
      onCriteriaChanged={() => null}
      modo="tabla"
    />
  );
};

const metaTablaRecibos = (t = tCompras): MetaTabla<ReciboFactura> => [
  { id: "codigo", cabecera: t("comun.campos.codigo") },
  { id: "fecha_vencimiento", cabecera: t("factura.detalle.vencimiento"), tipo: "fecha" },
  { id: "importe", cabecera: t("comun.campos.importe"), tipo: "moneda" },
  { id: "estado", cabecera: t("comun.campos.estado") },
];

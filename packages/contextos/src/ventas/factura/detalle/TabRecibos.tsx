import { MetaTabla } from "@olula/componentes/atomos/qtabla.tsx";
import { ListadoSemiControlado } from "@olula/componentes/maestro/ListadoSemiControlado.tsx";
import { criteriaDefecto } from "@olula/lib/dominio.js";
import { useEffect, useState } from "react";
import { getRecibosFactura } from "../infraestructura.ts";
import { ReciboFactura } from "../diseño.ts";
import { tVentas } from "../../i18n/index.ts";

interface TabRecibosProps {
  facturaId: string;
}

export const TabRecibos = ({ facturaId }: TabRecibosProps) => {
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
      metaTabla={metaTablaRecibos()}
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

const metaTablaRecibos = (): MetaTabla<ReciboFactura> => [
  { id: "codigo", cabecera: tVentas("factura.recibos.codigo") },
  {
    id: "fecha_vencimiento",
    cabecera: tVentas("factura.recibos.vencimiento"),
    tipo: "fecha",
  },
  {
    id: "importe",
    cabecera: tVentas("factura.recibos.importe"),
    tipo: "moneda",
  },
  { id: "estado", cabecera: tVentas("factura.recibos.estado") },
];

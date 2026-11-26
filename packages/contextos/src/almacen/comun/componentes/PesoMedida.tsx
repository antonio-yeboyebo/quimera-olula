import { QSelect, QSelectProps } from "@olula/componentes/atomos/qselect.tsx";
import { criteriaDefecto } from "@olula/lib/dominio.ts";
import { useEffect, useState } from "react";
import { getPesosMedidas } from "../../peso_medida/infraestructura.ts";
import { tAlmacen } from "../../i18n/index.ts";

type PesoMedidaProps = Omit<QSelectProps, "opciones" | "label" | "nombre"> & {
  label?: string;
  nombre?: string;
};

type OpcionPesoMedida = {
  valor: string;
  descripcion: string;
};

const sinUnidad: OpcionPesoMedida = { valor: "", descripcion: "—" };

/** Selector de unidad de peso o medida (maestro pesosmedidas, plugin pesos_medidas). */
export const PesoMedida = ({
  valor,
  nombre = "unidad_id",
  label = tAlmacen("comun.unidad"),
  onChange,
  ...props
}: PesoMedidaProps) => {
  const [opciones, setOpciones] = useState<OpcionPesoMedida[]>([sinUnidad]);

  useEffect(() => {
    getPesosMedidas({ ...criteriaDefecto, orden: ["id"], paginacion: { limite: 1000, pagina: 1 } })
      .then(({ datos }) =>
        setOpciones([
          sinUnidad,
          ...datos.map((u) => ({ valor: u.id, descripcion: `${u.id} - ${u.descripcion}` })),
        ])
      );
  }, []);

  return (
    <QSelect
      label={label}
      nombre={nombre}
      valor={valor}
      onChange={onChange}
      opciones={opciones}
      {...props}
    />
  );
};

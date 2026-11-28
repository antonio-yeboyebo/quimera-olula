import { QSelect, QSelectProps } from "@olula/componentes/atomos/qselect.tsx";
import { Orden } from "@olula/lib/diseño.ts";
import { useEffect, useState } from "react";
import { getFamilias } from "../../familia/infraestructura.ts";
import { tAlmacen } from "../../i18n/index.ts";

type FamiliaProps = Omit<QSelectProps, "opciones" | "label" | "nombre"> & {
  label?: string;
  nombre?: string;
};

type OpcionFamilia = {
  valor: string;
  descripcion: string;
};

const sinFamilia: OpcionFamilia = { valor: "", descripcion: "—" };

export const Familia = ({
  valor,
  nombre = "familia_id",
  label = tAlmacen("comun.familia"),
  onChange,
  ...props
}: FamiliaProps) => {
  const [opciones, setOpciones] = useState<OpcionFamilia[]>([sinFamilia]);

  useEffect(() => {
    getFamilias([], ["descripcion"] as Orden, {
      limite: 1000,
      pagina: 1,
    }).then(({ datos }) =>
      setOpciones([
        sinFamilia,
        ...datos.map((f) => ({ valor: f.id, descripcion: f.descripcion })),
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

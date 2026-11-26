import { PLANTILLA_FICHA } from "#/almacen/comun/fichas.ts";
import { QSelect } from "@olula/componentes/index.js";
import { QAutocompletarProps } from "@olula/componentes/moleculas/qautocompletar.tsx";
import { Filtro, Orden } from "@olula/lib/diseño.ts";
import { useEffect, useState } from "react";
import { obtenerAlmacenes } from "../../almacen/infraestructura.ts";
import { tAlmacen } from "../../i18n/index.ts";

type AlmacenProps = Omit<QAutocompletarProps, "obtenerOpciones" | "label"> & { label?: string };

type OpcionAlmacen = {
  valor: string;
  descripcion: string;
};

export const Almacen = ({
  enlace = PLANTILLA_FICHA.almacen,
  valor,
  nombre = "codalmacen",
  label = tAlmacen("comun.almacen"),
  onChange,
  ...props
}: AlmacenProps) => {
  const [opciones, setOpciones] = useState<OpcionAlmacen[]>([]);

  useEffect(() => {
    obtenerAlmacenes(undefined as unknown as Filtro, undefined as unknown as Orden).then(
      (almacenes) =>
        setOpciones(almacenes.map((a) => ({ valor: a.id, descripcion: a.nombre })))
    );
  }, []);

  return (
    <QSelect
      label={label}
      nombre={nombre}
      enlace={enlace}
      valor={valor}
      onChange={onChange}
      opciones={opciones}
      {...props}
    />
  );
};

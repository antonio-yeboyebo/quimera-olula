import { QAutocompletar, QAutocompletarProps } from "@olula/componentes/moleculas/qautocompletar.tsx";
import { Criteria } from "@olula/lib/diseño.ts";
import { useCallback, useEffect, useState } from "react";
import { getTiposCaja } from "../../tipo_caja/infraestructura.ts";
import { tAlmacen } from "../../i18n/index.ts";

type TipoCajaProps = Omit<QAutocompletarProps, "obtenerOpciones" | "label"> & { label?: string };

type OpcionTipoCaja = {
  valor: string;
  descripcion: string;
};

export const TipoCaja = ({
  valor,
  nombre = "codtipocaja",
  label = tAlmacen("comun.tipoDeCaja"),
  onChange,
  ...props
}: TipoCajaProps) => {
  const [opciones, setOpciones] = useState<OpcionTipoCaja[]>([]);

  useEffect(() => {
    getTiposCaja({} as unknown as Criteria).then(({ datos }) =>
      setOpciones(datos.map((t) => ({ valor: t.id, descripcion: t.descripcion })))
    );
  }, []);

  const obtenerOpciones = useCallback(
    async (texto: string) => {
      const textoLower = texto.toLowerCase();
      return opciones.filter((o) =>
        o.descripcion.toLowerCase().includes(textoLower)
      );
    },
    [opciones]
  );

  return (
    <QAutocompletar
      label={label}
      nombre={nombre}
      valor={valor}
      onChange={onChange}
      obtenerOpciones={obtenerOpciones}
      longitudMinima={0}
      {...props}
    />
  );
};

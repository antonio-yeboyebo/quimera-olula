import { useTComun } from "#/comun/i18n/index.ts";
import { opcionesTipoIdFiscalTraducidas } from "#/valores/idfiscal.ts";
import { QSelect, QSelectProps } from "@olula/componentes/atomos/qselect.tsx";

type TipoIdFiscalProps = Omit<QSelectProps, "opciones" | "label" | "nombre"> & {
  valor: string;
  label?: string;
  nombre?: string;
  opciones?: { valor: string; descripcion: string }[];
};

export const TipoIdFiscal = ({
  valor,
  label,
  nombre = "tipo_id_fiscal",
  opciones,
  ...props
}: TipoIdFiscalProps) => {
  const t = useTComun();
  opciones = opciones ?? opcionesTipoIdFiscalTraducidas();
  const opcionesConValor =
    valor && !opciones.some((opcion) => opcion.valor === valor)
      ? [...opciones, { valor, descripcion: valor }]
      : opciones;

  return (
    <QSelect
      {...props}
      label={label ?? t("tipoIdFiscal.etiqueta")}
      nombre={nombre}
      valor={valor}
      opciones={opcionesConValor}
    />
  );
};

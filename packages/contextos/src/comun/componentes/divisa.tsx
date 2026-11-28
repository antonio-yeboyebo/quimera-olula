import { QSelect } from "@olula/componentes/atomos/qselect.tsx";
import { obtenerDatosSelector } from "@olula/lib/infraestructura.ts";
import { useEffect, useState } from "react";
import { useTComun } from "../i18n/index.ts";

interface DivisasProps {
  valor: string;
  nombre?: string;
  onChange: (opcion: { valor: string; descripcion: string } | null) => void;
  getProps?: (campo: string) => Record<string, unknown>;
}

type OpcionDivisa = {
  valor: string;
  descripcion: string;
  tasa_conversion?: number;
}

export const Divisa = ({
  valor,
  nombre = "divisa_id",
  onChange,
  ...props
}: DivisasProps) => {

  const t = useTComun();
  const [opcionesDivisa, setOpcionesDivisa] = useState<OpcionDivisa[]>([]);

  useEffect(() => {
    const cargarOpcionesDivisa = async () => {
      const datos = await obtenerDatosSelector("divisa")();
      const opcionesMapeadas = datos.map(
        ({ descripcion, tasa_conversion, ...resto }) => ({
          valor: String(Object.values(resto).at(0) ?? ""),
          descripcion: descripcion as string,
          ...(tasa_conversion === undefined || tasa_conversion === null
            ? {}
            : { tasa_conversion: Number(tasa_conversion) }),
        })
      );
      setOpcionesDivisa(opcionesMapeadas);
    };

    cargarOpcionesDivisa();
  }, []);

  return (
    <QSelect
      label={t("divisa")}
      nombre={nombre}
      valor={valor}
      onChange={onChange}
      opciones={opcionesDivisa}
      {...props}
    />
  );
};

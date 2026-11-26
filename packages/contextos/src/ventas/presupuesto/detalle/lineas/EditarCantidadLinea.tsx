import { QInput } from "@olula/componentes/atomos/qinput.tsx";
import { useEffect, useState } from "react";
import { LineaPresupuesto as Linea } from "../../diseño.ts";
import { tVentas, useTVentas } from "../../../i18n/index.ts";

const validacion = (cantidadRaw: string) => {
  const cantidad = parseInt(cantidadRaw);
  return isNaN(cantidad) || cantidad <= 0
    ? tVentas("documento.formLinea.cantidadMayorQueCero")
    : "";
};

export const EditarCantidadLinea = ({
  linea,
  onCantidadEditada,
}: {
  linea: Linea;
  onCantidadEditada: (linea: Linea, cantidad: number) => void;
}) => {
  const t = useTVentas();
  const [estado, setEstado] = useState("");
  const [valor, setValor] = useState(linea.cantidad.toString());

  useEffect(() => {
    setValor(linea.cantidad.toString());
  }, [linea.cantidad]);

  const handleChange = (v: string) => {
    const nuevoEstado = validacion(v);
    setEstado(nuevoEstado);
    setValor(v);
  };

  const submit = (valor: string) => {
    if (valor.toString() !== linea.cantidad.toString()) {
      onCantidadEditada(linea, parseInt(valor));
    }
  };

  return (
    <quimera-formulario>
      <QInput
        label={t("documento.formLinea.cantidad")}
        nombre="cantidad"
        valor={valor}
        erroneo={!!estado && estado.length > 0}
        textoValidacion={estado}
        condensado
        onChange={handleChange}
        autoSeleccion
        onBlur={() => submit(valor)}
      />
    </quimera-formulario>
  );
};

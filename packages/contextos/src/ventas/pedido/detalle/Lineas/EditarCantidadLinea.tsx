import { QInput } from "@olula/componentes/atomos/qinput.tsx";
import { useEffect, useState } from "react";
import { LineaPedido as Linea } from "../../diseño.ts";

const validacionPorDefecto = (cantidadRaw: string) => {
  const cantidad = parseInt(cantidadRaw);

  return isNaN(cantidad) || cantidad <= 0
    ? "Debe tener una cantidad mayor que cero."
    : "";
};

export const EditarCantidadLinea = ({
  linea,
  onCantidadEditada,
  validacion,
  deshabilitado = false,
}: {
  linea: Linea;
  onCantidadEditada: (linea: Linea, cantidad: number) => void;
  validacion?: (cantidadRaw: string) => string;
  deshabilitado?: boolean;
}) => {
  const [estado, setEstado] = useState("");
  const [valor, setValor] = useState(linea.cantidad.toString());
  useEffect(() => {
    setValor(linea.cantidad.toString());
  }, [linea.cantidad]);

  const handleChange = (v: string) => {
    const nuevoEstado = validacion ? validacion(v) : validacionPorDefecto(v);
    setEstado(nuevoEstado);
    if (nuevoEstado === "") {
      setValor(v);
    }
  };

  const submit = (valor: string) => {
    if (valor.toString() !== linea.cantidad.toString()) {
      onCantidadEditada(linea, parseInt(valor));
    }
  };

  return (
    <quimera-formulario>
      <QInput
        label="Cantidad"
        nombre="cantidad"
        valor={valor}
        erroneo={!!estado && estado.length > 0}
        textoValidacion={estado}
        condensado
        onChange={handleChange}
        autoSeleccion
        onBlur={submit}
        deshabilitado={deshabilitado}
      />
    </quimera-formulario>
  );
};

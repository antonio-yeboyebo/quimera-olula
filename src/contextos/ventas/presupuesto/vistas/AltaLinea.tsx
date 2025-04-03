import { useState } from "react";
import { QBoton } from "../../../../componentes/atomos/qboton.tsx";
import { QForm } from "../../../../componentes/atomos/qform.tsx";
import { QInput } from "../../../../componentes/atomos/qinput.tsx";
import { LineaPresupuestoNueva } from "../diseño.ts";
import { postLinea } from "../infraestructura.ts";

const validacion = (datos: Record<string, string>) => {
  const cantidad = parseInt(datos.cantidad);

  return {
    cantidad:
      isNaN(cantidad) || cantidad < 0
        ? "Debe tener una cantidad mayor que cero."
        : "",
  };
};

export const AltaLinea = ({
  presupuestoId,
  onLineaCreada,
  onCancelar,
}: {
  presupuestoId: string;
  onLineaCreada: (linea: LineaPresupuestoNueva, id: string) => void;
  onCancelar: () => void;
}) => {
  const [estado, setEstado] = useState({} as Record<string, string>);

  const onGuardar = async (datos: Record<string, string>) => {
    const nuevoEstado = validacion(datos);
    setEstado(nuevoEstado);

    if (Object.values(nuevoEstado).some((v) => v.length > 0)) return;

    const linea: LineaPresupuestoNueva = {
      referencia: datos.referencia,
      cantidad: parseInt(datos.cantidad),
    };

    postLinea(presupuestoId, linea).then((id) => onLineaCreada(linea, id));
  };

  return (
    <>
      <h2>Nueva línea</h2>
      <QForm onSubmit={onGuardar} onReset={onCancelar}>
        <section>
          <QInput label="Referencia" nombre="referencia" />
          <QInput
            label="Cantidad"
            nombre="cantidad"
            valor="1"
            erroneo={!!estado.cantidad && estado.cantidad.length > 0}
            textoValidacion={estado.cantidad}
          />
        </section>
        <section>
          <QBoton tipo="submit">Guardar</QBoton>
          <QBoton tipo="reset" variante="texto">
            Cancelar
          </QBoton>
        </section>
      </QForm>
    </>
  );
};

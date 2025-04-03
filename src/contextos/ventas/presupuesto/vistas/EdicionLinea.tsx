import { useState } from "react";
import { QBoton } from "../../../../componentes/atomos/qboton.tsx";
import { QForm } from "../../../../componentes/atomos/qform.tsx";
import { QInput } from "../../../../componentes/atomos/qinput.tsx";
import { LineaPresupuesto as Linea } from "../diseño.ts";
import { patchArticuloLinea } from "../infraestructura.ts";

export const EdicionLinea = ({
  presupuestoId,
  linea,
  onLineaActualizada,
  onCancelar,
}: {
  presupuestoId: string;
  linea: Linea;
  onLineaActualizada: (linea: Linea) => void;
  onCancelar: () => void;
}) => {
  const [estado, setEstado] = useState({} as Record<string, string>);

  const onGuardar = async (datos: Record<string, string>) => {
    const nuevoEstado = {
      referencia:
        datos.referencia.trim() === "" ? "La referencia es obligatoria." : "",
    };

    setEstado(nuevoEstado);

    if (Object.values(nuevoEstado).some((v) => v.length > 0)) return;

    await patchArticuloLinea(presupuestoId, linea.id, datos.referencia);
    const lineaActualizada = { ...linea, referencia: datos.referencia };
    onLineaActualizada(lineaActualizada);
  };

  return (
    <>
      <h2>Edición de línea</h2>
      <QForm onSubmit={onGuardar} onReset={onCancelar}>
        <section>
          <QInput
            label="Referencia"
            nombre="referencia"
            valor={linea.referencia}
            erroneo={!!estado.referencia && estado.referencia.length > 0}
            textoValidacion={estado.referencia}
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

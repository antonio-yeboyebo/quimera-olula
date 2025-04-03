import { useState } from "react";
import { QBoton } from "../../../../componentes/atomos/qboton.tsx";
import { QForm } from "../../../../componentes/atomos/qform.tsx";
import { QInput } from "../../../../componentes/atomos/qinput.tsx";
import { NuevoPresupuesto, Presupuesto } from "../diseño.ts";
import { validadoresPresupuesto } from "../dominio.ts";
import { getPresupuesto, postPresupuesto } from "../infraestructura.ts";

export const AltaPresupuesto = ({
  onPresupuestoCreado = () => {},
  onCancelar,
}: {
  onPresupuestoCreado?: (presupuesto: Presupuesto) => void;
  onCancelar: () => void;
}) => {
  const [estado, setEstado] = useState({} as Record<string, string>);

  const onGuardar = async (datos: Record<string, string>) => {
    const nuevoEstado = {
      cliente_id: validadoresPresupuesto.cliente_id(datos.cliente_id)
        ? ""
        : "El cliente es obligatorio.",
      direccion_id: validadoresPresupuesto.direccion_id(datos.direccion_id)
        ? ""
        : "La dirección es obligatoria.",
      empresa_id: validadoresPresupuesto.empresa_id(datos.empresa_id)
        ? ""
        : "La empresa es obligatoria.",
    };

    setEstado(nuevoEstado);

    if (Object.values(nuevoEstado).some((v) => v.length > 0)) return;

    const nuevoPresupuesto: NuevoPresupuesto = {
      cliente_id: datos.cliente_id,
      direccion_id: datos.direccion_id,
      empresa_id: datos.empresa_id,
    };

    const id = await postPresupuesto(nuevoPresupuesto);
    const presupuestoCreado = await getPresupuesto(id);
    onPresupuestoCreado(presupuestoCreado);
  };

  return (
    <>
      <h2>Nuevo Presupuesto</h2>
      <QForm onSubmit={onGuardar} onReset={onCancelar}>
        <section>
          <QInput
            label="Cliente"
            nombre="cliente_id"
            erroneo={!!estado.cliente_id && estado.cliente_id.length > 0}
            textoValidacion={estado.cliente_id}
          />
          <QInput
            label="Dirección"
            nombre="direccion_id"
            erroneo={!!estado.direccion_id && estado.direccion_id.length > 0}
            textoValidacion={estado.direccion_id}
          />
          <QInput
            label="Empresa"
            nombre="empresa_id"
            valor="1"
            erroneo={!!estado.empresa_id && estado.empresa_id.length > 0}
            textoValidacion={estado.empresa_id}
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

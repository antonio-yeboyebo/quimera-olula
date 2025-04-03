import { useState } from "react";
import { QBoton } from "../../../../componentes/atomos/qboton.tsx";
import { QForm } from "../../../../componentes/atomos/qform.tsx";
import { QInput } from "../../../../componentes/atomos/qinput.tsx";
import { Cliente, NuevoCliente } from "../diseño.ts";
import { validadoresCliente } from "../dominio.ts";
import { getCliente, postCliente } from "../infraestructura.ts";

export const AltaCliente = ({
  onClienteCreado = () => {},
  onCancelar,
}: {
  onClienteCreado?: (cliente: Cliente) => void;
  onCancelar: () => void;
}) => {
  const [estado, setEstado] = useState({} as Record<string, string>);

  const onGuardar = async (datos: Record<string, string>) => {
    // Validar los datos usando validadoresCliente
    const nuevoEstado = {
      nombre: validadoresCliente.nombre(datos.nombre)
        ? ""
        : "El nombre es obligatorio.",
      id_fiscal: validadoresCliente.id_fiscal(datos.id_fiscal)
        ? ""
        : "El ID fiscal es obligatorio.",
    };

    setEstado(nuevoEstado);

    // Si hay errores, no continuar
    if (Object.values(nuevoEstado).some((v) => v.length > 0)) return;

    // Crear el nuevo cliente
    const nuevoCliente: NuevoCliente = {
      nombre: datos.nombre,
      id_fiscal: datos.id_fiscal,
      empresa_id: datos.empresa_id,
      tipo_id_fiscal: datos.tipo_id_fiscal,
      agente_id: datos.agente_id,
    };

    const id = await postCliente(nuevoCliente);
    const clienteCreado = await getCliente(id);
    onClienteCreado(clienteCreado);
  };

  return (
    <>
      <h2>Nuevo Cliente</h2>
      <QForm onSubmit={onGuardar} onReset={onCancelar}>
        <section>
          <QInput
            label="Nombre"
            nombre="nombre"
            erroneo={!!estado.nombre && estado.nombre.length > 0}
            textoValidacion={estado.nombre}
          />
          <QInput
            label="ID Fiscal"
            nombre="id_fiscal"
            erroneo={!!estado.id_fiscal && estado.id_fiscal.length > 0}
            textoValidacion={estado.id_fiscal}
          />
          <QInput
            label="Empresa"
            nombre="empresa_id"
            valor="1"
            erroneo={!!estado.empresa_id && estado.empresa_id.length > 0}
            textoValidacion={estado.empresa_id}
          />
          <QInput
            label="Tipo ID Fiscal"
            nombre="tipo_id_fiscal"
            erroneo={
              !!estado.tipo_id_fiscal && estado.tipo_id_fiscal.length > 0
            }
            textoValidacion={estado.tipo_id_fiscal}
          />
          <QInput
            label="Agente"
            nombre="agente_id"
            erroneo={!!estado.agente_id && estado.agente_id.length > 0}
            textoValidacion={estado.agente_id}
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

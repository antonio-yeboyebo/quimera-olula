import { useState } from "react";
import { QBoton } from "../../../../componentes/atomos/qboton.tsx";
import { QForm } from "../../../../componentes/atomos/qform.tsx";
import { QInput } from "../../../../componentes/atomos/qinput.tsx";
import { DirCliente, NuevaDireccion } from "../diseño.ts";
import { validadoresDireccion } from "../dominio.ts";
import { getDireccion, postDireccion } from "../infraestructura.ts";

export const AltaDireccion = ({
  clienteId,
  onDireccionCreada = () => {},
  onCancelar,
}: {
  clienteId: string;
  onDireccionCreada?: (direccion: DirCliente) => void;
  onCancelar: () => void;
}) => {
  const [estado, setEstado] = useState({} as Record<string, string>);

  const onGuardar = async (datos: Record<string, string>) => {
    const nuevoEstado = {
      tipo_via: validadoresDireccion.tipo_via(datos.tipo_via)
        ? ""
        : "El tipo de vía es obligatorio.",
      nombre_via: validadoresDireccion.nombre_via(datos.nombre_via)
        ? ""
        : "El nombre de la vía es obligatorio.",
      ciudad: validadoresDireccion.ciudad(datos.ciudad)
        ? ""
        : "La ciudad es obligatoria.",
    };

    setEstado(nuevoEstado);

    if (Object.values(nuevoEstado).some((v) => v.length > 0)) return;

    const nuevaDireccion: NuevaDireccion = {
      tipo_via: datos.tipo_via,
      nombre_via: datos.nombre_via,
      ciudad: datos.ciudad,
    };

    const id = await postDireccion(clienteId, nuevaDireccion);
    const direccionCreada = await getDireccion(clienteId, id);
    onDireccionCreada(direccionCreada);
  };

  return (
    <>
      <h2>Nueva Dirección</h2>
      <QForm onSubmit={onGuardar} onReset={onCancelar}>
        <section>
          <QInput
            label="Tipo de Vía"
            nombre="tipo_via"
            erroneo={!!estado.tipo_via && estado.tipo_via.length > 0}
            textoValidacion={estado.tipo_via}
          />
          <QInput
            label="Nombre de la Vía"
            nombre="nombre_via"
            erroneo={!!estado.nombre_via && estado.nombre_via.length > 0}
            textoValidacion={estado.nombre_via}
          />
          <QInput
            label="Ciudad"
            nombre="ciudad"
            erroneo={!!estado.ciudad && estado.ciudad.length > 0}
            textoValidacion={estado.ciudad}
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

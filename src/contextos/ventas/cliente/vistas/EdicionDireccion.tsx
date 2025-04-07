import { useReducer } from "react";
import { QBoton } from "../../../../componentes/atomos/qboton.tsx";
import { QInput } from "../../../../componentes/atomos/qinput.tsx";
import { campoEntidadAInput, initEstadoEntidad, makeReductor, puedoGuardarEntidad } from "../../../comun/dominio.ts";
import { DirCliente } from "../diseño.ts";
import { metaDireccion } from "../dominio.ts";
import { actualizarDireccion } from "../infraestructura.ts";

export const EdicionDireccion = ({
  clienteId,
  direccion,
  onDireccionActualizada = () => {},
  onCancelar,
}: {
  clienteId: string;
  direccion: DirCliente;
  onDireccionActualizada?: (direccion: DirCliente) => void;
  onCancelar: () => void;
}) => {

  const [estado, dispatch] = useReducer(makeReductor(metaDireccion), initEstadoEntidad(direccion, metaDireccion));

  const setCampo = (campo: string) => (valor: string) => {
    dispatch({
      type: "set_campo",
      payload: {campo, valor, }
    });
  };

  const getProps = (campo: string) => {
    return campoEntidadAInput(estado, campo);
  };

  const guardar = async() => {
    await actualizarDireccion(clienteId, estado.valor);
    onDireccionActualizada(estado.valor);
  };

  return (
    <>
      <h2>Edición de dirección</h2>
        <section>
          <QInput
            label="Tipo de Vía"
            onChange={setCampo("tipo_via")}
            {...getProps("tipo_via")}
          />
          <QInput
            label="Nombre de la Vía"
            onChange={setCampo("nombre_via")}
            {...getProps("nombre_via")}
          />
          <QInput
            label="Ciudad"
            onChange={setCampo("ciudad")}
            {...getProps("ciudad")}
          />
        </section>
        <section>
          <QBoton deshabilitado={!puedoGuardarEntidad(estado)} onClick={guardar}>Guardar</QBoton>
        </section>
    </>
  );
};

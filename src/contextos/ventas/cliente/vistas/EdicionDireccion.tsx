import { useReducer } from "react";
import { QBoton } from "../../../../componentes/atomos/qboton.tsx";
import { QInput } from "../../../../componentes/atomos/qinput.tsx";
import { QSelect } from "../../../../componentes/atomos/qselect.tsx";
import { campoObjetoValorAInput, initEstadoObjetoValor, makeReductor, puedoGuardarObjetoValor } from "../../../comun/dominio.ts";
import { DirCliente } from "../diseño.ts";
import { metaDireccion } from "../dominio.ts";
import { actualizarDireccion } from "../infraestructura.ts";
import "./TabComercial.css";

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

  const [estado, dispatch] = useReducer(makeReductor(metaDireccion), initEstadoObjetoValor(direccion, metaDireccion));

  const setCampo = (campo: string) => (valor: string) => {
    dispatch({
      type: "set_campo",
      payload: {campo, valor, }
    });
  };

  const getProps = (campo: string) => {
    return campoObjetoValorAInput(estado, campo);
  };

  const guardar = async() => {
    await actualizarDireccion(clienteId, estado.valor);
    onDireccionActualizada(estado.valor);
  };

  const opciones = [
    { valor: "Calle", descripcion: "Calle" },
    { valor: "Avenida", descripcion: "Avenida" },
    { valor: "Plaza", descripcion: "Plaza" },
    { valor: "Paseo", descripcion: "Paseo" },
    { valor: "Camino", descripcion: "Camino" },
    { valor: "Carretera", descripcion: "Carretera" },
  ]

  return (
    <div style={{ maxWidth: '600px' }}>
      <h2>Edición de dirección</h2>
      <div className="container">
        <div style={{ gridColumn: 'span 2' }}>
          <QSelect
            label="Tipo de Vía"
            opciones={opciones}
            onChange={setCampo("tipo_via")}
            {...getProps("tipo_via")}
          />
        </div>
        <div style={{ gridColumn: 'span 10' }}>
          <QInput
            label="Nombre de la Vía"
            onChange={setCampo("nombre_via")}
            {...getProps("nombre_via")}
          />
          </div>
          <div style={{ gridColumn: 'span 12' }}>
          <QInput
            label="Ciudad"
            onChange={setCampo("ciudad")}
            {...getProps("ciudad")}
            />
            </div>
            <div style={{ gridColumn: 'span 12' }} className='botones'>
              <QBoton deshabilitado={!puedoGuardarObjetoValor(estado)} onClick={guardar}>Guardar</QBoton>
          </div>
      </div>
    </div>
  );
};

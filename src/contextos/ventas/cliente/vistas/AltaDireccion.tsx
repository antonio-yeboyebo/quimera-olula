import { useReducer } from "react";
import { QBoton } from "../../../../componentes/atomos/qboton.tsx";
import { QInput } from "../../../../componentes/atomos/qinput.tsx";
import { campoObjetoValorAInput, initEstadoObjetoValor, makeReductor, puedoGuardarObjetoValor } from "../../../comun/dominio.ts";
import { DirCliente } from "../diseño.ts";
import { metaNuevaDireccion, nuevaDireccionVacia } from "../dominio.ts";
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
  const [estado, dispatch] = useReducer(
    makeReductor(metaNuevaDireccion),
    initEstadoObjetoValor(nuevaDireccionVacia, metaNuevaDireccion)
  );
  
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
    const id = await postDireccion(clienteId, estado.valor);
    const direccionCreada = await getDireccion(clienteId, id);
    onDireccionCreada(direccionCreada);
  };
  // const [estado, setEstado] = useState({} as Record<string, string>);

  // const onGuardar = async (datos: Record<string, string>) => {
  //   const nuevoEstado = {
  //     tipo_via: validadoresDireccion.tipo_via(datos.tipo_via)
  //       ? ""
  //       : "El tipo de vía es obligatorio.",
  //     nombre_via: validadoresDireccion.nombre_via(datos.nombre_via)
  //       ? ""
  //       : "El nombre de la vía es obligatorio.",
  //     ciudad: validadoresDireccion.ciudad(datos.ciudad)
  //       ? ""
  //       : "La ciudad es obligatoria.",
  //   };

  //   setEstado(nuevoEstado);

  //   if (Object.values(nuevoEstado).some((v) => v.length > 0)) return;

  //   const nuevaDireccion: NuevaDireccion = {
  //     tipo_via: datos.tipo_via,
  //     nombre_via: datos.nombre_via,
  //     ciudad: datos.ciudad,
  //   };

  //   const id = await postDireccion(clienteId, nuevaDireccion);
  //   const direccionCreada = await getDireccion(clienteId, id);
  //   onDireccionCreada(direccionCreada);
  // };

  return (
    <>
      <h2>Nueva Dirección</h2>
      {/* <QForm onSubmit={onGuardar} onReset={onCancelar}> */}
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
          <QBoton onClick={guardar}
          deshabilitado={!puedoGuardarObjetoValor(estado)} 
          >Guardar</QBoton>
          {/* <QBoton tipo="reset" variante="texto">
            Cancelar
          </QBoton> */}
        </section>
      {/* </QForm> */}
    </>
  );
};

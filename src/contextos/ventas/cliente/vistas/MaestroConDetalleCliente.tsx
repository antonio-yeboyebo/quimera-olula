import { useState } from "react";
import { Listado } from "../../../../componentes/maestro/Listado.tsx";
import { Entidad } from "../../../../contextos/comun/diseño.ts";
import { actualizarEntidadEnLista } from "../../../comun/dominio.ts";
import { Cliente } from "../diseño.ts";
import { deleteCliente, getClientes } from "../infraestructura.ts";
import { AltaCliente } from "./AltaCliente.tsx";
import { DetalleCliente } from "./DetalleCliente.tsx";
import "./MaestroConDetalleCliente.css";

const metaTablaCliente = [
  { id: "id", cabecera: "Id" },
  { id: "nombre", cabecera: "Nombre" },
  {
    id: "id_fiscal",
    cabecera: "Id Fiscal",
    render: (entidad: Entidad) =>
      `${entidad.tipo_id_fiscal}: ${entidad.id_fiscal}`,
  },
];

export const MaestroConDetalleCliente = () => {
  const [entidades, setEntidades] = useState<Cliente[]>([]);
  const [seleccionada, setSeleccionada] = useState<Cliente | null>(null);
  const [mostrarModal, setMostrarModal] = useState(false); // Estado para controlar el modal

  const actualizarEntidad = (entidad: Cliente) => {
    setEntidades(actualizarEntidadEnLista<Cliente>(entidades, entidad));
  };

  const onCrearCliente = () => {
    setMostrarModal(true);
  };

  const onClienteCreado = (nuevoCliente: Cliente) => {
    setEntidades([...entidades, nuevoCliente]);
    setMostrarModal(false);
  };

  const onCancelar = () => {
    setMostrarModal(false);
  };

  const onBorrarCliente = async () => {
    if (!seleccionada) {
      return;
    }
    await deleteCliente(seleccionada.id);
    setEntidades(entidades.filter((e) => e.id !== seleccionada.id));
    setSeleccionada(null);
  };

  const clasesMaestro = "maestro" + (seleccionada ? " solo-una-vista" : "");
  const clasesDetalle = "detalle" + (seleccionada ? "" : " solo-una-vista");

  return (
    <section className="maestro-con-detalle">
      <section className={clasesMaestro}>
        <h2>Clientes</h2>
        <div className="maestro-botones">
          <button onClick={onCrearCliente}>Nuevo</button>
          <button disabled={!seleccionada} onClick={onBorrarCliente}>
            Borrar
          </button>
        </div>
        <Listado
          metaTabla={metaTablaCliente}
          entidades={entidades}
          setEntidades={setEntidades}
          seleccionada={seleccionada}
          setSeleccionada={setSeleccionada}
          cargar={getClientes}
        />
      </section>
      <section className={clasesDetalle}>
        <DetalleCliente
          clienteInicial={seleccionada}
          onEntidadActualizada={actualizarEntidad}
          cancelarSeleccionada={() => setSeleccionada(null)}
        />
      </section>

      {mostrarModal && (
        <div className="modal">
          <div className="modal-content">
            <span className="close" onClick={onCancelar}>
              &times;
            </span>
            <AltaCliente
              onClienteCreado={onClienteCreado}
              onCancelar={onCancelar}
            />
          </div>
        </div>
      )}
    </section>
  );
};

import { useState } from "react";
import { actualizarEntidadEnLista } from "../../../comun/dominio.ts";
import { DirCliente } from "../diseño.ts";
import { AltaDireccion } from "./AltaDireccion.tsx";
import { EdicionDireccion } from "./EdicionDireccion.tsx";
import { TabDireccionesLista } from "./TabDireccionesLista.tsx";

export const TabDirecciones = ({ clienteId }: { clienteId: string }) => {
  const [modo, setModo] = useState("lista");
  const [direcciones, setDirecciones] = useState<DirCliente[]>([]);
  const [seleccionada, setSeleccionada] = useState<DirCliente | null>(null);

  const actualizarDireccion = (direccion: DirCliente) => {
    setDirecciones(
      actualizarEntidadEnLista<DirCliente>(direcciones, direccion)
    );
    setSeleccionada(direccion);
    setModo("lista");
  };

  const añadirDireccion = (direccion: DirCliente) => {
    setDirecciones([direccion, ...direcciones]);
    setSeleccionada(direccion);
    setModo("lista");
  };

  return (
    <>
      <TabDireccionesLista
        clienteId={clienteId}
        onEditarDireccion={() => setModo("edicion")}
        onCrearDireccion={() => setModo("alta")}
        direcciones={direcciones}
        setDirecciones={setDirecciones}
        seleccionada={seleccionada}
        setSeleccionada={setSeleccionada}
      />
      {modo === "edicion" && seleccionada && (
        <div className="modal">
          <div className="modal-content">
            <span className="close" onClick={() => setModo("lista")}>
              &times;
            </span>
            <EdicionDireccion
              clienteId={clienteId}
              direccion={seleccionada}
              onDireccionActualizada={actualizarDireccion}
              onCancelar={() => setModo("lista")}
            />
          </div>
        </div>
      )}
      {modo === "alta" && (
        <div className="modal">
          <div className="modal-content">
            <span className="close" onClick={() => setModo("lista")}>
              &times;
            </span>
            <AltaDireccion
              clienteId={clienteId}
              onDireccionCreada={añadirDireccion}
              onCancelar={() => setModo("lista")}
            />
          </div>
        </div>
      )}
    </>
  );
};

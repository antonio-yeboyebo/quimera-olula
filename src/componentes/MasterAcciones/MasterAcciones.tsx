import { useContext } from "react";
import { Entidad, Acciones } from "../../contextos/comun/diseño.ts";
import { MasterContext } from "../Master";
import "./MasterAcciones.css";

type MasterProps<T extends Entidad> = {
  acciones: Acciones<T>;
};

export const MasterAcciones = <T extends Entidad>({
  acciones,
}: MasterProps<T>) => {
  const { crearUno, actualizarUno } = acciones;
  const context = useContext(MasterContext);
  if (!context) {
    throw new Error("MasterContext is null");
  }
  const { entidades, setEntidades } = context;

  const onCrearNuevo = () => {
    const nuevaEntidad = {
      id: (entidades.length + 1).toString().padStart(6, "0"),
      nombre: [
        "Michel Jordan",
        "Lebron James",
        "Kobe Bryant",
        "Stephen Curry",
        "Kevin Durant",
        "James Harden",
        "Anthony Davis",
        "Giannis Antetokounmpo",
        "Luka Doncic",
        "Damian Lillard",
      ][entidades.length % 10],
      id_fiscal: "53631867F",
    } as unknown as T;

    crearUno(nuevaEntidad).then(() => {
      setEntidades([nuevaEntidad, ...entidades]);
    });
  };

  const onActualizarPrimero = () => {
    const primeraEntidad = entidades[0];

    const nuevaEntidad = {
      id: primeraEntidad.id,
      nombre: primeraEntidad.nombre + " (actualizado)",
      nada: "",
    } as unknown as Partial<T>;

    actualizarUno(nuevaEntidad).then(() => {
      setEntidades([
        { ...primeraEntidad, nombre: nuevaEntidad.nombre },
        ...entidades.slice(1),
      ]);
    });
  };

  const onEliminarPrimero = () => {
    acciones.eliminarUno(entidades[0].id).then(() => {
      setEntidades(entidades.slice(1));
    });
  };

  return (
    <div className="MasterAcciones">
      <button onClick={onCrearNuevo}>Crear nuevo</button>
      <button onClick={onActualizarPrimero}>Actualizar primero</button>
      <button onClick={onEliminarPrimero}>Eliminar primero</button>
    </div>
  );
};

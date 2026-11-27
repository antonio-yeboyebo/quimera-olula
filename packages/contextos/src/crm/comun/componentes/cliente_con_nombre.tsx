import { Cliente as ClienteAuto } from "#/ventas/comun/componentes/cliente.tsx";
import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { QIcono } from "@olula/componentes/atomos/qicono.tsx";
import { QInput } from "@olula/componentes/atomos/qinput.tsx";
import { QAutocompletar } from "@olula/componentes/moleculas/qautocompletar.tsx";
import { Filtro, Orden, Paginacion } from "@olula/lib/diseño.ts";
import { useEffect, useState } from "react";
import { getClientes } from "../../../ventas/cliente/infraestructura.ts";
import { tCrm } from "../../i18n/index.ts";

interface ClienteProps {
  descripcion?: string;
  valor: string;
  nombre?: string;
  label?: string;
  deshabilitado?: boolean;
  enlace?: string;
  onChange?: (opcion: { valor: string; descripcion: string } | null) => void;
  [key: string]: unknown;
}

interface ClienteConNombreProps {
  descripcion?: string;
  valor: string;
  nombre?: string;
  label?: string;
  labelNombre?: string;
  onChange: (opcion: { valor: string; descripcion: string } | null) => void;
}

export const Cliente = ({
  descripcion = "",
  valor,
  nombre = "cliente_id",
  label = tCrm("comun.cliente"),
  deshabilitado = false,
  enlace = "/crm/cliente?id={id}",
  onChange,
  ...props
}: ClienteProps) => {
  const clienteRegistrado = !!valor && valor !== "None";

  const obtenerOpciones = async (texto: string) => {
    const criteria = {
      filtro: ["nombre", "~", texto],
      orden: ["id", "DESC"],
      paginacion: { pagina: 1, limite: 10 },
    };

    const { datos } = await getClientes(
      criteria.filtro as unknown as Filtro,
      criteria.orden as Orden,
      criteria.paginacion as Paginacion
    );

    if (!Array.isArray(datos)) {
      console.error("Los clientes no son un array:", datos);
      return [];
    }

    return datos.map((cliente) => ({
      valor: cliente.id,
      descripcion: cliente.nombre,
    }));
  };

  return (
    <QAutocompletar
      label={label}
      nombre={nombre}
      onChange={onChange}
      valor={valor}
      obtenerOpciones={obtenerOpciones}
      descripcion={descripcion}
      enlace={clienteRegistrado ? enlace : undefined}
      soloLectura={deshabilitado}
      {...props}
    />
  );
};

export const ClienteConNombre = ({
  descripcion = "",
  valor,
  nombre = "cliente_id",
  label = tCrm("comun.cliente"),
  labelNombre = tCrm("comun.nombreDelCliente"),
  onChange,
  ...props
}: ClienteConNombreProps) => {
  const [mostrarNombre, setMostrarNombre] = useState(false);
  const [nombreCliente, setNombreCliente] = useState(descripcion);

  useEffect(() => {
    setNombreCliente(descripcion ?? "");
  }, [descripcion, valor]);

  const handleClienteChange = (
    opcion: { valor: string; descripcion: string } | null
  ) => {
    setNombreCliente(opcion?.descripcion ?? "");
    onChange(opcion);
  };

  const handleNombreChange = (nuevoNombre: string) => {
    setNombreCliente(nuevoNombre);
    onChange({ valor, descripcion: nuevoNombre });
  };

  return (
    <>
      <ClienteAuto
        descripcion={nombreCliente}
        valor={valor}
        nombre={nombre}
        label={label}
        onChange={handleClienteChange}
        {...props}
      />

      {mostrarNombre && (
        <QInput
          label={labelNombre}
          valor={nombreCliente}
          onChange={handleNombreChange}
          nombre="nombre_cliente"
        />
      )}
      <QBoton
        variante="texto"
        tamaño="pequeño"
        onClick={() => setMostrarNombre((v) => !v)}
      >
        <QIcono nombre={mostrarNombre ? "candado_abierto" : "candado"} />
      </QBoton>
    </>
  );
};

import { QAutocompletar } from "@olula/componentes/moleculas/qautocompletar.tsx";
import { Filtro } from "@olula/lib/diseño.ts";
import { getClientes } from "../../cliente/infraestructura.ts";
import { AvisoObservacionesCliente } from "./aviso_observaciones_cliente/AvisoObservacionesCliente.tsx";
import { useAvisoObservacionesCliente } from "./aviso_observaciones_cliente/useAvisoObservacionesCliente.ts";
import { useTVentas } from "../../i18n/index.ts";

interface ClienteProps {
  descripcion?: string;
  valor: string;
  nombre?: string;
  label?: string;
  deshabilitado?: boolean;
  soloLectura?: boolean;
  opcional?: boolean;
  enlace?: string;
  ref?: React.RefObject<HTMLInputElement | null>;
  /**
   * Al elegir el cliente avisa de sus observaciones si la configuración de
   * ventas lo pide («Mostrar observaciones del cliente»). Para documentos de venta.
   */
  avisarObservaciones?: boolean;
  onChange?: (
    opcion: { valor: string; descripcion: string } | null,
    evento?: React.ChangeEvent<HTMLElement>
  ) => void;
}

export const Cliente = ({
  descripcion = "",
  valor,
  nombre = "cliente_id",
  label: labelProp,
  deshabilitado = false,
  enlace = "/ventas/cliente?id={id}",
  avisarObservaciones = false,
  onChange,
  ...props
}: ClienteProps) => {
  const t = useTVentas();
  const label = labelProp ?? t("comun.campos.cliente");
  const clienteRegistrado = !!valor && valor !== "None";
  const { aviso, avisar, cerrar } = useAvisoObservacionesCliente();

  const cambiarCliente: ClienteProps["onChange"] = (opcion, evento) => {
    if (avisarObservaciones) void avisar(opcion?.valor);
    onChange?.(opcion, evento);
  };

  const obtenerOpciones = async (texto: string, id?: string) => {
    const criteria = {
      filtro: id ? [["id", "=", id]] : ["nombre", "~", texto],
      orden: ["id"],
    };

    const { datos } = await getClientes(
      criteria.filtro as unknown as Filtro,
      criteria.orden,
      { pagina: 1, limite: 10 }
    );

    if (!Array.isArray(datos)) {
      return [];
    }

    return datos.map((cliente) => ({
      valor: cliente.id,
      descripcion: cliente.nombre,
    }));
  };

  return (
    <>
      <QAutocompletar
        label={label}
        nombre={nombre}
        onChange={cambiarCliente}
        valor={valor}
        obtenerOpciones={obtenerOpciones}
        enlace={clienteRegistrado ? enlace : undefined}
        descripcion={descripcion}
        soloLectura={deshabilitado}
        {...props}
      />
      {avisarObservaciones && aviso && (
        <AvisoObservacionesCliente aviso={aviso} onCerrar={cerrar} />
      )}
    </>
  );
};

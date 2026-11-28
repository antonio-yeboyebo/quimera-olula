import { QAutocompletar } from "@olula/componentes/moleculas/qautocompletar.tsx";
import { Criteria } from "@olula/lib/diseño.ts";
import { getCuentasBancarias } from "#/tesoreria/cuentas_bancarias/infraestructura.ts";
import { tTesoreria } from "../../i18n/index.ts";

interface CuentaBancariaProps {
  descripcion?: string;
  valor: string;
  nombre?: string;
  label?: string;
  deshabilitado?: boolean;
  soloLectura?: boolean;
  enlace?: string;
  ref?: React.RefObject<HTMLInputElement | null>;
  onChange?: (opcion: { valor: string; descripcion: string } | null) => void;
}

export const CuentaBancaria = ({
  descripcion = "",
  valor,
  nombre = "cuenta_bancaria_id",
  label = tTesoreria("comun.cuentaBancaria"),
  deshabilitado = false,
  enlace = "/tesoreria/cuentas_bancarias?id={id}",
  onChange,
  ...props
}: CuentaBancariaProps) => {
  const obtenerOpciones = async (texto: string) => {
    const criteria: Criteria = {
      filtro: { or: [["descripcion", "~", texto], ["id", "~", texto]] },
      orden: ["id"],
      paginacion: { pagina: 1, limite: 10 },
    };

    const { datos } = await getCuentasBancarias(criteria);

    return datos.map((cuenta) => ({
      valor: cuenta.id,
      descripcion: cuenta.descripcion || cuenta.iban || cuenta.id,
    }));
  };

  return (
    <QAutocompletar
      label={label}
      nombre={nombre}
      onChange={onChange}
      valor={valor}
      obtenerOpciones={obtenerOpciones}
      enlace={valor ? enlace : undefined}
      descripcion={descripcion}
      deshabilitado={deshabilitado}
      longitudMinima={0}
      {...props}
    />
  );
};

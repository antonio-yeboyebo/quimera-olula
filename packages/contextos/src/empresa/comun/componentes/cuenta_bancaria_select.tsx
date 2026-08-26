import { QSelect } from "@olula/componentes/atomos/qselect.tsx";
import { Criteria } from "@olula/lib/diseño.ts";
import { useEffect, useState } from "react";
import { getCuentasBancarias } from "../../cuentas_bancarias/infraestructura.ts";

interface CuentaBancariaSelectProps {
  valor?: string;
  nombre?: string;
  label?: string;
  deshabilitado?: boolean;
  onChange: (opcion: { valor: string; descripcion: string } | null) => void;
}

export const CuentaBancariaSelect = ({
  valor,
  nombre = "cuenta_pago_id",
  label = "Cuenta bancaria",
  deshabilitado = false,
  onChange,
  ...props
}: CuentaBancariaSelectProps) => {
  const [opciones, setOpciones] = useState<
    { valor: string; descripcion: string }[]
  >([]);

  useEffect(() => {
    const fetchCuentas = async () => {
      const criteria: Criteria = {
        filtro: [],
        orden: ["id"],
        paginacion: { pagina: 1, limite: 100 },
      };

      const { datos } = await getCuentasBancarias(criteria);
      setOpciones(
        datos.map((cuenta) => ({
          valor: cuenta.id,
          descripcion: cuenta.descripcion || cuenta.iban || cuenta.id,
        }))
      );
    };

    fetchCuentas();
  }, []);

  return (
    <QSelect
      {...props}
      label={label}
      nombre={nombre}
      valor={valor}
      deshabilitado={deshabilitado}
      opciones={opciones}
      onChange={onChange}
    />
  );
};

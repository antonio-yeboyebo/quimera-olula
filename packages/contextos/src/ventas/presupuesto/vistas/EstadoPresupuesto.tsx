import { QIcono } from "@olula/componentes/atomos/qicono.tsx";
import "./EstadoPresupuesto.css";
import { useTVentas } from "../../i18n/index.ts";

const PENDIENTE: {
  clave: "presupuesto.estado.pendiente" | "presupuesto.estado.aprobado";
  color: string;
} = {
  clave: "presupuesto.estado.pendiente",
  color: "var(--color-exito-oscuro)",
};

const APROBADO: typeof PENDIENTE = {
  clave: "presupuesto.estado.aprobado",
  color: "var(--color-deshabilitado-oscuro)",
};

export const EstadoPresupuesto = ({ aprobado }: { aprobado: boolean }) => {
  const t = useTVentas();
  const { clave, color } = aprobado ? APROBADO : PENDIENTE;
  const descripcion = t(clave);

  return (
    <span className="estado-presupuesto" title={descripcion}>
      <QIcono nombre="circulo_relleno" tamaño="sm" color={color} />
    </span>
  );
};

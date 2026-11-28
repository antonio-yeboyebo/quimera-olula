import { QIcono } from "@olula/componentes/atomos/qicono.tsx";
import "./EstadoAlbaran.css";
import { useTVentas } from "../../i18n/index.ts";

const PENDIENTE: {
  clave: "albaran.estado.pendiente" | "albaran.estado.facturado";
  color: string;
} = {
  clave: "albaran.estado.pendiente",
  color: "var(--color-exito-oscuro)",
};

const FACTURADO: typeof PENDIENTE = {
  clave: "albaran.estado.facturado",
  color: "var(--color-deshabilitado-oscuro)",
};

export const EstadoAlbaran = ({ facturado }: { facturado: boolean }) => {
  const t = useTVentas();
  const { clave, color } = facturado ? FACTURADO : PENDIENTE;
  const descripcion = t(clave);

  return (
    <span className="estado-albaran" title={descripcion}>
      <QIcono nombre="circulo_relleno" tamaño="sm" color={color} />
    </span>
  );
};

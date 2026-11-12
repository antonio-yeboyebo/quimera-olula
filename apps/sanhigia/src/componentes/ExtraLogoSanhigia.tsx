import { puede } from "@olula/lib/dominio.ts";
import { Link } from "react-router";
import "./ExtraLogoSanhigia.css";

/**
 * Logo adicional para la cabecera de Sanhigia
 * Muestra el logo de SmartSales junto al principal
 * Solo visible para usuarios con acceso a "crm.trato"
 */
export const ExtraLogoSanhigia = () => {
  if (!puede("crm.trato")) return null;

  return (
    <Link to="/ss/dashboard" className="extra-logo-sanhigia">
      SmartSales
    </Link>
  );
};

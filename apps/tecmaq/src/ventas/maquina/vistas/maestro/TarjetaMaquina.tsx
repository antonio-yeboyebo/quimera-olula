import { Entidad } from "@olula/lib/diseño.ts";
import { ItemMaquina } from "../../diseño.ts";
import "./TarjetaMaquina.css";

export const TarjetaMaquina = (entidad: Entidad) => {
    const maquina = entidad as ItemMaquina;
    return (
        <div className="TarjetaMaquina">
            <div className="TarjetaMaquina-cabecera">
                <span className="TarjetaMaquina-referencia">{maquina.referencia}</span>
                <span className="TarjetaMaquina-descripcion">{maquina.descripcion}</span>
            </div>
            <div className="TarjetaMaquina-pie">
                <span>{maquina.cliente}</span>
                <span>{maquina.codigoPedido} / {maquina.fecha}</span>
            </div>
        </div>
    );
};

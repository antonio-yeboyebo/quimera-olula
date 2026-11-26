import { QAvatar, QEtiqueta, QTarjetaGenerica } from "@olula/componentes/index.js";
import { tVentas } from "../../i18n/index.ts";
import { Cliente } from "../diseño.ts";

/** Se pinta desde el maestro, que se repinta al cambiar de idioma. */
export const TarjetaCliente = (cliente: Cliente) => (
  <QTarjetaGenerica
    avatar={<QAvatar nombre={cliente.nombre} />}
    arribaIzquierda={cliente.nombre}
    arribaDerecha={
      cliente.de_baja ? (
        <QEtiqueta variante="advertencia">{tVentas("cliente.maestro.deBaja")}</QEtiqueta>
      ) : undefined
    }
    abajoIzquierda={cliente.email}
    abajoDerecha={cliente.telefono1}
  />
);

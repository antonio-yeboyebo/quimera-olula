import { QModal } from "@olula/componentes/moleculas/qmodal.tsx";
import { EmitirEvento } from "@olula/lib/diseño.ts";
import { Link } from "react-router";
import { tAlmacen } from "../../../i18n/index.ts";

export const EntradaCreada = ({
    publicar,
    idOrden,
}: {
    publicar: EmitirEvento;
    idOrden: string;
}) => {
    const cerrar = () => publicar("cerrar_confirmacion");

    return (
        <QModal
            nombre="entradaCreada"
            abierto={true}
            titulo={tAlmacen("pedido_compra.entradaCreada")}
            onCerrar={cerrar}
        >
            <div className="mensaje">
                {tAlmacen("pedido_compra.laEntradaSeHaCreadoCorrectamente")}
            </div>
            <Link to={`/almacen/ordenes?id=${idOrden}`}>
                {tAlmacen("pedido_compra.verOrdenDeEntradaIdorden", { idOrden })}
            </Link>

        </QModal>
    );
};

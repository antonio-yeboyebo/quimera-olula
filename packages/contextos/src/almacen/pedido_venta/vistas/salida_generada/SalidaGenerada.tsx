import { QModal } from "@olula/componentes/moleculas/qmodal.tsx";
import { EmitirEvento } from "@olula/lib/diseño.ts";
import { Link } from "react-router";
import { tAlmacen } from "../../../i18n/index.ts";

export const SalidaGenerada = ({
    publicar,
    idOrden,
}: {
    publicar: EmitirEvento;
    idOrden: string;
}) => {
    const cerrar = () => publicar("cerrar_confirmacion");

    return (
        <QModal
            nombre="salidaGenerada"
            abierto={true}
            titulo={tAlmacen("pedido_venta.salidaGenerada")}
            onCerrar={cerrar}
        >
            <div className="mensaje">
                {tAlmacen("pedido_venta.laSalidaSeHaGeneradoCorrectamente")}
            </div>
            <Link to={`/almacen/ordenes?id=${idOrden}`}>
                {tAlmacen("pedido_venta.verOrdenDeSalidaIdorden", { idOrden })}
            </Link>
        </QModal>
    );
};

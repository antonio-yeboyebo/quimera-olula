import { QModal } from "@olula/componentes/moleculas/qmodal.tsx";
import { EmitirEvento } from "@olula/lib/diseño.ts";
import { Link } from "react-router";

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
            titulo="Entrada creada"
            onCerrar={cerrar}
        >
            <div className="mensaje">
                La entrada se ha creado correctamente.
            </div>
            <Link to={`/almacen/ordenes?id=${idOrden}`}>
                Ver orden de entrada {idOrden}
            </Link>

        </QModal>
    );
};

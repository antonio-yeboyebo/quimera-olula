
import { VentaTpv } from "#/tpv/venta/diseño.ts";
import { ModeloClienteFacturaRegistrado, clienteRegistradoDesdeFactura, metaModeloClienteFacturaRegistrado } from "#/ventas/factura/cliente_factura/cliente_factura.ts";
import { ClienteFacturaRegistrado } from "#/ventas/factura/cliente_factura/ClienteFacturaRegistrado.tsx";
import { QBoton, QModal } from "@olula/componentes/index.js";
import { useModelo } from "@olula/lib/useModelo.js";
import { useMemo, useState } from "react";

export const ClienteVentaTpv = ({
    venta,
    guardar,
    cancelar,
}: {
    venta: VentaTpv;
    guardar: (cambioCliente: ModeloClienteFacturaRegistrado | null) => void;
    cancelar: () => void;

}) => {

    const clienteRegistradoInicial = useMemo(
        () => clienteRegistradoDesdeFactura(venta),
        [venta]
    );

    // const clienteNoRegistradoInicial = useMemo(
    //     () => clienteNoRegistradoDesdeVenta(venta),
    //     [venta]
    // );

    const registrado = useModelo(
        metaModeloClienteFacturaRegistrado,
        clienteRegistradoInicial
    );

    // const noRegistrado = useModelo(
    //     metaModeloClienteVentaNoRegistrado,
    //     clienteNoRegistradoInicial
    // );

    const [tipoCliente, setTipoCliente] = useState<"registrado" | "simplificada">(
        venta.cliente_id
            ? "registrado"
            : "simplificada"
    );

    const esRegistrado = tipoCliente === "registrado";

    const toggleTipo = () => {
        setTipoCliente(esRegistrado ? "simplificada" : "registrado");
    };

    const valido = esRegistrado ? registrado.valido : true;

    // console.log('Registrado', registrado.modelo);
    // console.log('No registrado', noRegistrado.modelo);

    return (
        <QModal abierto={true} nombre="mostrar" onCerrar={cancelar}>
            <h2>Cambiar cliente</h2>

            <QBoton 
                tamaño='pequeño'
                texto={esRegistrado ? "Fra. Simplificada" : "Registrado"}
                onClick={toggleTipo}
            />

            <quimera-formulario>
            {
                esRegistrado 
                    ? <ClienteFacturaRegistrado
                        cliente={registrado}
                    />
                    : 'Factura simplificada'
            }
            </quimera-formulario>

            <div className="botones maestro-botones ">
                <QBoton texto="Cancelar"
                    onClick={cancelar}
                />
                <QBoton texto="Guardar"
                    onClick={() => guardar(
                        tipoCliente === "registrado"
                            ? registrado.modelo
                            : null
                    )}
                    deshabilitado={!valido}
                />
            </div>
        </QModal>
    );
};


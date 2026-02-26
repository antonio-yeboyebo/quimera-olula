import Tpv_Urls from "#/tpv/comun/urls.ts";
import { ModeloClienteFacturaRegistrado } from "#/ventas/factura/cliente_factura/cliente_factura.ts";
import { ClienteFacturaRegistrado } from "#/ventas/factura/diseño.ts";
import { RestAPI } from "@olula/lib/api/rest_api.js";

const baseUrl = new Tpv_Urls().VENTA;

// DISEÑO
type PatchVentaClienteRegistrado = (id: string, cliente: ClienteFacturaRegistrado) => Promise<void>;

type PatchVentaClienteSimplificada = (id: string) => Promise<void>;

// export const guardarClienteNoRegistrado = async (id: string, cliente: ModeloClienteVentaNoRegistrado) => {

//     await patchVentaClienteNoRegistrado(id, {
//         nombre: cliente.nombre,
//         idFiscal: cliente.idFiscal,
//         direccion: {
//             nombreVia: cliente.nombreVia,
//             codPostal: cliente.codPostal,
//             ciudad: cliente.ciudad ?? '',
//             provincia: cliente.provincia ?? '',
//             idProvincia: cliente.idProvincia ?? '',
//             idPais: cliente.idPais ?? '',

//         }
//     })
// }

export const guardarClienteRegistrado = async (id: string, cliente: ModeloClienteFacturaRegistrado) => {

    await patchVentaClienteRegistrado(id, {
        id: cliente.idCliente,
        // idDireccion: cliente.idDireccion
    })
}

export const guardarClienteSimplificada = async (id: string) => {

    await patchVentaClienteSimplificada(id)
}

// INFRAESTRUCTURA

const patchVentaClienteRegistrado: PatchVentaClienteRegistrado = async (id, cliente) => {

    const payload = {
        cliente_id: cliente.id,
    };

    await RestAPI.patch(`${baseUrl}/${id}/cambiar_cliente`, payload,
        'Error al guardar la venta'
    );
};

const patchVentaClienteSimplificada: PatchVentaClienteSimplificada = async (id) => {

    const payload = {
        cliente_id: null
    };

    await RestAPI.patch(`${baseUrl}/${id}/cambiar_cliente`, payload,
        'Error al guardar la venta'
    );
};

// const patchVentaClienteNoRegistrado: PatchVentaClienteNoRegistrado = async (id, cliente) => {

//     const payload = {
//         cambios: {
//             cliente: {
//                 nombre: cliente.nombre,
//                 id_fiscal: cliente.idFiscal,
//                 direccion: {
//                     tipo_via: '',
//                     nombre_via: cliente.direccion.nombreVia,
//                     numero: '',
//                     otros: '',
//                     ciudad: '',
//                     provincia_id: '',
//                     provincia: '',
//                     cod_postal: cliente.direccion.codPostal,
//                     pais_id: '',
//                     apartado: '',
//                     telefono: ''
//                 }
//             }
//         }
//     };

//     await RestAPI.patch(`${baseUrl}/${id}/cambiar_cliente`, payload,
//         'Error al guardar la venta'
//     );
// };

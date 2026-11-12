import { QInput } from "@olula/componentes/atomos/qinput.tsx";
import { QAutocompletar } from "@olula/componentes/moleculas/qautocompletar.tsx";
import { buscarClientes } from "../../nueva_tarea/infraestructura.ts";
import { FormularioContacto } from "../diseño.ts";

type Props = {
    formulario: FormularioContacto;
    cambiar: (cambios: Partial<FormularioContacto>) => void;
    conCiudad?: boolean;
    clienteBloqueado?: boolean;
};

export const CamposContacto = ({ formulario, cambiar, conCiudad = false, clienteBloqueado = false }: Props) => (
    <>
        <QInput label="Teléfono" nombre="telefono" opcional valor={formulario.telefono} onChange={(telefono) => cambiar({ telefono })} />
        <QInput label="Dirección" nombre="direccion" opcional valor={formulario.direccion} onChange={(direccion) => cambiar({ direccion })} />
        {conCiudad && <QInput label="Ciudad" nombre="ciudad" opcional valor={formulario.ciudad} onChange={(ciudad) => cambiar({ ciudad })} />}
        <QInput label="Código postal" nombre="codpostal" opcional valor={formulario.codPostal} onChange={(codPostal) => cambiar({ codPostal })} />
        <QAutocompletar
            label="Cliente"
            nombre="cliente"
            opcional
            deshabilitado={clienteBloqueado}
            valor={formulario.cliente?.codigo ?? ""}
            descripcion={formulario.cliente?.nombre}
            obtenerOpciones={async (texto) => (await buscarClientes(texto)).map((c) => ({ valor: c.codigo, descripcion: c.nombre }))}
            onChange={(opcion) => cambiar({ cliente: opcion ? { codigo: opcion.valor, nombre: opcion.descripcion } : null })}
        />
    </>
);

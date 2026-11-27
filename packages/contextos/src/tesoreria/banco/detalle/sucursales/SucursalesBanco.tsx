import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { MetaTabla, QTabla } from "@olula/componentes/atomos/qtabla.tsx";
import { EmitirEvento } from "@olula/lib/diseño.ts";
import { Banco, Sucursal } from "../../diseño.ts";
import { tTesoreria } from "../../../i18n/index.ts";

const metaTablaSucursales: MetaTabla<Sucursal> = [
    { id: "agencia", get cabecera() { return tTesoreria("banco.nDeOficina"); } },
    { id: "nombre", get cabecera() { return tTesoreria("banco.nombre"); } },
    { id: "poblacion", get cabecera() { return tTesoreria("banco.poblacion"); } },
    { id: "provincia", get cabecera() { return tTesoreria("banco.provincia"); } },
    { id: "telefono", get cabecera() { return tTesoreria("banco.telefono"); } },
];

/** Pestaña «Sucursales» de Eneboo `bancos.ui`. */
export const SucursalesBanco = ({
    banco,
    publicar,
    editable,
}: {
    banco: Banco;
    publicar: EmitirEvento;
    editable: boolean;
}) => (
    <div className="SucursalesBanco">
        <h3>{tTesoreria("banco.sucursales")}</h3>
        {editable && (
            <div className="botones maestro-botones">
                <QBoton onClick={() => publicar("crear_sucursal_solicitado")}>{tTesoreria("banco.nuevaSucursal")}</QBoton>
            </div>
        )}
        <QTabla<Sucursal>
            metaTabla={[
                ...metaTablaSucursales,
                {
                    id: "acciones",
                    cabecera: "",
                    render: (sucursal: Sucursal) =>
                        editable && (
                            <span className="sucursales-acciones">
                                <QBoton
                                    tamaño="pequeño"
                                    variante="borde"
                                    onClick={() => publicar("cambiar_sucursal_solicitado", sucursal)}
                                >
                                    {tTesoreria("banco.editar")}
                                </QBoton>
                                <QBoton
                                    tamaño="pequeño"
                                    variante="borde"
                                    advertencia
                                    onClick={() => publicar("borrar_sucursal_solicitado", sucursal)}
                                >
                                    {tTesoreria("banco.borrar")}
                                </QBoton>
                            </span>
                        ),
                },
            ]}
            datos={banco.sucursales}
            cargando={false}
            orden={[]}
        />
    </div>
);

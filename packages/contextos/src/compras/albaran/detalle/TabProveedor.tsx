import { Proveedor } from "#/compras/comun/componentes/proveedor.tsx";
import { BotonCambiar } from "#/ventas/comun/componentes/BotonCambiar.tsx";
import { QDate } from "@olula/componentes/atomos/qdate.tsx";
import { QInput } from "@olula/componentes/atomos/qinput.tsx";
import { EmitirEvento } from "@olula/lib/diseño.ts";
import { HookModelo } from "@olula/lib/useModelo.ts";
import { Albaran } from "../diseño.ts";
import { albaranFacturado } from "../dominio.ts";
import "./TabProveedor.css";
import { useTCompras } from "#/compras/i18n/index.ts";

export const TabProveedor = ({
    form,
    publicar,
}: {
    form: HookModelo<Albaran>;
    publicar: EmitirEvento;
}) => {
    const t = useTCompras();
    const { uiProps, modelo } = form;
    const puedeCambiarProveedor = !albaranFacturado(modelo);

    return (
        <div className="TabProveedor">
            <quimera-formulario>
                <Proveedor
                    nombre="proveedorId"
                    valor={modelo.proveedorId ?? ""}
                    descripcion={modelo.nombreProveedor}
                    deshabilitado={true}
                />
                <QInput label={t("comun.campos.idFiscal")} {...uiProps("idFiscal")} />
                {puedeCambiarProveedor && (
                    <div className="TabProveedor-accion">
                        <BotonCambiar
                            titulo={t("comun.cambioProveedor.titulo")}
                            onClick={() => publicar("cambio_proveedor_solicitado")}
                        />
                    </div>
                )}
                <QInput label={t("comun.campos.numeroProveedor")} {...uiProps("numeroProveedor")} />
                <QDate label={t("comun.campos.fecha")} {...uiProps("fecha")} />
                <QInput label={t("comun.campos.hora")} {...uiProps("hora")} />
            </quimera-formulario>
        </div>
    );
};

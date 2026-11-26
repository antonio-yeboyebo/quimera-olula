import { Proveedor } from "#/compras/comun/componentes/proveedor.tsx";
import { EmpresaActual } from "#/comun/componentes/empresaActual.tsx";
import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { QInput } from "@olula/componentes/atomos/qinput.tsx";
import { QModal } from "@olula/componentes/index.js";
import { EmitirEvento } from "@olula/lib/diseño.ts";
import { useForm } from "@olula/lib/useForm.ts";
import { useModelo } from "@olula/lib/useModelo.ts";
import { useCallback, useMemo, useState } from "react";
import { postPedido } from "../infraestructura.ts";
import {
    metaNuevoPedido,
    metaNuevoPedidoProveedorNoRegistrado,
    nuevoPedidoInicial,
    nuevoPedidoProveedorNoRegistradoInicial,
} from "./crear.ts";
import "./CrearPedido.css";
import { useTCompras } from "#/compras/i18n/index.ts";

export const CrearPedido = ({ publicar }: { publicar: EmitirEvento }) => {
    const t = useTCompras();
    const [modoNoRegistrado, setModoNoRegistrado] = useState(false);

    const inicialRegistrado = useMemo(nuevoPedidoInicial, []);
    const inicialNoRegistrado = useMemo(nuevoPedidoProveedorNoRegistradoInicial, []);

    const registrado = useModelo(metaNuevoPedido, inicialRegistrado);
    const noRegistrado = useModelo(
        metaNuevoPedidoProveedorNoRegistrado,
        inicialNoRegistrado
    );

    const alternarModo = () => {
        setModoNoRegistrado((modo) => !modo);
        registrado.init(inicialRegistrado);
        noRegistrado.init(inicialNoRegistrado);
    };

    const crear_ = useCallback(async () => {
        const modelo = modoNoRegistrado ? noRegistrado.modelo : registrado.modelo;
        const id = await postPedido(modelo);
        publicar("pedido_creado", id);
    }, [modoNoRegistrado, noRegistrado.modelo, registrado.modelo, publicar]);

    const cancelar_ = useCallback(
        () => publicar("alta_de_pedido_cancelada"),
        [publicar]
    );

    const [crear, cancelar] = useForm(crear_, cancelar_);

    const form = modoNoRegistrado ? noRegistrado : registrado;

    return (
        <QModal
            abierto={true}
            nombre="crearPedidoCompra"
            titulo={t("pedido.crear.titulo")}
            onCerrar={cancelar}
        >
            <div className="modo-proveedor">
                <QBoton onClick={alternarModo} variante="texto" tipo="button">
                    {modoNoRegistrado ? t("comun.cambioProveedor.registrado") : t("comun.cambioProveedor.noRegistrado")}
                </QBoton>
            </div>
            <div className="CrearPedido">
                <quimera-formulario>
                    <EmpresaActual />
                    {modoNoRegistrado ? (
                        <>
                            <QInput
                                label={t("comun.cambioProveedor.nombreProveedor")}
                                {...noRegistrado.uiProps("nombre")}
                            />
                            <QInput label={t("comun.campos.idFiscal")} {...noRegistrado.uiProps("idFiscal")} />
                        </>
                    ) : (
                        <Proveedor
                            {...registrado.uiProps("proveedorId", "nombreProveedor")}
                            nombre="proveedorPedido"
                        />
                    )}
                    <QInput label={t("comun.campos.numeroProveedor")} {...form.uiProps("numeroProveedor")} />
                </quimera-formulario>
                <div className="botones maestro-botones">
                    <QBoton onClick={crear} deshabilitado={!form.valido}>
                        {t("comun.botones.crear")}
                    </QBoton>
                </div>
            </div>
        </QModal>
    );
};

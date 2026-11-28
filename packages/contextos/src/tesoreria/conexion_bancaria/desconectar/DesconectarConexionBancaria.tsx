import { QModalConfirmacion } from "@olula/componentes/moleculas/qmodalconfirmacion.tsx";
import { EmitirEvento } from "@olula/lib/diseño.js";
import { useForm } from "@olula/lib/useForm.js";
import { useCallback } from "react";
import { ConexionBancaria } from "../diseño.js";
import { nombreInstitucion } from "../dominio.js";
import { deleteConexionBancaria } from "../infraestructura.js";
import { useTTesoreria } from "../../i18n/index.ts";

export const DesconectarConexionBancaria = ({
    publicar,
    conexion,
}: {
    conexion: ConexionBancaria;
    publicar: EmitirEvento;
}) => {
    const t = useTTesoreria();
    const desconectar_ = useCallback(
        async () => {
            await deleteConexionBancaria(conexion.id);
            publicar("conexion_bancaria_borrada", conexion);
        },
        [publicar, conexion]
    );

    const cancelar_ = useCallback(
        () => publicar("desconexion_cancelada"),
        [publicar]
    );

    const [desconectar, cancelar] = useForm(desconectar_, cancelar_);

    return (
        <QModalConfirmacion
            nombre="desconectarConexionBancaria"
            abierto={true}
            titulo={t("conexion_bancaria.desconectarBanco")}
            mensaje={t("conexion_bancaria.estaSeguroDeQueDeseaDesconectar", { conexion: nombreInstitucion(conexion) })}
            onCerrar={cancelar}
            onAceptar={desconectar}
        />
    );
};

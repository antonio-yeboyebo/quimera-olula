import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { QEtiqueta } from "@olula/componentes/atomos/qetiqueta.tsx";
import { QSelect } from "@olula/componentes/atomos/qselect.tsx";
import { QTabla } from "@olula/componentes/atomos/qtabla.tsx";
import { MetaTabla } from "@olula/componentes/index.js";
import { EmitirEvento } from "@olula/lib/diseño.js";
import { UsuarioSoporte } from "../diseño.js";

const getMetaTabla = (
    grupos: string[],
    editable: boolean,
    publicar: EmitirEvento
): MetaTabla<UsuarioSoporte> => [
    { id: "nombre", cabecera: "Nombre" },
    { id: "email", cabecera: "Email" },
    {
        id: "grupo",
        cabecera: "Grupo",
        render: (u: UsuarioSoporte) => (
            <QSelect
                nombre={`grupo_${u.id}`}
                label=""
                valor={u.grupo}
                condensado
                deshabilitado={!editable}
                opciones={(grupos.includes(u.grupo) || !u.grupo ? grupos : [...grupos, u.grupo])
                    .map((g) => ({ valor: g, descripcion: g }))}
                onChange={(opcion) => {
                    if (opcion && opcion.valor !== u.grupo) {
                        publicar("grupo_usuario_cambiado", { id: u.id, grupo: opcion.valor });
                    }
                }}
            />
        ),
    },
    {
        id: "accesoSaas",
        cabecera: "Acceso",
        render: (u: UsuarioSoporte) => (
            <QEtiqueta variante={u.accesoSaas === false ? "error" : "exito"}>
                {u.accesoSaas === false ? "Bloqueado" : "Permitido"}
            </QEtiqueta>
        ),
    },
    {
        id: "acciones",
        cabecera: "",
        render: (u: UsuarioSoporte) => (
            <>
                <QBoton
                    tamaño="pequeño"
                    variante="borde"
                    deshabilitado={!editable}
                    onClick={() =>
                        publicar("acceso_usuario_cambiado", { id: u.id, activo: u.accesoSaas === false })
                    }
                >
                    {u.accesoSaas === false ? "Desbloquear" : "Bloquear"}
                </QBoton>
                <QBoton
                    tamaño="pequeño"
                    variante="borde"
                    deshabilitado={!editable}
                    onClick={() => publicar("contrasena_usuario_solicitada", u)}
                >
                    Restablecer contraseña
                </QBoton>
            </>
        ),
    },
];

export const TabUsuarios = ({
    usuarios,
    grupos,
    editable,
    publicar,
}: {
    usuarios: UsuarioSoporte[];
    grupos: string[];
    editable: boolean;
    publicar: EmitirEvento;
}) => (
    <div className="TabUsuarios">
        <QTabla<UsuarioSoporte>
            metaTabla={getMetaTabla(grupos, editable, publicar)}
            datos={usuarios}
            totalEntidades={usuarios.length}
            cargando={false}
            orden={[]}
        />
    </div>
);

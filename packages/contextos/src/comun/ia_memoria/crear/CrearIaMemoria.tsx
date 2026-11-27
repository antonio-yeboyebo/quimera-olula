import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { QInput } from "@olula/componentes/atomos/qinput.tsx";
import { QSelect } from "@olula/componentes/atomos/qselect.tsx";
import { QTextArea } from "@olula/componentes/atomos/qtextarea.tsx";
import { QModal } from "@olula/componentes/index.js";
import { ArrastraSuelta } from "@olula/componentes/gestor_documentos/ArrastraSuelta.tsx";
import { EmitirEvento } from "@olula/lib/diseño.js";
import { criteriaDefecto } from "@olula/lib/dominio.ts";
import { useFocus } from "@olula/lib/useFocus.ts";
import { useForm } from "@olula/lib/useForm.js";
import { useModelo } from "@olula/lib/useModelo.ts";
import { useCallback, useEffect, useState } from "react";
import { CredencialExterna, ItemArchivoConector } from "../../credencial_externa/diseño.js";
import { buscarArchivosDrive, getCredencialesExterna } from "../../credencial_externa/infraestructura.js";
import { postIaMemoria, postIaMemoriaDesdeConector, postIaMemoriaDesdeFichero } from "../infraestructura.js";
import "./CrearIaMemoria.css";
import { leerComoBase64, metaNuevaIaMemoria, nuevaIaMemoriaVacia, PROVEEDORES_IMPORTABLES } from "./crear.js";
import { useTComun } from "../../i18n/index.ts";

type ModoAlta = "texto" | "fichero" | "conector";

/**
 * Modal de alta de memoria del asistente de IA.
 *
 * Patrón:
 *   - El maestro lo renderiza condicionalmente cuando estado === "CREANDO".
 *   - Tres vías de alta que conviven: texto manual (formulario de siempre),
 *     subir/importar un fichero (el backend extrae el texto), o importar de
 *     un conector externo (Google Drive...) — la memoria queda vinculada y un
 *     job periódico en el backend la mantiene sincronizada después.
 *   - Llama a postIaMemoria/postIaMemoriaDesdeFichero/postIaMemoriaDesdeConector
 *     internamente y emite:
 *       "ia_memoria_creada" con el ID devuelto por la API (éxito)
 *       "alta_cancelada"    sin payload                     (cancelar)
 */
export const CrearIaMemoria = ({
    publicar,
}: {
    publicar: EmitirEvento;
}) => {
    const t = useTComun();
    const [modo, setModo] = useState<ModoAlta>("texto");
    const [fichero, setFichero] = useState<File | null>(null);
    const [tituloFichero, setTituloFichero] = useState("");

    const [credenciales, setCredenciales] = useState<CredencialExterna[]>([]);
    const [credencialId, setCredencialId] = useState("");
    const [tituloConector, setTituloConector] = useState("");
    const [textoBusqueda, setTextoBusqueda] = useState("");
    const [resultados, setResultados] = useState<ItemArchivoConector[]>([]);
    const [buscando, setBuscando] = useState(false);
    const [errorBusqueda, setErrorBusqueda] = useState("");
    const [archivoSeleccionado, setArchivoSeleccionado] = useState<ItemArchivoConector | null>(null);

    const { modelo: iaMemoria, uiProps, valido } = useModelo(
        metaNuevaIaMemoria,
        nuevaIaMemoriaVacia
    );

    // Credenciales de conectores con importador disponible en el backend — se
    // cargan una vez al abrir el modal, se preselecciona si solo hay una.
    useEffect(() => {
        getCredencialesExterna(criteriaDefecto).then((respuesta) => {
            const disponibles = respuesta.datos.filter(
                (c) => c.activo && c.categoria === "conector" && PROVEEDORES_IMPORTABLES.includes(c.proveedor)
            );
            setCredenciales(disponibles);
            if (disponibles.length === 1) setCredencialId(disponibles[0].id);
        });
    }, []);

    // Buscador con debounce: se relanza al cambiar de credencial o de texto.
    useEffect(() => {
        if (modo !== "conector" || !credencialId) return;
        setBuscando(true);
        setErrorBusqueda("");
        const temporizador = setTimeout(() => {
            buscarArchivosDrive(credencialId, textoBusqueda || undefined)
                .then((datos) => { setResultados(datos); setErrorBusqueda(""); })
                .catch((error: { descripcion?: string }) => {
                    setResultados([]);
                    setErrorBusqueda(error?.descripcion || t("iaMemoria.errorAlBuscarArchivosEnGoogle"));
                })
                .finally(() => setBuscando(false));
        }, 400);
        return () => clearTimeout(temporizador);
    }, [modo, credencialId, textoBusqueda, t]);

    const crear_ = useCallback(
        async () => {
            if (modo === "fichero") {
                if (!fichero) return;
                const contenidoBase64 = await leerComoBase64(fichero);
                const id = await postIaMemoriaDesdeFichero({
                    titulo: tituloFichero || undefined,
                    nombreFichero: fichero.name,
                    tipoMime: fichero.type || "application/octet-stream",
                    contenidoBase64,
                });
                publicar("ia_memoria_creada", id);
                return;
            }
            if (modo === "conector") {
                const credencial = credenciales.find((c) => c.id === credencialId);
                if (!credencial || !archivoSeleccionado) return;
                const id = await postIaMemoriaDesdeConector({
                    titulo: tituloConector || undefined,
                    credencialId: credencial.id,
                    proveedor: credencial.proveedor,
                    recursoId: archivoSeleccionado.id,
                });
                publicar("ia_memoria_creada", id);
                return;
            }
            const id = await postIaMemoria(iaMemoria);
            publicar("ia_memoria_creada", id);
        },
        [modo, fichero, tituloFichero, credenciales, credencialId, archivoSeleccionado, tituloConector, iaMemoria, publicar]
    );

    const cancelar_ = useCallback(
        () => publicar("alta_cancelada"),
        [publicar]
    );

    const [crear, cancelar] = useForm(crear_, cancelar_);

    const focus = useFocus();

    const manejarArchivoSeleccionado: EmitirEvento = useCallback(
        async (evento, payload) => {
            if (evento !== "archivos_seleccionados") return;
            const [archivo] = payload as File[];
            if (archivo) setFichero(archivo);
        },
        []
    );

    const validoAlta =
        modo === "texto" ? valido :
        modo === "fichero" ? Boolean(fichero) :
        Boolean(credencialId && archivoSeleccionado);

    return (
        <QModal
            abierto={true}
            nombre="crearIaMemoria"
            titulo={t("iaMemoria.nuevaMemoriaDelAsistente")}
            onCerrar={cancelar}
        >
            <div className="CrearIaMemoria">
                <div className="CrearIaMemoria-modo">
                    <QBoton
                        variante={modo === "texto" ? "solido" : "borde"}
                        onClick={() => setModo("texto")}
                    >
                        {t("iaMemoria.escribirTexto")}
                    </QBoton>
                    <QBoton
                        variante={modo === "fichero" ? "solido" : "borde"}
                        onClick={() => setModo("fichero")}
                    >
                        {t("iaMemoria.subirOImportarFichero")}
                    </QBoton>
                    <QBoton
                        variante={modo === "conector" ? "solido" : "borde"}
                        onClick={() => setModo("conector")}
                    >
                        {t("iaMemoria.importarDeUnConector")}
                    </QBoton>
                </div>

                {modo === "texto" && (
                    <quimera-formulario>
                        <QInput label={t("iaMemoria.titulo")} {...uiProps("titulo")} ref={focus} />
                        <QTextArea label={t("iaMemoria.contenido")} rows={8} {...uiProps("contenido")} />
                    </quimera-formulario>
                )}

                {modo === "fichero" && (
                    <div className="CrearIaMemoria-fichero">
                        <quimera-formulario>
                            <QInput
                                label={t("iaMemoria.tituloOpcional")}
                                nombre="tituloFichero"
                                valor={tituloFichero}
                                onChange={(valor) => setTituloFichero(valor)}
                            />
                        </quimera-formulario>
                        {fichero ? (
                            <div className="CrearIaMemoria-fichero-seleccionado">
                                <span>{fichero.name}</span>
                                <QBoton variante="texto" onClick={() => setFichero(null)}>
                                    {t("iaMemoria.quitar")}
                                </QBoton>
                            </div>
                        ) : (
                            <ArrastraSuelta emitir={manejarArchivoSeleccionado} />
                        )}
                    </div>
                )}

                {modo === "conector" && (
                    <div className="CrearIaMemoria-conector">
                        {credenciales.length === 0 ? (
                            <p className="CrearIaMemoria-conector-vacio">
                                {t("iaMemoria.noHayNingunaCredencialDeConector")}
                            </p>
                        ) : (
                            <>
                                <quimera-formulario>
                                    <QSelect
                                        label={t("iaMemoria.credencial")}
                                        nombre="credencialId"
                                        valor={credencialId}
                                        onChange={(opcion) => { setCredencialId(opcion?.valor ?? ""); setArchivoSeleccionado(null); }}
                                        opciones={credenciales.map((c) => ({ valor: c.id, descripcion: `${c.nombre} (${c.proveedor})` }))}
                                    />
                                    <QInput
                                        label={t("iaMemoria.tituloOpcional")}
                                        nombre="tituloConector"
                                        valor={tituloConector}
                                        onChange={(valor) => setTituloConector(valor)}
                                    />
                                </quimera-formulario>

                                <QInput
                                    label={t("iaMemoria.buscarArchivo")}
                                    nombre="textoBusqueda"
                                    valor={textoBusqueda}
                                    onChange={(valor) => { setTextoBusqueda(valor); setArchivoSeleccionado(null); }}
                                    deshabilitado={!credencialId}
                                />

                                <ul className="CrearIaMemoria-conector-resultados">
                                    {buscando && <li className="CrearIaMemoria-conector-estado">{t("iaMemoria.buscando")}</li>}
                                    {!buscando && errorBusqueda && (
                                        <li className="CrearIaMemoria-conector-error">{errorBusqueda}</li>
                                    )}
                                    {!buscando && !errorBusqueda && credencialId && resultados.length === 0 && (
                                        <li className="CrearIaMemoria-conector-estado">{t("iaMemoria.sinResultados")}</li>
                                    )}
                                    {resultados.map((archivo) => (
                                        <li
                                            key={archivo.id}
                                            className={
                                                "CrearIaMemoria-conector-resultado"
                                                + (archivoSeleccionado?.id === archivo.id ? " seleccionado" : "")
                                            }
                                            onClick={() => setArchivoSeleccionado(archivo)}
                                        >
                                            {archivo.nombre}
                                        </li>
                                    ))}
                                </ul>
                            </>
                        )}
                    </div>
                )}

                <div className="botones maestro-botones">
                    <QBoton onClick={crear} deshabilitado={!validoAlta}>
                        {t("iaMemoria.crear")}
                    </QBoton>
                </div>
            </div>
        </QModal>
    );
};

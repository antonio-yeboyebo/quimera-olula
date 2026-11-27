/** Textos de `@olula/lib` (validaciones de modelos, errores de la API). Referencia: español. */
export const es = {
    si: "Sí",
    no: "No",
    error: "Error",
    errorHttp: "Error {{estado}}",
    validacion: {
        requerido: "Campo requerido",
        email: "Formato Email incorrecto",
        positivo: "El número debe ser positivo",
        maximo: "El número debe ser menor o igual a {{maximo}}",
        minimo: "El número debe ser mayor o igual a {{minimo}}",
        subobjeto: "Sub-objeto inválido",
        minimoElementos_one: "Se requiere al menos {{count}} elemento",
        minimoElementos_other: "Se requieren al menos {{count}} elementos",
        maximoElementos_one: "Se permite como máximo {{count}} elemento",
        maximoElementos_other: "Se permiten como máximo {{count}} elementos",
        elementoInvalido: "Algún elemento de la lista es inválido",
        longitudMaxima: "Como mucho {{maximo}} caracteres",
        ibanRequerido: "El IBAN es requerido",
        ibanNoValido: "El IBAN no es válido",
    },
    // <generado: textos extraídos del código>
    gen: {
        api: {
            errorAlGuardarDocumento: "Error al guardar documento",
            errorAlCrearCarpeta: "Error al crear carpeta",
            errorAlBorrarDocumento: "Error al borrar documento",
        },
        voz: {
            permisoDeMicrofonoDenegado: "Permiso de micrófono denegado",
            elNavegadorNoPermiteElReconocimiento: "El navegador no permite el reconocimiento de voz",
            noSeHaEncontradoMicrofono: "No se ha encontrado micrófono",
            noSeHaDetectadoVoz: "No se ha detectado voz",
            errorDeRed: "Error de red",
        },
        controlesPantalla: {
            eseElementoYaNoEstaEn: "Ese elemento ya no está en pantalla.",
            noHePodidoHacerlo: "No he podido hacerlo.",
        },
        erroresLimite: {
            hasLlegadoAlLimiteDeTu: "Has llegado al límite de tu plan",
            tuEmpresaEstaEnSoloLectura: "Tu empresa está en solo lectura",
            moduloNoIncluidoEnTuPlan: "Módulo no incluido en tu plan",
        },
        useModelo: {
            error: "Error",
        },
    },
    // </generado>
} as const;

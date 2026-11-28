import type { Traduccion } from "./i18n.ts";
import type { es } from "./es.ts";

export const en: Traduccion<typeof es> = {
    si: "Yes",
    no: "No",
    error: "Error",
    errorHttp: "Error {{estado}}",
    validacion: {
        requerido: "Required field",
        email: "Invalid email format",
        positivo: "The number must be positive",
        maximo: "The number must be less than or equal to {{maximo}}",
        minimo: "The number must be greater than or equal to {{minimo}}",
        subobjeto: "Invalid sub-object",
        minimoElementos_one: "At least {{count}} item is required",
        minimoElementos_other: "At least {{count}} items are required",
        maximoElementos_one: "At most {{count}} item is allowed",
        maximoElementos_other: "At most {{count}} items are allowed",
        elementoInvalido: "Some item in the list is invalid",
        longitudMaxima: "At most {{maximo}} characters",
        ibanRequerido: "The IBAN is required",
        ibanNoValido: "The IBAN is not valid",
    },
    // <generado: textos extraídos del código>
    gen: {
        api: {
            errorAlGuardarDocumento: "Error saving document",
            errorAlCrearCarpeta: "Error creating folder",
            errorAlBorrarDocumento: "Error deleting document",
        },
        voz: {
            permisoDeMicrofonoDenegado: "Microphone permission denied",
            elNavegadorNoPermiteElReconocimiento: "The browser does not allow speech recognition",
            noSeHaEncontradoMicrofono: "No microphone found",
            noSeHaDetectadoVoz: "No speech detected",
            errorDeRed: "Network error",
        },
        controlesPantalla: {
            eseElementoYaNoEstaEn: "That element is no longer on screen.",
            noHePodidoHacerlo: "I could not do it.",
        },
        erroresLimite: {
            hasLlegadoAlLimiteDeTu: "You have reached your plan's limit",
            tuEmpresaEstaEnSoloLectura: "Your company is read-only",
            moduloNoIncluidoEnTuPlan: "Module not included in your plan",
        },
        useModelo: {
            error: "Error",
        },
    },
    // </generado>
};

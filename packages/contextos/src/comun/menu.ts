export const menuComun = {
    "Dashboards": { icono: "grafico_barras", url: "/comun/dashboard", area: "Sistema" },
    "Asistente IA": { icono: "asistente", area: "Sistema" },
    "Asistente IA/Chat": { url: "/comun/asistente" },
    "Asistente IA/Memoria del asistente": { url: "/comun/ia-memoria", regla: "comun.ia_memoria" },
    "Asistente IA/Flujos de trabajo": { url: "/comun/ia-flujo", regla: "comun.ia_flujo" },
    "Asistente IA/Tareas programadas": { url: "/comun/ia-tarea-programada", regla: "comun.ia_tarea_programada" },
    // Las credenciales las usan el asistente, los conectores (Stripe…) y otras
    // integraciones: van con usuarios y grupos (la sección la define auth).
    "Administración/Credenciales": { url: "/comun/credencial-externa", regla: "comun.credencial_externa" },
    "Asistente IA/Bandeja de tareas": { url: "/comun/hitl-cola", regla: "comun.hitl_cola" },
};

interface NodoComun {
    id?: string;
    children?: ReactNode;
    key?: string;
    [key: string]: unknown;
}

interface BoxIcon extends NodoComun {
    name: string;
    size?: string;
    color?: string;
    type?: "solid" | "regular" | "logo";
    style?: React.CSSProperties;
}

declare namespace React {
    namespace JSX {
        interface IntrinsicElements {
            'quimera-formulario': NodoComun;
            'quimera-boton': NodoComun;
            'quimera-date': NodoComun;
            'quimera-input': NodoComun;
            'quimera-checkbox': NodoComun;
            'quimera-radio': NodoComun;
            'quimera-select': NodoComun;
            'quimera-tabla': NodoComun;
            'quimera-lista': NodoComun;
            'quimera-tabla-paginacion': NodoComun;
            'quimera-tabla-multinivel': NodoComun;
            'quimera-textarea': NodoComun;
            'quimera-icono': NodoComun;
            'box-icon': BoxIcon;
            'quimera-tarjetas': NodoComun;
            'quimera-tarjeta': NodoComun;
            'quimera-tarjeta-resumen': NodoComun;
            'maestro-detalle': NodoComun;
            'etiqueta-filtro': NodoComun;
            'etiquetas-filtro': NodoComun;
            'quimera-acciones': NodoComun;
            'quimera-autocompletar': NodoComun;
            'quimera-acordeon': NodoComun;
            'quimera-modal': NodoComun;
            'qhistorias-componente': NodoComun;
            'qhistorias-historia': NodoComun;
            'quimera-historias': NodoComun;
            'menu-lateral': NodoComun;
            'menu-usuario': NodoComun;
            'panel-asistente': NodoComun;
            'quimera-editor-enriquecido': NodoComun;
            'quimera-cargando': NodoComun;
        }
    }
}

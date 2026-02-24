interface BoxIcon extends NodoComun {
    name: string;
    size?: string;
    color?: string;
    style?: React.CSSProperties;
    type?: 'solid' | 'regular' | 'logo';
}

declare namespace React {
    namespace JSX {
        interface IntrinsicElements {
            'quimera-formulario': NodoComun;
            'quimera-boton': NodoComun;
            'quimera-date': NodoComun;
            'quimera-input': NodoComun;
            'quimera-checkbox': NodoComun;
            'quimera-select': NodoComun;
            'quimera-tabla': NodoComun;
            'quimera-lista': NodoComun;
            'quimera-tabla-paginacion': NodoComun;
            'quimera-textarea': NodoComun;
            'quimera-icono': NodoComun;
            'box-icon': BoxIcon;
            'quimera-tarjetas': NodoComun;
            'quimera-tarjeta': NodoComun;
            'maestro-detalle': NodoComun;
            'etiqueta-filtro': NodoComun;
            'etiquetas-filtro': NodoComun;
            'quimera-acciones': NodoComun;
            'quimera-autocompletar': NodoComun;
            'quimera-modal': NodoComun;
            'qhistorias-componente': NodoComun;
            'qhistorias-historia': NodoComun;
            'quimera-historias': NodoComun;
            'menu-lateral': NodoComun;
            'menu-usuario': NodoComun;
        }
    }
}

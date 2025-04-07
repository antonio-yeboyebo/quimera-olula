interface NodoComun {
    id?: string;
    children?: ReactNode;
    key?: string;
}

interface BoxIcon extends NodoComun {
    name: string;
    size?: string;
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
            'quimera-autocompletar': NodoComun;
            'quimera-tabla': NodoComun;
            'etiquetas-filtro': NodoComun;
            'menu-lateral': NodoComun;
            'quimera-icono': NodoComun;
            'box-icon': BoxIcon;
        }
    }
}

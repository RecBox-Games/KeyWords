let input:Input;

export interface Input {
    element: HTMLInputElement,
    is_showing: boolean,
    is_active: boolean
}

export function init_input() {
    let inputElement = document.createElement('input');    
    input = {
        element: inputElement,
        is_showing: false,
        is_active: false,        
    };
    style_input();
    document.body.appendChild(inputElement);
}

export function activate_input() { input.is_active = true; }

export function deactivate_input() { input.is_active = false; }

export function show_input () {input.element.style.display = 'flex';}

export function hide_input () {input.element.style.display = 'none';}

export const get_input = () : Input => { return input; };

export function style_input() {
    input.element.type = 'text';
    input.element.placeholder = 'enter your clue!';
    input.element.style.display = 'none';
    input.element.style.top = '0vh';
    input.element.style.position = 'Absolute';
    input.element.style.left = '67.75vw';
    input.element.style.width = '11.5%';
    input.element.style.fontSize = '15px';
    input.element.style.background = 'transparent';
    input.element.style.border = 'none';
    input.element.style.borderBottom = '2px solid white';
    input.element.style.color = 'black';
    input.element.style.fontWeight = 'bold';

}
/*
export function add_textbox_handlers() {
    input.element.onchange = handle_input;

    // touchstart handler
    document.addEventListener('touchstart', function(e) {
        if (input.element === document.activeElement) {
            handle_input(e);
        }
    });

    // blur handler with delay
    input.element.addEventListener("blur", function(e) {
        setTimeout(function() {
            handle_input(e);
        }, 500);
    });
}


function handle_input(e: Event) {
    if ((e.target as HTMLInputElement).value != "") {
        get_board().clue = (e.target as HTMLInputElement).value;
        get_board().topbar.acceptButton._active = true;
    }
    else {
        get_board().topbar.acceptButton._active = false;
    }
    console.log((e.target as HTMLInputElement).value);
}
*/

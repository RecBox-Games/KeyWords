import { get_context } from "../controller_lib/init.js";

let input: Input;

export interface Input {
    element: HTMLInputElement,
    is_showing: boolean,
    is_active: boolean
    clue: string,
}

export function init_input() {
    let inputElement = document.createElement('input');
    input = {
        element: inputElement,
        is_showing: false,
        is_active: false,
        clue: "",
    };
    style_input();
    inputElement.classList.add('uniqueInput'); // Add unique class
    input.element.onfocus = activate_input;
    input.element.onblur = handle_input;
    document.body.appendChild(inputElement);
    style_placeholder();
}

export function activate_input() { console.log("input is now active"); input.is_active = true; }

export function deactivate_input() { console.log("input is now inactive"); input.is_active = false; }

export function show_input() { input.element.style.display = 'flex'; }

export function hide_input() { input.element.style.display = 'none'; }

export function clear_input() { input.element.value = "" };

export function set_red_input_border() { input.element.style.border = '2px solid red'; };

export function set_blue_input_border() { input.element.style.border = '2px solid blue'; }

export const get_input = (): Input => { return input; };

export function style_placeholder() {
    const style = document.createElement('style');
    style.innerHTML = `
.uniqueInput::placeholder {
    color: red;
  }
`;
    document.head.appendChild(style);
    console.log("styles appended");
}

export function style_input() {
    input.element.type = 'text';
    input.element.placeholder = 'enter clue here';
    input.element.style.display = 'none';
    input.element.style.top = '-.1vh';
    input.element.style.position = 'Absolute';
    input.element.style.left = "74.5vw";
    input.element.style.width = '15%';
    input.element.style.fontSize = '20px';
    input.element.style.background = '#2eaf5b';
    input.element.style.border = 'none';
    input.element.style.color = 'black';
    input.element.style.fontWeight = 'bold';
}


export const confirm_clue = (amount: number) => {
    const ctx = get_context();
    ctx.ws.send("input:clue," + input.clue + "," + amount.toString());
}

export function handle_input(e: Event) {
    deactivate_input();
    if ((e.target as HTMLInputElement).value != "") {
        input.clue = (e.target as HTMLInputElement).value;
    }
    console.log(input.clue);
}

import { get_context } from "../controller_lib/init.js";
let input;
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
export function clear_input() { input.element.value = ""; }
;
export function set_red_input_border() { input.element.style.border = '2px solid red'; }
;
export function set_blue_input_border() { input.element.style.border = '2px solid blue'; }
export const get_input = () => { return input; };
export function style_placeholder() {
    const style = document.createElement('style');
    style.innerHTML = `
.uniqueInput::placeholder {
    color: #666666;
  }
`;
    document.head.appendChild(style);
    console.log("styles appended");
}
export function style_input() {
    input.element.type = 'text';
    input.element.placeholder = ' Enter clue here';
    input.element.style.display = 'none';
    input.element.style.position = 'Absolute';
    input.element.style.fontSize = '24px';
    input.element.style.background = '#eaeae8';
    input.element.style.border = '2px solid black';
    input.element.style.color = 'black';
    input.element.style.fontWeight = 'bold';
    input.element.style.top = '-.1v';
    input.element.style.left = "77%";
    input.element.style.width = '19%';
}
export const confirm_clue = (amount) => {
    const ctx = get_context();
    ctx.ws.send("input:clue," + input.clue + "," + amount.toString());
};
export function handle_input(e) {
    deactivate_input();
    if (e.target.value != "") {
        input.clue = e.target.value;
    }
    console.log(input.clue);
}
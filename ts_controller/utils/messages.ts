import { get_context } from "../controller_lib/init";

export const send_acknowledge = () => {
    const ctx = get_context();

    ctx.ws.send("input:ack");
}

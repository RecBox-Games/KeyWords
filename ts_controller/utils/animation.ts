export interface Anim {
    object: any,
    frame:number,
    max_frame:number,
    animate_fn: Function
}

const animated_objects:(Anim)[] = [];

export const add_animation = (anim:Anim) => animated_objects.push(anim);

const animate = () =>
{
    const new_list:Anim[] = [];
    for (let animation of animated_objects)
    {
        if (animation.animate_fn(animation.object))
            new_list.push(animation);
    }
}

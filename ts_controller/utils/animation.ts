interface Animaton {
    object: any,
    frame:number,
    max_frame:number,
    animate_fn: Function
}

const animated_objects:(Animaton)[] = [];

export const add_animation = (anim:Animaton) => animated_objects.push(anim);

const animate = () =>
{
    const new_list:Animaton[] = [];
    for (let animation of animated_objects)
    {
        if (animation.animate_fn(animation.object))
            new_list.push(animation);
    }
}

const animated_objects = [];
export const add_animation = (anim) => animated_objects.push(anim);
const animate = () => {
    const new_list = [];
    for (let animation of animated_objects) {
        if (animation.animate_fn(animation.object))
            new_list.push(animation);
    }
};

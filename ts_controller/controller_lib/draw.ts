import { get_context } from "./init.js";
import { Context } from "./types/context.js";
import { DEFAULT_DRAWABLE_IMG, DEFAULT_DRAWABLE_RECT, DEFAULT_DRAWABLE_TEXT, DrawableImage, DrawableRect, DrawableText } from "./types/drawables.js";
import { Rectangle } from "./types/shapes.js";
import { center_text, checkAllFieldsExist } from "./utils.js";

let Idrawables: (DrawableImage | DrawableRect | DrawableText) [] = []

export const drawablesPrint = () => {
	console.log("Drawables",Idrawables)
	for (let item of Idrawables)
		console.log(item)
}



export const drawablesRenderAll = () => {
	let ctx:Context = get_context();

	// printDrawables();
	// ctx.ctx.fillStyle = "#808080";
    // ctx.ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
	for (let item of Idrawables)
	{
		drawableRenderSingle(ctx, item);
	}
	Idrawables.length = 0;
}


export const drawablesAdd = (item:DrawableImage | DrawableRect | DrawableText) => {
	Idrawables.push(item);
}

export const drawableRenderSingle = (ctx:Context, drawable:DrawableImage | DrawableRect | DrawableText) =>
{

    // console.log('resize fill', ctx);
	if (checkAllFieldsExist(DEFAULT_DRAWABLE_RECT,drawable))
	{
		const rect = drawable as DrawableRect;
		if (rect.stroke == 0) {
			ctx.ctx.fillStyle = rect.color;
			ctx.ctx.fillRect(rect.boundingBox.x, rect.boundingBox.y, rect.boundingBox.w, rect.boundingBox.h);
		} else {
			ctx.ctx.strokeStyle = rect.color;
			ctx.ctx.lineWidth = rect.stroke;
			ctx.ctx.strokeRect(rect.boundingBox.x, rect.boundingBox.y, rect.boundingBox.w, rect.boundingBox.h);
		}
	}
	else if (checkAllFieldsExist(DEFAULT_DRAWABLE_IMG,drawable))
	{
		const img = drawable as DrawableImage;
		if (img.image && img.image.complete)
		{
			// ctx.ctx.setTransform(img.scale, 0, 0, img.scale, 0, 0); // sets scale and origin
			ctx.ctx.rotate(img.rotation);
            // !src -> 2 args
            // else 3 args
            // If !dst, fullconst ctx:Context = get_context()

            let dst:Rectangle = {x:0, y:0, w: ctx.dimensions.x, h:ctx.dimensions.y};
            ctx.ctx.imageSmoothingEnabled = false;
            if (img.dst)
                dst = img.dst;
            if (img.src)
            {

                 ctx.ctx.drawImage(img.image,
                 img.src.x, img.src.y, img.src.w, img.src.h,
                 dst.x,     dst.y,      dst.w,    dst.h);
            }
            else
            {
                ctx.ctx.drawImage(img.image, dst.x, dst.y, dst.w, dst.h);
            }
			ctx.ctx.setTransform(1,0,0,1,0,0);
		}
	}
	else if (checkAllFieldsExist(DEFAULT_DRAWABLE_TEXT,drawable))
	{
		const text = drawable as DrawableText;
        // let oldFont = ctx.ctx.font;
		ctx.ctx.fillStyle = text.color;
        ctx.ctx.font = text.font;
        if (text.center) {
            text.coords = center_text(text.text,text.font, text.boundingBox);
        }
        if (text.wrap) {
            const match = text.font.match(/^(\d+)px/);
            var line_height = 4;
            if (match) {
                line_height += parseInt(match[1]);
            }
            wrapText(ctx.ctx, text.text, text.boundingBox.x, text.boundingBox.y, text.boundingBox.w, line_height);
        } else {
		    ctx.ctx.fillText(text.text as string, text.coords.x, text.coords.y);
        }
	}
	else throw "Drawable types matches none"
}

function wrapText(context, text, x, y, maxWidth, lineHeight) {
    var words = text.split(' ');
    var line = '';

    for (var n = 0; n < words.length; n++) {
        var testLine = line + words[n] + ' ';
        var metrics = context.measureText(testLine);
        var testWidth = metrics.width;
        if (testWidth > maxWidth && n > 0) {
            context.fillText(line, x, y);
            line = words[n] + ' ';
            y += lineHeight;
        }
        else {
            line = testLine;
        }
    }
    context.fillText(line, x, y);
}

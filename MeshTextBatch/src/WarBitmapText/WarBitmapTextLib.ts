import { TextStyleMap } from "./TextStyleMap";
import WarBitmapText from "./WarBitmapText";
import { TextStyleType } from "./TextStyleType";


export default class WarBitmapTextLib
{
    static defaultAtlas: TextStyleMap;
    static defaultText: WarBitmapText;

    static async LoadDefalutAsync()
    {
        if(this.defaultAtlas)
        {
            return;
        }
        

        var text = this.defaultText = new WarBitmapText();
        var style = this.defaultAtlas = new TextStyleMap();
        this.defaultText.textStyleMap = style;
        style.GenerateNumType("0123456789", TextStyleType.Yellow);
        style.GenerateNumType("qwertyuiop", TextStyleType.Skill);
        style.GenerateNumType("asdfghjkl;", TextStyleType.White);
        style.GenerateNumType("zxcvbnm,./", TextStyleType.Red);
        style.GenerateNumType("!@#$%^&*()", TextStyleType.Green);
        // style.GenerateNumType("零一二三四五六七八九", TextStyleType.WhiteBig);
        // style.AddToAllType("d", "闪");
        // style.AddToAllType("c", "暴");
        // style.AddToType("c", "爆", TextStyleType.Red);

        return new Promise<WarBitmapText>((resolve)=>
        {
            text.LoadFont("res/font/damage-export.fnt", ()=>
            {
                text.InitItemPool();
                resolve(text);
            });
         });
    }
}


window['TextStyleType'] = TextStyleType;
window['WarBitmapText'] = WarBitmapText;
window['WarBitmapTextLib'] = WarBitmapTextLib;
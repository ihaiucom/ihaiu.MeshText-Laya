import TextureTextAtlas from "./TextureTextAtlas";
import { MeshTextType, TextStyleType } from "../MeshText/MeshTextType";
import WarTextureText from "./WarTextureText";

export default class WarTextureTextLib
{
    static defaultAtlas: TextureTextAtlas;
    static defaultText: WarTextureText;

    static async LoadDefalutAsync()
    {
        if(this.defaultAtlas)
        {
            return;
        }
        var texturePath: string, atlasPath: string;
        texturePath = "res/font/WarMeshText.png";
        atlasPath = "res/font/WarMeshText.txt";
        var atlas = await TextureTextAtlas.CreateAsync(texturePath, atlasPath);
        atlas.GenerateNumType(MeshTextType.White, TextStyleType.White);
        atlas.GenerateNumType(MeshTextType.Red, TextStyleType.Red);
        atlas.GenerateNumType(MeshTextType.Green, TextStyleType.Green);
        atlas.GenerateNumType(MeshTextType.WhiteBig, TextStyleType.WhiteBig);
        atlas.GenerateNumType(MeshTextType.YellowBig, TextStyleType.YellowBig);
        atlas.AddToAllType("c", "c_yellow");
        atlas.AddToType("c", "c_red", TextStyleType.Red);
        atlas.AddToAllType("d");
        atlas.InitAllChartSpritePool();

        
        // atlas.typeScaleMap.set(TextStyleType.White, 1);
        // atlas.typeScaleMap.set(TextStyleType.Green, 1);
        // atlas.typeScaleMap.set(TextStyleType.Green, 1);

        // atlas.typeScaleMap.set(TextStyleType.WhiteBig, 1);
        // atlas.typeScaleMap.set(TextStyleType.YellowBig, 1);

        this.defaultAtlas = atlas;

        var text = new WarTextureText(atlas);
        this.defaultText = text;
    }
}

window['WarTextureText'] = WarTextureText;
window['WarTextureTextLib'] = WarTextureTextLib;
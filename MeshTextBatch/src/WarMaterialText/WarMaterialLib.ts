
import { MeshTextType, TextStyleType } from "../MeshText/MeshTextType";
import WarMaterialTextAtlas from "./WarMaterialTextAtlas";
import WarMaterialText from "./WarMaterialText";

export default class WarMaterialLib
{
    static defaultAtlas: WarMaterialTextAtlas;
    static defaultText: WarMaterialText;

    static async LoadDefalutAsync()
    {
        if(this.defaultAtlas)
        {
            return;
        }
        var texturePath: string, atlasPath: string;
        texturePath = "res/font/WarMeshText.png";
        atlasPath = "res/font/WarMeshText.txt";
        var atlas = await WarMaterialTextAtlas.CreateAsync(texturePath, atlasPath);
        atlas.GenerateNumType(MeshTextType.White, TextStyleType.White);
        atlas.GenerateNumType(MeshTextType.Red, TextStyleType.Red);
        atlas.GenerateNumType(MeshTextType.Green, TextStyleType.Green);
        atlas.GenerateNumType(MeshTextType.WhiteBig, TextStyleType.WhiteBig);
        atlas.GenerateNumType(MeshTextType.YellowBig, TextStyleType.YellowBig);
        atlas.AddToAllType("c", "c_yellow");
        atlas.AddToType("c", "c_red", TextStyleType.Red);
        atlas.AddToAllType("d");
        atlas.InitAllChartSpritePool();
        this.defaultAtlas = atlas;

        var text = new WarMaterialText(atlas);
        this.defaultText = text;
    }
}
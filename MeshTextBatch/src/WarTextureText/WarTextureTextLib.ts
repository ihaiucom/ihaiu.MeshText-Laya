import TextureTextAtlas from "./TextureTextAtlas";
import { MeshTextType } from "../MeshText/MeshTextType";
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
        atlas.GenerateNumType(MeshTextType.white);
        atlas.GenerateNumType(MeshTextType.red);
        atlas.GenerateNumType(MeshTextType.green);
        atlas.AddToAllType("c");
        atlas.AddToAllType("d");
        atlas.InitAllChartSpritePool();
        this.defaultAtlas = atlas;

        var text = new WarTextureText(atlas);
        this.defaultText = text;
    }
}
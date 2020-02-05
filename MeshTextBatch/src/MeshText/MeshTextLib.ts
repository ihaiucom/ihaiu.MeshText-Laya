import MeshTextBatchMesh from "./MeshTextBatchMesh";
import MeshTextBatchSprite from "./MeshTextBatchSprite";
import ToolMeshText from "./ToolMeshText";
import MeshTextAtlas from "./MeshTextAtlas";
import { MeshTextType, TextStyleType } from "./MeshTextType";
import { HorizontalAlignType } from "./HorizontalAlignType";
import { MeshTextBatchTweenMaterial } from "./Material/MeshTextBatchTweenMaterial";
import { MeshTextBatchTweenSeparateMaterial } from "./Material/MeshTextBatchTweenSeparateMaterial";

export default class MeshTextLib
{
    static defaultAtlas: MeshTextAtlas;
    static defaultText: MeshTextBatchMesh;
    static defaultMeshTextBatchSprite: MeshTextBatchSprite;

    static isInited: boolean = false;
    static async InitAsync()
    {
        if(this.isInited)
        {
            return
        }

        this.isInited = true;
        await MeshTextBatchTweenMaterial.install();
        await MeshTextBatchTweenSeparateMaterial.install();
    }

    static async LoadDefalutAsync()
    {
        await this.InitAsync();
        if(this.defaultAtlas)
        {
            return;
        }
        var texturePath: string, atlasPath: string;
        texturePath = "res/font/WarMeshText.png";
        atlasPath = "res/font/WarMeshText.txt";
        var atlas = await MeshTextAtlas.CreateAsync(texturePath, atlasPath);
        atlas.GenerateNumType(MeshTextType.White, TextStyleType.White);
        atlas.GenerateNumType(MeshTextType.Red, TextStyleType.Red);
        atlas.GenerateNumType(MeshTextType.Green, TextStyleType.Green);
        atlas.GenerateNumType(MeshTextType.WhiteBig, TextStyleType.WhiteBig);
        atlas.GenerateNumType(MeshTextType.YellowBig, TextStyleType.YellowBig);

        atlas.AddToAllType("c", "c_yellow");
        atlas.AddToType("c", "c_red", TextStyleType.Red);
        atlas.AddToAllType("d");
        atlas.GenerateNumType(MeshTextType.Red, TextStyleType.Red);

        atlas.typeScaleMap.set(TextStyleType.White, 0.2);
        atlas.typeScaleMap.set(TextStyleType.Green, 0.2);
        atlas.typeScaleMap.set(TextStyleType.Green, 0.2);

        atlas.typeScaleMap.set(TextStyleType.WhiteBig, 0.3);
        atlas.typeScaleMap.set(TextStyleType.YellowBig, 0.3);

        var batchMesh:MeshTextBatchMesh = new MeshTextBatchMesh(atlas);
        // batchMesh.StartUpdate();

        
        var meshTextBatchSprite = batchMesh.sprite = new MeshTextBatchSprite(batchMesh);
        meshTextBatchSprite.meshRenderer.sharedMaterial = atlas.MeshTextBatchTweenMaterial;
        meshTextBatchSprite.meshRenderer.sharedMaterial.renderQueue = Laya.BaseMaterial.RENDERQUEUE_TRANSPARENT + 500;
        // meshTextBatchSprite.transform.localRotationEulerY = 20;
        // meshTextBatchSprite.transform.localPositionZ = 0;
        this.defaultAtlas = atlas;
        this.defaultText = batchMesh;
        this.defaultMeshTextBatchSprite = meshTextBatchSprite;
    }
}

window['MeshTextBatchMesh'] = MeshTextBatchMesh;
window['MeshTextBatchSprite'] = MeshTextBatchSprite;
window['ToolMeshText'] = ToolMeshText;
window['MeshTextAtlas'] = MeshTextAtlas;
window['MeshTextType'] = MeshTextType;
window['HorizontalAlignType'] = HorizontalAlignType;
window['MeshTextBatchTweenMaterial'] = MeshTextBatchTweenMaterial;
window['MeshTextBatchTweenSeparateMaterial'] = MeshTextBatchTweenSeparateMaterial;
window['MeshTextLib'] = MeshTextLib;
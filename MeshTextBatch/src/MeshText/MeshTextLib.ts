import MeshTextBatchMesh from "./MeshTextBatchMesh";
import MeshTextBatchSprite from "./MeshTextBatchSprite";
import ToolMeshText from "./ToolMeshText";
import MeshTextAtlas from "./MeshTextAtlas";
import { MeshTextType } from "./MeshTextType";
import { HorizontalAlignType } from "./HorizontalAlignType";
import { MeshTextBatchTweenMaterial } from "./Material/MeshTextBatchTweenMaterial";
import { MeshTextBatchTweenSeparateMaterial } from "./Material/MeshTextBatchTweenSeparateMaterial";

export default class MeshTextLib
{
    static defaultAtlas: MeshTextAtlas;
    static defaultMeshTextBatchMesh: MeshTextBatchMesh;
    static defaultMeshTextBatchSprite: MeshTextBatchSprite;

    static async InitAsync()
    {
        await MeshTextBatchTweenMaterial.install();
        await MeshTextBatchTweenSeparateMaterial.install();
    }

    static async LoadDefalutAsync()
    {
        if(this.defaultAtlas)
        {
            return;
        }
        var texturePath: string, atlasPath: string;
        texturePath = "res/font/WarMeshText.png";
        atlasPath = "res/font/WarMeshText.txt";
        var atlas = await MeshTextAtlas.CreateAsync(texturePath, atlasPath);
        atlas.GenerateNumType(MeshTextType.white);
        atlas.GenerateNumType(MeshTextType.red);
        atlas.GenerateNumType(MeshTextType.green);
        atlas.AddToAllType("c");
        atlas.AddToAllType("d");

        var batchMesh:MeshTextBatchMesh = new MeshTextBatchMesh(atlas);
        // batchMesh.StartUpdate();

        
        var meshTextBatchSprite = new MeshTextBatchSprite(batchMesh);
        meshTextBatchSprite.meshRenderer.sharedMaterial = atlas.MeshTextBatchTweenMaterial;
        meshTextBatchSprite.meshRenderer.sharedMaterial.renderQueue = Laya.BaseMaterial.RENDERQUEUE_TRANSPARENT + 500;
        // meshTextBatchSprite.transform.localRotationEulerY = 20;
        // meshTextBatchSprite.transform.localPositionZ = 0;
        this.defaultAtlas = atlas;
        this.defaultMeshTextBatchMesh = batchMesh;
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
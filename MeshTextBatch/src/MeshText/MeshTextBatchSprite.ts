import MeshTextAtlas from "./MeshTextAtlas";
import { HorizontalAlignType } from "./HorizontalAlignType";
import MeshTextBatchMesh from "./MeshTextBatchMesh";
import ToolMeshText from "./ToolMeshText";

export default class MeshTextBatchSprite extends Laya.MeshSprite3D 
{
    batchMesh:MeshTextBatchMesh;
    constructor(batchMesh: MeshTextBatchMesh, name?:string )
    {
        super(batchMesh.mesh, name);
        this.batchMesh = batchMesh;
        this.meshRenderer.bounds.setMin(new Laya.Vector3(-999999,-999999, -999999));
        this.meshRenderer.bounds.setMax(new Laya.Vector3(999999, 999999, 999999));
    }



}
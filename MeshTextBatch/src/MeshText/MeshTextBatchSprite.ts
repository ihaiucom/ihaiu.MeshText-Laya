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
    }



}
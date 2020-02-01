import Mesh = Laya.Mesh;
import VertexDeclaration = Laya.VertexDeclaration;
import VertexMesh = Laya.VertexMesh;
import ToolMeshText from "./ToolMeshText";
import MeshTextItem from "./MeshTextItem";
import MeshTextAtlas from "./MeshTextAtlas";
export default class MeshTextBatchMesh
{
    private static UID = 0;
    uid: number = 0;
    private itemPoolKey: string;
    mesh:Mesh;
    onceTextLength:number = 10;
    maxTextNum = 100;
    stringMaxLength = 10 * 100;
    verticesBuffer: Float32Array;
    indicesBuffer: Uint16Array;
    isReshedMesh: boolean = false;

    
    public atlas: MeshTextAtlas;
    constructor(atlas: MeshTextAtlas, onceTextLength:number = 10, maxTextNum: number = 100)
    {
        this.uid = MeshTextBatchMesh.UID ++;
        this.itemPoolKey = "MeshTextItem__" + this.uid;

        this.atlas = atlas;
        var stringMaxLength = onceTextLength * maxTextNum;
        this.onceTextLength = onceTextLength;
        this.maxTextNum = maxTextNum;
        this.stringMaxLength = stringMaxLength;

        var onceTextVerticeCount = (onceTextLength << 2) * 5;
        var verticeCount = (stringMaxLength << 2) * 5;
        var indicesCount = (stringMaxLength << 1) * 3;

        var vertexDeclaration: VertexDeclaration = VertexMesh.getVertexDeclaration("POSITION,UV");
        var verticesBuffer: Float32Array = new Float32Array(verticeCount);
        var indicesBuffer: Uint16Array = new Uint16Array(indicesCount);
        ToolMeshText.SetIndicesBuffer(indicesBuffer);

        // for(var i = 0; i < verticeCount; i ++)
        // {
        //     verticesBuffer[i] = Math.random() * 2 * (Math.random() > 0.5 ? 1 : -1);
        // }

        for(var i = maxTextNum - 1; i >= 0; i --)
        {
            var verticeBeginIndex: number = i * onceTextVerticeCount;
            var verticeEndIndex: number = (i + 1) * onceTextVerticeCount;
            var item = new MeshTextItem(this, i, verticeBeginIndex, verticeEndIndex);
            Laya.Pool.recover(this.itemPoolKey, item);
        }

        this.verticesBuffer = verticesBuffer;
        this.indicesBuffer = indicesBuffer;
        this.mesh = Laya.PrimitiveMesh._createMesh(vertexDeclaration, verticesBuffer, indicesBuffer);
    }

    useItemList:MeshTextItem[] = [];
    GetItem(text: string, position = new Laya.Vector3(0, 0, 0), atlaTypeKey?: any):MeshTextItem
    {
        var item:MeshTextItem = Laya.Pool.getItem(this.itemPoolKey);
        if(item == null)
        {
            if(this.useItemList.length > 0)
            {
                item = this.useItemList.shift();
                item.RecoverPool();
            }
        }
        item.atlaTypeKey = atlaTypeKey;
        item.position = position;
        item.Text = text;
        this.useItemList.push(item);
        return item;
    } 

    private RemoveUseFromList(item:MeshTextItem)
    {

        var index = this.useItemList.indexOf(item);
        if(index != -1)
        {
            this.useItemList.splice(index, 1);
        }
    }

    RecoverItem(item:MeshTextItem)
    {
        Laya.Pool.recover(this.itemPoolKey, item);
        this.RemoveUseFromList(item);
    }

    tweenItemList: MeshTextItem[] = [];

    AddTweenItem(item:MeshTextItem)
    {
        var index = this.tweenItemList.indexOf(item);
        if(index == -1)
        {
            this.tweenItemList.push(item);
        }
    }

    RemoveTweenItem(item:MeshTextItem)
    {
        var index = this.tweenItemList.indexOf(item);
        if(index != -1)
        {
            this.tweenItemList.splice(index, 1);
        }
    }
    StartUpdate()
    {
        Laya.timer.frameLoop(1, this, this.OnLoop);
    }

    StopUpdate()
    {
        Laya.timer.clear(this, this.OnLoop);
    }

    OnLoop()
    {
        if(this.isReshedMesh)
        {
            ToolMeshText.PushGPUVertexBuffer(this.mesh);
            // console.log("PushGPUVertexBuffer");
            this.isReshedMesh = false;
        }
        var delta = Laya.timer.delta * 0.001;
        for(var i = this.tweenItemList.length - 1; i >= 0; i --)
        {
            var item = this.tweenItemList[i];
            item.UpdateTween(delta);
        }
    }

}
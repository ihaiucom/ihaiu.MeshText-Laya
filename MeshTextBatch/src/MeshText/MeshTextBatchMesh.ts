import Mesh = Laya.Mesh;
import VertexDeclaration = Laya.VertexDeclaration;
import VertexMesh = Laya.VertexMesh;
import ToolMeshText from "./ToolMeshText";
import MeshTextItem from "./MeshTextItem";
import MeshTextAtlas from "./MeshTextAtlas";
import MeshTextBatchSprite from "./MeshTextBatchSprite";
export default class MeshTextBatchMesh 
{
    debugItemLoop: boolean = false;
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
    constructor(atlas: MeshTextAtlas, onceTextLength:number = 5, maxTextNum: number = 50)
    {
        this.uid = MeshTextBatchMesh.UID ++;
        this.itemPoolKey = "MeshTextItem__" + this.uid;

        this.atlas = atlas;
        var stringMaxLength = onceTextLength * maxTextNum;
        this.onceTextLength = onceTextLength;
        this.maxTextNum = maxTextNum;
        this.stringMaxLength = stringMaxLength;

        var onceTextVerticeCount = (onceTextLength << 2) * 7;
        var verticeCount = (stringMaxLength << 2) * 7;
        var indicesCount = (stringMaxLength << 1) * 3;

        var vertexDeclaration: VertexDeclaration = VertexMesh.getVertexDeclaration("POSITION,UV,UV1");
        var verticesBuffer: Float32Array = new Float32Array(verticeCount);
        var indicesBuffer: Uint16Array = new Uint16Array(indicesCount);
        ToolMeshText.SetIndicesBuffer(indicesBuffer);

        // uv2.y
        for(var i = 0; i < stringMaxLength; i ++)
        {
            for(var v = 0; v < 4; v ++)
            {
                var ii = i * 4 + v;
                ii = ii * 7 + 6;
                verticesBuffer[ii] = Math.random();
            }
        }


        this.verticesBuffer = verticesBuffer;
        this.indicesBuffer = indicesBuffer;
        this.mesh = Laya.PrimitiveMesh._createMesh(vertexDeclaration, verticesBuffer, indicesBuffer);
        
        for(var i = maxTextNum - 1; i >= 0; i --)
        {
            var verticeBeginIndex: number = i * onceTextVerticeCount;
            var verticeEndIndex: number = (i + 1) * onceTextVerticeCount;
            var item = new MeshTextItem(this, i, verticeBeginIndex, verticeEndIndex);
            Laya.Pool.recover(this.itemPoolKey, item);
        }

    }

    
    textItemCache: Map<any, Map<string, MeshTextItem[]>> = new Map<any, Map<string, MeshTextItem[]>>();

    GetItemCacheByType(text: string, atlaTypeKey: any):MeshTextItem[]
    {
        var typeMap: Map<string, MeshTextItem[]>;
        if(this.textItemCache.has(atlaTypeKey))
        {
            typeMap = this.textItemCache.get(atlaTypeKey);
        }
        else
        {
            typeMap = new Map<string, MeshTextItem[]>();
            this.textItemCache.set(atlaTypeKey, typeMap);
        }

        if(typeMap.has(text))
        {
            return typeMap.get(text);
        }
        else
        {
            var list = [];
            typeMap.set(text, list);
            return list;
        }
    }

    RecoverItemCache(item:MeshTextItem)
    {
        var list = this.GetItemCacheByType(item.Text, item.atlaTypeKey);
        list.push(item);
    }

    
    RemoveFromItemCache(item:MeshTextItem)
    {
        if(!item.atlaTypeKey)
        {
            return;
        }
        var list = this.GetItemCacheByType(item.Text, item.atlaTypeKey);
        var i = list.indexOf(item);
        if(i != -1)
        {
            list.splice(i, 1);
        }
    }

    GetItemCache(text: string, atlaTypeKey: any):MeshTextItem
    {
        var list = this.GetItemCacheByType(text, atlaTypeKey);
        if(list.length > 0)
        {
            var item = list.shift();
            var pool = Laya.Pool.getPoolBySign(this.itemPoolKey);
            var i = pool.indexOf(item);
            if(i != -1)
            {
                pool.splice(i, 1);
            }
            return item;
        }
        return null;
    }

    useItemList:MeshTextItem[] = [];
    GetItem(text: string, position = new Laya.Vector3(0, 0, 0), atlaTypeKey?: any, scale: number = 1.0):MeshTextItem
    {
        // var item:MeshTextItem = this.GetItemCache(text, atlaTypeKey);
        // if(item == null)
        // {
            var item = Laya.Pool.getItem(this.itemPoolKey);
            if(item)
            {
                this.RemoveFromItemCache(item);
            }
        // }


        if(item == null)
        {
            if(this.useItemList.length > 0)
            {
                item = this.useItemList.shift();
                item.Reset();
                this.RemoveTweenItem(item);
                this.RemoveFromItemCache(item);
                // item.RecoverPool();
            }
        }
        
        if(this.atlas.typeScaleMap.has(atlaTypeKey))
        {
            scale = this.atlas.typeScaleMap.get(atlaTypeKey);
        }
        item.atlaTypeKey = atlaTypeKey;
        item.position = position;
        item.scale = scale;
        item.Text = text;
        this.useItemList.push(item);
        return item;
    } 

    PlayItem(text: string, position = new Laya.Vector3(0, 0, 0), atlaTypeKey?: any, scale: number = 1.0, tweenSpeed:number = 1.0):MeshTextItem
    {
        var item:MeshTextItem = this.GetItem(text, position, atlaTypeKey, scale);
        item.tweenSpeed = tweenSpeed;
        item.StartTween();
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
        // this.RecoverItemCache(item);
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

    sprite:MeshTextBatchSprite;

    
    camera: Laya.Camera;
    __parent: Laya.Node;
    __parentIndex:number;
    SetParent(parent: Laya.Node, parentIndex?:number)
    {
        this.__parent = parent;
        this.__parentIndex = parentIndex;
    }


    Show()
    {
        if(this.__parentIndex != undefined)
        {
            this.__parent.addChildAt(this.sprite, this.__parentIndex);
        }
        else
        {
            this.__parent.addChild(this.sprite);
        }
        this.StartUpdate();
    }

    Hide()
    {
        this.Clear();
        this.sprite.removeSelf();
        this.StopUpdate();
    }

    Clear()
    {
        while(this.useItemList.length > 0)
        {
            var item = this.useItemList.shift();
            item.RecoverPool();
        }
        this.tweenItemList.length = 0;
    }

}
import Text = Laya.Text;
import BitmapFont = Laya.BitmapFont;
import Handler = Laya.Handler;
import TextureTextAtlas from "./TextureTextAtlas";
import WarTextureTextItem from "./WarTextureTextItem";
export default class WarTextureText extends Laya.Sprite
{
    debugItemLoop: boolean = false;
    
    private static UID = 0;
    uid: number = 0;
    private itemPoolKey: string;

    textStyleMap: TextureTextAtlas;

    constructor(textStyleMap: TextureTextAtlas)
    {
        super();
        this.uid = WarTextureText.UID ++;
        this.itemPoolKey = "WarTextureTextItem__" + this.uid;
        this.textStyleMap = textStyleMap;
        this.InitItemPool();
    }

    InitItemPool(maxTextNum: number = 100)
    {
        for(var i = maxTextNum - 1; i >= 0; i --)
        {
            var item = new WarTextureTextItem(this, i);
            Laya.Pool.recover(this.itemPoolKey, item);
        }


    }

    
    textItemCache: Map<any, Map<string, WarTextureTextItem[]>> = new Map<any, Map<string, WarTextureTextItem[]>>();

    GetItemCacheByType(text: string, atlaTypeKey: any):WarTextureTextItem[]
    {
        var typeMap: Map<string, WarTextureTextItem[]>;
        if(this.textItemCache.has(atlaTypeKey))
        {
            typeMap = this.textItemCache.get(atlaTypeKey);
        }
        else
        {
            typeMap = new Map<string, WarTextureTextItem[]>();
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

    RecoverItemCache(item:WarTextureTextItem)
    {
        var list = this.GetItemCacheByType(item.Text, item.atlaTypeKey);
        list.push(item);
    }

    
    RemoveFromItemCache(item:WarTextureTextItem)
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

    GetItemCache(text: string, atlaTypeKey: any):WarTextureTextItem
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
    
    useItemList:WarTextureTextItem[] = [];
    GetItem(text: string, position = new Laya.Vector3(0, 0, 0), atlaTypeKey?: any, scale: number = 1.0):WarTextureTextItem
    {
        var item:WarTextureTextItem = this.GetItemCache(text, atlaTypeKey);
        if(item == null)
        {
            item = Laya.Pool.getItem(this.itemPoolKey);
            if(item)
            {
                this.RemoveFromItemCache(item);
            }
        }


        if(item == null)
        {
            if(this.useItemList.length > 0)
            {
                item = this.useItemList.shift();
                item.Clear();
                this.RemoveFromItemCache(item);
                // item.RecoverPool();
            }
        }
        
        if(this.camera)
        {
            this.camera.worldToViewportPoint(position, item.position);
            position = item.position;
        }

        if(this.textStyleMap.typeScaleMap.has(atlaTypeKey))
        {
            scale = this.textStyleMap.typeScaleMap.get(atlaTypeKey);
        }

        item.atlaTypeKey = atlaTypeKey;
        item.position = position;
        item.pos(position.x, position.y);
        item.__scale = scale;
        item.Text = text;
        this.useItemList.push(item);
        return item;
    } 

    PlayItem(text: string, position = new Laya.Vector3(0, 0, 0), atlaTypeKey?: any, scale: number = 1.0, tweenSpeed:number = 1.0):WarTextureTextItem
    {
        var item:WarTextureTextItem = this.GetItem(text, position, atlaTypeKey, scale);
        item.tweenSpeed = tweenSpeed;
        this.addChild(item);
        item.StartTween();
        return item;
    }

    private RemoveUseFromList(item:WarTextureTextItem)
    {
        var index = this.useItemList.indexOf(item);
        if(index != -1)
        {
            this.useItemList.splice(index, 1);
        }
    }

    RecoverItem(item:WarTextureTextItem)
    {
        this.RecoverItemCache(item);
        Laya.Pool.recover(this.itemPoolKey, item);
        this.RemoveUseFromList(item);
    }

    tweenItemList: WarTextureTextItem[] = [];

    AddTweenItem(item:WarTextureTextItem)
    {
        var index = this.tweenItemList.indexOf(item);
        if(index == -1)
        {
            this.tweenItemList.push(item);
        }
    }

    RemoveTweenItem(item:WarTextureTextItem)
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
        var delta = Laya.timer.delta * 0.001;
        for(var i = this.tweenItemList.length - 1; i >= 0; i --)
        {
            var item = this.tweenItemList[i];
            item.UpdateTween(delta);
        }
    }

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
            this.__parent.addChildAt(this, this.__parentIndex);
        }
        else
        {
            this.__parent.addChild(this);
        }
        this.StartUpdate();
    }

    Hide()
    {
        this.Clear();
        this.removeSelf();
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
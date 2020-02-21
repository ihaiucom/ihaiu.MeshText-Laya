import Text = Laya.Text;
import BitmapFont = Laya.BitmapFont;
import Handler = Laya.Handler;
import { TextStyleMap } from "./TextStyleMap";
import { TextStyleType } from "./TextStyleType";
import WarBitmapTextItem from "./WarBitmapTextItem";
export default class WarBitmapText extends Laya.Sprite
{
   
    debugItemLoop: boolean = false;

    private static UID = 0;
    uid: number = 0;
    private itemPoolKey: string;

    fontName: string = "WarFont";
    bitmapFont: BitmapFont;
    textStyleMap: TextStyleMap;

    constructor()
    {
        super();
        
        this.uid = WarBitmapText.UID ++;
        this.itemPoolKey = "WarBitmapTextItem__" + this.uid;
    }

    LoadFont(path: string, callback?:Function)
    {
        var bitmapFont: BitmapFont = new BitmapFont();
        this.bitmapFont = bitmapFont;
        bitmapFont.loadFont(path, new Handler(this, ()=>
        {
            bitmapFont.setSpaceWidth(10);
            Text.registerBitmapFont(this.fontName, bitmapFont);
            if(callback)
            {
                callback();
            }
        }));
    }

    InitItemPool(maxTextNum: number = 100)
    {
        for(var i = maxTextNum - 1; i >= 0; i --)
        {
            var item = new WarBitmapTextItem(this, i);
            Laya.Pool.recover(this.itemPoolKey, item);
        }
    }
    
    textItemCache: Map<any, Map<string, WarBitmapTextItem[]>> = new Map<any, Map<string, WarBitmapTextItem[]>>();

    GetItemCacheByType(text: string, atlaTypeKey: any):WarBitmapTextItem[]
    {
        var typeMap: Map<string, WarBitmapTextItem[]>;
        if(this.textItemCache.has(atlaTypeKey))
        {
            typeMap = this.textItemCache.get(atlaTypeKey);
        }
        else
        {
            typeMap = new Map<string, WarBitmapTextItem[]>();
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

    RecoverItemCache(item:WarBitmapTextItem)
    {
        var list = this.GetItemCacheByType(item.Text, item.atlaTypeKey);
        list.push(item);
    }

    
    RemoveFromItemCache(item:WarBitmapTextItem)
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

    GetItemCache(text: string, atlaTypeKey: any):WarBitmapTextItem
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

    useItemList:WarBitmapTextItem[] = [];
    GetItem(text: string, position = new Laya.Vector3(0, 0, 0), atlaTypeKey?: any, scale: number = 1.0):WarBitmapTextItem
    {
        var item:WarBitmapTextItem = this.GetItemCache(text, atlaTypeKey);
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

        if(!item)
        {
            return null;
        }

        if(this.camera)
        {
            this.camera.worldToViewportPoint(position, item.position);
            position = item.position;
        }
        item.atlaTypeKey = atlaTypeKey;
        item.position = position;
        item.textTF.pos(position.x, position.y);
        item.scale = scale;
        item.Text = text;
        this.useItemList.push(item);
        return item;
    } 

    PlayItem(text: string, position = new Laya.Vector3(0, 0, 0), atlaTypeKey?: any, scale: number = 1.0, tweenSpeed:number = 1.0):WarBitmapTextItem
    {
        var item:WarBitmapTextItem = this.GetItem(text, position, atlaTypeKey, scale);
        if(!item)
        {
            return null;
        }
        item.tweenSpeed = tweenSpeed;
        this.addChild(item.textTF);
        item.StartTween();
        return item;
    }

    private RemoveUseFromList(item:WarBitmapTextItem)
    {
        var index = this.useItemList.indexOf(item);
        if(index != -1)
        {
            this.useItemList.splice(index, 1);
        }
    }

    RecoverItem(item:WarBitmapTextItem)
    {
        this.RecoverItemCache(item);
        Laya.Pool.recover(this.itemPoolKey, item);
        this.RemoveUseFromList(item);
    }

    tweenItemList: WarBitmapTextItem[] = [];

    AddTweenItem(item:WarBitmapTextItem)
    {
        var index = this.tweenItemList.indexOf(item);
        if(index == -1)
        {
            this.tweenItemList.push(item);
        }
    }

    RemoveTweenItem(item:WarBitmapTextItem)
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
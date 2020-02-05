import Text = Laya.Text;
import BitmapFont = Laya.BitmapFont;
import Handler = Laya.Handler;
import WarMaterialTextAtlas from "./WarMaterialTextAtlas";
import WarMaterialTextItem from "./WarMaterialTextItem";
export default class WarMaterialText extends Laya.Sprite3D
{
    debugItemLoop: boolean = false;

    private static UID = 0;
    uid: number = 0;
    private itemPoolKey: string;

    textStyleMap: WarMaterialTextAtlas;

    constructor(textStyleMap: WarMaterialTextAtlas)
    {
        super();
        this.uid = WarMaterialText.UID ++;
        this.itemPoolKey = "WarMaterialText__" + this.uid;
        this.textStyleMap = textStyleMap;
        this.InitItemPool();
    }

    InitItemPool(maxTextNum: number = 100)
    {
        for(var i = maxTextNum - 1; i >= 0; i --)
        {
            var item = new WarMaterialTextItem(this, i);
            Laya.Pool.recover(this.itemPoolKey, item);
        }


    }
    
    useItemList:WarMaterialTextItem[] = [];
    GetItem(text: string, position = new Laya.Vector3(0, 0, 0), atlaTypeKey?: any, scale: number = 1.0):WarMaterialTextItem
    {
        var item:WarMaterialTextItem = Laya.Pool.getItem(this.itemPoolKey);
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
        item.transform.position = position;
        item.Text = text;
        this.useItemList.push(item);
        return item;
    } 

    PlayItem(text: string, position = new Laya.Vector3(0, 0, 0), atlaTypeKey?: any, scale: number = 1.0, tweenSpeed:number = 1.0):WarMaterialTextItem
    {
        var item:WarMaterialTextItem = this.GetItem(text, position, atlaTypeKey, scale);
        item.tweenSpeed = tweenSpeed;
        this.addChild(item);
        item.StartTween();
        return item;
    }

    private RemoveUseFromList(item:WarMaterialTextItem)
    {
        var index = this.useItemList.indexOf(item);
        if(index != -1)
        {
            this.useItemList.splice(index, 1);
        }
    }

    RecoverItem(item:WarMaterialTextItem)
    {
        Laya.Pool.recover(this.itemPoolKey, item);
        this.RemoveUseFromList(item);
    }

    tweenItemList: WarMaterialTextItem[] = [];

    AddTweenItem(item:WarMaterialTextItem)
    {
        var index = this.tweenItemList.indexOf(item);
        if(index == -1)
        {
            this.tweenItemList.push(item);
        }
    }

    RemoveTweenItem(item:WarMaterialTextItem)
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
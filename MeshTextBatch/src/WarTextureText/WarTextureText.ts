import Text = Laya.Text;
import BitmapFont = Laya.BitmapFont;
import Handler = Laya.Handler;
import TextureTextAtlas from "./TextureTextAtlas";
import WarTextureTextItem from "./WarTextureTextItem";
export default class WarTextureText extends Laya.Sprite
{
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
    
    useItemList:WarTextureTextItem[] = [];
    GetItem(text: string, position = new Laya.Vector3(0, 0, 0), atlaTypeKey?: any, scale: number = 1.0):WarTextureTextItem
    {
        var item:WarTextureTextItem = Laya.Pool.getItem(this.itemPoolKey);
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
        item.pos(position.x, position.y);
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


}
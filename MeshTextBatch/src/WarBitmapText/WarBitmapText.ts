import Text = Laya.Text;
import BitmapFont = Laya.BitmapFont;
import Handler = Laya.Handler;
import { TextStyleMap } from "./TextStyleMap";
import { TextStyleType } from "./TextStyleType";
import WarBitmapTextItem from "./WarBitmapTextItem";
export default class WarBitmapText extends Laya.Sprite
{
    static default: WarBitmapText;
    static async LoadDefaultAsync(): Promise<WarBitmapText>
    {
        this.default = new WarBitmapText();
        var style = new TextStyleMap();
        this.default.textStyleMap = style;
        style.GenerateNumType("012345679", TextStyleType.White);
        style.GenerateNumType("qwertyuiop", TextStyleType.Red);
        style.GenerateNumType("asdfghjkl;", TextStyleType.Green);
        style.GenerateNumType("zxcvbnm,./", TextStyleType.YelloBig);
        style.GenerateNumType("零一二三四五六七八九", TextStyleType.WhiteBig);
        style.AddToAllType("d", "闪");
        style.AddToAllType("c", "暴");
        style.AddToType("c", "爆", TextStyleType.Red);

        return new Promise<WarBitmapText>((resolve)=>
        {
            this.default.LoadFont("res/font/WarFont-export.fnt", ()=>
            {
                this.default.InitItemPool();
                resolve(this.default);
            });
         });
    }

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
    
    useItemList:WarBitmapTextItem[] = [];
    GetItem(text: string, position = new Laya.Vector3(0, 0, 0), atlaTypeKey?: any, scale: number = 1.0):WarBitmapTextItem
    {
        var item:WarBitmapTextItem = Laya.Pool.getItem(this.itemPoolKey);
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
        item.textTF.pos(position.x, position.y);
        item.scale = scale;
        item.Text = text;
        this.useItemList.push(item);
        return item;
    } 

    PlayItem(text: string, position = new Laya.Vector3(0, 0, 0), atlaTypeKey?: any, scale: number = 1.0, tweenSpeed:number = 1.0):WarBitmapTextItem
    {
        var item:WarBitmapTextItem = this.GetItem(text, position, atlaTypeKey, scale);
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


}
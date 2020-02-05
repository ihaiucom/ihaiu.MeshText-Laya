
import Vector2 = Laya.Vector2;
import Vector3 = Laya.Vector3;
import Tween = Laya.Tween;
import Ease = Laya.Ease;
import WarTextureText from "./WarTextureText";
export default class WarTextureTextItem extends Laya.Sprite
{
    bitmapText: WarTextureText;
    public index:number = 0;
    public atlaTypeKey: any;
    private _text: string = "";
    private spriteList: Laya.Sprite[] = [];
    public __scale = 1;
    constructor(bitmapText: WarTextureText, index?:number)
    {
        super();
        this.bitmapText = bitmapText;
        this.index = index;
    }

    
    public get Text():string
    {
        return this._text;
    }

    public set Text(value: string)
    {
        if(this._text == value)
        {
            return;
        }

        if(value === undefined || value === null)
        {
            value = "";
        }


        for(var sprite of this.spriteList)
        {
            sprite.removeSelf();
            this.bitmapText.textStyleMap.RecoverChartSprite(sprite);
        }
        this.spriteList.length = 0;

        var x = -value.length * 25;
        for(var i = 0, len = value.length; i < len; i ++)
        {
            var sprite = this.bitmapText.textStyleMap.GetChartSprite(value[i], this.atlaTypeKey);
            // sprite.scale(this.__scale, this.__scale);
            sprite.x = x;
            x += sprite.width;
            // x += sprite.width * this.__scale;
            this.addChild(sprite);
            this.spriteList.push(sprite);
        }
        // this.width = x;
        this.pivotX = 0.5;
        this.pivotY = 0.5;
    }

    public position: Vector3 = new Vector3();

    
    private startX:number = 0;

    private startY:number = 0;
    public tweenRate = 0;
    public StartTween()
    {
        this.tweenRate = 0;
        this.tweenValue = 0;
        // this.bitmapText.AddTweenItem(this);
        
        let ratio = Number(Math.random().toFixed(2));
        this.startX = this.x = (this.x - 40 + 80 * ratio);
        this.startY = this.y = (this.y - 80 * ratio);

        this.scale(0,0);
        this.alpha = 1.0;

        Tween.to(this, { scaleX: 1.5, scaleY: 1.5 }, 144, Ease.linearNone, null, 0, false);
        Tween.to(this, { scaleX: 0.8, scaleY: 0.8 }, 144, Ease.linearNone, null, 144, false);
        Tween.to(this, { y: this.startY - 80,alpha: 0.0 }, 400, Ease.linearNone, Laya.Handler.create(this, this.OnTweenEnd), 448, false);
    
    }

    public tweenSpeed: number = 1;
    private speedRandom = Math.random() * 0.5 + 0.7;
    private tweenValue = 0;
    public UpdateTween(delta: number)
    {
        this.tweenRate += delta   * this.tweenSpeed;
        // this.tweenValue = Mathf.Lerp(this.tweenValue, 1.0, this.tweenRate);
        // this.tweenValue = Mathf.Lerp(0, 1.0, this.tweenRate);
        this.tweenValue = Mathf.Lerp(this.tweenValue * 0.25, 1.0, this.tweenRate);


        if(this.tweenValue >= 1)
        {
            this.RecoverPool();
        }
    }

    Clear()
    {
        Tween.clearAll(this);
    }

    OnTweenEnd()
    {
        Tween.clearAll(this);
        if(this.bitmapText.debugItemLoop)
        {
            this.pos(this.position.x, this.position.y);
            this.StartTween();
            return;
        }
        this.RecoverPool();
    }

    public RecoverPool()
    {
        this.removeSelf();
        Tween.clearAll(this);
        this.bitmapText.RemoveTweenItem(this);
        this.bitmapText.RecoverItem(this);
    }

}
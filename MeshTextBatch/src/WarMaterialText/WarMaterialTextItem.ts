
import Vector2 = Laya.Vector2;
import Vector3 = Laya.Vector3;
import Tween = Laya.Tween;
import Ease = Laya.Ease;
import WarMaterialText from "./WarMaterialText";
import Tool from "../MeshText/Tool";
export default class WarMaterialTextItem extends Laya.Sprite3D
{
    bitmapText: WarMaterialText;
    public index:number = 0;
    public atlaTypeKey: any;
    private _text: string = "";
    private spriteList: Laya.MeshSprite3D[] = [];
    constructor(bitmapText: WarMaterialText, index?:number)
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
        if(value === undefined || value === null)
        {
            value = "";
        }

        if(this._text == value)
        {
            return;
        }

        for(var sprite of this.spriteList)
        {
            sprite.removeSelf();
            this.bitmapText.textStyleMap.RecoverChartSprite(sprite);
        }
        this.spriteList.length = 0;

        var x = 0;
        for(var i = 0, len = value.length; i < len; i ++)
        {
            var sprite = this.bitmapText.textStyleMap.GetChartSprite(value[i], this.atlaTypeKey);
            sprite.transform.localPositionX = i;
            this.addChild(sprite);
            this.spriteList.push(sprite);

        //       let boxLineSprite3D = this.addChild(new Laya.PixelLineSprite3D(100));
        // Tool.linearModel(sprite, boxLineSprite3D, Laya.Color.GREEN);
        }
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
        this.startY = this.transform.localPositionY;

        this.transform.scale = new Vector3(0, 0, 1);
        // this.scale(0,0);
        // this.alpha = 1.0;
        Tween.to(this.transform, { localScaleX: 1.5, localScaleY: 1.5 }, 144, Ease.linearNone, null, 0, false);
        Tween.to(this.transform, { localScaleX: 0.8, localScaleY: 0.8 }, 144, Ease.linearNone, null, 144, false);
        Tween.to(this.transform, { localPositionY: this.startY + 1 }, 400, Ease.linearNone, Laya.Handler.create(this, this.OnTweenEnd), 448, false);
    
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

    OnTweenEnd()
    {
        Tween.clearAll(this.transform);
        if(this.bitmapText.debugItemLoop)
        {
            this.transform.position = this.position;
            this.StartTween();
            return;
        }
        this.RecoverPool();
    }

    public RecoverPool()
    {
        this.removeSelf();
        Tween.clearAll(this.transform);
        this.bitmapText.RemoveTweenItem(this);
        this.bitmapText.RecoverItem(this);
    }

}
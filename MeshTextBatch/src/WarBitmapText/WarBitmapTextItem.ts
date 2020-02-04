import WarBitmapText from "./WarBitmapText";
import Vector2 = Laya.Vector2;
import Vector3 = Laya.Vector3;
import Tween = Laya.Tween;
import Ease = Laya.Ease;
export default class WarBitmapTextItem
{
    bitmapText: WarBitmapText;
    textTF:Laya.Text;
    public index:number = 0;
    public atlaTypeKey: any;
    public scale: number = 1;
    private _text: string = "";
    constructor(bitmapText: WarBitmapText, index?:number)
    {
        this.bitmapText = bitmapText;
        this.index = index;

        var tf = new Laya.Text();
        tf.font = bitmapText.fontName;
        tf.width = 250;
        tf.height = 50;
        tf.pivotX = 0.5;
        tf.pivotY = 0.5;
        this.textTF = tf;
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

        if(this.bitmapText.textStyleMap)
        {
            value == this.bitmapText.textStyleMap.GetCharts(value, this.atlaTypeKey);
        }
        if(this._text == value)
        {
            return;
        }

        this.textTF.text = value;

    }

    public position: Vector3 = new Vector3();

    
    private startX:number = 0;

    private startY:number = 0;
    public tweenRate = 0;
    public StartTween()
    {
        var textTF = this.textTF;
        this.tweenRate = 0;
        this.tweenValue = 0;
        // this.bitmapText.AddTweenItem(this);
        
        let ratio = Number(Math.random().toFixed(2));
        this.startX = textTF.x = (textTF.x - 40 + 80 * ratio);
        this.startY = textTF.y = (textTF.y - 80 * ratio);

        textTF.scale(0,0);
        textTF.alpha = 1.0;

        Tween.to(textTF, { scaleX: 1.5, scaleY: 1.5 }, 144, Ease.linearNone, null, 0, false);
        Tween.to(textTF, { scaleX: 0.8, scaleY: 0.8 }, 144, Ease.linearNone, null, 144, false);
        Tween.to(textTF, { y: this.startY - 80,alpha: 0.0 }, 400, Ease.linearNone, Laya.Handler.create(this, this.RecoverPool), 448, false);
    
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


    public RecoverPool()
    {
        this.textTF.removeSelf();
        Tween.clearAll(this.textTF);
        this.bitmapText.RemoveTweenItem(this);
        this.bitmapText.RecoverItem(this);
    }

}
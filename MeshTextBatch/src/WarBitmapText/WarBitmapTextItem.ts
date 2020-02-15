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
    private _text2: string = "";
    constructor(bitmapText: WarBitmapText, index?:number)
    {
        this.bitmapText = bitmapText;
        this.index = index;

        var tf = new Laya.Text();
        tf.font = bitmapText.fontName;
        tf.align = "center";
        tf.width = 250;
        tf.height = 50;
        tf.pivotX = 0.5 * tf.width;
        tf.pivotY = 0.5 * tf.height;
        this.textTF = tf;
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
        var str = value;
        if(this.bitmapText.textStyleMap)
        {
            str = this.bitmapText.textStyleMap.GetCharts(value, this.atlaTypeKey);
        }
        if(this._text2 == str)
        {
            return;
        }
        this._text = value;
        this._text2 = str;

        this.textTF.changeText(str);
        // this.textTF.text = str;
        // window['tf'] = this.textTF;

    }

    public position: Vector3 = new Vector3();

    
    private startX:number = 0;

    private startY:number = 0;
    private endY:number = 0;
    public tweenRate = 0;
    public StartTween()
    {
        var textTF = this.textTF;
        this.tweenRate = 0;
        this.tweenValue = 0;
        
        let ratio = Number(Math.random().toFixed(2));
        this.startX = textTF.x = (textTF.x - 40 + 80 * ratio);
        this.startY = textTF.y = (textTF.y - 80 * ratio);
        this.endY = this.startY - 80;

        textTF.scale(0,0);
        textTF.alpha = 1.0;
        this.bitmapText.AddTweenItem(this);

        // Tween.to(textTF, { scaleX: 1.5, scaleY: 1.5 }, 144, Ease.linearNone, null, 0, false);
        // Tween.to(textTF, { scaleX: 0.8, scaleY: 0.8 }, 144, Ease.linearNone, null, 144, false);
        // Tween.to(textTF, { y: this.startY - 80,alpha: 0.0 }, 400, Ease.linearNone, Laya.Handler.create(this, this.OnTweenEnd), 448, false);
    
    }

    public tweenSpeed: number = 1;
    private speedRandom = Math.random() * 0.5 + 0.7;
    private tweenValue = 0;
    public UpdateTween(delta: number)
    {
        var t = this.tweenRate += delta   * this.tweenSpeed;
        // this.tweenValue = Mathf.Lerp(this.tweenValue * 0.25, 1.0, this.tweenRate);

        if(t < 0.17)
        {
            var scale = Mathf.Lerp(0, 1.5, t / 0.17);
            this.textTF.scale(scale, scale);
        }
        else if(t < 0.34)
        {
            var scale = Mathf.Lerp(1.5, 0.8, (t - 0.17) / 0.17);
            this.textTF.scale(scale, scale);
        }
        else if(t > 0.52)
        {
		    t = (t - 0.52) / 0.48;
            this.textTF.y = Mathf.Lerp(this.startY, this.endY, t);
            this.textTF.alpha = 1 - t;
        }

        if(this.tweenRate >= 1)
        {
            this.OnTweenEnd();
        }
    }

    Clear()
    {
        Tween.clearAll(this.textTF);
        this.bitmapText.RemoveTweenItem(this);
    }

    OnTweenEnd()
    {
        Tween.clearAll(this.textTF);
        if(this.bitmapText.debugItemLoop)
        {
            this.textTF.pos(this.position.x, this.position.y);
            this.StartTween();
            return;
        }
        this.RecoverPool();
    }

    public RecoverPool()
    {
        this.textTF.removeSelf();
        Tween.clearAll(this.textTF);
        this.bitmapText.RemoveTweenItem(this);
        this.bitmapText.RecoverItem(this);
    }

}
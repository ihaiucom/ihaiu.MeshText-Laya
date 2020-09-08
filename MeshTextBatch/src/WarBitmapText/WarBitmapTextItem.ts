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
        // tf.valign = "middle";
        tf.width = 250;
        tf.height = 38;
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

    public unitId: number = -1;
    public offsetY: number = 0;
    public offsetYEnd: number = 0;
    
    private startX:number = 0;
    private startY:number = 0;
    public tweenRate = 0;
    
    public StartTween()
    {
        var textTF = this.textTF;
        this.tweenRate = 0;
        this.tweenValue = 0;
        

        this.offsetY = 0;
        this.offsetYEnd = 0;
        this.startX = textTF.x;
        this.startY = textTF.y;

        textTF.scale(0.85,0.85);
        textTF.alpha = 1.0;
        this.bitmapText.AddTweenItem(this);
    }

    public tweenSpeed: number = 1;
    private speedRandom = Math.random() * 0.5 + 0.7;
    private tweenValue = 0;
    
    public UpdateTween(delta: number)
    {
        // var frameKeys = [0, 0.01, 0.04, 0.09, 0.20];
        // var frameKeys = [0, 0.05, 0.2, 0.45, 1.0];
        delta *= this.tweenSpeed;
        var t = this.tweenRate += delta;
        if(this.offsetYEnd < this.offsetY)
        {
            this.offsetY = Mathf.Lerp(this.offsetY, this.offsetYEnd, 0.5);
            // this.offsetY =this.offsetYEnd;
        }

        if(t < 0.05)
        {
            var scale = Mathf.Lerp(0.85, 1.3, t / 0.05);
            this.textTF.scale(scale, scale);
        }
        else if(t < 0.2)
        {
            var r = (t - 0.05) / 0.15;
            var scale = Mathf.Lerp(1.3, 1, r);
            this.textTF.scale(scale, scale);
        }

        if(t < 0.05)
        {
            this.textTF.y = this.offsetY + this.startY;
        }
        else if(t < 0.45)
        {
            var r = (t - 0.05) / 0.4;
            this.textTF.y = this.offsetY + this.startY + Mathf.Lerp(0, -10, r);
        }
        else
        {
            var r = (t - 0.45) / 0.55;
            this.textTF.y = this.offsetY + this.startY - 10 + Mathf.Lerp(0, -30, r);
            this.textTF.alpha = 1 - r;
        }



        if(this.tweenRate >= 1)
        {
            this.OnTweenEnd();
        }
    }


    Clear()
    {
        this.bitmapText.RemoveTweenItem(this);
    }

    OnTweenEnd()
    {
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
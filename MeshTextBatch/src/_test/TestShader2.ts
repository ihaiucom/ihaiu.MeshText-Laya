import { TestScene } from "./TestSene";

import Mesh = Laya.Mesh;
import Texture2D = Laya.Texture2D;
import Tool from "../MeshText/Tool";
import MeshTextAtlas from "../MeshText/MeshTextAtlas";
import { MeshTextType } from "../MeshText/MeshTextType";
import ToolRotation from "./ToolRotation";
import BitmapFont = Laya.BitmapFont;
	import Stage = Laya.Stage;
	import Text = Laya.Text;
	import Browser = Laya.Browser;
	import Handler = Laya.Handler;
	import WebGL = Laya.WebGL;

export default class TestShader2
{
    scene: TestScene;
    constructor()
    {
        this.scene = TestScene.create();
        Laya.stage.addChild(this.scene);
        // this.loadPrefab();
        // this.InitAsync();
        // this.TestTextMesh();
        this.loadFont();
    }

    async InitAsync()
    {
        // let box:Laya.MeshSprite3D = <Laya.MeshSprite3D> this.scene.addChild(new Laya.MeshSprite3D(Laya.PrimitiveMesh.createBox(0.5, 0.5, 0.5)));
       
        // let box:Laya.MeshSprite3D = <Laya.MeshSprite3D> this.scene.addChild(new Laya.MeshSprite3D(MeshText.createBox(0.5, 0.5, 0.5)));
        // box.transform.position = new Laya.Vector3(0, 0, 0);
        // box.transform.rotate(new Laya.Vector3(0, 45, 0), false, false);
        // let boxLineSprite3D = this.scene.addChild(new Laya.PixelLineSprite3D(100));
        // Tool.linearModel(box, boxLineSprite3D, Laya.Color.GREEN);
    }


    strList = [];
   
    private fontName: string = "diyFont";
    private loadFont(): void {
        var bitmapFont: BitmapFont = new BitmapFont();
        bitmapFont.loadFont("res/font/WarFont-export.fnt", new Handler(this, this.onFontLoaded, [bitmapFont]));
    }

    private onFontLoaded(bitmapFont: BitmapFont): void {
        bitmapFont.setSpaceWidth(10);
        Text.registerBitmapFont(this.fontName, bitmapFont);

        for(var j = 0; j <= 100; j ++)
        {
            if(Random.range(1,10) > 8)
            {
                str = "d";
                this.strList[j] = str;
                continue;
            }
            // var str = "cd";
            var str = "";
            if(Random.range(1,10) > 7)
            {
                str = "c";
            }
            var num = Random.range(1,5);
            for(var i = 0; i <= num; i ++)
            {
                str += Random.rangeBoth(0,9).toString();
            }
            this.strList[j] = str;
        }
        // this.createText(this.fontName);
        for(var i= 0; i < 100; i ++)
        {
            this.createText(this.fontName);
        }

        // this.createText(this.fontName);
    }

    private createText(font: string): void {
        var txt: Text = new Text();
        txt.width = Laya.stage.width  -30;
        txt.wordWrap = true;
        txt.text = this.strList[Random.range(0,this.strList.length)];
        // txt.text = "0123456789";
        // txt.text = "闪爆暴0123456789qwertyuiopasdfghjkl;zxcvbnm,./零一二三四五六七八九";
        // if(Random.range(0, 10) > 5)
        {
            txt.font = font;
        }
        // txt.leading = 5;
        // txt.pos(200, Laya.stage.height * 0.5);
        txt.pos(Laya.stage.width * (Math.random() * 0.8 + 0.1) , Laya.stage.height * (Math.random() * 0.8 + 0.1));
        Laya.stage.addChild(txt);
        
        var y = txt.y;
        var fun = ()=>{

            txt.text = this.strList[Random.range(0,this.strList.length)];
            txt.y = y;
            // var scale = Math.random() * 2 + 0.6;
            // txt.scale(scale, scale);
            Laya.Tween.to(txt, {y : txt.y - 100}, 1000, Laya.Ease.linearNone, null, 0, false);
   
            Laya.timer.once(Random.range(1000,2000), this,fun);
        }

        Laya.timer.once(100, this,fun);
    }

}
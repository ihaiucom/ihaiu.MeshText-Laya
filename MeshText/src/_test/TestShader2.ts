import { TestScene } from "./TestSene";

import Mesh = Laya.Mesh;
import Texture2D = Laya.Texture2D;
import Tool from "../MeshText/Tool";
import MeshText from "../MeshText/MeshText";
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

    async TestTextMesh()
    {
        var isShowLine = false;
        var texturePath: string, atlasPath: string;
        texturePath = "res/font/WarMeshText.png";
        atlasPath = "res/font/WarMeshText.txt";
        var atlas = await MeshTextAtlas.CreateAsync(texturePath, atlasPath);
        console.log(atlas);
        atlas.GenerateNumType(MeshTextType.white);
        atlas.GenerateNumType(MeshTextType.red);
        atlas.GenerateNumType(MeshTextType.green);
        atlas.AddToAllType("c");
        atlas.AddToAllType("d");

        
        for(var j = 0; j <= 100; j ++)
        {
            var str = "cd";
            for(var i = 0; i <= 9; i ++)
            {
                str += Random.rangeBoth(0,9).toString();
            }
            this.strList[j] = str;
        }

        // this.createText(atlas, isShowLine);
        for(var i= 0; i < 100; i ++)
        {
            
            this.createText2(atlas, isShowLine, new Laya.Vector3(Random.range(-5, 5) , Random.range(-5, 5) , -i * 0.2));

        }
        
        // ToolRotation.Start(textSprite, new Laya.Vector3(0, 1, 0));
    }

    strList = [];
    createText2(atlas, isShowLine, position = new Laya.Vector3(0, 0, 0))
    {
        var mestText = new MeshText();
        mestText.Init(atlas, MeshTextType.white);
        mestText.Text = "cd0123456789";
        window['mestText'] = mestText;

        var textSprite:Laya.MeshSprite3D = <Laya.MeshSprite3D> this.scene.addChild(new Laya.MeshSprite3D(mestText.mesh));
        textSprite.transform.position = position;
        textSprite.meshRenderer.sharedMaterial = atlas.UnlitMaterial;
        // textSprite._isStatic = true;
        if(isShowLine)
        {
            var boxLineSprite3D = this.scene.addChild(new Laya.PixelLineSprite3D(100));
            // Tool.linearModel(textSprite, boxLineSprite3D, Laya.Color.GREEN);
        }

        var fun = ()=>{
            mestText.Text = this.strList[Random.range(0,this.strList.length)];
            
            Laya.timer.once(Random.range(50,100), this,fun);
        }

        Laya.timer.once(100, this,fun);
    }

    private fontName: string = "diyFont";
    private loadFont(): void {
        var bitmapFont: BitmapFont = new BitmapFont();
        bitmapFont.loadFont("res/font/test.fnt", new Handler(this, this.onFontLoaded, [bitmapFont]));
    }

    private onFontLoaded(bitmapFont: BitmapFont): void {
        bitmapFont.setSpaceWidth(10);
        Text.registerBitmapFont(this.fontName, bitmapFont);


        for(var j = 0; j <= 100; j ++)
        {
            var str = "cd";
            for(var i = 0; i <= 9; i ++)
            {
                str += Random.rangeBoth(0,9).toString();
            }
            this.strList[j] = str;
        }

        // this.createText(atlas, isShowLine);
        for(var i= 0; i < 100; i ++)
        {
            this.createText(this.fontName);
        }

        this.createText(this.fontName);
    }

    private createText(font: string): void {
        var txt: Text = new Text();
        txt.width = 250;
        txt.wordWrap = true;
        txt.text = this.strList[Random.range(0,this.strList.length)];
        if(Random.range(0, 10) > 5)
        {
            txt.font = font;
        }
        txt.leading = 5;
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
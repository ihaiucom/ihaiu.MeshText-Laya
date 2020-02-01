import { TestScene } from "./TestSene";

import Mesh = Laya.Mesh;
import Texture2D = Laya.Texture2D;
import Tool from "../MeshText/Tool";
import MeshTextAtlas from "../MeshText/MeshTextAtlas";
import { MeshTextType } from "../MeshText/MeshTextType";
import ToolRotation from "./ToolRotation";
import MeshTextBatchSprite from "../MeshText/MeshTextBatchSprite";
import MeshTextBatchMesh from "../MeshText/MeshTextBatchMesh";


export default class TestShader
{
    scene: TestScene;
    constructor()
    {
        this.scene = TestScene.create();
        Laya.stage.addChild(this.scene);
        // this.loadPrefab();
        // this.InitAsync();
        this.TestTextMesh();
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
        var isShowLine = true;
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

        var batchMesh:MeshTextBatchMesh = new MeshTextBatchMesh(atlas);
        batchMesh.StartUpdate();
        window['batchMesh'] = batchMesh;
        var meshTextBatchSprite = new MeshTextBatchSprite(batchMesh);
        meshTextBatchSprite.meshRenderer.sharedMaterial = atlas.UnlitMaterial;
        this.scene.addChild(meshTextBatchSprite);
        if(isShowLine)
        {
            // var boxLineSprite3D = this.scene.addChild(new Laya.PixelLineSprite3D(100));
            // Tool.linearModel(meshTextBatchSprite, boxLineSprite3D, Laya.Color.GREEN);
        }
        
        for(var j = 0; j <= 100; j ++)
        {
            // var str = "cd";
            var str = "";
            var num = Random.range(1,5);
            for(var i = 0; i <= num; i ++)
            {
                str += Random.rangeBoth(0,9).toString();
            }
            this.strList[j] = str;
        }

        // this.createText(batchMesh, new Laya.Vector3(0, 0, 0));
        for(var i= 0; i < 100; i ++)
        {
            this.createText(batchMesh,  new Laya.Vector3(Math.random() * 10 + -5 , Math.random() * 10 + -7 , 0));
            
        }
        
        // ToolRotation.Start(textSprite, new Laya.Vector3(0, 1, 0));
    }

    atlasKeyTypeList = [MeshTextType.white, MeshTextType.red, MeshTextType.green];
    strList = [];
    createText(batchMesh:MeshTextBatchMesh,  position = new Laya.Vector3(0, 0, 0))
    {
        var text = this.strList[Random.range(0,this.strList.length)];
        var atlasKeyType = this.atlasKeyTypeList[Random.range(0,this.atlasKeyTypeList.length)];
        var item = batchMesh.GetItem(text, position, atlasKeyType);
        item.StartTween();
        // var mestText = new MeshText();
        // mestText.Init(atlas, MeshTextType.white, true);
        // mestText.Text = "cd0123456789";
        // window['mestText'] = mestText;

        // var scale = Math.random() * 0.5 + 0.2;
        // mestText.transform.position = position;
        // mestText.transform.localScale = new Laya.Vector3(scale, scale, scale);
        // mestText._isStatic = true;
        // this.scene.addChild(mestText);
        // // textSprite._isStatic = true;
        // if(isShowLine)
        // {
        //     var boxLineSprite3D = this.scene.addChild(new Laya.PixelLineSprite3D(100));
        //     // Tool.linearModel(textSprite, boxLineSprite3D, Laya.Color.GREEN);
        // }

        // var position2 = position.clone();
        // position2.y += 3;
        // mestText.tweenEndPos = position2;
        var fun = ()=>{
            this.createText(batchMesh,  new Laya.Vector3(Math.random() * 8 + -4 , Math.random() * 3 + -4 , 0));
           
            // item.Text = this.strList[Random.range(0,this.strList.length)];
            // // mestText.transform.position = position;
            // // mestText.tweenRate = 0;
            // // Laya.Tween.to(mestText, {tweenRate : 1}, 1000, Laya.Ease.linearNone, null, 0, false);
            
            // Laya.timer.once(Random.range(100,200), this,fun);
        }

        Laya.timer.once(Random.range(250,600), this, fun);
    }

}
import { TestScene } from "./TestSene";

import Mesh = Laya.Mesh;
import Texture2D = Laya.Texture2D;
import Tool from "../MeshText/Tool";
import MeshTextAtlas from "../MeshText/MeshTextAtlas";
import { MeshTextType } from "../MeshText/MeshTextType";
import ToolRotation from "./ToolRotation";
import MeshTextBatchSprite from "../MeshText/MeshTextBatchSprite";
import MeshTextBatchMesh from "../MeshText/MeshTextBatchMesh";
import MeshTextLib from "../MeshText/MeshTextLib";


export default class TestShader
{
    scene: TestScene;
    constructor()
    {
        this.scene = TestScene.create();
        Laya.stage.addChild(this.scene);
        // this.loadPrefab();
        this.InitAsync();
    }

    async InitAsync()
    {
        await MeshTextLib.InitAsync();
        this.TestTextMesh();

        // let box:Laya.MeshSprite3D = <Laya.MeshSprite3D> this.scene.addChild(new Laya.MeshSprite3D(Laya.PrimitiveMesh.createBox(0.5, 0.5, 0.5)));
       
        // let box:Laya.MeshSprite3D = <Laya.MeshSprite3D> this.scene.addChild(new Laya.MeshSprite3D(MeshText.createBox(0.5, 0.5, 0.5)));
        // box.transform.position = new Laya.Vector3(0, 0, 0);
        // box.transform.rotate(new Laya.Vector3(0, 45, 0), false, false);
        // let boxLineSprite3D = this.scene.addChild(new Laya.PixelLineSprite3D(100));
        // Tool.linearModel(box, boxLineSprite3D, Laya.Color.GREEN);
    }

    async TestTextMesh()
    {
        await MeshTextLib.LoadDefalutAsync();

        
        var batchMesh:MeshTextBatchMesh = MeshTextLib.defaultMeshTextBatchMesh
        batchMesh.StartUpdate();
        window['batchMesh'] = batchMesh;
        this.scene.addChild(MeshTextLib.defaultMeshTextBatchSprite);

        
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

        // this.createText(batchMesh, new Laya.Vector3(0, 0, 0));
        for(var i= 0; i < 100; i ++)
        {
            this.createText(batchMesh,  new Laya.Vector3(Math.random() * 8 + -4 , Math.random() * 3 + -2 , 0));
            
            // Laya.timer.once(Random.range(100,200) * i, this, ()=>{

            //     this.createText(batchMesh,  new Laya.Vector3(Math.random() * 0 + 0 , Math.random() * 0 + 0 , 0));
            // });
        }
        
        // ToolRotation.Start(textSprite, new Laya.Vector3(0, 1, 0));
    }

    atlasKeyTypeList = [MeshTextType.white, MeshTextType.red, MeshTextType.green];
    strList = [];
    createText(batchMesh:MeshTextBatchMesh,  position = new Laya.Vector3(0, 0, 0))
    {
        var text = this.strList[Random.range(0,this.strList.length)];
        var atlasKeyType = this.atlasKeyTypeList[Random.range(0,this.atlasKeyTypeList.length)];
        var item = batchMesh.PlayItem(text, position, atlasKeyType, 0.5, 1.5);
        
        var fun = ()=>{
            this.createText(batchMesh,  position);
           
          
        }

        Laya.timer.once(Random.range(250,600), this, fun);
    }

}
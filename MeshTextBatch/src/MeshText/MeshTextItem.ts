import Mesh = Laya.Mesh;
import Vector4 = Laya.Vector4;
import Vector3 = Laya.Vector3;
import Vector2 = Laya.Vector2;
import Color = Laya.Color;
import Rectangle = Laya.Rectangle;

import WebGLContext = Laya.WebGLContext;
import IndexBuffer3D = Laya.IndexBuffer3D;
import VertexMesh = Laya.VertexMesh;
import VertexBuffer3D = Laya.VertexBuffer3D;
import VertexDeclaration = Laya.VertexDeclaration;
import Quaternion = Laya.Quaternion;
import SubMesh = Laya.SubMesh;
import LayaGL = Laya.LayaGL;
import IndexFormat = Laya.IndexFormat;
import MeshTextAtlas from "./MeshTextAtlas";
import ToolMeshText from "./ToolMeshText";
import ToolMeshTextMeshCache from "./ToolMeshTextMeshCache";
import { HorizontalAlignType } from "./HorizontalAlignType";
import MeshTextBatchMesh from "./MeshTextBatchMesh";


export default class MeshTextItem
{
    public meshTextBatchMesh: MeshTextBatchMesh;
    public batchIndex:number = 0;
    public verticeBeginIndex: number = 0;
    public verticeEndIndex: number = 0;

    public atlaTypeKey: any;
    public hAlignType: HorizontalAlignType = HorizontalAlignType.Center;
    public scale: number = 0.5;
    private _text: string = "";

    get verticesBuffer(): Float32Array
    {
        return this.meshTextBatchMesh.mesh._vertexBuffer.getFloat32Data();
    }

    get atlas(): MeshTextAtlas
    {
        return this.meshTextBatchMesh.atlas;
    }


    private textLength: number = 0;
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

        this.textLength = value.length;
        this._text = value;
        
        this.Reset();
        ToolMeshText.SetVerticesSubBuffer(
            this.verticesBuffer, 
            this.verticeBeginIndex,
            this.scale,
            this.position,
            this._text,
            this.hAlignType,
            this.atlas,
            this.atlaTypeKey
        );
        this.meshTextBatchMesh.isReshedMesh = true;
    }

    public position1: Vector3 = new Vector3();
    public position2: Vector3 = new Vector3();
    public positionSub: Vector3 = new Vector3();
    public position: Vector3 = new Vector3();

    constructor(meshTextBatchMesh: MeshTextBatchMesh, batchIndex:number, verticeBeginIndex: number, verticeEndIndex: number)
    {
        this.meshTextBatchMesh = meshTextBatchMesh;
        this.batchIndex = batchIndex;
        this.verticeBeginIndex = verticeBeginIndex;
        this.verticeEndIndex = verticeEndIndex;
    }

    Reset()
    {
        this.tweenRate = 0;

        this.verticesBuffer.fill(0, this.verticeBeginIndex, this.verticeEndIndex);
        this.meshTextBatchMesh.isReshedMesh = true;
    }

    public tweenRate = 0;
    public StartTween()
    {
        this.tweenRate = 0;
        this.position1.x = this.position.x;
        this.position1.y = this.position.y;
        this.position1.z = this.position.z;

        this.position2.x = this.position.x;
        this.position2.y = this.position.y + 2;
        this.position2.z = this.position.z;

        this.meshTextBatchMesh.AddTweenItem(this);
        
    }

    public UpdateTween(delta: number)
    {
        this.tweenRate += delta;
        this.position.x = Mathf.Lerp(this.position.x, this.position2.x, this.tweenRate);
        this.position.y = Mathf.Lerp(this.position.y, this.position2.y, this.tweenRate);
        this.position.z = Mathf.Lerp(this.position.z, this.position2.z, this.tweenRate);
        this.positionSub.x = this.position.x - this.position1.x;
        this.positionSub.y = this.position.y - this.position1.y;
        this.positionSub.z = this.position.z - this.position1.z;
        
        this.position1.x = this.position.x;
        this.position1.y = this.position.y;
        this.position1.z = this.position.z;

        ToolMeshText.SetVerticesSubBufferTween(
            this.verticesBuffer, 
            this.verticeBeginIndex,
            this.positionSub,
            this.textLength
        );
        this.meshTextBatchMesh.isReshedMesh = true;

        if(this.tweenRate >= 0.5)
        {
            this.RecoverPool();
        }
    }

    public RecoverPool()
    {
        this.Reset();
        this.meshTextBatchMesh.RemoveTweenItem(this);
        this.meshTextBatchMesh.RecoverItem(this);
    }




}
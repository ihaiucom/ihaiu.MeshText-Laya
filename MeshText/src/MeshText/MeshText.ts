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

export enum HorizontalAlignType
{
    Left,
    Center,
    Right
}

export default class MeshText extends Laya.MeshSprite3D 
{
    public atlas: MeshTextAtlas;
    public atlaTypeKey: any;
    public hAlignType: HorizontalAlignType = HorizontalAlignType.Center;
    public useCacheMesh: boolean = false;

    private _text: string = "";
    
    public get Text():string
    {
        return this._text;
    }

    public set Text(value: string)
    {
        this._text = value;
        if(value === undefined || value === null)
        {
            this._text = "";
        }
        this.GenerateFilter();
    }

    public mesh:Mesh;
    public tweenEndPos:Vector3;
    private _tweenPos:Vector3 = new Vector3();
    private _tweenRate: number = 0;
    public get tweenRate()
    {
        return this._tweenRate;
    }

    public set tweenRate(value: number)
    {
        this._tweenRate = value;
        Vector3.lerp(this.transform.position, this.tweenEndPos, value, this._tweenPos);
        this.transform.position = this._tweenPos;
        this.meshRenderer._boundsChange = false;
    }



    constructor(name?:string)
    {
        super(null, name);
    }

    Init(
        atlas: MeshTextAtlas, 
        atlaTypeKey?: any, 
        useCacheMesh: boolean = false,
        hAlignType: HorizontalAlignType = HorizontalAlignType.Center)
    {
        this.atlas = atlas;
        this.atlaTypeKey = atlaTypeKey;
        this.hAlignType = hAlignType;
        this.useCacheMesh = useCacheMesh;
        this.meshRenderer.sharedMaterial = this.atlas.UnlitMaterial;
    }


    private lastTextLength = 0;
    private lastText: string = "";
    GenerateFilter() 
    {
        if(this.lastText == this._text)
        {
            return;
        }

        if(this.useCacheMesh)
        {
            if(this.mesh)
            {
                ToolMeshTextMeshCache.RemoveCacheUse(this.mesh);
            }

            this.mesh = ToolMeshTextMeshCache.GetCache(this._text, this.atlas, this.atlaTypeKey, this.hAlignType);
            ToolMeshTextMeshCache.AddCacheUse(this.mesh);
            this.setMesh(this.mesh);
        }
        else
        {
            if(this.mesh)
            { 
                if(this._text.length == this.lastTextLength)
                {
                    ToolMeshText.RefreshTextMesh(this.mesh, this._text, this.hAlignType, this.atlas, this.atlaTypeKey);
                }
                else
                {
                    if(this.mesh != null)
                    {
                        this.mesh.destroy();
                    }
                    this.mesh = ToolMeshText.CreateTextMesh(this._text, this.hAlignType, this.atlas, this.atlaTypeKey);
                    this.setMesh(this.mesh);
                }
            }
            else
            {
                this.mesh = ToolMeshText.CreateTextMesh(this._text, this.hAlignType, this.atlas, this.atlaTypeKey);
                this.setMesh(this.mesh);
            }
        }


        this.lastTextLength = this._text.length;
        this.lastText = this._text;
    }

    setMesh(mesh: Mesh)
    {
        this.mesh = mesh;
		(mesh) && (this.meshFilter.sharedMesh = mesh);
    }




}
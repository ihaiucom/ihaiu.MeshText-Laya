
import Shader3D = Laya.Shader3D;
import SubShader = Laya.SubShader;
import SkinnedMeshSprite3D = Laya.SkinnedMeshSprite3D;
import VertexMesh = Laya.VertexMesh;
import ShaderDefine = Laya.ShaderDefine;
import Vector4 = Laya.Vector4;
import RenderState = Laya.RenderState;
import Scene3DShaderDeclaration = Laya.Scene3DShaderDeclaration;
import BaseTexture = Laya.BaseTexture;
import Material = Laya.Material;
import { BaseMaterial } from "./BaseMaterial";



export class MeshTextBatchTweenSeparateMaterial extends BaseMaterial
{
    
    /** Shader名称 */
    public static shaderName = "MeshTextBatchTweenSeparate";

	private static _isInstalled: boolean = false;
    public static async install()
    {
		if(MeshTextBatchTweenSeparateMaterial._isInstalled)
		{
			return;
		}
		MeshTextBatchTweenSeparateMaterial._isInstalled = true;
        MeshTextBatchTweenSeparateMaterial.__initDefine__();
        await MeshTextBatchTweenSeparateMaterial.initShader();

        MeshTextBatchTweenSeparateMaterial.defaultMaterial = new MeshTextBatchTweenSeparateMaterial();
        MeshTextBatchTweenSeparateMaterial.defaultMaterial.lock = true;
    }

    private static async initShader()
    {
        var vs: string = await MeshTextBatchTweenSeparateMaterial.loadShaderVSAsync(MeshTextBatchTweenSeparateMaterial.shaderName);
        var ps: string = await MeshTextBatchTweenSeparateMaterial.loadShaderPSAsync("MeshTextBatchTween");
        
        
        var attributeMap: object;
        var uniformMap: object;
        var stateMap: object;
        var shader:Shader3D;
        var subShader:SubShader;

        attributeMap = 
        {
			'a_Position': VertexMesh.MESH_POSITION0,
			'a_Color': VertexMesh.MESH_COLOR0,
			'a_Texcoord0': VertexMesh.MESH_TEXTURECOORDINATE0,
			'a_Texcoord1': VertexMesh.MESH_TEXTURECOORDINATE1,
			'a_MvpMatrix': VertexMesh.MESH_MVPMATRIX_ROW0
		};

        uniformMap = 
        {
			'u_AlbedoTexture': Shader3D.PERIOD_MATERIAL,
			'u_AlbedoColor': Shader3D.PERIOD_MATERIAL,
			'u_TilingOffset': Shader3D.PERIOD_MATERIAL,
            'u_AlphaTestValue': Shader3D.PERIOD_MATERIAL,
            'u_TweenPositionBegin': Shader3D.PERIOD_MATERIAL,
            'u_TweenPositionEnd': Shader3D.PERIOD_MATERIAL,
            
            'u_MvpMatrix': Shader3D.PERIOD_SPRITE,
            
			'u_FogStart': Shader3D.PERIOD_SCENE,
			'u_FogRange': Shader3D.PERIOD_SCENE,
			'u_FogColor': Shader3D.PERIOD_SCENE
		};

        stateMap = 
        {
			's_Cull': Shader3D.RENDER_STATE_CULL,
			's_Blend': Shader3D.RENDER_STATE_BLEND,
			's_BlendSrc': Shader3D.RENDER_STATE_BLEND_SRC,
			's_BlendDst': Shader3D.RENDER_STATE_BLEND_DST,
			's_DepthTest': Shader3D.RENDER_STATE_DEPTH_TEST,
			's_DepthWrite': Shader3D.RENDER_STATE_DEPTH_WRITE
		};

        
        shader = Shader3D.add(MeshTextBatchTweenSeparateMaterial.shaderName, null, null, true);
        subShader =  new SubShader(attributeMap, uniformMap);
        shader.addSubShader(subShader);
        

        var mainPass =  subShader.addShaderPass(vs, ps, stateMap);
        // mainPass.renderState.cull = Laya.RenderState.CULL_BACK;
        
        
    }

	
	/**渲染状态_不透明。*/
	static RENDERMODE_OPAQUE: number = 0;
	/**渲染状态_阿尔法测试。*/
	static RENDERMODE_CUTOUT: number = 1;
	/**渲染状态__透明混合。*/
	static RENDERMODE_TRANSPARENT: number = 2;
	/**渲染状态__加色法混合。*/
	static RENDERMODE_ADDTIVE: number = 3;

	static SHADERDEFINE_ALBEDOTEXTURE: ShaderDefine;
	static SHADERDEFINE_TILINGOFFSET: ShaderDefine;
	static SHADERDEFINE_ENABLEVERTEXCOLOR: ShaderDefine;

	static ALBEDOTEXTURE: number = Shader3D.propertyNameToID("u_AlbedoTexture");
	static ALBEDOCOLOR: number = Shader3D.propertyNameToID("u_AlbedoColor");
	static TILINGOFFSET: number = Shader3D.propertyNameToID("u_TilingOffset");
	static TWEEN_POSITION_BEGIN: number = Shader3D.propertyNameToID("u_TweenPositionBegin");
	static TWEEN_POSITION_END: number = Shader3D.propertyNameToID("u_TweenPositionEnd");
	static CULL: number = Shader3D.propertyNameToID("s_Cull");
	static BLEND: number = Shader3D.propertyNameToID("s_Blend");
	static BLEND_SRC: number = Shader3D.propertyNameToID("s_BlendSrc");
	static BLEND_DST: number = Shader3D.propertyNameToID("s_BlendDst");
	static DEPTH_TEST: number = Shader3D.propertyNameToID("s_DepthTest");
	static DEPTH_WRITE: number = Shader3D.propertyNameToID("s_DepthWrite");

	/** 默认材质，禁止修改*/
	static defaultMaterial: MeshTextBatchTweenSeparateMaterial;

	/**
	 * @internal
	 */
	static __initDefine__(): void {
		MeshTextBatchTweenSeparateMaterial.SHADERDEFINE_ALBEDOTEXTURE = Shader3D.getDefineByName("ALBEDOTEXTURE");
		MeshTextBatchTweenSeparateMaterial.SHADERDEFINE_TILINGOFFSET = Shader3D.getDefineByName("TILINGOFFSET");
		MeshTextBatchTweenSeparateMaterial.SHADERDEFINE_ENABLEVERTEXCOLOR = Shader3D.getDefineByName("ENABLEVERTEXCOLOR");
	}

	private _albedoColor: Vector4 = new Vector4(1.0, 1.0, 1.0, 1.0);
	private _albedoIntensity: number = 1.0;
	private _enableVertexColor: boolean = false;

	// /**
	//  * @internal
	//  */
	// get _ColorR(): number {
	// 	return this._albedoColor.x;
	// }

	// set _ColorR(value: number) {
	// 	this._albedoColor.x = value;
	// 	this.albedoColor = this._albedoColor;
	// }

	// /**
	//  * @internal
	//  */
	// get _ColorG(): number {
	// 	return this._albedoColor.y;
	// }

	// set _ColorG(value: number) {
	// 	this._albedoColor.y = value;
	// 	this.albedoColor = this._albedoColor;
	// }

	// /**
	//  * @internal
	//  */
	// get _ColorB(): number {
	// 	return this._albedoColor.z;
	// }

	// set _ColorB(value: number) {
	// 	this._albedoColor.z = value;
	// 	this.albedoColor = this._albedoColor;
	// }

	// /**
	//  * @internal 
	//  */
	// get _ColorA(): number {
	// 	return this._albedoColor.w;
	// }

	// set _ColorA(value: number) {
	// 	this._albedoColor.w = value;
	// 	this.albedoColor = this._albedoColor;
	// }

	// /**
	//  * @internal
	//  */
	// get _AlbedoIntensity(): number {
	// 	return this._albedoIntensity;
	// }

	// set _AlbedoIntensity(value: number) {
	// 	if (this._albedoIntensity !== value) {
	// 		var finalAlbedo: Vector4 = (<Vector4>this._shaderValues.getVector(MeshTextBatchTweenSeparateMaterial.ALBEDOCOLOR));
	// 		Vector4.scale(this._albedoColor, value, finalAlbedo);
	// 		this._albedoIntensity = value;
	// 		this._shaderValues.setVector(MeshTextBatchTweenSeparateMaterial.ALBEDOCOLOR, finalAlbedo);
	// 	}
	// }

	// /**
	//  * @internal
	//  */
	// get _MainTex_STX(): number {
	// 	return this._shaderValues.getVector(MeshTextBatchTweenSeparateMaterial.TILINGOFFSET).x;
	// }

	// set _MainTex_STX(x: number) {
	// 	var tilOff: Vector4 = (<Vector4>this._shaderValues.getVector(MeshTextBatchTweenSeparateMaterial.TILINGOFFSET));
	// 	tilOff.x = x;
	// 	this.tilingOffset = tilOff;
	// }

	// /**
	//  * @internal
	//  */
	// get _MainTex_STY(): number {
	// 	return this._shaderValues.getVector(MeshTextBatchTweenSeparateMaterial.TILINGOFFSET).y;
	// }

	// set _MainTex_STY(y: number) {
	// 	var tilOff: Vector4 = (<Vector4>this._shaderValues.getVector(MeshTextBatchTweenSeparateMaterial.TILINGOFFSET));
	// 	tilOff.y = y;
	// 	this.tilingOffset = tilOff;
	// }

	// /**
	//  * @internal
	//  */
	// get _MainTex_STZ(): number {
	// 	return this._shaderValues.getVector(MeshTextBatchTweenSeparateMaterial.TILINGOFFSET).z;
	// }

	// set _MainTex_STZ(z: number) {
	// 	var tilOff: Vector4 = (<Vector4>this._shaderValues.getVector(MeshTextBatchTweenSeparateMaterial.TILINGOFFSET));
	// 	tilOff.z = z;
	// 	this.tilingOffset = tilOff;
	// }

	// /**
	//  * @internal
	//  */
	// get _MainTex_STW(): number {
	// 	return this._shaderValues.getVector(MeshTextBatchTweenSeparateMaterial.TILINGOFFSET).w;
	// }

	// set _MainTex_STW(w: number) {
	// 	var tilOff: Vector4 = (<Vector4>this._shaderValues.getVector(MeshTextBatchTweenSeparateMaterial.TILINGOFFSET));
	// 	tilOff.w = w;
	// 	this.tilingOffset = tilOff;
	// }

	// /**
	//  * @internal
	//  */
	// get _Cutoff(): number {
	// 	return this.alphaTestValue;
	// }

	// set _Cutoff(value: number) {
	// 	this.alphaTestValue = value;
	// }

	// /**
	//  * 反照率颜色R分量。
	//  */
	// get albedoColorR(): number {
	// 	return this._ColorR;
	// }

	// set albedoColorR(value: number) {
	// 	this._ColorR = value;
	// }

	// /**
	//  * 反照率颜色G分量。
	//  */
	// get albedoColorG(): number {
	// 	return this._ColorG;
	// }

	// set albedoColorG(value: number) {
	// 	this._ColorG = value;
	// }

	// /**
	//  * 反照率颜色B分量。
	//  */
	// get albedoColorB(): number {
	// 	return this._ColorB;
	// }

	// set albedoColorB(value: number) {
	// 	this._ColorB = value;
	// }

	// /**
	//  * 反照率颜色Z分量。
	//  */
	// get albedoColorA(): number {
	// 	return this._ColorA;
	// }

	// set albedoColorA(value: number) {
	// 	this._ColorA = value;
	// }

	// /**
	//  * 反照率颜色。
	//  */
	// get albedoColor(): Vector4 {
	// 	return this._albedoColor;
	// }

	// set albedoColor(value: Vector4) {
	// 	var finalAlbedo: Vector4 = (<Vector4>this._shaderValues.getVector(MeshTextBatchTweenSeparateMaterial.ALBEDOCOLOR));
	// 	Vector4.scale(value, this._albedoIntensity, finalAlbedo);
	// 	this._albedoColor = value;
	// 	this._shaderValues.setVector(MeshTextBatchTweenSeparateMaterial.ALBEDOCOLOR, finalAlbedo);
	// }

	// /**
	//  * 反照率强度。
	//  */
	// get albedoIntensity(): number {
	// 	return this._albedoIntensity;
	// }

	// set albedoIntensity(value: number) {
	// 	this._AlbedoIntensity = value;
	// }

	/**
	 * 反照率贴图。
	 */
	get albedoTexture(): BaseTexture {
		return this._shaderValues.getTexture(MeshTextBatchTweenSeparateMaterial.ALBEDOTEXTURE);
	}

	set albedoTexture(value: BaseTexture) {
		if (value)
			this._shaderValues.addDefine(MeshTextBatchTweenSeparateMaterial.SHADERDEFINE_ALBEDOTEXTURE);
		else
			this._shaderValues.removeDefine(MeshTextBatchTweenSeparateMaterial.SHADERDEFINE_ALBEDOTEXTURE);
		this._shaderValues.setTexture(MeshTextBatchTweenSeparateMaterial.ALBEDOTEXTURE, value);
	}

	// /**
	//  * 纹理平铺和偏移X分量。
	//  */
	// get tilingOffsetX(): number {
	// 	return this._MainTex_STX;
	// }

	// set tilingOffsetX(x: number) {
	// 	this._MainTex_STX = x;
	// }

	// /**
	//  * 纹理平铺和偏移Y分量。
	//  */
	// get tilingOffsetY(): number {
	// 	return this._MainTex_STY;
	// }

	// set tilingOffsetY(y: number) {
	// 	this._MainTex_STY = y;
	// }

	// /**
	//  * 纹理平铺和偏移Z分量。
	//  */
	// get tilingOffsetZ(): number {
	// 	return this._MainTex_STZ;
	// }

	// set tilingOffsetZ(z: number) {
	// 	this._MainTex_STZ = z;
	// }

	// /**
	//  * 纹理平铺和偏移W分量。
	//  */
	// get tilingOffsetW(): number {
	// 	return this._MainTex_STW;
	// }

	// set tilingOffsetW(w: number) {
	// 	this._MainTex_STW = w;
	// }

	// /**
	//  * 纹理平铺和偏移。
	//  */
	// get tilingOffset(): Vector4 {
	// 	return (<Vector4>this._shaderValues.getVector(MeshTextBatchTweenSeparateMaterial.TILINGOFFSET));
	// }

	// set tilingOffset(value: Vector4) {
	// 	if (value) {
	// 		if (value.x != 1 || value.y != 1 || value.z != 0 || value.w != 0)
	// 			this._shaderValues.addDefine(MeshTextBatchTweenSeparateMaterial.SHADERDEFINE_TILINGOFFSET);
	// 		else
	// 			this._shaderValues.removeDefine(MeshTextBatchTweenSeparateMaterial.SHADERDEFINE_TILINGOFFSET);
	// 	} else {
	// 		this._shaderValues.removeDefine(MeshTextBatchTweenSeparateMaterial.SHADERDEFINE_TILINGOFFSET);
	// 	}
	// 	this._shaderValues.setVector(MeshTextBatchTweenSeparateMaterial.TILINGOFFSET, value);
	// }

	// /**
	//  * 是否支持顶点色。
	//  */
	// get enableVertexColor(): boolean {
	// 	return this._enableVertexColor;
	// }

	// set enableVertexColor(value: boolean) {
	// 	this._enableVertexColor = value;
	// 	if (value)
	// 		this._shaderValues.addDefine(MeshTextBatchTweenSeparateMaterial.SHADERDEFINE_ENABLEVERTEXCOLOR);
	// 	else
	// 		this._shaderValues.removeDefine(MeshTextBatchTweenSeparateMaterial.SHADERDEFINE_ENABLEVERTEXCOLOR);
	// }

	/**
	 * 渲染模式。
	 */
	set renderMode(value: number) {
		switch (value) {
			case MeshTextBatchTweenSeparateMaterial.RENDERMODE_OPAQUE:
				this.alphaTest = false;
				this.renderQueue = Material.RENDERQUEUE_OPAQUE;
				this.depthWrite = true;
				this.cull = RenderState.CULL_BACK;
				this.blend = RenderState.BLEND_DISABLE;
				this.depthTest = RenderState.DEPTHTEST_LESS;
				break;
			case MeshTextBatchTweenSeparateMaterial.RENDERMODE_CUTOUT:
				this.renderQueue = Material.RENDERQUEUE_ALPHATEST;
				this.alphaTest = true;
				this.depthWrite = true;
				this.cull = RenderState.CULL_BACK;
				this.blend = RenderState.BLEND_DISABLE;
				this.depthTest = RenderState.DEPTHTEST_LESS;
				break;
			case MeshTextBatchTweenSeparateMaterial.RENDERMODE_TRANSPARENT:
				this.renderQueue = Material.RENDERQUEUE_TRANSPARENT;
				this.alphaTest = false;
				this.depthWrite = false;
				this.cull = RenderState.CULL_BACK;
				this.blend = RenderState.BLEND_ENABLE_ALL;
				this.blendSrc = RenderState.BLENDPARAM_SRC_ALPHA;
				this.blendDst = RenderState.BLENDPARAM_ONE_MINUS_SRC_ALPHA;
				this.depthTest = RenderState.DEPTHTEST_LESS;
				break;
			default:
				throw new Error("MeshTextBatchTweenSeparateMaterial : renderMode value error.");
		}
	}



	/**
	 * 是否写入深度。
	 */
	get depthWrite(): boolean {
		return this._shaderValues.getBool(MeshTextBatchTweenSeparateMaterial.DEPTH_WRITE);
	}

	set depthWrite(value: boolean) {
		this._shaderValues.setBool(MeshTextBatchTweenSeparateMaterial.DEPTH_WRITE, value);
	}



	/**
	 * 剔除方式。
	 */
	get cull(): number {
		return this._shaderValues.getInt(MeshTextBatchTweenSeparateMaterial.CULL);
	}

	set cull(value: number) {
		this._shaderValues.setInt(MeshTextBatchTweenSeparateMaterial.CULL, value);
	}


	/**
	 * 混合方式。
	 */
	get blend(): number {
		return this._shaderValues.getInt(MeshTextBatchTweenSeparateMaterial.BLEND);
	}

	set blend(value: number) {
		this._shaderValues.setInt(MeshTextBatchTweenSeparateMaterial.BLEND, value);
	}


	/**
	 * 混合源。
	 */
	get blendSrc(): number {
		return this._shaderValues.getInt(MeshTextBatchTweenSeparateMaterial.BLEND_SRC);
	}

	set blendSrc(value: number) {
		this._shaderValues.setInt(MeshTextBatchTweenSeparateMaterial.BLEND_SRC, value);
	}



	/**
	 * 混合目标。
	 */
	get blendDst(): number {
		return this._shaderValues.getInt(MeshTextBatchTweenSeparateMaterial.BLEND_DST);
	}

	set blendDst(value: number) {
		this._shaderValues.setInt(MeshTextBatchTweenSeparateMaterial.BLEND_DST, value);
	}


	/**
	 * 深度测试方式。
	 */
	get depthTest(): number {
		return this._shaderValues.getInt(MeshTextBatchTweenSeparateMaterial.DEPTH_TEST);
	}

	set depthTest(value: number) {
		this._shaderValues.setInt(MeshTextBatchTweenSeparateMaterial.DEPTH_TEST, value);
	}

	
	private _tweenPositionEnd: Vector4 = new Vector4(0.5, 2.0, 0.0, 0.0);
	get tweenPositionEnd(): Vector4 {
		return this._tweenPositionEnd;
	}

	set tweenPositionEnd(value: Vector4) {
		this._tweenPositionEnd = value;
		this._shaderValues.setVector(MeshTextBatchTweenSeparateMaterial.TWEEN_POSITION_END, value);
	}

	constructor() {
		super();
		this.setShaderName(MeshTextBatchTweenSeparateMaterial.shaderName);
		this._shaderValues.setVector(MeshTextBatchTweenSeparateMaterial.ALBEDOCOLOR, new Vector4(1.0, 1.0, 1.0, 1.0));
		this._shaderValues.setVector(MeshTextBatchTweenSeparateMaterial.TWEEN_POSITION_BEGIN, new Vector4(0.0, 0.0, 0.0, 0.0));
		this._shaderValues.setVector(MeshTextBatchTweenSeparateMaterial.TWEEN_POSITION_END, this._tweenPositionEnd);
		this.renderMode = MeshTextBatchTweenSeparateMaterial.RENDERMODE_TRANSPARENT;

		
	}

	/**
	 * 克隆。
	 * @return	 克隆副本。
	 * @override
	 */
	clone(): any {
		var dest: MeshTextBatchTweenSeparateMaterial = new MeshTextBatchTweenSeparateMaterial();
		this.cloneTo(dest);
		dest._albedoIntensity = this._albedoIntensity;
        this._albedoColor.cloneTo(dest._albedoColor);
		return dest;
	}

}
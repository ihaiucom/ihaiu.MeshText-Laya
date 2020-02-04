
export interface MeshTextAtlasData
{
    meta: {size: {w: number, h: number}};
    frames: {[key:string]:MeshTextAtlasFrameData};
}

export interface MeshTextAtlasFrameData
{
    frameUV: {xMin:number, yMin:number, xMax: number, yMax:number, r: number};
    frame: {x:number, y:number, w: number, h:number};
    spriteSourceSize: {x:number, y:number, w: number, h:number};
    sourceSize: {w: number, h:number};
}


export default class WarMaterialTextAtlas
{
    private static UID = 0;
    uid:int = 0;
    texture: Laya.Texture2D;
    atlasData: MeshTextAtlasData;
    private typeMap: Map<any, Map<string, MeshTextAtlasFrameData>> = new Map<any, Map<string, MeshTextAtlasFrameData>>();

    get textureWidth()
    {
        return this.atlasData.meta.size.w;
    }

    get textureHeight()
    {
        return this.atlasData.meta.size.h;
    }

    private _UnlitMaterial:Laya.UnlitMaterial;
    get UnlitMaterial():Laya.UnlitMaterial
    {
        if(!this._UnlitMaterial)
        {
            var m = new Laya.UnlitMaterial();
            m.renderMode = Laya.UnlitMaterial.RENDERMODE_TRANSPARENT;
            m.albedoTexture = this.texture;
            // m.cull = Laya.RenderState.CULL_NONE;
            this._UnlitMaterial = m;
        }
        return this._UnlitMaterial;
    }

    

	private static LoadAsync(path: string, type?:string): Promise<any>
	{
		return new  Promise<any>((resolve)=>
		{
			Laya.loader.load(path, Laya.Handler.create(this, (data:any)=>
			{
                resolve(data);
			}), null, type);
		});
	}
    
	private static Load3DAsync(path: string, type?:string): Promise<any>
	{
		return new  Promise<any>((resolve)=>
		{
			Laya.loader.create(path, Laya.Handler.create(this, (data:any)=>
			{
                Laya.timer.frameOnce(1, this, ()=>
                {
                    resolve(data);
                })
			}), null, type);
		});
    }
    
    
    static async CreateAsync(texturePath: string, atlasPath: string): Promise<WarMaterialTextAtlas>
    {
        var texture = await WarMaterialTextAtlas.LoadAsync(texturePath, Laya.Loader.TEXTURE2D);
        var atlasData = await WarMaterialTextAtlas.LoadAsync(atlasPath, Laya.Loader.JSON);
        var atlas = new WarMaterialTextAtlas(texture, atlasData);
        return atlas;
    }

    constructor(texture: Laya.Texture2D, atlasData: MeshTextAtlasData)
    {
        this.uid = WarMaterialTextAtlas.UID ++;
        this.texture = texture;
        this.atlasData = atlasData;

        this.InitUV();
    }

    InitUV()
    {
        var atlasData = this.atlasData;
        var textureWidth =  atlasData.meta.size.w;
        var textureHeight =  atlasData.meta.size.h;
        for(var frameKey in atlasData.frames)
        {
            var frame = atlasData.frames[frameKey];
            frame.frameUV = 
            {
                xMin: frame.frame.x / textureWidth,
                yMin: frame.frame.y / textureHeight,
                xMax: (frame.frame.x + frame.frame.w) / textureWidth,
                yMax: (frame.frame.y + frame.frame.h) / textureHeight,
                r:frame.frame.w / frame.frame.h
            };

        }
    }

    GetType(typeKey: any):Map<string, MeshTextAtlasFrameData>
    {
        return this.typeMap.get(typeKey);
    }

    GetOrCreateType(typeKey: any):Map<string, MeshTextAtlasFrameData>
    {
        if(!this.typeMap.has(typeKey))
        {
            this.typeMap.set(typeKey, new Map<string, MeshTextAtlasFrameData>());
        }
        return this.typeMap.get(typeKey);
    }

    GenerateNumType(numTypeName: string, typeKey?: any)
    {
        if(typeKey === undefined)
        {
            typeKey = numTypeName;
        }

        var map = this.GetOrCreateType(typeKey);
        for(var i = 0; i <= 9; i ++)
        {
            var frameName = numTypeName + i;
            var frame = this.atlasData.frames[frameName];
            if(frame)
            {
                map.set(i.toString(), frame);
            } 
            else
            {
                console.warn("文字图集里没找到字符:" + i);
                continue;
            }
        }

        var flags = ["-", "+"];
        for(var flag of flags)
        {
            var frameName = numTypeName + flag;
            var frame = this.atlasData.frames[frameName];
            if(frame)
            {
                map.set(i.toString(), frame);
            }
        }
        
    }

    AddToType(chart: string, frameName: string, typeKey: any)
    {
        if(frameName === undefined)
        {
            frameName = chart;
        }

        var map = this.GetOrCreateType(typeKey);
        var frame = this.atlasData.frames[frameName];
        if(frame)
        {
            map.set(chart, frame);
        }
    }

    
    AddToAllType(chart: string, frameName?: string)
    {
        if(frameName === undefined)
        {
            frameName = chart;
        }

        var frame = this.atlasData.frames[frameName];
        if(frame)
        {
            this.typeMap.forEach((map, key)=>
            {
                map.set(chart, frame);
            })
        }
    }

    GetTypeFrame(chart: string, typeKey:any):MeshTextAtlasFrameData
    {
        var map = this.GetType(typeKey);
        return map.get(chart);
    }

    GetFrame(chart: string, typeKey?:any):MeshTextAtlasFrameData
    {
        var frame: MeshTextAtlasFrameData;
        if(typeKey !== undefined)
        {
            frame = this.GetTypeFrame(chart, typeKey);
            if(frame)
            {
                return frame;
            }
        }

        frame = this.atlasData.frames[chart];
        return frame;

    }


}

export interface TextureTextAtlasData
{
    meta: {size: {w: number, h: number}};
    frames: {[key:string]:TextureTextAtlasFrameData};
}

export interface TextureTextAtlasFrameData
{
    frameUV: {xMin:number, yMin:number, xMax: number, yMax:number, r: number};
    frame: {x:number, y:number, w: number, h:number};
    spriteSourceSize: {x:number, y:number, w: number, h:number};
    sourceSize: {w: number, h:number};
    texture: Laya.Texture;
    poolSign:string;

}


export default class TextureTextAtlas
{
    private static UID = 0;
    uid:int = 0;
    texture: Laya.Texture;
    atlasData: TextureTextAtlasData;
    private typeMap: Map<any, Map<string, TextureTextAtlasFrameData>> = new Map<any, Map<string, TextureTextAtlasFrameData>>();
    typeScaleMap:Map<any, number> = new Map<any, number>();
    get textureWidth()
    {
        return this.atlasData.meta.size.w;
    }

    get textureHeight()
    {
        return this.atlasData.meta.size.h;
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

    private static LoadTexture(texturePath: string): Promise<Laya.Texture>
    {
		return new  Promise<Laya.Texture>((resolve)=>
		{
            var texture = new Laya.Texture();
            texture.load(texturePath, Laya.Handler.create(this, ()=>{
                resolve(texture);
            }))
        });
    }
    
    
    static async CreateAsync(texturePath: string, atlasPath: string): Promise<TextureTextAtlas>
    {
        var texture = await this.LoadTexture(texturePath);
        var atlasData = await this.LoadAsync(atlasPath, Laya.Loader.JSON);
        var atlas = new TextureTextAtlas(texture, atlasData);
        return atlas;
    }

    constructor(texture: Laya.Texture, atlasData: TextureTextAtlasData)
    {
        this.uid = TextureTextAtlas.UID ++;
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
            var f = frame.frame;
            frame.texture = Laya.Texture.createFromTexture(this.texture,
                f.x, f.y, f.w, f.h);
            frame.poolSign = "TextureTextAtlas_" + this.uid + "_" + frameKey;

        }
    }

    GetType(typeKey: any):Map<string, TextureTextAtlasFrameData>
    {
        return this.typeMap.get(typeKey);
    }

    GetOrCreateType(typeKey: any):Map<string, TextureTextAtlasFrameData>
    {
        if(!this.typeMap.has(typeKey))
        {
            this.typeMap.set(typeKey, new Map<string, TextureTextAtlasFrameData>());
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

    GetTypeFrame(chart: string, typeKey:any):TextureTextAtlasFrameData
    {
        var map = this.GetType(typeKey);
        return map.get(chart);
    }

    GetFrame(chart: string, typeKey?:any):TextureTextAtlasFrameData
    {
        var frame: TextureTextAtlasFrameData;
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

    InitAllChartSpritePool(maxNum: number = 100)
    {
        var atlasData = this.atlasData;

        for(var frameKey in atlasData.frames)
        {
            var frame = atlasData.frames[frameKey];
            for(var i = 0; i < maxNum; i ++)
            {
                var sprite = this.CreateChartSprite(frame);
                Laya.Pool.recover(frame.poolSign, sprite);
            }
        }
    }
    

    CreateChartSprite(frame: TextureTextAtlasFrameData):Laya.Sprite
    {
        var sprite = new Laya.Sprite();
        sprite.texture = frame.texture;
        sprite.width = frame.frame.w;
        sprite.height = frame.frame.h;
        sprite.name = frame.poolSign;
        return sprite;
    }

    GetChartSprite(chart: string, typeKey?:any): Laya.Sprite
    {
        var frame = this.GetFrame(chart, typeKey);
        var sprite = Laya.Pool.getItem(frame.poolSign);
        if(!sprite)
        {
            sprite = this.CreateChartSprite(frame);
        }
        return sprite;
    }

    RecoverChartSprite(sprite: Laya.Sprite)
    {
        Laya.Pool.recover(sprite.name, sprite);
    }


}
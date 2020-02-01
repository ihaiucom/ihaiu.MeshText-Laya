import MeshTextAtlas from "./MeshTextAtlas";
import { HorizontalAlignType } from "./MeshText";
import ToolMeshText from "./ToolMeshText";
import Mesh = Laya.Mesh;

export default class ToolMeshTextMeshCache
{

    static GetKey(
        text: string,
        atlas: MeshTextAtlas, 
        atlaTypeKey?: any, 
        hAlignType: HorizontalAlignType = HorizontalAlignType.Center):string
    {
        return text + atlas.uid + (atlaTypeKey ? atlaTypeKey : "") + hAlignType;
    }

    private static cache:Map<string, Mesh> = new Map<string, Mesh>();
    static GetCache(
        text: string,
        atlas: MeshTextAtlas, 
        atlaTypeKey?: any, 
        hAlignType: HorizontalAlignType = HorizontalAlignType.Center)
    {
        var key:string = this.GetKey(text, atlas, atlaTypeKey, hAlignType);
        var mesh: Mesh;
        if(! this.cache.has(key) )
        {
            mesh = ToolMeshText.CreateTextMesh(text, hAlignType, atlas, atlaTypeKey);
            mesh['__cacheKey'] = key;
            this.cache.set(key, mesh);
        }
        else
        {
            mesh = this.cache.get(key);
        }

        return mesh;
    }

    static RemoveCacheUse(mesh: Mesh)
    {
        mesh['__cacheReferenceCount'] = mesh['__cacheReferenceCount'] ? mesh['__cacheReferenceCount'] - 1 : 0;

    }

    static AddCacheUse(mesh: Mesh)
    {
        mesh['__cacheReferenceCount'] = mesh['__cacheReferenceCount'] ? mesh['__cacheReferenceCount'] + 1 : 1;
        mesh['__cacheReferenceLastTime'] = Laya.timer.currTimer;
    }

    static DestoryNoUse()
    {
        var list:Mesh[] = [];
        this.cache.forEach((mesh, key)=>{
            var referenceCount = mesh['__cacheReferenceCount'] ;
            if(referenceCount <= 0)
            {
                list.push(mesh);
            }
        });

        for(var mesh of list)
        {
            var key =  mesh['__cacheKey'];
            this.cache.delete(key);
            mesh.destroy();
        }
        
        list.length = 0;
    }


    
    
}
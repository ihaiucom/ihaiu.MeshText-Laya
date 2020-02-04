export class TextStyleMap
{
    private typeMap: Map<any, Map<string, string>> = new Map<any, Map<string, string>>();
    defaultType:any;
    GetType(typeKey: any):Map<string, string>
    {
        return this.typeMap.get(typeKey);
    }

    GetOrCreateType(typeKey: any):Map<string, string>
    {
        if(!this.typeMap.has(typeKey))
        {
            this.typeMap.set(typeKey, new Map<string, string>());
        }
        return this.typeMap.get(typeKey);
    }
    
    GenerateNumType(charts:string,  typeKey: any)
    {
        var map = this.GetOrCreateType(typeKey);
        for(var i = 0; i <= 9; i ++)
        {
            map.set(i.toString(), charts[i]);
        }
    }

    AddToAllType(chart: string, fontChart?: string)
    {
        if(fontChart === undefined)
        {
            fontChart = chart;
        }
        
        this.typeMap.forEach((map, key)=>
        {
            map.set(chart, fontChart);
        });
    }

    
    AddToType(chart: string, fontChart: string, typeKey: any)
    {
        var map = this.GetOrCreateType(typeKey);
        map.set(chart, fontChart);
    }
    
    chartsCache:Map<any, Map<string, string>> = new Map<any, Map<string, string>>();
    
    GetOrCreateCache(typeKey: any):Map<string, string>
    {
        if(!this.chartsCache.has(typeKey))
        {
            this.chartsCache.set(typeKey, new Map<string, string>());
        }
        return this.chartsCache.get(typeKey);
    }
    GetCharts(txt: string, typeKey:any):string
    {
        var cahceMap = this.GetOrCreateCache(typeKey);
        if(cahceMap.has(txt))
        {
            return cahceMap.get(txt);
        }
        if(typeKey == this.defaultType)
        {
            return txt;
        }

        var map = this.GetType(typeKey);
        var str = "";
        for(var i = 0, len = txt.length; i < len; i ++)
        {
            if(map.has(txt[i]))
            {
                var chart = map.get(txt[i]);
                str += chart;
            }
            else
            {
                str += txt[i];
            }
        }
        
        cahceMap.set(txt, str);
        
        return str;

    }

    
    

}
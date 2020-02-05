import MeshTextAtlas from "./MeshTextAtlas";
import { HorizontalAlignType } from "./HorizontalAlignType";

import VertexDeclaration = Laya.VertexDeclaration;
import VertexMesh = Laya.VertexMesh;
import Mesh = Laya.Mesh;

export default class ToolMeshText
{
    
    // static CreateTextMesh(text: string, hAlignType: HorizontalAlignType, atlas:MeshTextAtlas, atlaTypeKey?: any): Mesh
    // {
    //     var vertexDeclaration: VertexDeclaration = VertexMesh.getVertexDeclaration("POSITION,UV");
    //     var vertices:float[] = [];
    //     var indices:int[] = [];

    //     let length = text.length;
    //     var verticeCount = length << 2;
    //     vertices.length = verticeCount * 5;
    //     indices.length = (length << 1) * 3;
        

    //     this.SetVerticesBuffer(vertices,
    //         text, hAlignType, atlas, atlaTypeKey
    //     );
    //     this.SetIndicesBuffer(indices);
    //     var verticesBuffer: Float32Array = new Float32Array(vertices);
    //     var indicesBuffer: Uint16Array = new Uint16Array(indices);

    //     // console.log("text=", text);
    //     // console.log("indices.length=", indices.length);
    //     // console.log("indicesBuffer.length=", indicesBuffer.length);
    //     // console.log("verticeCount=", verticeCount);
    //     // console.log("verticesBuffer.length=", verticesBuffer.length);
    //     // console.log(verticesBuffer);
    //     // console.log(indicesBuffer);
	// 	return Laya.PrimitiveMesh._createMesh(vertexDeclaration, verticesBuffer, indicesBuffer);
    // }

    // static SetVerticesBuffer(verticesBuffer: Float32Array | Array<number>,  text: string, hAlignType: HorizontalAlignType, atlas:MeshTextAtlas, atlaTypeKey?: any)
    // {
    //     let length = text.length;
    //     var verticeCount = length << 2;
       
    //     let offestH = 0;
    //     switch(hAlignType)
    //     {
    //         case HorizontalAlignType.Center:
    //             offestH = -(verticeCount >> 3);
    //             break;
    //         case HorizontalAlignType.Left:
    //             offestH = 0;
    //             break;
    //         case HorizontalAlignType.Right:
    //             offestH = -(verticeCount >> 2);
    //             break;
    //     }

    //     let tmp:int = 0;
    //     let tmp2: float = 0;
    //     let r: float = 1;
    //     let oncePosLength = 3;
    //     let onceUVLength = 2;
    //     let onceVerticeLength = oncePosLength /*pos*/ + onceUVLength /*uv*/;
    //     for(var i = 0; i < verticeCount; i += 4)
    //     {
    //         tmp = (i + 1) % 2;
    //         let s = text[ i / 4];
            
    //         var spriteData = atlas.GetFrame(s, atlaTypeKey);
    //         if(spriteData == null)
    //         {
    //             console.warn("文字图集里没找到字符:" + s);
    //             continue;
    //         }
    //         var spriteUV = spriteData.frameUV;
    //         r = spriteUV.r;

    //         // pos: x,y,z
    //         var iPos = i * onceVerticeLength;
    //         // v0: left top
    //         verticesBuffer[iPos + 0] = offestH;
    //         verticesBuffer[iPos + 1] = tmp + 1;
    //         verticesBuffer[iPos + 2] = 0;

            


    //         // v1: left bottom
    //         iPos += onceVerticeLength;
    //         verticesBuffer[iPos + 0] = offestH;
    //         verticesBuffer[iPos + 1] = tmp;
    //         verticesBuffer[iPos + 2] = 0;

    //         offestH += r;

    //         // v2: right top
    //         iPos += onceVerticeLength;
    //         verticesBuffer[iPos + 0] = offestH;
    //         verticesBuffer[iPos + 1] = tmp + 1;
    //         verticesBuffer[iPos + 2] = 0;

    //         // v3: right bottom
    //         iPos += onceVerticeLength;
    //         verticesBuffer[iPos + 0] = offestH;
    //         verticesBuffer[iPos + 1] = tmp;
    //         verticesBuffer[iPos + 2] = 0;


    //         // uv: x, y
    //         var iUV = i * onceVerticeLength + oncePosLength;
    //         // v0: left top
    //         verticesBuffer[iUV + 0] = spriteUV.xMin;
    //         verticesBuffer[iUV + 1] = spriteUV.yMin;

    //         // v1: left bottom
    //         iUV += onceVerticeLength;
    //         verticesBuffer[iUV + 0] = spriteUV.xMin;
    //         verticesBuffer[iUV + 1] = spriteUV.yMax;

    //         // v2: right top
    //         iUV += onceVerticeLength;
    //         verticesBuffer[iUV + 0] = spriteUV.xMax;
    //         verticesBuffer[iUV + 1] = spriteUV.yMin;
    //         // v3: right bottom
    //         iUV += onceVerticeLength;
    //         verticesBuffer[iUV + 0] = spriteUV.xMax;
    //         verticesBuffer[iUV + 1] = spriteUV.yMax;
    //     }

    // }

    
    // static RefreshTextMesh(mesh:Mesh, text: string, hAlignType: HorizontalAlignType, atlas:MeshTextAtlas, atlaTypeKey?: any)
    // {
    //     this.SetVerticesBuffer(mesh._vertexBuffer.getFloat32Data(),
    //         text, hAlignType, atlas, atlaTypeKey
    //     );
    //     this.PushGPUVertexBuffer(mesh);
    // }

    
    static SetIndicesBuffer(indicesBuffer: Uint16Array | Array<number>)
    {
        var tmp = 0;
        for(var i = 0; i < indicesBuffer.length; i += 6)
        {
            tmp = (i / 3) << 1;
            indicesBuffer[i + 0] = indicesBuffer[i + 3] = tmp;
            indicesBuffer[i + 1] = indicesBuffer[i + 5] = tmp + 3;
            indicesBuffer[i + 2] = tmp + 1;
            indicesBuffer[i + 4] = tmp + 2;
        }
    }

    
    static SetVerticesSubBuffer(verticesBuffer: Float32Array | Array<number>, offset:number=0, itemSale: number, itemPosition:Laya.Vector3, text: string, hAlignType: HorizontalAlignType, atlas:MeshTextAtlas, atlaTypeKey?: any)
    {
        let length = text.length;
        var verticeCount = length << 2;
       
        let offestH = 0;
        switch(hAlignType)
        {
            case HorizontalAlignType.Center:
                offestH = -(verticeCount >> 3);
                break;
            case HorizontalAlignType.Left:
                offestH = 0;
                break;
            case HorizontalAlignType.Right:
                offestH = -(verticeCount >> 2);
                break;
        }

        let tmp:int = 0;
        let tmp2: float = 0;
        let r: float = 1;
        let oncePosLength = 3;
        let onceUVLength = 2;
        let onceVerticeLength = oncePosLength /*pos*/ 
        + onceUVLength /*uv*/ 
        + onceUVLength /*uv1*/;
        for(var i = 0; i < verticeCount; i += 4)
        {
            tmp = (i + 1) % 2;
            let s = text[ i / 4];
            
            var spriteData = atlas.GetFrame(s, atlaTypeKey);
            if(spriteData == null)
            {
                console.warn("文字图集里没找到字符:" + s, "type=" + atlaTypeKey);
                continue;
            }
            var spriteUV = spriteData.frameUV;
            r = spriteUV.r;

            // pos: x,y,z
            var iPos = offset + i * onceVerticeLength;
            // v0: left top
            verticesBuffer[iPos + 0] = offestH * itemSale + itemPosition.x;
            verticesBuffer[iPos + 1] = (tmp + 1) * itemSale + itemPosition.y;
            // verticesBuffer[iPos + 2] = 0;

            


            // v1: left bottom
            iPos += onceVerticeLength;
            verticesBuffer[iPos + 0] = offestH * itemSale + itemPosition.x;
            verticesBuffer[iPos + 1] = tmp * itemSale     + itemPosition.y;
            // verticesBuffer[iPos + 2] = 0;

            offestH += r;

            // v2: right top
            iPos += onceVerticeLength;
            verticesBuffer[iPos + 0] = offestH * itemSale + itemPosition.x;
            verticesBuffer[iPos + 1] = (tmp + 1) * itemSale + itemPosition.y;
            // verticesBuffer[iPos + 2] = 0;

            // v3: right bottom
            iPos += onceVerticeLength;
            verticesBuffer[iPos + 0] = offestH * itemSale + itemPosition.x;
            verticesBuffer[iPos + 1] = tmp * itemSale     + itemPosition.y;
            // verticesBuffer[iPos + 2] = 0;


            // uv: x, y
            var iUV = offset + i * onceVerticeLength + oncePosLength;
            // v0: left top
            verticesBuffer[iUV + 0] = spriteUV.xMin;
            verticesBuffer[iUV + 1] = spriteUV.yMin;

            // v1: left bottom
            iUV += onceVerticeLength;
            verticesBuffer[iUV + 0] = spriteUV.xMin;
            verticesBuffer[iUV + 1] = spriteUV.yMax;

            // v2: right top
            iUV += onceVerticeLength;
            verticesBuffer[iUV + 0] = spriteUV.xMax;
            verticesBuffer[iUV + 1] = spriteUV.yMin;
            // v3: right bottom
            iUV += onceVerticeLength;
            verticesBuffer[iUV + 0] = spriteUV.xMax;
            verticesBuffer[iUV + 1] = spriteUV.yMax;
        }

    }

    
    static SetVerticesSubBufferTween(verticesBuffer: Float32Array | Array<number>, offset:number=0, addPosition:Laya.Vector3, textLength: number)
    {
        let length = textLength;
        var verticeCount = length << 2;
       

        let oncePosLength = 3;
        let onceUVLength = 2;
        let onceVerticeLength = oncePosLength /*pos*/ 
            + onceUVLength /*uv*/ 
            + onceUVLength /*uv1*/;
        for(var i = 0; i < verticeCount; i += 4)
        {
           

            // pos: x,y,z
            var iPos = offset + i * onceVerticeLength;
            // v0: left top
            verticesBuffer[iPos + 0] += addPosition.x;
            verticesBuffer[iPos + 1] += addPosition.y;
            // verticesBuffer[iPos + 2] = 0;

            


            // v1: left bottom
            iPos += onceVerticeLength;
            verticesBuffer[iPos + 0] += addPosition.x;
            verticesBuffer[iPos + 1] += addPosition.y;
            // verticesBuffer[iPos + 2] = 0;


            // v2: right top
            iPos += onceVerticeLength;
            verticesBuffer[iPos + 0] += addPosition.x;
            verticesBuffer[iPos + 1] += addPosition.y;
            // verticesBuffer[iPos + 2] = 0;

            // v3: right bottom
            iPos += onceVerticeLength;
            verticesBuffer[iPos + 0] += addPosition.x;
            verticesBuffer[iPos + 1] += addPosition.y;
            // verticesBuffer[iPos + 2] = 0;

        }

    }

    
    static SetVerticesSubBufferTweenRate(verticesBuffer: Float32Array | Array<number>, offset:number=0, tweenRate:float, tweenRate2:float, textLength: number)
    {
        let length = textLength;
        var verticeCount = length << 2;
       

        let oncePosLength = 3;
        let onceUVLength = 2;
        let onceVerticeLength = oncePosLength /*pos*/ 
            + onceUVLength /*uv*/ 
            + onceUVLength /*uv1*/;
        for(var i = 0; i < verticeCount; i += 4)
        {
            
            // uv: x, y
            var iUV = offset + i * onceVerticeLength + oncePosLength + onceUVLength;
            // v0: left top
            verticesBuffer[iUV + 0] = tweenRate;
            // verticesBuffer[iUV + 1] = tweenRate2;

            // v1: left bottom
            iUV += onceVerticeLength;
            verticesBuffer[iUV + 0] = tweenRate;
            // verticesBuffer[iUV + 1] = tweenRate2;

            // v2: right top
            iUV += onceVerticeLength;
            verticesBuffer[iUV + 0] = tweenRate;
            // verticesBuffer[iUV + 1] = tweenRate2;

            // v3: right bottom
            iUV += onceVerticeLength;
            verticesBuffer[iUV + 0] = tweenRate;
            // verticesBuffer[iUV + 1] = tweenRate2;

        }

    }

    
    static PushGPUVertexBuffer(mesh: Mesh)
    {
        var vertexBuffer = mesh._vertexBuffer;
        var buffer = vertexBuffer.getUint8Data();
        vertexBuffer.bind();
        Laya.LayaGL.instance.bufferSubData(vertexBuffer._bufferType, 0, buffer);
    }

    
}

window['ToolMeshText'] = ToolMeshText;
(function () {
    'use strict';

    var Vector3 = Laya.Vector3;
    class TestScene extends Laya.Scene3D {
        static create() {
            let node = new TestScene();
            node.name = "WarScene";
            let scene = node;
            scene.init();
            return scene;
        }
        init() {
            window['warScene'] = this;
            this.initCamera();
        }
        initCamera() {
            var cameraRootNode = new Laya.Sprite3D("CameraRoot");
            var cameraRotationXNode = new Laya.Sprite3D("CameraRotationX");
            var camera = new Laya.Camera(0, 0.1, 1000);
            var screenLayer = new Laya.Sprite3D("ScreenLayer");
            cameraRootNode.addChild(cameraRotationXNode);
            cameraRotationXNode.addChild(camera);
            camera.addChild(screenLayer);
            cameraRotationXNode.transform.localRotationEulerX = -20;
            camera.transform.localPosition = new Vector3(0, 0, 200);
            camera.clearColor = new Laya.Vector4(0.2, 0.5, 0.8, 1);
            camera.orthographic = true;
            camera.orthographicVerticalSize = 5.2;
            camera.farPlane = 2000;
            this.camera = camera;
            this.cameraNode = cameraRootNode;
            this.screen3DLayer = screenLayer;
            let directionLight = this.addChild(new Laya.DirectionLight());
            directionLight.color = new Laya.Vector3(1, 1, 1);
            this.lightRotaitonSrc = directionLight.transform.localRotationEuler = new Laya.Vector3(125, 68, 106);
            this.directionLight = directionLight;
            this.addChild(cameraRootNode);
            this.addChild(directionLight);
            this.lightRotaitonStart();
        }
        lightRotaitonStart() {
            this.lightRotaiton = this.directionLight.transform.localRotationEuler;
            Laya.timer.frameLoop(1, this, this.onLightRotaitonLoop);
        }
        lightRotaitonStop() {
            this.directionLight.transform.localRotationEuler = this.lightRotaitonSrc;
            Laya.timer.clear(this, this.onLightRotaitonLoop);
        }
        onLightRotaitonLoop() {
            this.lightRotaiton.x += 1;
            this.lightRotaiton.y += 2;
            this.lightRotaiton.z += 2;
            this.directionLight.transform.localRotationEuler = this.lightRotaiton;
        }
    }

    var MeshTextType;
    (function (MeshTextType) {
        MeshTextType["white"] = "white_";
        MeshTextType["red"] = "red_";
        MeshTextType["green"] = "green_";
    })(MeshTextType || (MeshTextType = {}));

    var HorizontalAlignType;
    (function (HorizontalAlignType) {
        HorizontalAlignType[HorizontalAlignType["Left"] = 0] = "Left";
        HorizontalAlignType[HorizontalAlignType["Center"] = 1] = "Center";
        HorizontalAlignType[HorizontalAlignType["Right"] = 2] = "Right";
    })(HorizontalAlignType || (HorizontalAlignType = {}));

    class ToolMeshText {
        static SetIndicesBuffer(indicesBuffer) {
            var tmp = 0;
            for (var i = 0; i < indicesBuffer.length; i += 6) {
                tmp = (i / 3) << 1;
                indicesBuffer[i + 0] = indicesBuffer[i + 3] = tmp;
                indicesBuffer[i + 1] = indicesBuffer[i + 5] = tmp + 3;
                indicesBuffer[i + 2] = tmp + 1;
                indicesBuffer[i + 4] = tmp + 2;
            }
        }
        static SetVerticesSubBuffer(verticesBuffer, offset = 0, itemSale, itemPosition, text, hAlignType, atlas, atlaTypeKey) {
            let length = text.length;
            var verticeCount = length << 2;
            let offestH = 0;
            switch (hAlignType) {
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
            let tmp = 0;
            let r = 1;
            let oncePosLength = 3;
            let onceUVLength = 2;
            let onceVerticeLength = oncePosLength
                + onceUVLength
                + onceUVLength;
            for (var i = 0; i < verticeCount; i += 4) {
                tmp = (i + 1) % 2;
                let s = text[i / 4];
                var spriteData = atlas.GetFrame(s, atlaTypeKey);
                if (spriteData == null) {
                    console.warn("文字图集里没找到字符:" + s);
                    continue;
                }
                var spriteUV = spriteData.frameUV;
                r = spriteUV.r;
                var iPos = offset + i * onceVerticeLength;
                verticesBuffer[iPos + 0] = offestH * itemSale + itemPosition.x;
                verticesBuffer[iPos + 1] = (tmp + 1) * itemSale + itemPosition.y;
                iPos += onceVerticeLength;
                verticesBuffer[iPos + 0] = offestH * itemSale + itemPosition.x;
                verticesBuffer[iPos + 1] = tmp * itemSale + itemPosition.y;
                offestH += r;
                iPos += onceVerticeLength;
                verticesBuffer[iPos + 0] = offestH * itemSale + itemPosition.x;
                verticesBuffer[iPos + 1] = (tmp + 1) * itemSale + itemPosition.y;
                iPos += onceVerticeLength;
                verticesBuffer[iPos + 0] = offestH * itemSale + itemPosition.x;
                verticesBuffer[iPos + 1] = tmp * itemSale + itemPosition.y;
                var iUV = offset + i * onceVerticeLength + oncePosLength;
                verticesBuffer[iUV + 0] = spriteUV.xMin;
                verticesBuffer[iUV + 1] = spriteUV.yMin;
                iUV += onceVerticeLength;
                verticesBuffer[iUV + 0] = spriteUV.xMin;
                verticesBuffer[iUV + 1] = spriteUV.yMax;
                iUV += onceVerticeLength;
                verticesBuffer[iUV + 0] = spriteUV.xMax;
                verticesBuffer[iUV + 1] = spriteUV.yMin;
                iUV += onceVerticeLength;
                verticesBuffer[iUV + 0] = spriteUV.xMax;
                verticesBuffer[iUV + 1] = spriteUV.yMax;
            }
        }
        static SetVerticesSubBufferTween(verticesBuffer, offset = 0, addPosition, textLength) {
            let length = textLength;
            var verticeCount = length << 2;
            let oncePosLength = 3;
            let onceUVLength = 2;
            let onceVerticeLength = oncePosLength
                + onceUVLength
                + onceUVLength;
            for (var i = 0; i < verticeCount; i += 4) {
                var iPos = offset + i * onceVerticeLength;
                verticesBuffer[iPos + 0] += addPosition.x;
                verticesBuffer[iPos + 1] += addPosition.y;
                iPos += onceVerticeLength;
                verticesBuffer[iPos + 0] += addPosition.x;
                verticesBuffer[iPos + 1] += addPosition.y;
                iPos += onceVerticeLength;
                verticesBuffer[iPos + 0] += addPosition.x;
                verticesBuffer[iPos + 1] += addPosition.y;
                iPos += onceVerticeLength;
                verticesBuffer[iPos + 0] += addPosition.x;
                verticesBuffer[iPos + 1] += addPosition.y;
            }
        }
        static SetVerticesSubBufferTweenRate(verticesBuffer, offset = 0, tweenRate, tweenRate2, textLength) {
            let length = textLength;
            var verticeCount = length << 2;
            let oncePosLength = 3;
            let onceUVLength = 2;
            let onceVerticeLength = oncePosLength
                + onceUVLength
                + onceUVLength;
            for (var i = 0; i < verticeCount; i += 4) {
                var iUV = offset + i * onceVerticeLength + oncePosLength + onceUVLength;
                verticesBuffer[iUV + 0] = tweenRate;
                iUV += onceVerticeLength;
                verticesBuffer[iUV + 0] = tweenRate;
                iUV += onceVerticeLength;
                verticesBuffer[iUV + 0] = tweenRate;
                iUV += onceVerticeLength;
                verticesBuffer[iUV + 0] = tweenRate;
            }
        }
        static PushGPUVertexBuffer(mesh) {
            var vertexBuffer = mesh._vertexBuffer;
            var buffer = vertexBuffer.getUint8Data();
            vertexBuffer.bind();
            Laya.LayaGL.instance.bufferSubData(vertexBuffer._bufferType, 0, buffer);
        }
    }
    window['ToolMeshText'] = ToolMeshText;

    var Vector3$1 = Laya.Vector3;
    class MeshTextItem {
        constructor(meshTextBatchMesh, batchIndex, verticeBeginIndex, verticeEndIndex) {
            this.batchIndex = 0;
            this.verticeBeginIndex = 0;
            this.verticeEndIndex = 0;
            this.hAlignType = HorizontalAlignType.Center;
            this.scale = 0.5;
            this._text = "";
            this.textLength = 0;
            this.position = new Vector3$1();
            this.tweenRate = 0;
            this.tweenSpeed = 1;
            this.speedRandom = Math.random() * 0.5 + 0.7;
            this.tweenValue = 0;
            this.meshTextBatchMesh = meshTextBatchMesh;
            this.batchIndex = batchIndex;
            this.verticeBeginIndex = verticeBeginIndex;
            this.verticeEndIndex = verticeEndIndex;
            this.itemDefaultBuffer = meshTextBatchMesh.verticesBuffer.slice(verticeBeginIndex, verticeEndIndex);
        }
        get verticesBuffer() {
            return this.meshTextBatchMesh.mesh._vertexBuffer.getFloat32Data();
        }
        get atlas() {
            return this.meshTextBatchMesh.atlas;
        }
        get Text() {
            return this._text;
        }
        set Text(value) {
            if (value === undefined || value === null) {
                value = "";
            }
            if (this._text == value) {
                return;
            }
            this.textLength = value.length;
            this._text = value;
            this.Reset();
            ToolMeshText.SetVerticesSubBuffer(this.verticesBuffer, this.verticeBeginIndex, this.scale, this.position, this._text, this.hAlignType, this.atlas, this.atlaTypeKey);
            this.meshTextBatchMesh.isReshedMesh = true;
        }
        Reset() {
            this.tweenRate = 0;
            this.verticesBuffer.set(this.itemDefaultBuffer, this.verticeBeginIndex);
            this.meshTextBatchMesh.isReshedMesh = true;
        }
        StartTween() {
            this.tweenRate = 0;
            this.tweenValue = 0;
            this.meshTextBatchMesh.AddTweenItem(this);
        }
        UpdateTween(delta) {
            this.tweenRate += delta * this.tweenSpeed;
            this.tweenValue = Mathf.Lerp(this.tweenValue * 0.25, 1.0, this.tweenRate);
            ToolMeshText.SetVerticesSubBufferTweenRate(this.verticesBuffer, this.verticeBeginIndex, this.tweenValue, 0, this.textLength);
            this.meshTextBatchMesh.isReshedMesh = true;
            if (this.tweenValue >= 1) {
                this.RecoverPool();
            }
        }
        RecoverPool() {
            this.Reset();
            this.meshTextBatchMesh.RemoveTweenItem(this);
            this.meshTextBatchMesh.RecoverItem(this);
        }
    }

    var VertexMesh = Laya.VertexMesh;
    class MeshTextBatchMesh {
        constructor(atlas, onceTextLength = 10, maxTextNum = 100) {
            this.uid = 0;
            this.onceTextLength = 10;
            this.maxTextNum = 100;
            this.stringMaxLength = 10 * 100;
            this.isReshedMesh = false;
            this.useItemList = [];
            this.tweenItemList = [];
            this.uid = MeshTextBatchMesh.UID++;
            this.itemPoolKey = "MeshTextItem__" + this.uid;
            this.atlas = atlas;
            var stringMaxLength = onceTextLength * maxTextNum;
            this.onceTextLength = onceTextLength;
            this.maxTextNum = maxTextNum;
            this.stringMaxLength = stringMaxLength;
            var onceTextVerticeCount = (onceTextLength << 2) * 7;
            var verticeCount = (stringMaxLength << 2) * 7;
            var indicesCount = (stringMaxLength << 1) * 3;
            var vertexDeclaration = VertexMesh.getVertexDeclaration("POSITION,UV,UV1");
            var verticesBuffer = new Float32Array(verticeCount);
            var indicesBuffer = new Uint16Array(indicesCount);
            ToolMeshText.SetIndicesBuffer(indicesBuffer);
            for (var i = 0; i < stringMaxLength; i++) {
                for (var v = 0; v < 4; v++) {
                    var ii = i * 4 + v;
                    ii = ii * 7 + 6;
                    verticesBuffer[ii] = Math.random();
                }
            }
            this.verticesBuffer = verticesBuffer;
            this.indicesBuffer = indicesBuffer;
            this.mesh = Laya.PrimitiveMesh._createMesh(vertexDeclaration, verticesBuffer, indicesBuffer);
            for (var i = maxTextNum - 1; i >= 0; i--) {
                var verticeBeginIndex = i * onceTextVerticeCount;
                var verticeEndIndex = (i + 1) * onceTextVerticeCount;
                var item = new MeshTextItem(this, i, verticeBeginIndex, verticeEndIndex);
                Laya.Pool.recover(this.itemPoolKey, item);
            }
        }
        GetItem(text, position = new Laya.Vector3(0, 0, 0), atlaTypeKey, scale = 1.0) {
            var item = Laya.Pool.getItem(this.itemPoolKey);
            if (item == null) {
                if (this.useItemList.length > 0) {
                    item = this.useItemList.shift();
                    item.RecoverPool();
                }
            }
            item.atlaTypeKey = atlaTypeKey;
            item.position = position;
            item.scale = scale;
            item.Text = text;
            this.useItemList.push(item);
            return item;
        }
        PlayItem(text, position = new Laya.Vector3(0, 0, 0), atlaTypeKey, scale = 1.0, tweenSpeed = 1.0) {
            var item = this.GetItem(text, position, atlaTypeKey, scale);
            item.tweenSpeed = tweenSpeed;
            item.StartTween();
            return item;
        }
        RemoveUseFromList(item) {
            var index = this.useItemList.indexOf(item);
            if (index != -1) {
                this.useItemList.splice(index, 1);
            }
        }
        RecoverItem(item) {
            Laya.Pool.recover(this.itemPoolKey, item);
            this.RemoveUseFromList(item);
        }
        AddTweenItem(item) {
            var index = this.tweenItemList.indexOf(item);
            if (index == -1) {
                this.tweenItemList.push(item);
            }
        }
        RemoveTweenItem(item) {
            var index = this.tweenItemList.indexOf(item);
            if (index != -1) {
                this.tweenItemList.splice(index, 1);
            }
        }
        StartUpdate() {
            Laya.timer.frameLoop(1, this, this.OnLoop);
        }
        StopUpdate() {
            Laya.timer.clear(this, this.OnLoop);
        }
        OnLoop() {
            if (this.isReshedMesh) {
                ToolMeshText.PushGPUVertexBuffer(this.mesh);
                this.isReshedMesh = false;
            }
            var delta = Laya.timer.delta * 0.001;
            for (var i = this.tweenItemList.length - 1; i >= 0; i--) {
                var item = this.tweenItemList[i];
                item.UpdateTween(delta);
            }
        }
    }
    MeshTextBatchMesh.UID = 0;

    class MeshTextBatchSprite extends Laya.MeshSprite3D {
        constructor(batchMesh, name) {
            super(batchMesh.mesh, name);
            this.batchMesh = batchMesh;
            this.meshRenderer.bounds.setMin(new Laya.Vector3(-999999, -999999, -999999));
            this.meshRenderer.bounds.setMax(new Laya.Vector3(999999, 999999, 999999));
        }
    }

    class BaseMaterial extends Laya.Material {
        static getShaderVS(filename) {
            return this.SHADER_PATH_ROOT + filename + ".vs";
        }
        static getShaderPS(filename) {
            return this.SHADER_PATH_ROOT + filename + ".fs";
        }
        static getShaderGLSL(filename) {
            return this.SHADER_PATH_ROOT + filename + ".glsl";
        }
        static async loadShaderGlslAsync(filename) {
            let code = await this.loadAsync(this.getShaderGLSL(filename), Laya.Loader.TEXT);
            return code.replace(/\r/g, "");
        }
        static async loadShaderVSAsync(filename) {
            let code = await this.loadAsync(this.getShaderVS(filename), Laya.Loader.TEXT);
            return code.replace(/\r/g, "");
        }
        static async loadShaderPSAsync(filename) {
            let code = await this.loadAsync(this.getShaderPS(filename), Laya.Loader.TEXT);
            return code.replace(/\r/g, "");
        }
        static async loadAsync(path, type) {
            return new Promise((resolve) => {
                Laya.loader.load(path, Laya.Handler.create(null, (res) => {
                    resolve(res);
                }), null, type);
            });
        }
    }
    BaseMaterial.SHADER_PATH_ROOT = "res/shaders/";

    var Shader3D = Laya.Shader3D;
    var SubShader = Laya.SubShader;
    var VertexMesh$1 = Laya.VertexMesh;
    var Vector4 = Laya.Vector4;
    var RenderState = Laya.RenderState;
    var Material = Laya.Material;
    class MeshTextBatchTweenMaterial extends BaseMaterial {
        constructor() {
            super();
            this._albedoColor = new Vector4(1.0, 1.0, 1.0, 1.0);
            this._albedoIntensity = 1.0;
            this._enableVertexColor = false;
            this._tweenPositionEnd = new Vector4(0.25, 1.0, 0.0, 0.0);
            this.setShaderName(MeshTextBatchTweenMaterial.shaderName);
            this._shaderValues.setVector(MeshTextBatchTweenMaterial.ALBEDOCOLOR, new Vector4(1.0, 1.0, 1.0, 1.0));
            this._shaderValues.setVector(MeshTextBatchTweenMaterial.TWEEN_POSITION_BEGIN, new Vector4(0.0, 0.0, 0.0, 0.0));
            this._shaderValues.setVector(MeshTextBatchTweenMaterial.TWEEN_POSITION_END, this._tweenPositionEnd);
            this.renderMode = MeshTextBatchTweenMaterial.RENDERMODE_TRANSPARENT;
        }
        static async install() {
            if (MeshTextBatchTweenMaterial._isInstalled) {
                return;
            }
            MeshTextBatchTweenMaterial._isInstalled = true;
            MeshTextBatchTweenMaterial.__initDefine__();
            await MeshTextBatchTweenMaterial.initShader();
            MeshTextBatchTweenMaterial.defaultMaterial = new MeshTextBatchTweenMaterial();
            MeshTextBatchTweenMaterial.defaultMaterial.lock = true;
        }
        static async initShader() {
            var vs = await MeshTextBatchTweenMaterial.loadShaderVSAsync(MeshTextBatchTweenMaterial.shaderName);
            var ps = await MeshTextBatchTweenMaterial.loadShaderPSAsync(MeshTextBatchTweenMaterial.shaderName);
            var attributeMap;
            var uniformMap;
            var stateMap;
            var shader;
            var subShader;
            attributeMap =
                {
                    'a_Position': VertexMesh$1.MESH_POSITION0,
                    'a_Color': VertexMesh$1.MESH_COLOR0,
                    'a_Texcoord0': VertexMesh$1.MESH_TEXTURECOORDINATE0,
                    'a_Texcoord1': VertexMesh$1.MESH_TEXTURECOORDINATE1,
                    'a_MvpMatrix': VertexMesh$1.MESH_MVPMATRIX_ROW0
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
            shader = Shader3D.add(MeshTextBatchTweenMaterial.shaderName, null, null, true);
            subShader = new SubShader(attributeMap, uniformMap);
            shader.addSubShader(subShader);
            var mainPass = subShader.addShaderPass(vs, ps, stateMap);
        }
        static __initDefine__() {
            MeshTextBatchTweenMaterial.SHADERDEFINE_ALBEDOTEXTURE = Shader3D.getDefineByName("ALBEDOTEXTURE");
            MeshTextBatchTweenMaterial.SHADERDEFINE_TILINGOFFSET = Shader3D.getDefineByName("TILINGOFFSET");
            MeshTextBatchTweenMaterial.SHADERDEFINE_ENABLEVERTEXCOLOR = Shader3D.getDefineByName("ENABLEVERTEXCOLOR");
        }
        get _ColorR() {
            return this._albedoColor.x;
        }
        set _ColorR(value) {
            this._albedoColor.x = value;
            this.albedoColor = this._albedoColor;
        }
        get _ColorG() {
            return this._albedoColor.y;
        }
        set _ColorG(value) {
            this._albedoColor.y = value;
            this.albedoColor = this._albedoColor;
        }
        get _ColorB() {
            return this._albedoColor.z;
        }
        set _ColorB(value) {
            this._albedoColor.z = value;
            this.albedoColor = this._albedoColor;
        }
        get _ColorA() {
            return this._albedoColor.w;
        }
        set _ColorA(value) {
            this._albedoColor.w = value;
            this.albedoColor = this._albedoColor;
        }
        get _AlbedoIntensity() {
            return this._albedoIntensity;
        }
        set _AlbedoIntensity(value) {
            if (this._albedoIntensity !== value) {
                var finalAlbedo = this._shaderValues.getVector(MeshTextBatchTweenMaterial.ALBEDOCOLOR);
                Vector4.scale(this._albedoColor, value, finalAlbedo);
                this._albedoIntensity = value;
                this._shaderValues.setVector(MeshTextBatchTweenMaterial.ALBEDOCOLOR, finalAlbedo);
            }
        }
        get _MainTex_STX() {
            return this._shaderValues.getVector(MeshTextBatchTweenMaterial.TILINGOFFSET).x;
        }
        set _MainTex_STX(x) {
            var tilOff = this._shaderValues.getVector(MeshTextBatchTweenMaterial.TILINGOFFSET);
            tilOff.x = x;
            this.tilingOffset = tilOff;
        }
        get _MainTex_STY() {
            return this._shaderValues.getVector(MeshTextBatchTweenMaterial.TILINGOFFSET).y;
        }
        set _MainTex_STY(y) {
            var tilOff = this._shaderValues.getVector(MeshTextBatchTweenMaterial.TILINGOFFSET);
            tilOff.y = y;
            this.tilingOffset = tilOff;
        }
        get _MainTex_STZ() {
            return this._shaderValues.getVector(MeshTextBatchTweenMaterial.TILINGOFFSET).z;
        }
        set _MainTex_STZ(z) {
            var tilOff = this._shaderValues.getVector(MeshTextBatchTweenMaterial.TILINGOFFSET);
            tilOff.z = z;
            this.tilingOffset = tilOff;
        }
        get _MainTex_STW() {
            return this._shaderValues.getVector(MeshTextBatchTweenMaterial.TILINGOFFSET).w;
        }
        set _MainTex_STW(w) {
            var tilOff = this._shaderValues.getVector(MeshTextBatchTweenMaterial.TILINGOFFSET);
            tilOff.w = w;
            this.tilingOffset = tilOff;
        }
        get _Cutoff() {
            return this.alphaTestValue;
        }
        set _Cutoff(value) {
            this.alphaTestValue = value;
        }
        get albedoColorR() {
            return this._ColorR;
        }
        set albedoColorR(value) {
            this._ColorR = value;
        }
        get albedoColorG() {
            return this._ColorG;
        }
        set albedoColorG(value) {
            this._ColorG = value;
        }
        get albedoColorB() {
            return this._ColorB;
        }
        set albedoColorB(value) {
            this._ColorB = value;
        }
        get albedoColorA() {
            return this._ColorA;
        }
        set albedoColorA(value) {
            this._ColorA = value;
        }
        get albedoColor() {
            return this._albedoColor;
        }
        set albedoColor(value) {
            var finalAlbedo = this._shaderValues.getVector(MeshTextBatchTweenMaterial.ALBEDOCOLOR);
            Vector4.scale(value, this._albedoIntensity, finalAlbedo);
            this._albedoColor = value;
            this._shaderValues.setVector(MeshTextBatchTweenMaterial.ALBEDOCOLOR, finalAlbedo);
        }
        get albedoIntensity() {
            return this._albedoIntensity;
        }
        set albedoIntensity(value) {
            this._AlbedoIntensity = value;
        }
        get albedoTexture() {
            return this._shaderValues.getTexture(MeshTextBatchTweenMaterial.ALBEDOTEXTURE);
        }
        set albedoTexture(value) {
            if (value)
                this._shaderValues.addDefine(MeshTextBatchTweenMaterial.SHADERDEFINE_ALBEDOTEXTURE);
            else
                this._shaderValues.removeDefine(MeshTextBatchTweenMaterial.SHADERDEFINE_ALBEDOTEXTURE);
            this._shaderValues.setTexture(MeshTextBatchTweenMaterial.ALBEDOTEXTURE, value);
        }
        get tilingOffsetX() {
            return this._MainTex_STX;
        }
        set tilingOffsetX(x) {
            this._MainTex_STX = x;
        }
        get tilingOffsetY() {
            return this._MainTex_STY;
        }
        set tilingOffsetY(y) {
            this._MainTex_STY = y;
        }
        get tilingOffsetZ() {
            return this._MainTex_STZ;
        }
        set tilingOffsetZ(z) {
            this._MainTex_STZ = z;
        }
        get tilingOffsetW() {
            return this._MainTex_STW;
        }
        set tilingOffsetW(w) {
            this._MainTex_STW = w;
        }
        get tilingOffset() {
            return this._shaderValues.getVector(MeshTextBatchTweenMaterial.TILINGOFFSET);
        }
        set tilingOffset(value) {
            if (value) {
                if (value.x != 1 || value.y != 1 || value.z != 0 || value.w != 0)
                    this._shaderValues.addDefine(MeshTextBatchTweenMaterial.SHADERDEFINE_TILINGOFFSET);
                else
                    this._shaderValues.removeDefine(MeshTextBatchTweenMaterial.SHADERDEFINE_TILINGOFFSET);
            }
            else {
                this._shaderValues.removeDefine(MeshTextBatchTweenMaterial.SHADERDEFINE_TILINGOFFSET);
            }
            this._shaderValues.setVector(MeshTextBatchTweenMaterial.TILINGOFFSET, value);
        }
        get enableVertexColor() {
            return this._enableVertexColor;
        }
        set enableVertexColor(value) {
            this._enableVertexColor = value;
            if (value)
                this._shaderValues.addDefine(MeshTextBatchTweenMaterial.SHADERDEFINE_ENABLEVERTEXCOLOR);
            else
                this._shaderValues.removeDefine(MeshTextBatchTweenMaterial.SHADERDEFINE_ENABLEVERTEXCOLOR);
        }
        set renderMode(value) {
            switch (value) {
                case MeshTextBatchTweenMaterial.RENDERMODE_OPAQUE:
                    this.alphaTest = false;
                    this.renderQueue = Material.RENDERQUEUE_OPAQUE;
                    this.depthWrite = true;
                    this.cull = RenderState.CULL_BACK;
                    this.blend = RenderState.BLEND_DISABLE;
                    this.depthTest = RenderState.DEPTHTEST_LESS;
                    break;
                case MeshTextBatchTweenMaterial.RENDERMODE_CUTOUT:
                    this.renderQueue = Material.RENDERQUEUE_ALPHATEST;
                    this.alphaTest = true;
                    this.depthWrite = true;
                    this.cull = RenderState.CULL_BACK;
                    this.blend = RenderState.BLEND_DISABLE;
                    this.depthTest = RenderState.DEPTHTEST_LESS;
                    break;
                case MeshTextBatchTweenMaterial.RENDERMODE_TRANSPARENT:
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
                    throw new Error("MeshTextBatchTweenMaterial : renderMode value error.");
            }
        }
        get depthWrite() {
            return this._shaderValues.getBool(MeshTextBatchTweenMaterial.DEPTH_WRITE);
        }
        set depthWrite(value) {
            this._shaderValues.setBool(MeshTextBatchTweenMaterial.DEPTH_WRITE, value);
        }
        get cull() {
            return this._shaderValues.getInt(MeshTextBatchTweenMaterial.CULL);
        }
        set cull(value) {
            this._shaderValues.setInt(MeshTextBatchTweenMaterial.CULL, value);
        }
        get blend() {
            return this._shaderValues.getInt(MeshTextBatchTweenMaterial.BLEND);
        }
        set blend(value) {
            this._shaderValues.setInt(MeshTextBatchTweenMaterial.BLEND, value);
        }
        get blendSrc() {
            return this._shaderValues.getInt(MeshTextBatchTweenMaterial.BLEND_SRC);
        }
        set blendSrc(value) {
            this._shaderValues.setInt(MeshTextBatchTweenMaterial.BLEND_SRC, value);
        }
        get blendDst() {
            return this._shaderValues.getInt(MeshTextBatchTweenMaterial.BLEND_DST);
        }
        set blendDst(value) {
            this._shaderValues.setInt(MeshTextBatchTweenMaterial.BLEND_DST, value);
        }
        get depthTest() {
            return this._shaderValues.getInt(MeshTextBatchTweenMaterial.DEPTH_TEST);
        }
        set depthTest(value) {
            this._shaderValues.setInt(MeshTextBatchTweenMaterial.DEPTH_TEST, value);
        }
        get tweenPositionEnd() {
            return this._tweenPositionEnd;
        }
        set tweenPositionEnd(value) {
            this._tweenPositionEnd = value;
            this._shaderValues.setVector(MeshTextBatchTweenMaterial.TWEEN_POSITION_END, value);
        }
        clone() {
            var dest = new MeshTextBatchTweenMaterial();
            this.cloneTo(dest);
            dest._albedoIntensity = this._albedoIntensity;
            this._albedoColor.cloneTo(dest._albedoColor);
            return dest;
        }
    }
    MeshTextBatchTweenMaterial.shaderName = "MeshTextBatchTween";
    MeshTextBatchTweenMaterial._isInstalled = false;
    MeshTextBatchTweenMaterial.RENDERMODE_OPAQUE = 0;
    MeshTextBatchTweenMaterial.RENDERMODE_CUTOUT = 1;
    MeshTextBatchTweenMaterial.RENDERMODE_TRANSPARENT = 2;
    MeshTextBatchTweenMaterial.RENDERMODE_ADDTIVE = 3;
    MeshTextBatchTweenMaterial.ALBEDOTEXTURE = Shader3D.propertyNameToID("u_AlbedoTexture");
    MeshTextBatchTweenMaterial.ALBEDOCOLOR = Shader3D.propertyNameToID("u_AlbedoColor");
    MeshTextBatchTweenMaterial.TILINGOFFSET = Shader3D.propertyNameToID("u_TilingOffset");
    MeshTextBatchTweenMaterial.TWEEN_POSITION_BEGIN = Shader3D.propertyNameToID("u_TweenPositionBegin");
    MeshTextBatchTweenMaterial.TWEEN_POSITION_END = Shader3D.propertyNameToID("u_TweenPositionEnd");
    MeshTextBatchTweenMaterial.CULL = Shader3D.propertyNameToID("s_Cull");
    MeshTextBatchTweenMaterial.BLEND = Shader3D.propertyNameToID("s_Blend");
    MeshTextBatchTweenMaterial.BLEND_SRC = Shader3D.propertyNameToID("s_BlendSrc");
    MeshTextBatchTweenMaterial.BLEND_DST = Shader3D.propertyNameToID("s_BlendDst");
    MeshTextBatchTweenMaterial.DEPTH_TEST = Shader3D.propertyNameToID("s_DepthTest");
    MeshTextBatchTweenMaterial.DEPTH_WRITE = Shader3D.propertyNameToID("s_DepthWrite");

    var Shader3D$1 = Laya.Shader3D;
    var SubShader$1 = Laya.SubShader;
    var VertexMesh$2 = Laya.VertexMesh;
    var Vector4$1 = Laya.Vector4;
    var RenderState$1 = Laya.RenderState;
    var Material$1 = Laya.Material;
    class MeshTextBatchTweenSeparateMaterial extends BaseMaterial {
        constructor() {
            super();
            this._albedoColor = new Vector4$1(1.0, 1.0, 1.0, 1.0);
            this._albedoIntensity = 1.0;
            this._enableVertexColor = false;
            this._tweenPositionEnd = new Vector4$1(0.5, 2.0, 0.0, 0.0);
            this.setShaderName(MeshTextBatchTweenSeparateMaterial.shaderName);
            this._shaderValues.setVector(MeshTextBatchTweenSeparateMaterial.ALBEDOCOLOR, new Vector4$1(1.0, 1.0, 1.0, 1.0));
            this._shaderValues.setVector(MeshTextBatchTweenSeparateMaterial.TWEEN_POSITION_BEGIN, new Vector4$1(0.0, 0.0, 0.0, 0.0));
            this._shaderValues.setVector(MeshTextBatchTweenSeparateMaterial.TWEEN_POSITION_END, this._tweenPositionEnd);
            this.renderMode = MeshTextBatchTweenSeparateMaterial.RENDERMODE_TRANSPARENT;
        }
        static async install() {
            if (MeshTextBatchTweenSeparateMaterial._isInstalled) {
                return;
            }
            MeshTextBatchTweenSeparateMaterial._isInstalled = true;
            MeshTextBatchTweenSeparateMaterial.__initDefine__();
            await MeshTextBatchTweenSeparateMaterial.initShader();
            MeshTextBatchTweenSeparateMaterial.defaultMaterial = new MeshTextBatchTweenSeparateMaterial();
            MeshTextBatchTweenSeparateMaterial.defaultMaterial.lock = true;
        }
        static async initShader() {
            var vs = await MeshTextBatchTweenSeparateMaterial.loadShaderVSAsync(MeshTextBatchTweenSeparateMaterial.shaderName);
            var ps = await MeshTextBatchTweenSeparateMaterial.loadShaderPSAsync("MeshTextBatchTween");
            var attributeMap;
            var uniformMap;
            var stateMap;
            var shader;
            var subShader;
            attributeMap =
                {
                    'a_Position': VertexMesh$2.MESH_POSITION0,
                    'a_Color': VertexMesh$2.MESH_COLOR0,
                    'a_Texcoord0': VertexMesh$2.MESH_TEXTURECOORDINATE0,
                    'a_Texcoord1': VertexMesh$2.MESH_TEXTURECOORDINATE1,
                    'a_MvpMatrix': VertexMesh$2.MESH_MVPMATRIX_ROW0
                };
            uniformMap =
                {
                    'u_AlbedoTexture': Shader3D$1.PERIOD_MATERIAL,
                    'u_AlbedoColor': Shader3D$1.PERIOD_MATERIAL,
                    'u_TilingOffset': Shader3D$1.PERIOD_MATERIAL,
                    'u_AlphaTestValue': Shader3D$1.PERIOD_MATERIAL,
                    'u_TweenPositionBegin': Shader3D$1.PERIOD_MATERIAL,
                    'u_TweenPositionEnd': Shader3D$1.PERIOD_MATERIAL,
                    'u_MvpMatrix': Shader3D$1.PERIOD_SPRITE,
                    'u_FogStart': Shader3D$1.PERIOD_SCENE,
                    'u_FogRange': Shader3D$1.PERIOD_SCENE,
                    'u_FogColor': Shader3D$1.PERIOD_SCENE
                };
            stateMap =
                {
                    's_Cull': Shader3D$1.RENDER_STATE_CULL,
                    's_Blend': Shader3D$1.RENDER_STATE_BLEND,
                    's_BlendSrc': Shader3D$1.RENDER_STATE_BLEND_SRC,
                    's_BlendDst': Shader3D$1.RENDER_STATE_BLEND_DST,
                    's_DepthTest': Shader3D$1.RENDER_STATE_DEPTH_TEST,
                    's_DepthWrite': Shader3D$1.RENDER_STATE_DEPTH_WRITE
                };
            shader = Shader3D$1.add(MeshTextBatchTweenSeparateMaterial.shaderName, null, null, true);
            subShader = new SubShader$1(attributeMap, uniformMap);
            shader.addSubShader(subShader);
            var mainPass = subShader.addShaderPass(vs, ps, stateMap);
        }
        static __initDefine__() {
            MeshTextBatchTweenSeparateMaterial.SHADERDEFINE_ALBEDOTEXTURE = Shader3D$1.getDefineByName("ALBEDOTEXTURE");
            MeshTextBatchTweenSeparateMaterial.SHADERDEFINE_TILINGOFFSET = Shader3D$1.getDefineByName("TILINGOFFSET");
            MeshTextBatchTweenSeparateMaterial.SHADERDEFINE_ENABLEVERTEXCOLOR = Shader3D$1.getDefineByName("ENABLEVERTEXCOLOR");
        }
        get _ColorR() {
            return this._albedoColor.x;
        }
        set _ColorR(value) {
            this._albedoColor.x = value;
            this.albedoColor = this._albedoColor;
        }
        get _ColorG() {
            return this._albedoColor.y;
        }
        set _ColorG(value) {
            this._albedoColor.y = value;
            this.albedoColor = this._albedoColor;
        }
        get _ColorB() {
            return this._albedoColor.z;
        }
        set _ColorB(value) {
            this._albedoColor.z = value;
            this.albedoColor = this._albedoColor;
        }
        get _ColorA() {
            return this._albedoColor.w;
        }
        set _ColorA(value) {
            this._albedoColor.w = value;
            this.albedoColor = this._albedoColor;
        }
        get _AlbedoIntensity() {
            return this._albedoIntensity;
        }
        set _AlbedoIntensity(value) {
            if (this._albedoIntensity !== value) {
                var finalAlbedo = this._shaderValues.getVector(MeshTextBatchTweenSeparateMaterial.ALBEDOCOLOR);
                Vector4$1.scale(this._albedoColor, value, finalAlbedo);
                this._albedoIntensity = value;
                this._shaderValues.setVector(MeshTextBatchTweenSeparateMaterial.ALBEDOCOLOR, finalAlbedo);
            }
        }
        get _MainTex_STX() {
            return this._shaderValues.getVector(MeshTextBatchTweenSeparateMaterial.TILINGOFFSET).x;
        }
        set _MainTex_STX(x) {
            var tilOff = this._shaderValues.getVector(MeshTextBatchTweenSeparateMaterial.TILINGOFFSET);
            tilOff.x = x;
            this.tilingOffset = tilOff;
        }
        get _MainTex_STY() {
            return this._shaderValues.getVector(MeshTextBatchTweenSeparateMaterial.TILINGOFFSET).y;
        }
        set _MainTex_STY(y) {
            var tilOff = this._shaderValues.getVector(MeshTextBatchTweenSeparateMaterial.TILINGOFFSET);
            tilOff.y = y;
            this.tilingOffset = tilOff;
        }
        get _MainTex_STZ() {
            return this._shaderValues.getVector(MeshTextBatchTweenSeparateMaterial.TILINGOFFSET).z;
        }
        set _MainTex_STZ(z) {
            var tilOff = this._shaderValues.getVector(MeshTextBatchTweenSeparateMaterial.TILINGOFFSET);
            tilOff.z = z;
            this.tilingOffset = tilOff;
        }
        get _MainTex_STW() {
            return this._shaderValues.getVector(MeshTextBatchTweenSeparateMaterial.TILINGOFFSET).w;
        }
        set _MainTex_STW(w) {
            var tilOff = this._shaderValues.getVector(MeshTextBatchTweenSeparateMaterial.TILINGOFFSET);
            tilOff.w = w;
            this.tilingOffset = tilOff;
        }
        get _Cutoff() {
            return this.alphaTestValue;
        }
        set _Cutoff(value) {
            this.alphaTestValue = value;
        }
        get albedoColorR() {
            return this._ColorR;
        }
        set albedoColorR(value) {
            this._ColorR = value;
        }
        get albedoColorG() {
            return this._ColorG;
        }
        set albedoColorG(value) {
            this._ColorG = value;
        }
        get albedoColorB() {
            return this._ColorB;
        }
        set albedoColorB(value) {
            this._ColorB = value;
        }
        get albedoColorA() {
            return this._ColorA;
        }
        set albedoColorA(value) {
            this._ColorA = value;
        }
        get albedoColor() {
            return this._albedoColor;
        }
        set albedoColor(value) {
            var finalAlbedo = this._shaderValues.getVector(MeshTextBatchTweenSeparateMaterial.ALBEDOCOLOR);
            Vector4$1.scale(value, this._albedoIntensity, finalAlbedo);
            this._albedoColor = value;
            this._shaderValues.setVector(MeshTextBatchTweenSeparateMaterial.ALBEDOCOLOR, finalAlbedo);
        }
        get albedoIntensity() {
            return this._albedoIntensity;
        }
        set albedoIntensity(value) {
            this._AlbedoIntensity = value;
        }
        get albedoTexture() {
            return this._shaderValues.getTexture(MeshTextBatchTweenSeparateMaterial.ALBEDOTEXTURE);
        }
        set albedoTexture(value) {
            if (value)
                this._shaderValues.addDefine(MeshTextBatchTweenSeparateMaterial.SHADERDEFINE_ALBEDOTEXTURE);
            else
                this._shaderValues.removeDefine(MeshTextBatchTweenSeparateMaterial.SHADERDEFINE_ALBEDOTEXTURE);
            this._shaderValues.setTexture(MeshTextBatchTweenSeparateMaterial.ALBEDOTEXTURE, value);
        }
        get tilingOffsetX() {
            return this._MainTex_STX;
        }
        set tilingOffsetX(x) {
            this._MainTex_STX = x;
        }
        get tilingOffsetY() {
            return this._MainTex_STY;
        }
        set tilingOffsetY(y) {
            this._MainTex_STY = y;
        }
        get tilingOffsetZ() {
            return this._MainTex_STZ;
        }
        set tilingOffsetZ(z) {
            this._MainTex_STZ = z;
        }
        get tilingOffsetW() {
            return this._MainTex_STW;
        }
        set tilingOffsetW(w) {
            this._MainTex_STW = w;
        }
        get tilingOffset() {
            return this._shaderValues.getVector(MeshTextBatchTweenSeparateMaterial.TILINGOFFSET);
        }
        set tilingOffset(value) {
            if (value) {
                if (value.x != 1 || value.y != 1 || value.z != 0 || value.w != 0)
                    this._shaderValues.addDefine(MeshTextBatchTweenSeparateMaterial.SHADERDEFINE_TILINGOFFSET);
                else
                    this._shaderValues.removeDefine(MeshTextBatchTweenSeparateMaterial.SHADERDEFINE_TILINGOFFSET);
            }
            else {
                this._shaderValues.removeDefine(MeshTextBatchTweenSeparateMaterial.SHADERDEFINE_TILINGOFFSET);
            }
            this._shaderValues.setVector(MeshTextBatchTweenSeparateMaterial.TILINGOFFSET, value);
        }
        get enableVertexColor() {
            return this._enableVertexColor;
        }
        set enableVertexColor(value) {
            this._enableVertexColor = value;
            if (value)
                this._shaderValues.addDefine(MeshTextBatchTweenSeparateMaterial.SHADERDEFINE_ENABLEVERTEXCOLOR);
            else
                this._shaderValues.removeDefine(MeshTextBatchTweenSeparateMaterial.SHADERDEFINE_ENABLEVERTEXCOLOR);
        }
        set renderMode(value) {
            switch (value) {
                case MeshTextBatchTweenSeparateMaterial.RENDERMODE_OPAQUE:
                    this.alphaTest = false;
                    this.renderQueue = Material$1.RENDERQUEUE_OPAQUE;
                    this.depthWrite = true;
                    this.cull = RenderState$1.CULL_BACK;
                    this.blend = RenderState$1.BLEND_DISABLE;
                    this.depthTest = RenderState$1.DEPTHTEST_LESS;
                    break;
                case MeshTextBatchTweenSeparateMaterial.RENDERMODE_CUTOUT:
                    this.renderQueue = Material$1.RENDERQUEUE_ALPHATEST;
                    this.alphaTest = true;
                    this.depthWrite = true;
                    this.cull = RenderState$1.CULL_BACK;
                    this.blend = RenderState$1.BLEND_DISABLE;
                    this.depthTest = RenderState$1.DEPTHTEST_LESS;
                    break;
                case MeshTextBatchTweenSeparateMaterial.RENDERMODE_TRANSPARENT:
                    this.renderQueue = Material$1.RENDERQUEUE_TRANSPARENT;
                    this.alphaTest = false;
                    this.depthWrite = false;
                    this.cull = RenderState$1.CULL_BACK;
                    this.blend = RenderState$1.BLEND_ENABLE_ALL;
                    this.blendSrc = RenderState$1.BLENDPARAM_SRC_ALPHA;
                    this.blendDst = RenderState$1.BLENDPARAM_ONE_MINUS_SRC_ALPHA;
                    this.depthTest = RenderState$1.DEPTHTEST_LESS;
                    break;
                default:
                    throw new Error("MeshTextBatchTweenSeparateMaterial : renderMode value error.");
            }
        }
        get depthWrite() {
            return this._shaderValues.getBool(MeshTextBatchTweenSeparateMaterial.DEPTH_WRITE);
        }
        set depthWrite(value) {
            this._shaderValues.setBool(MeshTextBatchTweenSeparateMaterial.DEPTH_WRITE, value);
        }
        get cull() {
            return this._shaderValues.getInt(MeshTextBatchTweenSeparateMaterial.CULL);
        }
        set cull(value) {
            this._shaderValues.setInt(MeshTextBatchTweenSeparateMaterial.CULL, value);
        }
        get blend() {
            return this._shaderValues.getInt(MeshTextBatchTweenSeparateMaterial.BLEND);
        }
        set blend(value) {
            this._shaderValues.setInt(MeshTextBatchTweenSeparateMaterial.BLEND, value);
        }
        get blendSrc() {
            return this._shaderValues.getInt(MeshTextBatchTweenSeparateMaterial.BLEND_SRC);
        }
        set blendSrc(value) {
            this._shaderValues.setInt(MeshTextBatchTweenSeparateMaterial.BLEND_SRC, value);
        }
        get blendDst() {
            return this._shaderValues.getInt(MeshTextBatchTweenSeparateMaterial.BLEND_DST);
        }
        set blendDst(value) {
            this._shaderValues.setInt(MeshTextBatchTweenSeparateMaterial.BLEND_DST, value);
        }
        get depthTest() {
            return this._shaderValues.getInt(MeshTextBatchTweenSeparateMaterial.DEPTH_TEST);
        }
        set depthTest(value) {
            this._shaderValues.setInt(MeshTextBatchTweenSeparateMaterial.DEPTH_TEST, value);
        }
        get tweenPositionEnd() {
            return this._tweenPositionEnd;
        }
        set tweenPositionEnd(value) {
            this._tweenPositionEnd = value;
            this._shaderValues.setVector(MeshTextBatchTweenSeparateMaterial.TWEEN_POSITION_END, value);
        }
        clone() {
            var dest = new MeshTextBatchTweenSeparateMaterial();
            this.cloneTo(dest);
            dest._albedoIntensity = this._albedoIntensity;
            this._albedoColor.cloneTo(dest._albedoColor);
            return dest;
        }
    }
    MeshTextBatchTweenSeparateMaterial.shaderName = "MeshTextBatchTweenSeparate";
    MeshTextBatchTweenSeparateMaterial._isInstalled = false;
    MeshTextBatchTweenSeparateMaterial.RENDERMODE_OPAQUE = 0;
    MeshTextBatchTweenSeparateMaterial.RENDERMODE_CUTOUT = 1;
    MeshTextBatchTweenSeparateMaterial.RENDERMODE_TRANSPARENT = 2;
    MeshTextBatchTweenSeparateMaterial.RENDERMODE_ADDTIVE = 3;
    MeshTextBatchTweenSeparateMaterial.ALBEDOTEXTURE = Shader3D$1.propertyNameToID("u_AlbedoTexture");
    MeshTextBatchTweenSeparateMaterial.ALBEDOCOLOR = Shader3D$1.propertyNameToID("u_AlbedoColor");
    MeshTextBatchTweenSeparateMaterial.TILINGOFFSET = Shader3D$1.propertyNameToID("u_TilingOffset");
    MeshTextBatchTweenSeparateMaterial.TWEEN_POSITION_BEGIN = Shader3D$1.propertyNameToID("u_TweenPositionBegin");
    MeshTextBatchTweenSeparateMaterial.TWEEN_POSITION_END = Shader3D$1.propertyNameToID("u_TweenPositionEnd");
    MeshTextBatchTweenSeparateMaterial.CULL = Shader3D$1.propertyNameToID("s_Cull");
    MeshTextBatchTweenSeparateMaterial.BLEND = Shader3D$1.propertyNameToID("s_Blend");
    MeshTextBatchTweenSeparateMaterial.BLEND_SRC = Shader3D$1.propertyNameToID("s_BlendSrc");
    MeshTextBatchTweenSeparateMaterial.BLEND_DST = Shader3D$1.propertyNameToID("s_BlendDst");
    MeshTextBatchTweenSeparateMaterial.DEPTH_TEST = Shader3D$1.propertyNameToID("s_DepthTest");
    MeshTextBatchTweenSeparateMaterial.DEPTH_WRITE = Shader3D$1.propertyNameToID("s_DepthWrite");

    class MeshTextAtlas {
        constructor(texture, atlasData) {
            this.uid = 0;
            this.typeMap = new Map();
            this.uid = MeshTextAtlas.UID++;
            this.texture = texture;
            this.atlasData = atlasData;
            this.InitUV();
        }
        get textureWidth() {
            return this.atlasData.meta.size.w;
        }
        get textureHeight() {
            return this.atlasData.meta.size.h;
        }
        get UnlitMaterial() {
            if (!this._UnlitMaterial) {
                var m = new Laya.UnlitMaterial();
                m.renderMode = Laya.UnlitMaterial.RENDERMODE_TRANSPARENT;
                m.albedoTexture = this.texture;
                this._UnlitMaterial = m;
            }
            return this._UnlitMaterial;
        }
        get MeshTextBatchTweenMaterial() {
            if (!this._MeshTextBatchTweenMaterial) {
                var m = new MeshTextBatchTweenMaterial();
                m.renderMode = Laya.UnlitMaterial.RENDERMODE_TRANSPARENT;
                m.albedoTexture = this.texture;
                this._MeshTextBatchTweenMaterial = m;
            }
            return this._MeshTextBatchTweenMaterial;
        }
        get MeshTextBatchTweenSeparateMaterial() {
            if (!this._MeshTextBatchTweenMaterial) {
                var m = new MeshTextBatchTweenSeparateMaterial();
                m.renderMode = Laya.UnlitMaterial.RENDERMODE_TRANSPARENT;
                m.albedoTexture = this.texture;
                this._MeshTextBatchTweenSeparateMaterial = m;
            }
            return this._MeshTextBatchTweenSeparateMaterial;
        }
        static LoadAsync(path, type) {
            return new Promise((resolve) => {
                Laya.loader.load(path, Laya.Handler.create(this, (data) => {
                    resolve(data);
                }), null, type);
            });
        }
        static Load3DAsync(path, type) {
            return new Promise((resolve) => {
                Laya.loader.create(path, Laya.Handler.create(this, (data) => {
                    Laya.timer.frameOnce(1, this, () => {
                        resolve(data);
                    });
                }), null, type);
            });
        }
        static async CreateAsync(texturePath, atlasPath) {
            var texture = await this.LoadAsync(texturePath, Laya.Loader.TEXTURE2D);
            var atlasData = await this.LoadAsync(atlasPath, Laya.Loader.JSON);
            var atlas = new MeshTextAtlas(texture, atlasData);
            return atlas;
        }
        InitUV() {
            var atlasData = this.atlasData;
            var textureWidth = atlasData.meta.size.w;
            var textureHeight = atlasData.meta.size.h;
            for (var frameKey in atlasData.frames) {
                var frame = atlasData.frames[frameKey];
                frame.frameUV =
                    {
                        xMin: frame.frame.x / textureWidth,
                        yMin: frame.frame.y / textureHeight,
                        xMax: (frame.frame.x + frame.frame.w) / textureWidth,
                        yMax: (frame.frame.y + frame.frame.h) / textureHeight,
                        r: frame.frame.w / frame.frame.h
                    };
            }
        }
        GetType(typeKey) {
            return this.typeMap.get(typeKey);
        }
        GetOrCreateType(typeKey) {
            if (!this.typeMap.has(typeKey)) {
                this.typeMap.set(typeKey, new Map());
            }
            return this.typeMap.get(typeKey);
        }
        GenerateNumType(numTypeName, typeKey) {
            if (typeKey === undefined) {
                typeKey = numTypeName;
            }
            var map = this.GetOrCreateType(typeKey);
            for (var i = 0; i <= 9; i++) {
                var frameName = numTypeName + i;
                var frame = this.atlasData.frames[frameName];
                if (frame) {
                    map.set(i.toString(), frame);
                }
                else {
                    console.warn("文字图集里没找到字符:" + i);
                    continue;
                }
            }
            var flags = ["-", "+"];
            for (var flag of flags) {
                var frameName = numTypeName + flag;
                var frame = this.atlasData.frames[frameName];
                if (frame) {
                    map.set(i.toString(), frame);
                }
            }
        }
        AddToType(chart, frameName, typeKey) {
            if (frameName === undefined) {
                frameName = chart;
            }
            var map = this.GetOrCreateType(typeKey);
            var frame = this.atlasData.frames[frameName];
            if (frame) {
                map.set(chart, frame);
            }
        }
        AddToAllType(chart, frameName) {
            if (frameName === undefined) {
                frameName = chart;
            }
            var frame = this.atlasData.frames[frameName];
            if (frame) {
                this.typeMap.forEach((map, key) => {
                    map.set(chart, frame);
                });
            }
        }
        GetTypeFrame(chart, typeKey) {
            var map = this.GetType(typeKey);
            return map.get(chart);
        }
        GetFrame(chart, typeKey) {
            var frame;
            if (typeKey !== undefined) {
                frame = this.GetTypeFrame(chart, typeKey);
                if (frame) {
                    return frame;
                }
            }
            frame = this.atlasData.frames[chart];
            return frame;
        }
    }
    MeshTextAtlas.UID = 0;

    class MeshTextLib {
        static async InitAsync() {
            await MeshTextBatchTweenMaterial.install();
            await MeshTextBatchTweenSeparateMaterial.install();
        }
        static async LoadDefalutAsync() {
            if (this.defaultAtlas) {
                return;
            }
            var texturePath, atlasPath;
            texturePath = "res/font/WarMeshText.png";
            atlasPath = "res/font/WarMeshText.txt";
            var atlas = await MeshTextAtlas.CreateAsync(texturePath, atlasPath);
            atlas.GenerateNumType(MeshTextType.white);
            atlas.GenerateNumType(MeshTextType.red);
            atlas.GenerateNumType(MeshTextType.green);
            atlas.AddToAllType("c");
            atlas.AddToAllType("d");
            var batchMesh = new MeshTextBatchMesh(atlas);
            var meshTextBatchSprite = new MeshTextBatchSprite(batchMesh);
            meshTextBatchSprite.meshRenderer.sharedMaterial = atlas.MeshTextBatchTweenMaterial;
            meshTextBatchSprite.meshRenderer.sharedMaterial.renderQueue = Laya.BaseMaterial.RENDERQUEUE_TRANSPARENT + 500;
            this.defaultAtlas = atlas;
            this.defaultMeshTextBatchMesh = batchMesh;
            this.defaultMeshTextBatchSprite = meshTextBatchSprite;
        }
    }
    window['MeshTextBatchMesh'] = MeshTextBatchMesh;
    window['MeshTextBatchSprite'] = MeshTextBatchSprite;
    window['ToolMeshText'] = ToolMeshText;
    window['MeshTextAtlas'] = MeshTextAtlas;
    window['MeshTextType'] = MeshTextType;
    window['HorizontalAlignType'] = HorizontalAlignType;
    window['MeshTextBatchTweenMaterial'] = MeshTextBatchTweenMaterial;
    window['MeshTextBatchTweenSeparateMaterial'] = MeshTextBatchTweenSeparateMaterial;
    window['MeshTextLib'] = MeshTextLib;

    class TestShader {
        constructor() {
            this.atlasKeyTypeList = [MeshTextType.white, MeshTextType.red, MeshTextType.green];
            this.strList = [];
            this.scene = TestScene.create();
            Laya.stage.addChild(this.scene);
            this.InitAsync();
        }
        async InitAsync() {
            await MeshTextLib.InitAsync();
            this.TestTextMesh();
        }
        async TestTextMesh() {
            await MeshTextLib.LoadDefalutAsync();
            var batchMesh = MeshTextLib.defaultMeshTextBatchMesh;
            batchMesh.StartUpdate();
            window['batchMesh'] = batchMesh;
            this.scene.addChild(MeshTextLib.defaultMeshTextBatchSprite);
            for (var j = 0; j <= 100; j++) {
                if (Random.range(1, 10) > 8) {
                    str = "d";
                    this.strList[j] = str;
                    continue;
                }
                var str = "";
                if (Random.range(1, 10) > 7) {
                    str = "c";
                }
                var num = Random.range(1, 5);
                for (var i = 0; i <= num; i++) {
                    str += Random.rangeBoth(0, 9).toString();
                }
                this.strList[j] = str;
            }
            for (var i = 0; i < 100; i++) {
                this.createText(batchMesh, new Laya.Vector3(Math.random() * 8 + -4, Math.random() * 3 + -2, 0));
            }
        }
        createText(batchMesh, position = new Laya.Vector3(0, 0, 0)) {
            var text = this.strList[Random.range(0, this.strList.length)];
            var atlasKeyType = this.atlasKeyTypeList[Random.range(0, this.atlasKeyTypeList.length)];
            var item = batchMesh.PlayItem(text, position, atlasKeyType, 0.5, 1.5);
            var fun = () => {
                this.createText(batchMesh, position);
            };
            Laya.timer.once(Random.range(250, 600), this, fun);
        }
    }

    var Scene = Laya.Scene;
    var REG = Laya.ClassUtils.regClass;
    var ui;
    (function (ui) {
        var test;
        (function (test) {
            class TestSceneUI extends Scene {
                constructor() { super(); }
                createChildren() {
                    super.createChildren();
                    this.loadScene("test/TestScene");
                }
            }
            test.TestSceneUI = TestSceneUI;
            REG("ui.test.TestSceneUI", TestSceneUI);
        })(test = ui.test || (ui.test = {}));
    })(ui || (ui = {}));

    class GameUI extends ui.test.TestSceneUI {
        constructor() {
            super();
            var scene = Laya.stage.addChild(new Laya.Scene3D());
            var camera = (scene.addChild(new Laya.Camera(0, 0.1, 100)));
            camera.transform.translate(new Laya.Vector3(0, 3, 3));
            camera.transform.rotate(new Laya.Vector3(-30, 0, 0), true, false);
            var directionLight = scene.addChild(new Laya.DirectionLight());
            directionLight.color = new Laya.Vector3(0.6, 0.6, 0.6);
            directionLight.transform.worldMatrix.setForward(new Laya.Vector3(1, -1, 0));
            var box = scene.addChild(new Laya.MeshSprite3D(Laya.PrimitiveMesh.createBox(1, 1, 1)));
            box.transform.rotate(new Laya.Vector3(0, 45, 0), false, false);
            var material = new Laya.BlinnPhongMaterial();
            Laya.Texture2D.load("res/layabox.png", Laya.Handler.create(null, function (tex) {
                material.albedoTexture = tex;
            }));
            box.meshRenderer.material = material;
        }
    }

    class GameConfig {
        constructor() { }
        static init() {
            var reg = Laya.ClassUtils.regClass;
            reg("script/GameUI.ts", GameUI);
        }
    }
    GameConfig.width = 1334;
    GameConfig.height = 750;
    GameConfig.scaleMode = "fixedwidth";
    GameConfig.screenMode = Laya.Stage.SCREEN_NONE;
    GameConfig.alignV = "top";
    GameConfig.alignH = "left";
    GameConfig.startScene = "test/TestScene.scene";
    GameConfig.sceneRoot = "";
    GameConfig.debug = false;
    GameConfig.stat = true;
    GameConfig.physicsDebug = false;
    GameConfig.exportSceneToJson = true;
    GameConfig.init();

    class TestMain {
        constructor() {
            this.InitLaya();
            if (Laya.Browser.onWeiXin) {
                Laya.URL.basePath = "http://192.168.1.10:8900/bin/";
            }
            new TestShader();
        }
        InitLaya() {
            if (window["Laya3D"])
                Laya3D.init(GameConfig.width, GameConfig.height);
            else
                Laya.init(GameConfig.width, GameConfig.height, Laya["WebGL"]);
            Laya["Physics"] && Laya["Physics"].enable();
            Laya["DebugPanel"] && Laya["DebugPanel"].enable();
            Laya.stage.scaleMode = GameConfig.scaleMode;
            Laya.stage.screenMode = GameConfig.screenMode;
            Laya.stage.alignV = GameConfig.alignV;
            Laya.stage.alignH = GameConfig.alignH;
            Laya.URL.exportSceneToJson = GameConfig.exportSceneToJson;
            Laya.Shader3D.debugMode = true;
            if (GameConfig.physicsDebug && Laya["PhysicsDebugDraw"])
                Laya["PhysicsDebugDraw"].enable();
            if (GameConfig.stat)
                Laya.Stat.show();
            Laya.alertGlobalError = true;
        }
    }
    new TestMain();

}());

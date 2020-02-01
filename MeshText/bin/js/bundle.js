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
            camera.transform.localPosition = new Vector3(0, 0, 10);
            camera.clearColor = new Laya.Vector4(0.2, 0.5, 0.8, 1);
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

    var VertexMesh = Laya.VertexMesh;
    class ToolMeshText {
        static CreateTextMesh(text, hAlignType, atlas, atlaTypeKey) {
            var vertexDeclaration = VertexMesh.getVertexDeclaration("POSITION,UV");
            var vertices = [];
            var indices = [];
            let length = text.length;
            var verticeCount = length << 2;
            vertices.length = verticeCount;
            indices.length = (length << 1) * 3;
            this.SetVerticesBuffer(vertices, text, hAlignType, atlas, atlaTypeKey);
            this.SetIndicesBuffer(indices);
            var verticesBuffer = new Float32Array(vertices);
            var indicesBuffer = new Uint16Array(indices);
            return Laya.PrimitiveMesh._createMesh(vertexDeclaration, verticesBuffer, indicesBuffer);
        }
        static RefreshTextMesh(mesh, text, hAlignType, atlas, atlaTypeKey) {
            this.SetVerticesBuffer(mesh._vertexBuffer.getFloat32Data(), text, hAlignType, atlas, atlaTypeKey);
            this.PushGPUVertexBuffer(mesh);
        }
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
        static SetVerticesBuffer(verticesBuffer, text, hAlignType, atlas, atlaTypeKey) {
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
            let onceVerticeLength = oncePosLength + onceUVLength;
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
                var iPos = i * onceVerticeLength;
                verticesBuffer[iPos + 0] = offestH;
                verticesBuffer[iPos + 1] = tmp + 1;
                verticesBuffer[iPos + 2] = 0;
                iPos += onceVerticeLength;
                verticesBuffer[iPos + 0] = offestH;
                verticesBuffer[iPos + 1] = tmp;
                verticesBuffer[iPos + 2] = 0;
                offestH += r;
                iPos += onceVerticeLength;
                verticesBuffer[iPos + 0] = offestH;
                verticesBuffer[iPos + 1] = tmp + 1;
                verticesBuffer[iPos + 2] = 0;
                iPos += onceVerticeLength;
                verticesBuffer[iPos + 0] = offestH;
                verticesBuffer[iPos + 1] = tmp;
                verticesBuffer[iPos + 2] = 0;
                var iUV = i * onceVerticeLength + oncePosLength;
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
        static PushGPUVertexBuffer(mesh) {
            var vertexBuffer = mesh._vertexBuffer;
            var buffer = vertexBuffer.getUint8Data();
            vertexBuffer.bind();
            Laya.LayaGL.instance.bufferSubData(vertexBuffer._bufferType, 0, buffer);
        }
    }

    class ToolMeshTextMeshCache {
        static GetKey(text, atlas, atlaTypeKey, hAlignType = HorizontalAlignType.Center) {
            return text + atlas.uid + (atlaTypeKey ? atlaTypeKey : "") + hAlignType;
        }
        static GetCache(text, atlas, atlaTypeKey, hAlignType = HorizontalAlignType.Center) {
            var key = this.GetKey(text, atlas, atlaTypeKey, hAlignType);
            var mesh;
            if (!this.cache.has(key)) {
                mesh = ToolMeshText.CreateTextMesh(text, hAlignType, atlas, atlaTypeKey);
                mesh['__cacheKey'] = key;
                this.cache.set(key, mesh);
            }
            else {
                mesh = this.cache.get(key);
            }
            return mesh;
        }
        static RemoveCacheUse(mesh) {
            mesh['__cacheReferenceCount'] = mesh['__cacheReferenceCount'] ? mesh['__cacheReferenceCount'] - 1 : 0;
        }
        static AddCacheUse(mesh) {
            mesh['__cacheReferenceCount'] = mesh['__cacheReferenceCount'] ? mesh['__cacheReferenceCount'] + 1 : 1;
            mesh['__cacheReferenceLastTime'] = Laya.timer.currTimer;
        }
        static DestoryNoUse() {
            var list = [];
            this.cache.forEach((mesh, key) => {
                var referenceCount = mesh['__cacheReferenceCount'];
                if (referenceCount <= 0) {
                    list.push(mesh);
                }
            });
            for (var mesh of list) {
                var key = mesh['__cacheKey'];
                this.cache.delete(key);
                mesh.destroy();
            }
            list.length = 0;
        }
    }
    ToolMeshTextMeshCache.cache = new Map();

    var Vector3$1 = Laya.Vector3;
    var HorizontalAlignType;
    (function (HorizontalAlignType) {
        HorizontalAlignType[HorizontalAlignType["Left"] = 0] = "Left";
        HorizontalAlignType[HorizontalAlignType["Center"] = 1] = "Center";
        HorizontalAlignType[HorizontalAlignType["Right"] = 2] = "Right";
    })(HorizontalAlignType || (HorizontalAlignType = {}));
    class MeshText extends Laya.MeshSprite3D {
        constructor(name) {
            super(null, name);
            this.hAlignType = HorizontalAlignType.Center;
            this.useCacheMesh = false;
            this._text = "";
            this._tweenPos = new Vector3$1();
            this._tweenRate = 0;
            this.lastTextLength = 0;
            this.lastText = "";
        }
        get Text() {
            return this._text;
        }
        set Text(value) {
            this._text = value;
            if (value === undefined || value === null) {
                this._text = "";
            }
            this.GenerateFilter();
        }
        get tweenRate() {
            return this._tweenRate;
        }
        set tweenRate(value) {
            this._tweenRate = value;
            Vector3$1.lerp(this.transform.position, this.tweenEndPos, value, this._tweenPos);
            this.transform.position = this._tweenPos;
            this.meshRenderer._boundsChange = false;
        }
        Init(atlas, atlaTypeKey, useCacheMesh = false, hAlignType = HorizontalAlignType.Center) {
            this.atlas = atlas;
            this.atlaTypeKey = atlaTypeKey;
            this.hAlignType = hAlignType;
            this.useCacheMesh = useCacheMesh;
            this.meshRenderer.sharedMaterial = this.atlas.UnlitMaterial;
        }
        GenerateFilter() {
            if (this.lastText == this._text) {
                return;
            }
            if (this.useCacheMesh) {
                if (this.mesh) {
                    ToolMeshTextMeshCache.RemoveCacheUse(this.mesh);
                }
                this.mesh = ToolMeshTextMeshCache.GetCache(this._text, this.atlas, this.atlaTypeKey, this.hAlignType);
                ToolMeshTextMeshCache.AddCacheUse(this.mesh);
                this.setMesh(this.mesh);
            }
            else {
                if (this.mesh) {
                    if (this._text.length == this.lastTextLength) {
                        ToolMeshText.RefreshTextMesh(this.mesh, this._text, this.hAlignType, this.atlas, this.atlaTypeKey);
                    }
                    else {
                        if (this.mesh != null) {
                            this.mesh.destroy();
                        }
                        this.mesh = ToolMeshText.CreateTextMesh(this._text, this.hAlignType, this.atlas, this.atlaTypeKey);
                        this.setMesh(this.mesh);
                    }
                }
                else {
                    this.mesh = ToolMeshText.CreateTextMesh(this._text, this.hAlignType, this.atlas, this.atlaTypeKey);
                    this.setMesh(this.mesh);
                }
            }
            this.lastTextLength = this._text.length;
            this.lastText = this._text;
        }
        setMesh(mesh) {
            this.mesh = mesh;
            (mesh) && (this.meshFilter.sharedMesh = mesh);
        }
    }

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

    var MeshTextType;
    (function (MeshTextType) {
        MeshTextType["white"] = "white_";
        MeshTextType["red"] = "red_";
        MeshTextType["green"] = "green_";
    })(MeshTextType || (MeshTextType = {}));

    class TestShader {
        constructor() {
            this.strList = [];
            this.scene = TestScene.create();
            Laya.stage.addChild(this.scene);
            this.TestTextMesh();
        }
        async InitAsync() {
        }
        async TestTextMesh() {
            var isShowLine = false;
            var texturePath, atlasPath;
            texturePath = "res/font/WarMeshText.png";
            atlasPath = "res/font/WarMeshText.txt";
            var atlas = await MeshTextAtlas.CreateAsync(texturePath, atlasPath);
            console.log(atlas);
            atlas.GenerateNumType(MeshTextType.white);
            atlas.GenerateNumType(MeshTextType.red);
            atlas.GenerateNumType(MeshTextType.green);
            atlas.AddToAllType("c");
            atlas.AddToAllType("d");
            for (var j = 0; j <= 30; j++) {
                var str = "cd";
                for (var i = 0; i <= 9; i++) {
                    str += Random.rangeBoth(0, 9).toString();
                }
                this.strList[j] = str;
            }
            for (var i = 0; i < 100; i++) {
                this.createText(atlas, isShowLine, new Laya.Vector3(Random.range(-5, 5), Random.range(-5, 5), 0));
            }
        }
        createText(atlas, isShowLine, position = new Laya.Vector3(0, 0, 0)) {
            var mestText = new MeshText();
            mestText.Init(atlas, MeshTextType.white, true);
            mestText.Text = "cd0123456789";
            window['mestText'] = mestText;
            var scale = Math.random() * 0.5 + 0.2;
            mestText.transform.position = position;
            mestText.transform.localScale = new Laya.Vector3(scale, scale, scale);
            mestText._isStatic = true;
            this.scene.addChild(mestText);
            if (isShowLine) {
                var boxLineSprite3D = this.scene.addChild(new Laya.PixelLineSprite3D(100));
            }
            var position2 = position.clone();
            position2.y += 3;
            mestText.tweenEndPos = position2;
            var fun = () => {
                mestText.Text = this.strList[Random.range(0, this.strList.length)];
                mestText.transform.position = position;
                mestText.tweenRate = 0;
                Laya.Tween.to(mestText, { tweenRate: 1 }, 1000, Laya.Ease.linearNone, null, 0, false);
                Laya.timer.once(Random.range(1000, 2000), this, fun);
            };
            Laya.timer.once(100, this, fun);
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
    GameConfig.width = 640;
    GameConfig.height = 1136;
    GameConfig.scaleMode = "fixedwidth";
    GameConfig.screenMode = "none";
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
                Laya.URL.basePath = "http://10.10.10.188:8900/bin/";
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

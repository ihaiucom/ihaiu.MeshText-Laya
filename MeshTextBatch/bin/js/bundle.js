(function () {
    'use strict';

    var REG = Laya.ClassUtils.regClass;
    var ui;
    (function (ui) {
        var test;
        (function (test) {
            class TestSceneUI extends Laya.Scene {
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

    var TextStyleType;
    (function (TextStyleType) {
        TextStyleType[TextStyleType["White"] = 0] = "White";
        TextStyleType[TextStyleType["Red"] = 1] = "Red";
        TextStyleType[TextStyleType["Green"] = 2] = "Green";
        TextStyleType[TextStyleType["WhiteBig"] = 3] = "WhiteBig";
        TextStyleType[TextStyleType["YelloBig"] = 4] = "YelloBig";
    })(TextStyleType || (TextStyleType = {}));

    class TextStyleMap {
        constructor() {
            this.typeMap = new Map();
            this.chartsCache = new Map();
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
        GenerateNumType(charts, typeKey) {
            var map = this.GetOrCreateType(typeKey);
            for (var i = 0; i <= 9; i++) {
                map.set(i.toString(), charts[i]);
            }
        }
        AddToAllType(chart, fontChart) {
            if (fontChart === undefined) {
                fontChart = chart;
            }
            this.typeMap.forEach((map, key) => {
                map.set(chart, fontChart);
            });
        }
        AddToType(chart, fontChart, typeKey) {
            var map = this.GetOrCreateType(typeKey);
            map.set(chart, fontChart);
        }
        GetOrCreateCache(typeKey) {
            if (!this.chartsCache.has(typeKey)) {
                this.chartsCache.set(typeKey, new Map());
            }
            return this.chartsCache.get(typeKey);
        }
        GetCharts(txt, typeKey) {
            var cahceMap = this.GetOrCreateCache(typeKey);
            if (cahceMap.has(txt)) {
                return cahceMap.get(txt);
            }
            if (typeKey == this.defaultType) {
                return txt;
            }
            var map = this.GetType(typeKey);
            var str = "";
            for (var i = 0, len = txt.length; i < len; i++) {
                if (map.has(txt[i])) {
                    var chart = map.get(txt[i]);
                    str += chart;
                }
                else {
                    str += txt[i];
                }
            }
            cahceMap.set(txt, str);
            return str;
        }
    }

    var Vector3$1 = Laya.Vector3;
    var Tween = Laya.Tween;
    var Ease = Laya.Ease;
    class WarBitmapTextItem {
        constructor(bitmapText, index) {
            this.index = 0;
            this.scale = 1;
            this._text = "";
            this.position = new Vector3$1();
            this.startX = 0;
            this.startY = 0;
            this.tweenRate = 0;
            this.tweenSpeed = 1;
            this.speedRandom = Math.random() * 0.5 + 0.7;
            this.tweenValue = 0;
            this.bitmapText = bitmapText;
            this.index = index;
            var tf = new Laya.Text();
            tf.font = bitmapText.fontName;
            tf.width = 250;
            tf.height = 50;
            tf.pivotX = 0.5;
            tf.pivotY = 0.5;
            this.textTF = tf;
        }
        get Text() {
            return this._text;
        }
        set Text(value) {
            if (value === undefined || value === null) {
                value = "";
            }
            if (this.bitmapText.textStyleMap) {
                value == this.bitmapText.textStyleMap.GetCharts(value, this.atlaTypeKey);
            }
            if (this._text == value) {
                return;
            }
            this.textTF.text = value;
        }
        StartTween() {
            var textTF = this.textTF;
            this.tweenRate = 0;
            this.tweenValue = 0;
            let ratio = Number(Math.random().toFixed(2));
            this.startX = textTF.x = (textTF.x - 40 + 80 * ratio);
            this.startY = textTF.y = (textTF.y - 80 * ratio);
            textTF.scale(0, 0);
            textTF.alpha = 1.0;
            Tween.to(textTF, { scaleX: 1.5, scaleY: 1.5 }, 144, Ease.linearNone, null, 0, false);
            Tween.to(textTF, { scaleX: 0.8, scaleY: 0.8 }, 144, Ease.linearNone, null, 144, false);
            Tween.to(textTF, { y: this.startY - 80, alpha: 0.0 }, 400, Ease.linearNone, Laya.Handler.create(this, this.RecoverPool), 448, false);
        }
        UpdateTween(delta) {
            this.tweenRate += delta * this.tweenSpeed;
            this.tweenValue = Mathf.Lerp(this.tweenValue * 0.25, 1.0, this.tweenRate);
            if (this.tweenValue >= 1) {
                this.RecoverPool();
            }
        }
        RecoverPool() {
            this.textTF.removeSelf();
            Tween.clearAll(this.textTF);
            this.bitmapText.RemoveTweenItem(this);
            this.bitmapText.RecoverItem(this);
        }
    }

    var Text = Laya.Text;
    var BitmapFont = Laya.BitmapFont;
    var Handler = Laya.Handler;
    class WarBitmapText extends Laya.Sprite {
        constructor() {
            super();
            this.uid = 0;
            this.fontName = "WarFont";
            this.useItemList = [];
            this.tweenItemList = [];
            this.uid = WarBitmapText.UID++;
            this.itemPoolKey = "WarBitmapTextItem__" + this.uid;
        }
        static async LoadDefaultAsync() {
            this.default = new WarBitmapText();
            var style = new TextStyleMap();
            this.default.textStyleMap = style;
            style.GenerateNumType("012345679", TextStyleType.White);
            style.GenerateNumType("qwertyuiop", TextStyleType.Red);
            style.GenerateNumType("asdfghjkl;", TextStyleType.Green);
            style.GenerateNumType("zxcvbnm,./", TextStyleType.YelloBig);
            style.GenerateNumType("零一二三四五六七八九", TextStyleType.WhiteBig);
            style.AddToAllType("d", "闪");
            style.AddToAllType("c", "暴");
            style.AddToType("c", "爆", TextStyleType.Red);
            return new Promise((resolve) => {
                this.default.LoadFont("res/font/WarFont-export.fnt", () => {
                    this.default.InitItemPool();
                    resolve(this.default);
                });
            });
        }
        LoadFont(path, callback) {
            var bitmapFont = new BitmapFont();
            this.bitmapFont = bitmapFont;
            bitmapFont.loadFont(path, new Handler(this, () => {
                bitmapFont.setSpaceWidth(10);
                Text.registerBitmapFont(this.fontName, bitmapFont);
                if (callback) {
                    callback();
                }
            }));
        }
        InitItemPool(maxTextNum = 100) {
            for (var i = maxTextNum - 1; i >= 0; i--) {
                var item = new WarBitmapTextItem(this, i);
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
            item.textTF.pos(position.x, position.y);
            item.scale = scale;
            item.Text = text;
            this.useItemList.push(item);
            return item;
        }
        PlayItem(text, position = new Laya.Vector3(0, 0, 0), atlaTypeKey, scale = 1.0, tweenSpeed = 1.0) {
            var item = this.GetItem(text, position, atlaTypeKey, scale);
            item.tweenSpeed = tweenSpeed;
            this.addChild(item.textTF);
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
            var delta = Laya.timer.delta * 0.001;
            for (var i = this.tweenItemList.length - 1; i >= 0; i--) {
                var item = this.tweenItemList[i];
                item.UpdateTween(delta);
            }
        }
    }
    WarBitmapText.UID = 0;

    class TestShader3 {
        constructor() {
            this.atlasKeyTypeList = [TextStyleType.White, TextStyleType.Red, TextStyleType.Green, TextStyleType.WhiteBig, TextStyleType.YelloBig];
            this.strList = [];
            this.scene = TestScene.create();
            Laya.stage.addChild(this.scene);
            this.InitAsync();
        }
        async InitAsync() {
            this.TestTextMesh();
        }
        async TestTextMesh() {
            await WarBitmapText.LoadDefaultAsync();
            var batchMesh = WarBitmapText.default;
            batchMesh.StartUpdate();
            window['batchMesh'] = batchMesh;
            Laya.stage.addChild(batchMesh);
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
            for (var i = 0; i < 30; i++) {
                this.createText(batchMesh, new Laya.Vector3(Random.range(50, Laya.stage.width - 100), Random.range(50, Laya.stage.height - 100), 0));
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

    class TestMain {
        constructor() {
            this.InitLaya();
            if (Laya.Browser.onWeiXin) {
                Laya.URL.basePath = "http://192.168.1.10:8900/bin/";
            }
            new TestShader3();
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

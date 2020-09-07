var laya = (function () {
    'use strict';

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

    var Vector3 = Laya.Vector3;
    var Tween = Laya.Tween;
    class WarBitmapTextItem {
        constructor(bitmapText, index) {
            this.index = 0;
            this.scale = 1;
            this._text = "";
            this._text2 = "";
            this.position = new Vector3();
            this.startX = 0;
            this.startY = 0;
            this.endY = 0;
            this.tweenRate = 0;
            this.tweenSpeed = 1;
            this.speedRandom = Math.random() * 0.5 + 0.7;
            this.tweenValue = 0;
            this.bitmapText = bitmapText;
            this.index = index;
            var tf = new Laya.Text();
            tf.font = bitmapText.fontName;
            tf.align = "center";
            tf.width = 250;
            tf.height = 50;
            tf.pivotX = 0.5 * tf.width;
            tf.pivotY = 0.5 * tf.height;
            this.textTF = tf;
        }
        get Text() {
            return this._text;
        }
        set Text(value) {
            if (this._text == value) {
                return;
            }
            if (value === undefined || value === null) {
                value = "";
            }
            var str = value;
            if (this.bitmapText.textStyleMap) {
                str = this.bitmapText.textStyleMap.GetCharts(value, this.atlaTypeKey);
            }
            if (this._text2 == str) {
                return;
            }
            this._text = value;
            this._text2 = str;
            this.textTF.changeText(str);
        }
        StartTween() {
            var textTF = this.textTF;
            this.tweenRate = 0;
            this.tweenValue = 0;
            let ratio = Number(Math.random().toFixed(2));
            this.startX = textTF.x = (textTF.x - 40 + 80 * ratio);
            this.startY = textTF.y = (textTF.y - 80 * ratio);
            this.endY = this.startY - 80;
            textTF.scale(0, 0);
            textTF.alpha = 1.0;
            this.bitmapText.AddTweenItem(this);
        }
        UpdateTween(delta) {
            var t = this.tweenRate += delta * this.tweenSpeed;
            if (t < 0.17) {
                var scale = Mathf.Lerp(0, 1.5, t / 0.17);
                this.textTF.scale(scale, scale);
            }
            else if (t < 0.34) {
                var scale = Mathf.Lerp(1.5, 0.8, (t - 0.17) / 0.17);
                this.textTF.scale(scale, scale);
            }
            else if (t > 0.52) {
                t = (t - 0.52) / 0.48;
                this.textTF.y = Mathf.Lerp(this.startY, this.endY, t);
                this.textTF.alpha = 1 - t;
            }
            if (this.tweenRate >= 1) {
                this.OnTweenEnd();
            }
        }
        Clear() {
            Tween.clearAll(this.textTF);
            this.bitmapText.RemoveTweenItem(this);
        }
        OnTweenEnd() {
            Tween.clearAll(this.textTF);
            if (this.bitmapText.debugItemLoop) {
                this.textTF.pos(this.position.x, this.position.y);
                this.StartTween();
                return;
            }
            this.RecoverPool();
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
            this.enable = true;
            this.debugItemLoop = false;
            this.uid = 0;
            this.fontName = "WarFont";
            this.textItemCache = new Map();
            this.useItemList = [];
            this.tweenItemList = [];
            this.uid = WarBitmapText.UID++;
            this.itemPoolKey = "WarBitmapTextItem__" + this.uid;
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
        GetItemCacheByType(text, atlaTypeKey) {
            var typeMap;
            if (this.textItemCache.has(atlaTypeKey)) {
                typeMap = this.textItemCache.get(atlaTypeKey);
            }
            else {
                typeMap = new Map();
                this.textItemCache.set(atlaTypeKey, typeMap);
            }
            if (typeMap.has(text)) {
                return typeMap.get(text);
            }
            else {
                var list = [];
                typeMap.set(text, list);
                return list;
            }
        }
        RecoverItemCache(item) {
            var list = this.GetItemCacheByType(item.Text, item.atlaTypeKey);
            list.push(item);
        }
        RemoveFromItemCache(item) {
            if (!item.atlaTypeKey) {
                return;
            }
            var list = this.GetItemCacheByType(item.Text, item.atlaTypeKey);
            var i = list.indexOf(item);
            if (i != -1) {
                list.splice(i, 1);
            }
        }
        GetItemCache(text, atlaTypeKey) {
            var list = this.GetItemCacheByType(text, atlaTypeKey);
            if (list.length > 0) {
                var item = list.shift();
                var pool = Laya.Pool.getPoolBySign(this.itemPoolKey);
                var i = pool.indexOf(item);
                if (i != -1) {
                    item[Laya.Pool.POOLSIGN] = false;
                    pool.splice(i, 1);
                }
                return item;
            }
            return null;
        }
        GetItem(text, position = new Laya.Vector3(0, 0, 0), atlaTypeKey, scale = 1.0) {
            var item = this.GetItemCache(text, atlaTypeKey);
            if (item == null) {
                item = Laya.Pool.getItem(this.itemPoolKey);
                if (item) {
                    this.RemoveFromItemCache(item);
                }
            }
            if (item == null) {
                if (this.useItemList.length > 0) {
                    item = this.useItemList.shift();
                    item.Clear();
                    this.RemoveFromItemCache(item);
                }
            }
            if (!item) {
                return null;
            }
            if (this.camera) {
                this.camera.worldToViewportPoint(position, item.position);
                position = item.position;
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
            if (!this.enable)
                return;
            var item = this.GetItem(text, position, atlaTypeKey, scale);
            if (!item) {
                return null;
            }
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
            this.RecoverItemCache(item);
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
        SetParent(parent, parentIndex) {
            this.__parent = parent;
            this.__parentIndex = parentIndex;
        }
        Show() {
            if (this.__parentIndex != undefined) {
                this.__parent.addChildAt(this, this.__parentIndex);
            }
            else {
                this.__parent.addChild(this);
            }
            this.StartUpdate();
        }
        Hide() {
            this.Clear();
            this.removeSelf();
            this.StopUpdate();
        }
        Clear() {
            while (this.useItemList.length > 0) {
                var item = this.useItemList.shift();
                item.RecoverPool();
            }
            this.tweenItemList.length = 0;
        }
    }
    WarBitmapText.UID = 0;

    var TextStyleType;
    (function (TextStyleType) {
        TextStyleType[TextStyleType["White"] = 0] = "White";
        TextStyleType[TextStyleType["Red"] = 1] = "Red";
        TextStyleType[TextStyleType["Yellow"] = 2] = "Yellow";
        TextStyleType[TextStyleType["Green"] = 3] = "Green";
    })(TextStyleType || (TextStyleType = {}));

    class WarBitmapTextLib {
        static async LoadDefalutAsync() {
            if (this.defaultAtlas) {
                return;
            }
            var text = this.defaultText = new WarBitmapText();
            var style = this.defaultAtlas = new TextStyleMap();
            this.defaultText.textStyleMap = style;
            style.GenerateNumType("012345679", TextStyleType.White);
            style.GenerateNumType("qwertyuiop", TextStyleType.Red);
            style.GenerateNumType("asdfghjkl;", TextStyleType.Yellow);
            style.GenerateNumType("zxcvbnm,./", TextStyleType.Green);
            return new Promise((resolve) => {
                text.LoadFont("res/font/damage-export.fnt", () => {
                    text.InitItemPool();
                    resolve(text);
                });
            });
        }
    }
    window['TextStyleType'] = TextStyleType;
    window['WarBitmapText'] = WarBitmapText;
    window['WarBitmapTextLib'] = WarBitmapTextLib;

    return WarBitmapTextLib;

}());
//# sourceMappingURL=bundle.js.map

import WarBitmapTextLib from "../WarBitmapText/WarBitmapTextLib";
import { TestScene } from "./TestSene";
import { TextStyleType } from "../WarBitmapText/TextStyleType";

enum HurtType {
    HurtType_Nomal = 0,
    HurtType_Crit = 1,
    HurtType_Dodge = 2,
    HurtType_RecoveHp = 3,
    HurtType_RecoveMp = 4,
    HurtType_Miss = 5,
    HurtType_Block = 6
}


interface IHurtInfo {
	
    playerPos?: (number|null);

    hurtPos?: (number|null);

    hurtBlood?: (number|null);

    hurtType?: (HurtType|null);
}

class HurtInfo implements IHurtInfo {


    public playerPos: number;

    public hurtPos: number;

    public hurtBlood: number;

    public hurtType: HurtType;

}

export class TestText
{
    
    scene: TestScene;
    constructor()
    {
        this.scene = TestScene.create();
        Laya.stage.addChild(this.scene);
        // this.loadPrefab();
        this.InitAsync();
    }
    
    async InitAsync()
    {
        await this.InitBitmapTextAsync();

        
        Laya.timer.frameLoop(10, this, this.playText);
    }


    private unitPosList = new Map<number, Laya.Vector3>();;
    async playText()
    {
        var hurts = [];
        for(let i = 0; i < 2; i ++)
        {

            var hurt = new HurtInfo();
            hurt.hurtPos = i;
            hurt.hurtType = Random.range(0, 3);
            // hurt.hurtType = HurtType.HurtType_Nomal;
            // hurt.hurtBlood = Random.range(5, 500);
            hurt.hurtBlood = Laya.timer.currFrame;
            hurts.push(hurt);
            this.updateBattleHurts(hurts);

            // await this.waitTime();
        }
    }

    async waitTime()
    {
        return new Promise((resolve)=>{
            Laya.timer.once(Random.range(10, 100), null, resolve)
        })
    }

    
    private async InitBitmapTextAsync()
    {
        await WarBitmapTextLib.LoadDefalutAsync();
        WarBitmapTextLib.defaultText.camera = this.scene.camera;
        WarBitmapTextLib.defaultText.SetParent(Laya.stage);
        WarBitmapTextLib.defaultText.Show();
    }

    
    private _tmpVec3 = new Laya.Vector3();
    private updateBattleHurts(hurts: HurtInfo[]) {
        for(var hurt of hurts)
        {
            var unitId = hurt.hurtPos;
            // var view = War.view.GetViewPlayerByPos(hurt.playerPos);
            // if(view && view.transform)
            {
                var damage = hurt.hurtBlood;
                var damageStr: string;
                var systemType: TextStyleType;
                switch(hurt.hurtType)
                { 
                    // 普通伤害
                    case HurtType.HurtType_Nomal:
                        damageStr = damage.toString();
                        systemType = TextStyleType.White;
                        // systemType = Random.range(0, 10) > 5 ? TextStyleType.Red : TextStyleType.White;
                        break;
                    // 回血
                    case HurtType.HurtType_RecoveHp:
                        damageStr = damage.toString();
                        systemType = TextStyleType.Green;
                        break;
                    // 暴击
                    case HurtType.HurtType_Crit:
                        damageStr = damage.toString();
                        // damageStr = "c" + damage;
                        systemType = TextStyleType.Yellow;
                        break;
                    // 丢失
                    case HurtType.HurtType_Miss:
                        // damageStr = "d";
                        damageStr = "0";
                        systemType = TextStyleType.Red;
                        break;
                    // 闪避
                    case HurtType.HurtType_Dodge:
                    // 回蓝
                    case HurtType.HurtType_RecoveMp:
                        return;
                    default:
                        return;
                }

                var position: Laya.Vector3;
                if(this.unitPosList.has(unitId))
                {
                    position = this.unitPosList.get(unitId);
                }
                else
                {
                    position = new Laya.Vector3(Random.range(-3, 3), 0, Random.range(0, 5));
                    position.x = 0;
                    position.z = 0;
                    this.unitPosList.set(unitId, position);
                }

                var vec3 = this._tmpVec3;
                vec3.x = position.x;
                vec3.y = position.y + 1.5;
                vec3.z = position.z;
                var text:any = WarBitmapTextLib.defaultText;
                text.PlayItem(unitId, damageStr, vec3, systemType);
            }
        }
    }
}
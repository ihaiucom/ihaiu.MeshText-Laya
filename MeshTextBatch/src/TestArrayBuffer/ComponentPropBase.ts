import PropHelper from "./Props/PropHelper";

/*
 * @Descripttion: 角色属性组件
 * @version: 
 * @Author: ZengFeng
 * @Date: 2019-10-15 18:39:10
 * @LastEditors  : Please set LastEditors
 * @LastEditTime : 2020-01-19 15:12:27
 */
/**
 * 角色的各种属性组件
 */

export class ComponentPropBase
{
 	/** 战斗基础属性 */
    bases:Map<int, intwf> = new Map<int, intwf>();
    /** 附近的具体值 */
    adds:Map<int, intwf> = new Map<int, intwf>();
    /** 附加的百分比,针对基础的 */
    addpers:Map<int, intwf> = new Map<int, intwf>();
    /** 附加的百分比，针对基础和附加的 */
    addPersAll : Map<int, intwf> = new Map<int, intwf>();
    /** 当前值属性 */
    finals:Map<int, intwf> = new Map<int, intwf>();
    
    /** 累计伤害, 数值 万分比 */
    Damage:intwf = 0;

    get HP()
    {
        return this.bases.get(1);
    }

    set HP(v)
    {
        this.bases.set(1, v);
    }
    constructor()
    {
        this.reset();
    }

    reset()
    {
        this.Damage = 0;
        let idList = PropHelper.PropIdList;
        for(let propId of idList)
        {
            this.bases.set(propId, 0);
            this.adds.set(propId, 0);
            this.addpers.set(propId, 0);
			this.addPersAll.set(propId, 0);
            this.finals.set(propId, 0);
        }
    }

    init(list: int[][])
    {
        for(let item of list)
        {
            let id = item[0];
            let val = item[1];
            this.bases.set(id, val);
            this.finals.set(id, val);
        }
    }

    clone():ComponentPropBase
    {
        let com = Laya.Pool.createByClass(ComponentPropBase);
        // 战斗基础属性
        this.bases.forEach((value, key)=>
        {
            com.bases.set(key, value);
        });

        // 附近的具体值
        this.adds.forEach((value, key)=>
        {
            com.adds.set(key, value);
        });
        
        // 附加的百分比
        this.addpers.forEach((value, key)=>
        {
            com.addpers.set(key, value);
        });

        // 当前值属性
        this.finals.forEach((value, key)=>
        {
            com.finals.set(key, value);
        });

        com.Damage = this.Damage;
        return com;
    }

    
    /**
     * 重置
     */
    onPoolRecover(): void
    {
      this.reset();
    }

			

	
}

	
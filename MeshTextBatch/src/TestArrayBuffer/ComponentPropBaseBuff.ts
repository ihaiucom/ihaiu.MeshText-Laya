import PropHelper from "./Props/PropHelper";

export class MapBuff
{
    buff: Int32Array;
    offset: number;
    constructor(buff: Int32Array, offset: number)
    {
        this.buff = buff;
        this.offset = offset;
    }

    get(i: number)
    {
        return this.buff[i + this.offset];
    }

    set(i:number, v: number)
    {
        this.buff[i + this.offset] = v;
    }
}
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

export class ComponentPropBaseBuff
{
    buff: Int32Array;
 	/** 战斗基础属性 */
    bases:MapBuff;
    /** 附近的具体值 */
    adds:MapBuff;
    /** 附加的百分比,针对基础的 */
    addpers:MapBuff;
    /** 附加的百分比，针对基础和附加的 */
    addPersAll : MapBuff;
    /** 当前值属性 */
    finals:MapBuff;
    
    /** 累计伤害, 数值 万分比 */
    get Damage():intwf
    {
        return this.buff[0];
    }

    set Damage(v:intwf)
    {
        this.buff[0] = v;
    }

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
        let idList = PropHelper.PropIdList;
        var length = idList.length * 5 + 1;
        this.buff = new Int32Array(idList);

        let size = idList.length;
        this.bases = new MapBuff(this.buff, 1 + size * 0);
        this.adds = new MapBuff(this.buff, 1 + size * 1);
        this.addpers = new MapBuff(this.buff, 1 + size * 2);
        this.addPersAll = new MapBuff(this.buff, 1 + size * 3);
        this.finals = new MapBuff(this.buff, 1 + size * 4);

        // this.reset();
    }

    reset()
    {
        this.buff.fill(0, 0, this.buff.length);
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

    clone():ComponentPropBaseBuff
    {
        let com:ComponentPropBaseBuff = Laya.Pool.createByClass(ComponentPropBaseBuff);
        com.buff.set(this.buff, 0);

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

	
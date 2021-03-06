/*
 * @Descripttion: 
 * @version: 
 * @Author: ZengFeng
 * @Date: 2019-06-27 12:51:37
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2019-12-04 21:02:13
 */
import { PropType } from "./PropType";
import { PropId } from "./PropId";
import { PropField } from "./PropField";

/**
 * 取值范围
 * propTypeId : 1, 101， 2， 102
 * propId:      1, 1  ， 2， 2
 * propType: PropType.Base， PropType.Per
 */

export default class PropHelper
{
    // 最大值
    private static TYPE_ID_MASK = 100;

    
    /** 获取propId, 根据 propTypeId */
    public static PropTypeid2Id(propTypeId: int): int
    {
        return propTypeId % PropHelper.TYPE_ID_MASK;
    }

    
    /** 获取propType, 根据 propTypeId */
    public static PropTypeid2Type(propTypeId: int): PropType
    {
        return Math.floor(propTypeId / PropHelper.TYPE_ID_MASK);
    }

    /** 获取propTypeId, 根据 propId和propType */
    public static GetTypeId(propId: int, propType:PropType): int
    {
        return propType * PropHelper.TYPE_ID_MASK + propId;
    }

    
    /** 获取属性ID，根据属性字段 */
    public static  GetPropId(  propField:string ):int
    {
        return PropId[propField];
    }


    
    /** 获取属性字段，根据属性ID */
    public static  GetPropField(  propId:int ):string
    {
        return PropHelper.ID2FieldDict.getValue(propId);
    }


    
    /** ID列表 */
    private static _propIdList: int[];
    public static get PropIdList(): int[]
    {
        if(!PropHelper._propIdList)
        {
            let list = PropHelper._propIdList = [];

            for(let field in PropId)
            {
                list.push(PropId[field]);
            }
        }
        return PropHelper._propIdList;
    }


    /** 字段列表 */
    private static _fieldList: string[];
    public static get FieldList(): string[]
    {
        if(!PropHelper._fieldList)
        {
            let list = PropHelper._fieldList = [];

            for(let field in PropField)
            {
                list.push(PropField[field]);
            }
        }
        return PropHelper._fieldList;
    }

    /** 带有前缀的字段列表 */
    private static _preFieldList: string[];
    public static get PreFieldList(): string[]
    {
        
        if(!PropHelper._preFieldList)
        {
            
            let list = PropHelper._preFieldList = [];

            for(let field of PropHelper.FieldList)
            {
                list.push("prop_" + field);
            }
        }
        return PropHelper._preFieldList;
    }

    private static _ID2FieldDict:Dictionary<int, string>;
    private static get ID2FieldDict():Dictionary<int, string>
    {
        if(!PropHelper._ID2FieldDict)
        {
            let dict = PropHelper._ID2FieldDict = new Dictionary<int, string>();
            for(let field in PropId)
            {
                if(field.toLowerCase() == "list")
                    continue;
                dict.add(PropId[field], field);
            }

        }

        return PropHelper._ID2FieldDict;

    }



    

}
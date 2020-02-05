import { ITextItem } from "./ITextItem";

export interface ITextManager
{
    PlayItem(text: string, 
        position?: Laya.Vector3, 
        atlaTypeKey?: any, 
        scale?: number, 
        tweenSpeed?:number):ITextItem;

    SetParent(parent: Laya.Node, parentIndex?:number);
    Show();
    Hide();
    Clear();
    
}
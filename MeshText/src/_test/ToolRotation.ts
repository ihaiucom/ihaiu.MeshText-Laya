import Vector3 = Laya.Vector3;
export default class ToolRotation
{
    static Start(sprite: Laya.Sprite3D, speed: Vector3 = new Vector3(1, 2, 2))
    {
        new ToolRotation(sprite, speed).Start();
    }
    constructor(sprite: Laya.Sprite3D, speed: Vector3 = new Vector3(1, 2, 2))
    {
        this.sprite = sprite;
        this.speed = speed;
    }
    
    sprite: Laya.Sprite3D;
    speed: Vector3= new Vector3(1, 2, 2);
    rotaitonSrc:Vector3;
    rotaiton:Vector3;
    Start()
    {
        this.rotaiton = this.sprite.transform.localRotationEuler;
        Laya.timer.frameLoop(1, this, this.OnLoop)
    }

    
    Stop()
    {
        this.sprite.transform.localRotationEuler = this.rotaitonSrc;
        Laya.timer.clear(this, this.OnLoop)
    }
    
    OnLoop()
    {
        this.rotaiton.x += this.speed.x;
        this.rotaiton.y += this.speed.y;
        this.rotaiton.z += this.speed.z;

        this.sprite.transform.localRotationEuler = this.rotaiton;
    }
}
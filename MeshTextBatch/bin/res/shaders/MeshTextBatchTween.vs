precision highp float;

#include "Lighting.glsl";
//==============================================
// attribute 顶点属性
//----------------------------------------------

attribute vec4 a_Position;
attribute vec2 a_Texcoord0;
attribute vec2 a_Texcoord1;
attribute vec4 a_Color;

//==============================================
// uniform 全局变量
//----------------------------------------------

// MVP (模型-摄像机-屏幕)矩阵
#ifdef GPU_INSTANCE
	attribute mat4 a_MvpMatrix;
#else
	uniform mat4 u_MvpMatrix;
#endif


uniform vec4 u_TweenPositionBegin;
uniform vec4 u_TweenPositionEnd;

//==============================================
// varying 传递给像素片段处理器属性
//----------------------------------------------

// 主贴图UV坐标
varying vec2 v_Texcoord0;
varying vec4 v_Color;
varying float v_Alpha;

float lerp(float a, float b, float w) 
{
  return a + w*(b-a);
}


vec4 lerpVec4(vec4 a, vec4 b, float w) 
{
  return a + w*(b-a);
}
mat4 t0 = mat4(
	1, 0, 0, 0,
	0, 1, 0, 0, 
	0, 0, 1, 0, 
	0, 0, 0, 1);

mat4 t1 = mat4(
	1.1, 0, 0, 0,
	0, 1.1, 0, 0, 
	0, 0, 1.1, 0, 
	0, 0, 0, 1);

mat4 t2 = mat4(
	0.9, 0, 0, 0,
	0, 0.9, 0, 0, 
	0, 0, 0.9, 0, 
	0, 0, 0, 1);

mat4 t3 = mat4(
	0.8, 0, 0, 0,
	0, 0.8, 0, 0, 
	0, 0, 0.8, 0, 
	0, 1, 0, 1);

//  主函数
void main() 
{
	vec4 position = a_Position;
	
	float t = a_Texcoord1.x;
	v_Alpha = 1.0;
	if(t < 0.17)
	{
		position = position + lerpVec4(t0 * position, t1 * position,  t / 0.17); 
	}
	else if(t < 0.34)
	{
		position = position + lerpVec4(t1 * position, t2 * position,  (t - 0.17) / 0.17); 
	}
	else if(t < 0.52)
	{
		position = position + t2 * position;
	}
	else
	{
		float t = (t - 0.52) / 0.48;
		position = position + lerpVec4(t2 * position, t3 * position,  t); 
		v_Alpha = 1.5 - t;
	}
	// float fs = float[4](0.17, 0.33, 0.52, 1);

	//  position.xyz = position.xyz + lerpVec4(u_TweenPositionBegin, u_TweenPositionEnd, a_Texcoord1.x).xyz;

    
    // 模型坐标 转 屏幕裁剪坐标
	#ifdef GPU_INSTANCE
		gl_Position = a_MvpMatrix * position;
	#else
		gl_Position = u_MvpMatrix * position;
	#endif

    // 主贴图UV
    v_Texcoord0 = a_Texcoord0;

    
	#if defined(COLOR)&&defined(ENABLEVERTEXCOLOR)
		v_Color = a_Color;
	#endif

	gl_Position=remapGLPositionZ(gl_Position);
}
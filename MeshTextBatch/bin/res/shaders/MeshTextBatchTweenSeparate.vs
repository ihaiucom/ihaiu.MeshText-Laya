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


float rand(vec2 co)
{
 return fract(sin(dot(co.xy, vec2(12.9898,78.233))) * 43758.5453);
}

vec3 lerpVec3(vec3 a, vec3 b, float w) 
{
  return a + w*(b-a);
}
//  主函数
void main() 
{

	vec4 position = a_Position;
	float rate = a_Texcoord1.y * 0.3 - 0.07 + a_Texcoord1.x;
	// float rate = a_Texcoord1.x;
	position.xyz = position.xyz + lerpVec3(u_TweenPositionBegin.xyz, u_TweenPositionEnd.xyz, rate) ;

    
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
	v_Alpha = 1.0;

	gl_Position=remapGLPositionZ(gl_Position);
}
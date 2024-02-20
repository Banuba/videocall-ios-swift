#include <bnb/glsl.vert>
#include <bnb/decode_int1010102.glsl>
#include<bnb/matrix_operations.glsl>
#define bnb_IDX_OFFSET 0
#ifdef BNB_VK_1
#ifdef gl_VertexID
#undef gl_VertexID
#endif
#ifdef gl_InstanceID
#undef gl_InstanceID
#endif
#define gl_VertexID gl_VertexIndex
#define gl_InstanceID gl_InstanceIndex
#endif

#define Pi 3.14159265359

BNB_LAYOUT_LOCATION(0) BNB_IN vec3 attrib_pos;




BNB_OUT(1) vec2 var_bgmask_uv;
BNB_OUT(0) vec3 var_v;

vec3 quat_rotate( vec4 q, vec3 v )
{
	return v + 2.*cross( q.xyz, cross( q.xyz, v ) + q.w*v );
}

vec3 rotateAxis(vec3 p, vec3 axis, float angle)
{
	return mix(dot(axis, p)*axis, p, cos(angle)) + cross(axis,p)*sin(angle);
}

void main()
{
	vec2 v = attrib_pos.xy;
	gl_Position = vec4( v, 0., 1. );
	mat3 bg_basis = mat3(background_nn_transform);
	var_bgmask_uv = vec2(vec3(v,1.)*bg_basis);
	var_bgmask_uv.y -= 0.5/256.;

	vec4 q = bnb_QUAT;

	 q.x = -q.x;
     q.y = -q.y;

    vec3 side = quat_rotate( q, vec3(1.,0.,0.) );
    vec3 up = quat_rotate( q, vec3(0.,1.,0.) );

	vec3 vectorToRotate = vec3(v/vec2(bnb_PROJ[0][0],bnb_PROJ[1][1]),-1.);

	float angle = 0.;
	if( side.y > 0.7071 && bnb_SCREEN.x > bnb_SCREEN.y){
		angle = -Pi/2.;
	}
	else if( side.y < -0.7071 && bnb_SCREEN.x > bnb_SCREEN.y){
		angle = Pi/2.;
	}

	vectorToRotate = rotateAxis(vectorToRotate,vec3(0.,0.,1.),angle);

	vec4 q1 = bnb_QUAT;

	var_v = quat_rotate( q1,vectorToRotate);
}

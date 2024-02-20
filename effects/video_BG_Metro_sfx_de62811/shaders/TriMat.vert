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

BNB_LAYOUT_LOCATION(0) BNB_IN vec3 attrib_pos;



BNB_OUT(1) vec2 var_bgmask_uv;
BNB_OUT(0) vec2 var_uv;

vec3 quat_rotate( vec4 q, vec3 v )
{
	return v + 2.*cross( q.xyz, cross( q.xyz, v ) + q.w*v );
}


BNB_DECLARE_SAMPLER_2D(0, 1, glfx_BG_MASK);

void main()
{
	vec2 v = attrib_pos.xy;
	gl_Position = vec4( v, 1., 1. );
	var_uv = v*0.5 + 0.5;

	mat3 basis = mat3(background_nn_transform);
	var_bgmask_uv = vec2(vec3(v,1.)*basis);
}

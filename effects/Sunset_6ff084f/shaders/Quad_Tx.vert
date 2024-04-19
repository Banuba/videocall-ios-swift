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
BNB_LAYOUT_LOCATION(3) BNB_IN vec2 attrib_uv;

BNB_OUT(0) vec2 var_uv;
BNB_OUT(2) vec2 var_pos;




BNB_DECLARE_SAMPLER_VIDEO(2, 3, glfx_VIDEO);

float texture_aspect(BNB_DECLARE_SAMPLER_2D_ARGUMENT(s))
{
	vec2 sz = vec2(textureSize(BNB_SAMPLER_2D(s),0));
	return sz.x/sz.y;
}

void main()
{
    var_pos = js_pos.xy;
    
    const float x_scale = 1.;
	
	// vec2 quad_size = vec2(x_scale, x_scale*texture_aspect(BNB_PASS_SAMPLER_ARGUMENT(glfx_VIDEO))*(bnb_SCREEN.x/bnb_SCREEN.y));
	vec2 vpos = attrib_pos.xy; //*quad_size
    // vpos.x = -vpos.x;
    gl_Position = vec4(vpos, 0., 1.);

    var_uv = attrib_uv;
}
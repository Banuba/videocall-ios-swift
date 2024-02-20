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

#define TRANSLATION_RATE 0.003

BNB_LAYOUT_LOCATION(0) BNB_IN vec3 attrib_pos;
BNB_LAYOUT_LOCATION(3) BNB_IN vec2 attrib_uv;
#ifndef BNB_GL_ES_1
BNB_LAYOUT_LOCATION(4) BNB_IN uvec4 attrib_bones;
#else
BNB_LAYOUT_LOCATION(4) BNB_IN vec4 attrib_bones;
#endif
#ifndef BNB_1_BONE
BNB_LAYOUT_LOCATION(5) BNB_IN vec4 attrib_weights;
#endif

BNB_OUT(0) vec2 var_uv;
// BNB_OUT(2) vec2 var_pos;


BNB_DECLARE_SAMPLER_2D(4, 5, bnb_BONES);


BNB_DECLARE_SAMPLER_VIDEO(2, 3, glfx_VIDEO);

BNB_OUT(1) vec2 var_bg_uv;

float texture_aspect(BNB_DECLARE_SAMPLER_2D_ARGUMENT(s))
{
	vec2 sz = vec2(textureSize(BNB_SAMPLER_2D(s),0));
	return sz.x/sz.y;
}

#include <bnb/get_bone.glsl>
#include <bnb/anim_transform.glsl>
void main()
{
    mat4 m = bnb_get_transform();
    vec3 vpos = attrib_pos;
    m[2][3] *= TRANSLATION_RATE;
    m[1][3] *= -TRANSLATION_RATE;
    m[0][3] *= TRANSLATION_RATE;

    float angle = 0.03;

    float cosX = -cos(radians(angle));
	float sinX = sin(radians(angle));

	mat4 rot_z = mat4(  cosX, -sinX, 0., 0.,
                        sinX, cosX, 0., 0.,
                        0., 0., 1., 0.,
                        0., 0., 0., 1.);

    vpos = vec3(vec4(vpos,1.)*m);

    // var_pos = js_pos.xy;
    
    const float x_scale = 1.;
	
	vec2 quad_size = vec2(x_scale, x_scale/2.8);
	vec2 vposi = vpos.xy*quad_size + vec2(0.,-2.15/3.); //*quad_size
    // vpos.x = -vpos.x;
    gl_Position = vec4(vposi, 0., 1.) * rot_z;

    var_bg_uv = (gl_Position.xy/gl_Position.w)*0.5 + 0.5;

    var_uv = attrib_uv;
}
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


#define BNB_USE_AUTOMORPH

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



BNB_DECLARE_SAMPLER_2D(0, 1, bnb_BONES);

#ifdef BNB_USE_UVMORPH

BNB_DECLARE_SAMPLER_2D(2, 3, bnb_UVMORPH_FISHEYE);
#endif

#ifdef BNB_USE_AUTOMORPH

BNB_DECLARE_SAMPLER_2D(4, 5, bnb_MORPH);
#ifndef BNB_AUTOMORPH_BONE
#else
#endif
#endif



#include <bnb/morph_transform.glsl>
#include <bnb/anim_transform.glsl>
#include <bnb/get_bone.glsl>
void main()
{
    mat4 m = bnb_get_transform();
    vec3 vpos = attrib_pos;

#ifdef BNB_USE_UVMORPH
    const float max_range = 40.;
    vec3 translation = BNB_TEXTURE_2D(BNB_SAMPLER_2D(bnb_UVMORPH_FISHEYE), vec3(smoothstep(0.,1.,attrib_uv),float(gl_InstanceID)) ).xyz*(2.*max_range) - max_range;
#ifdef GLFX_UVMORPH_Z_UP
    vpos += vec3(translation.x,-translation.z,translation.y);
#else
    vpos += translation;
#endif
#endif

    vpos = vec3(vec4(vpos,1.)*m);

#ifdef BNB_USE_AUTOMORPH
#ifndef BNB_AUTOMORPH_BONE
    vpos = bnb_auto_morph( vpos );
#else
    vpos = bnb_auto_morph_bone( vpos, m );
#endif
#endif

    gl_Position = bnb_MVP * vec4(vpos,1.);
}
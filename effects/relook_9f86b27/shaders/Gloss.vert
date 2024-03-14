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


#define NUM_POINT_LIGHTS 4
#define BRIGHT_LIGHTS 4.0

#define GLFX_IBL
#define GLFX_TBN
#define GLFX_LIGHTING
#define BNB_USE_UVMORPH

BNB_LAYOUT_LOCATION(0) BNB_IN vec3 attrib_pos;
#ifdef GLFX_LIGHTING
#ifdef BNB_VK_1
BNB_LAYOUT_LOCATION(1) BNB_IN uint attrib_n;
#else
BNB_LAYOUT_LOCATION(1) BNB_IN vec4 attrib_n;
#endif
#ifdef GLFX_TBN
#ifdef BNB_VK_1
BNB_LAYOUT_LOCATION(2) BNB_IN uint attrib_t;
#else
BNB_LAYOUT_LOCATION(2) BNB_IN vec4 attrib_t;
#endif
#endif
#endif
BNB_LAYOUT_LOCATION(3) BNB_IN vec2 attrib_uv;
#ifndef BNB_GL_ES_1
BNB_LAYOUT_LOCATION(4) BNB_IN uvec4 attrib_bones;
#else
BNB_LAYOUT_LOCATION(4) BNB_IN vec4 attrib_bones;
#endif
#ifndef BNB_1_BONE
BNB_LAYOUT_LOCATION(5) BNB_IN vec4 attrib_weights;
#endif



BNB_DECLARE_SAMPLER_2D(14, 15, bnb_BONES);

#ifdef BNB_USE_UVMORPH

BNB_DECLARE_SAMPLER_2D(16, 17, bnb_UVMORPH);
#endif

#ifdef GLFX_OCCLUSION
BNB_OUT(7) vec2 glfx_OCCLUSION_UV;
#endif

#ifdef BNB_USE_AUTOMORPH

BNB_DECLARE_SAMPLER_2D(18, 19, bnb_MORPH);
#ifndef BNB_AUTOMORPH_BONE
#else
#endif
#endif

#ifdef BNB_USE_SHADOW

BNB_OUT(8) vec3 var_shadow_coord;
vec3 spherical_proj( vec2 fovM, vec2 fovP, float zn, float zf, vec3 v )
{
    vec2 xy = (atan( v.xy, v.zz )-(fovP+fovM)*0.5)/((fovP-fovM)*0.5);
    float z = (length(v)-(zn+zf)*0.5)/((zf-zn)*0.5);
    return vec3( xy, z );
}
#endif

BNB_OUT(0) vec2 var_uv;
#ifdef GLFX_LIGHTING
#ifdef GLFX_TBN
BNB_OUT(1) vec3 var_t;
BNB_OUT(2) vec3 var_b;
#endif
BNB_OUT(3) vec3 var_n;
BNB_OUT(4) vec3 var_v;
#endif

BNB_OUT(5) vec4 light1;
BNB_OUT(6) vec4 light2;
BNB_OUT(7) vec4 light3;
BNB_OUT(8) vec4 light4;

BNB_OUT(9) vec3 radiance1;
BNB_OUT(10) vec3 radiance2;
BNB_OUT(11) vec3 radiance3;
BNB_OUT(12) vec3 radiance4;

const float UV_MORPH_STR = 1.0;



#include <bnb/get_bone.glsl>
#include <bnb/morph_transform.glsl>
#include <bnb/anim_transform.glsl>
void main()
{
    mat4 m = bnb_get_transform();
    vec3 vpos = attrib_pos;


#ifdef BNB_VK_1
    vec2 flip_uv = vec2( attrib_uv.x, 1. - attrib_uv.y );
#else
    vec2 flip_uv = vec2( attrib_uv.xy );
#endif

#ifdef BNB_USE_UVMORPH
    const float max_range = 40.;
    vec3 translation = BNB_TEXTURE_2D(BNB_SAMPLER_2D(bnb_UVMORPH), smoothstep(0.,1.,flip_uv)).xyz*(2.*max_range) - max_range;
#ifdef GLFX_UVMORPH_Z_UP
    vpos += vec3(translation.x,-translation.z,translation.y);
#else
    vpos += translation  * UV_MORPH_STR;
    // vpos.y += 30.;
#endif
#endif

    vpos = vec3(vec4(vpos,1.)*m);

#ifdef BNB_USE_AUTOMORPH
#ifndef BNB_AUTOMORPH_BONE
    vpos = bnb_auto_morph( vpos );
#else
    vpos = bnb_auto_morph( vpos, m );
#endif
#endif

    gl_Position = bnb_MVP * vec4(vpos,1.);

    var_uv = attrib_uv;

#ifdef GLFX_LIGHTING
    var_n = normalize(mat3(bnb_MV)*(bnb_decode_int1010102(attrib_n).xyz*mat3(m)));
#ifdef GLFX_TBN
    var_t = normalize(mat3(bnb_MV)*(bnb_decode_int1010102(attrib_t).xyz*mat3(m)));
    var_b = bnb_decode_int1010102(attrib_t).w*cross( var_n, var_t );
#endif
    var_v = (bnb_MV*vec4(vpos,1.)).xyz;
#endif

        light1 = vec4((bnb_MV*vec4(light_pos0.xyz,1.)).xyz - var_v, 0.);
        radiance1 = BRIGHT_LIGHTS * light_radiance0.xyz;

                light2 = vec4((bnb_MV*vec4(light_pos1.xyz,1.)).xyz - var_v, 0.);
        radiance2 = BRIGHT_LIGHTS * light_radiance1.xyz;

                light3 = vec4((bnb_MV*vec4(light_pos2.xyz,1.)).xyz - var_v, 0.);
        radiance3 = BRIGHT_LIGHTS * light_radiance2.xyz;

                light4 = vec4((bnb_MV*vec4(light_pos3.xyz,1.)).xyz - var_v, 0.);
        radiance4 = BRIGHT_LIGHTS * light_radiance3.xyz;
}
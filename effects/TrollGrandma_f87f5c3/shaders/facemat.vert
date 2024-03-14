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

#define BNB_USE_UVMORPH

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

BNB_DECLARE_SAMPLER_2D(2, 3, bnb_UVMORPH);
#ifdef GLFX_USE_BG

BNB_DECLARE_SAMPLER_2D(4, 5, bnb_STATICPOS);
#endif
#endif

#ifdef BNB_USE_AUTOMORPH

BNB_DECLARE_SAMPLER_2D(6, 7, bnb_MORPH);
#ifndef BNB_AUTOMORPH_BONE
#else
#endif
#endif


#include <bnb/morph_transform.glsl>
#include <bnb/get_bone.glsl>
void main()
{
    mat4 m = bnb_get_bone( 
#ifdef BNB_GL_ES_1
(float(attrib_bones[0]) * 3. + 0.5) * (1. / (bnb_ANIM.z * 3.)), 1. / (bnb_ANIM.z * 3.), (bnb_ANIM.x + 0.5) / bnb_ANIM.y
#else
attrib_bones[0], int(bnb_ANIMKEY)
#endif
 );
#ifndef BNB_1_BONE
    if( attrib_weights[1] > 0. )
    {
        m = m*attrib_weights[0] + bnb_get_bone( 
#ifdef BNB_GL_ES_1
(float(attrib_bones[1]) * 3. + 0.5) * (1. / (bnb_ANIM.z * 3.)), 1. / (bnb_ANIM.z * 3.), (bnb_ANIM.x + 0.5) / bnb_ANIM.y
#else
attrib_bones[1], int(bnb_ANIMKEY)
#endif
 )*attrib_weights[1];
        if( attrib_weights[2] > 0. )
        {
            m += bnb_get_bone( 
#ifdef BNB_GL_ES_1
(float(attrib_bones[2]) * 3. + 0.5) * (1. / (bnb_ANIM.z * 3.)), 1. / (bnb_ANIM.z * 3.), (bnb_ANIM.x + 0.5) / bnb_ANIM.y
#else
attrib_bones[2], int(bnb_ANIMKEY)
#endif
 )*attrib_weights[2];
            if( attrib_weights[3] > 0. )
                m += bnb_get_bone( 
#ifdef BNB_GL_ES_1
(float(attrib_bones[3]) * 3. + 0.5) * (1. / (bnb_ANIM.z * 3.)), 1. / (bnb_ANIM.z * 3.), (bnb_ANIM.x + 0.5) / bnb_ANIM.y
#else
attrib_bones[3], int(bnb_ANIMKEY)
#endif
 )*attrib_weights[3];
        }
    }
#endif

    vec3 vpos = attrib_pos;

#ifdef BNB_USE_UVMORPH
    #ifndef BNB_VK_1
vec2 flip_uv = vec2( attrib_uv.x, 1. - attrib_uv.y );
#else
vec2 flip_uv = vec2( attrib_uv.xy );
#endif

    vec3 translation = BNB_TEXTURE_2D(BNB_SAMPLER_2D(bnb_UVMORPH),flip_uv).xyz;
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
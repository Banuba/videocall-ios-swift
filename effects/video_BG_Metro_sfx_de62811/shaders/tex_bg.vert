#include <bnb/glsl.vert>

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

BNB_DECLARE_SAMPLER_2D(2, 3, bnb_BONES);

BNB_OUT(0) vec2 var_uv;

#include <bnb/get_bone.glsl>

#undef bnb_ANIM
#define bnb_ANIM bnb_ANIM_[7]

#include <bnb/get_transform.glsl>

void main()
{
    mat4 m = bnb_get_transform();
    vec3 vpos = attrib_pos;

    vpos = vec3(vec4(vpos,1.)*m);

    float width = 159.*2.;
    float height = 90.*2.;

    mat4 proj = mat4(
        2./width,0.,0.,0.,
        0.,2./height,0.,0.,
        0.,0.,0.,0.,
        0.,0.,1.,1.
        );

    gl_Position = proj * vec4(vpos,1.); 
    var_uv = attrib_uv;
}
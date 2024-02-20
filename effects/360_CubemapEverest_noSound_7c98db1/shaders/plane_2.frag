#include <bnb/glsl.frag>


BNB_IN(0) vec2 var_uv;



BNB_DECLARE_SAMPLER_VIDEO(2, 3, glfx_VIDEO);

BNB_DECLARE_SAMPLER_2D(0, 1, glfx_BACKGROUND);


vec2 aspect_fill_uv_tex(vec2 uv)
{
    vec2 textureSize = vec2(textureSize(BNB_SAMPLER_2D(glfx_VIDEO), 0));
    float aspect_ratio = bnb_SCREEN.y / bnb_SCREEN.x;
    float texture_aspect_ratio = textureSize.y / textureSize.x;
    float scale_x = 1.0;
    float scale_y = 1.0;
    if (texture_aspect_ratio > aspect_ratio) {
        scale_y = texture_aspect_ratio / aspect_ratio;
    } else {
        scale_x = aspect_ratio / texture_aspect_ratio;
    }
    
    float inv_scale_x = 1. / scale_x;
    float inv_scale_y = 1. / scale_y;
    
    return vec2(mat3(inv_scale_x, 0., 0., 0., inv_scale_y, 0., 0.5, 0.5, 1.0) * vec3(uv - 0.5, 1.));
}

void main()
{   
    vec2 uv = var_uv;
    vec3 bg = BNB_TEXTURE_2D(BNB_SAMPLER_2D(glfx_BACKGROUND), uv ).xyz;
    uv.y = 1. - uv.y;

    uv = aspect_fill_uv_tex(uv);
    vec4 bg_tex = BNB_TEXTURE_2D(BNB_SAMPLER_2D(glfx_VIDEO), uv);

    bnb_FragColor = vec4(bg_tex.xyz, 1.0);
}

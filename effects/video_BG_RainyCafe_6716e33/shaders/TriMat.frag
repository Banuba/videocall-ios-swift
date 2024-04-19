#include <bnb/glsl.frag>


BNB_IN(0) vec2 var_uv;
BNB_IN(1) vec2 var_bgmask_uv;




BNB_DECLARE_SAMPLER_2D(4, 5, glfx_BACKGROUND);

BNB_DECLARE_SAMPLER_2D(2, 3, tex_bg);

BNB_DECLARE_SAMPLER_2D(0, 1, glfx_BG_MASK);

vec4 cubic(float v) {
    vec4 n = vec4(1.0, 2.0, 3.0, 4.0) - v;
    vec4 s = n * n * n;
    float x = s.x;
    float y = s.y - 4.0 * s.x;
    float z = s.z - 4.0 * s.y + 6.0 * s.x;
    float w = 6.0 - x - y - z;
    return vec4(x, y, z, w) * (1.0 / 6.0);
}

vec2 scale_aspect_fill(vec2 uv, BNB_DECLARE_SAMPLER_2D_ARGUMENT(sampler))
{
    vec2 texSize = vec2(textureSize(BNB_SAMPLER_2D(sampler), 0));
    float aspect_ratio = bnb_SCREEN.y / bnb_SCREEN.x;
    float texture_aspect_ratio = texSize.y / texSize.x;
    float scale_x = 1.0;
    float scale_y = 1.0;

    if (texture_aspect_ratio >= aspect_ratio) {
        scale_y = texture_aspect_ratio / aspect_ratio;
    } else {
        scale_x = aspect_ratio / texture_aspect_ratio;
    }

    float inv_scale_x = 1. / scale_x;
    float inv_scale_y = 1. / scale_y;
    
    return vec2(mat3(inv_scale_x, 0., 0., 0., inv_scale_y, 0., 0.5, 0.5, 1.0) * vec3(uv - 0.5, 1.));
}

vec4 textureBicubic(BNB_DECLARE_SAMPLER_2D_ARGUMENT(sampler), vec2 texCoords){
    vec2 texSize = vec2(textureSize(BNB_SAMPLER_2D(sampler), 0));
    vec2 invTexSize = 1.0 / texSize;

    texCoords = texCoords * texSize - 0.5;

    vec2 fxy = fract(texCoords);
    texCoords -= fxy;

    vec4 xcubic = cubic(fxy.x);
    vec4 ycubic = cubic(fxy.y);

    vec4 c = texCoords.xxyy + vec2(-0.5, +1.5).xyxy;

    vec4 s = vec4(xcubic.xz + xcubic.yw, ycubic.xz + ycubic.yw);
    vec4 offset = c + vec4(xcubic.yw, ycubic.yw) / s;

    offset *= invTexSize.xxyy;

    vec4 sample0 = BNB_TEXTURE_2D(BNB_SAMPLER_2D(sampler), offset.xz);
    vec4 sample1 = BNB_TEXTURE_2D(BNB_SAMPLER_2D(sampler), offset.yz);
    vec4 sample2 = BNB_TEXTURE_2D(BNB_SAMPLER_2D(sampler), offset.xw);
    vec4 sample3 = BNB_TEXTURE_2D(BNB_SAMPLER_2D(sampler), offset.yw);

    float sx = s.x / (s.x + s.y);
    float sy = s.z / (s.z + s.w);

    return mix(
        mix(sample3, sample2, sx), mix(sample1, sample0, sx)
    , sy);
}

vec2 rgb_hs(vec3 rgb)
{
    float cmax = max(rgb.r, max(rgb.g, rgb.b));
    float cmin = min(rgb.r, min(rgb.g, rgb.b));
    float delta = cmax - cmin;
    vec2 hs = vec2(0.0);

    if (cmax > cmin) {
        hs.y = delta/cmax;
        if (rgb.r == cmax)
            hs.x = (rgb.g - rgb.b) / delta;
        else 
        {
            if (rgb.g == cmax)
                hs.x = 2.0 + (rgb.b - rgb.r) / delta;
            else
                hs.x = 4.0 + (rgb.r - rgb.g) / delta;
        }
        hs.x = fract(hs.x / 6.0);
    }
    
    return hs;
}

float rgb_v(vec3 rgb)
{
    return max(rgb.r, max(rgb.g, rgb.b));
}

vec3 hsv_rgb(float h, float s, float v)
{
    return v * mix(vec3(1.0), clamp(abs(fract(vec3(1.0, 2.0 / 3.0, 1.0 / 3.0) + h) * 6.0 - 3.0) - 1.0, 0.0, 1.0), s);
}

vec3 blendColor(vec3 base, vec3 blend) {
    float v = rgb_v(base);
    vec2 hs = rgb_hs(blend);
    return hsv_rgb(hs.x, hs.y, v);
}

vec3 blendColor(vec3 base, vec3 blend, float opacity) {
    return (blendColor(base, blend) * opacity + base * (1.0 - opacity));
}

void main()
{   
    vec2 uv = var_uv;
    vec3 bg = BNB_TEXTURE_2D(BNB_SAMPLER_2D(glfx_BACKGROUND), var_uv).xyz;
    uv = scale_aspect_fill(uv,BNB_PASS_SAMPLER_ARGUMENT(tex_bg));

    vec4 bg_color = BNB_TEXTURE_2D(BNB_SAMPLER_2D(tex_bg), uv);
    const float threshold = 0.2;
    float mask = max((textureBicubic(BNB_PASS_SAMPLER_ARGUMENT(glfx_BG_MASK),var_bgmask_uv).x - threshold) / (1.0 - threshold), 0.0);
    // bnb_FragColor = vec4(blendColor(bg, bg_color.xyz, mask * bg_color.w), 1.0);
    bnb_FragColor = vec4(mix(bg, bg_color.xyz, mask), 1.0);
}

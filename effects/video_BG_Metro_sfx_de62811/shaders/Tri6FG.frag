#include <bnb/glsl.frag>
#include <bnb/lut.glsl>



BNB_IN(0) vec2 var_uv;
BNB_IN(1) vec2 var_bgmask_uv;




BNB_DECLARE_SAMPLER_2D(4, 5, glfx_BACKGROUND);
BNB_DECLARE_SAMPLER_2D(2, 3, glfx_BG_MASK);


BNB_DECLARE_SAMPLER_2D(0, 1, lut);

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
vec4 textureLookup(vec4 originalColor, BNB_DECLARE_SAMPLER_2D_ARGUMENT(lookupTexture))
{
    const float epsilon = 0.000001;
    const float lutSize = 512.0;

    float blueValue = (originalColor.b * 255.0) / 4.0;

    vec2 mulB = clamp(floor(blueValue) + vec2(0.0, 1.0), 0.0, 63.0);
    vec2 row = floor(mulB / 8.0 + epsilon);
    vec4 row_col = vec4(row, mulB - row * 8.0);
    vec4 lookup = originalColor.ggrr * (63.0 / lutSize) + row_col * (64.0 / lutSize) + (0.5 / lutSize);

    float factor = blueValue - mulB.x;

    vec3 sampled1 = BNB_TEXTURE_2D_LOD(BNB_SAMPLER_2D(lookupTexture), lookup.zx, 0.).rgb;
    vec3 sampled2 = BNB_TEXTURE_2D_LOD(BNB_SAMPLER_2D(lookupTexture), lookup.wy, 0.).rgb;

    vec3 res = mix(sampled1, sampled2, factor);
    return vec4(res, originalColor.a);
}

vec4 cubic(float v) {
    vec4 n = vec4(1.0, 2.0, 3.0, 4.0) - v;
    vec4 s = n * n * n;
    float x = s.x;
    float y = s.y - 4.0 * s.x;
    float z = s.z - 4.0 * s.y + 6.0 * s.x;
    float w = 6.0 - x - y - z;
    return vec4(x, y, z, w) * (1.0 / 6.0);
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

void main()
{
    vec2 uv = var_uv;
    #ifdef BNB_VK_1
        uv.y = 1. - uv.y;
    #endif    
    const float threshold = 0.2;

    float mask = max((textureBicubic(BNB_PASS_SAMPLER_ARGUMENT(glfx_BG_MASK),var_bgmask_uv).x - threshold) / (1.0 - threshold), 0.0);
    vec4 color = bnb_texture_lookup_512(BNB_TEXTURE_2D(BNB_SAMPLER_2D(glfx_BACKGROUND), uv),BNB_PASS_SAMPLER_ARGUMENT(lut));

    mask = 1. - mask;
    bnb_FragColor = vec4(color.rgb, color.a * mask);
    // bnb_FragColor = vec4(1.,0.,0.,1.);

}

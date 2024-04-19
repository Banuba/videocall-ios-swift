#include <bnb/glsl.frag>


BNB_IN(0) vec2 var_uv;



BNB_DECLARE_SAMPLER_2D(2, 3, glfx_BACKGROUND);

BNB_DECLARE_SAMPLER_2D(0, 1, luttex);

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

void main()
{ 
    vec4 background = BNB_TEXTURE_2D(BNB_SAMPLER_2D(glfx_BACKGROUND), var_uv );
	background.xyz = textureLookup(background, BNB_PASS_SAMPLER_ARGUMENT(luttex)).xyz;
	bnb_FragColor = background;
}

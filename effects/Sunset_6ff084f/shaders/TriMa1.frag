#include <bnb/glsl.frag>


BNB_IN(0) vec2 var_uv;



BNB_DECLARE_SAMPLER_2D(2, 3, glfx_BACKGROUND);

BNB_DECLARE_SAMPLER_2D(0, 1, luttex);

vec4 finalColorFilter(vec4 orgColor)
{
    const float EPS = 0.000001;
    const float pxSize = 512.0;
    
    float bValue = (orgColor.b * 255.0) / 4.0;
    
    vec2 mulB = clamp(floor(bValue) + vec2(0.0, 1.0), 0.0, 63.0);
    vec2 row = floor(mulB / 8.0 + EPS);
    vec4 row_col = vec4(row, mulB - row * 8.0);
    vec4 lookup = orgColor.ggrr * (63.0/pxSize) + row_col * (64.0/pxSize) + (0.5/pxSize);
    
    float b1w = bValue - mulB.x;
    
	lookup*= pxSize;
	ivec4 positions = ivec4(lookup);

    vec3 sampled1 = texelFetch(BNB_SAMPLER_2D(luttex), positions.zx, 0).rgb;
    vec3 sampled2 = texelFetch(BNB_SAMPLER_2D(luttex), positions.wy, 0).rgb;
    
    vec3 res = mix(sampled1, sampled2, b1w);
    return vec4(res, orgColor.a);
}

void main()
{
	vec3 color = finalColorFilter(BNB_TEXTURE_2D(BNB_SAMPLER_2D(glfx_BACKGROUND), var_uv )).xyz;
	bnb_FragColor = vec4 (color, 1.0);
}

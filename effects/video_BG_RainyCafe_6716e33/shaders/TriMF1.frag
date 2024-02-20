#include <bnb/glsl.frag>


BNB_IN(0) vec2 var_uv;
BNB_IN(1) vec2 var_bgmask_uv;




BNB_DECLARE_SAMPLER_2D(4, 5, glfx_BACKGROUND);

BNB_DECLARE_SAMPLER_2D(2, 3, tex_fgLight1);

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

float blendColorDodge(float base, float blend) {
	return (blend==1.0)?blend:min(base/(1.0-blend),1.0);
}

vec3 blendColorDodge(vec3 base, vec3 blend) {
	return vec3(blendColorDodge(base.r,blend.r),blendColorDodge(base.g,blend.g),blendColorDodge(base.b,blend.b));
}

vec3 blendColorDodge(vec3 base, vec3 blend, float opacity) {
	return (blendColorDodge(base, blend) * opacity + base * (1.0 - opacity));
}

vec3 blendMultiply(vec3 base, vec3 blend) {
	return base*blend;
}

vec3 blendMultiply(vec3 base, vec3 blend, float opacity) {
	return (blendMultiply(base, blend) * opacity + base * (1.0 - opacity));
}

float blendOverlay(float base, float blend) {
	return base<0.5?(2.0*base*blend):(1.0-2.0*(1.0-base)*(1.0-blend));
}

vec3 blendOverlay(vec3 base, vec3 blend) {
	return vec3(blendOverlay(base.r,blend.r),blendOverlay(base.g,blend.g),blendOverlay(base.b,blend.b));
}

vec3 blendOverlay(vec3 base, vec3 blend, float opacity) {
	return (blendOverlay(base, blend) * opacity + base * (1.0 - opacity));
}

float blendScreen(float base, float blend) {
	return 1.0-((1.0-base)*(1.0-blend));
}

vec3 blendScreen(vec3 base, vec3 blend) {
	return vec3(blendScreen(base.r,blend.r),blendScreen(base.g,blend.g),blendScreen(base.b,blend.b));
}

vec3 blendScreen(vec3 base, vec3 blend, float opacity) {
	return (blendScreen(base, blend) * opacity + base * (1.0 - opacity));
}

float blendSoftLight(float base, float blend) {
	return (blend<0.5)?(2.0*base*blend+base*base*(1.0-2.0*blend)):(sqrt(base)*(2.0*blend-1.0)+2.0*base*(1.0-blend));
}

vec3 blendSoftLight(vec3 base, vec3 blend) {
	return vec3(blendSoftLight(base.r,blend.r),blendSoftLight(base.g,blend.g),blendSoftLight(base.b,blend.b));
}

vec3 blendSoftLight(vec3 base, vec3 blend, float opacity) {
	return (blendSoftLight(base, blend) * opacity + base * (1.0 - opacity));
}

float blendLighten(float base, float blend) {
	return max(blend,base);
}

vec3 blendLighten(vec3 base, vec3 blend) {
	return vec3(blendLighten(base.r,blend.r),blendLighten(base.g,blend.g),blendLighten(base.b,blend.b));
}

vec3 blendLighten(vec3 base, vec3 blend, float opacity) {
	return (blendLighten(base, blend) * opacity + base * (1.0 - opacity));
}

float blendAdd(float base, float blend) {
	return min(base+blend,1.0);
}

vec3 blendAdd(vec3 base, vec3 blend) {
	return min(base+blend,vec3(1.0));
}

vec3 blendAdd(vec3 base, vec3 blend, float opacity) {
	return (blendAdd(base, blend) * opacity + base * (1.0 - opacity));
}

void main()
{
    vec2 uv = var_uv;
    uv = scale_aspect_fill(uv,BNB_PASS_SAMPLER_ARGUMENT(tex_fgLight1));

    vec3 bg = BNB_TEXTURE_2D(BNB_SAMPLER_2D(glfx_BACKGROUND), var_uv).xyz;
    vec3 texture_color = BNB_TEXTURE_2D(BNB_SAMPLER_2D(tex_fgLight1), uv).xyz;
    float alpha = 0.6;

	texture_color = blendScreen(bg,texture_color);

    // bnb_FragColor = vec4(blendColor(bg, bg_color.xyz, mask * bg_color.w), 1.0);
    bnb_FragColor = vec4(mix(bg, texture_color, alpha), 1.0);
}

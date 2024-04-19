#include <bnb/glsl.frag>


BNB_IN(0) vec2 var_uv;
BNB_IN(1) float var_offset;



BNB_DECLARE_SAMPLER_2D(0, 1, tex_multiply);

BNB_DECLARE_SAMPLER_2D(2, 3, tex_overlay);

BNB_DECLARE_SAMPLER_2D(4, 5, glfx_BACKGROUND);

float blendOverlay(float base, float blend) {
	return base<0.5?(2.0*base*blend):(1.0-2.0*(1.0-base)*(1.0-blend));
}

vec3 blendOverlay(vec3 base, vec3 blend) {
	return vec3(blendOverlay(base.r,blend.r),blendOverlay(base.g,blend.g),blendOverlay(base.b,blend.b));
}

vec3 blendOverlay(vec3 base, vec3 blend, float opacity) {
	return (blendOverlay(base, blend) * opacity + base * (1.0 - opacity));
}

vec3 blendMultiply(vec3 base, vec3 blend) {
	return base*blend;
}

vec3 blendMultiply(vec3 base, vec3 blend, float opacity) {
	return (blendMultiply(base, blend) * opacity + base * (1.0 - opacity));
}

void main()
{
	vec2 uv = var_uv;
	
	vec4 overlayColor = BNB_TEXTURE_2D(BNB_SAMPLER_2D(tex_overlay),uv);
	vec4 multiplyColor = BNB_TEXTURE_2D(BNB_SAMPLER_2D(tex_multiply),uv);
		#ifndef BNB_VK_1
		uv.y = 1. - uv.y;
	#endif
	vec4 bg = BNB_TEXTURE_2D(BNB_SAMPLER_2D(glfx_BACKGROUND),uv);

	vec3 mix1 = blendOverlay(bg.rgb,overlayColor.rgb,overlayColor.a * 0.66);
	vec4 mix2 = bg * multiplyColor;
	bnb_FragColor = vec4(blendMultiply(mix1,multiplyColor.rgb,multiplyColor.a * 0.55),1.);
	// bnb_FragColor = vec4(mix1,1.);
}

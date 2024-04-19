#include <bnb/glsl.frag>


BNB_IN(0) vec2 var_uv;
BNB_IN(1) float var_offset;



BNB_DECLARE_SAMPLER_2D(6, 7, glfx_BACKGROUND);

BNB_DECLARE_SAMPLER_2D(0, 1, tex_normal);

BNB_DECLARE_SAMPLER_2D(2, 3, tex_screen);

BNB_DECLARE_SAMPLER_2D(4, 5, tex_dodge);

float blendScreen(float base, float blend) {
	return 1.0-((1.0-base)*(1.0-blend));
}

vec3 blendScreen(vec3 base, vec3 blend) {
	return vec3(blendScreen(base.r,blend.r),blendScreen(base.g,blend.g),blendScreen(base.b,blend.b));
}

vec3 blendScreen(vec3 base, vec3 blend, float opacity) {
	return (blendScreen(base, blend) * opacity + base * (1.0 - opacity));
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

vec3 blendNormal(vec3 base, vec3 blend) {
	return blend;
}

vec3 blendNormal(vec3 base, vec3 blend, float opacity) {
	return (blendNormal(base, blend) * opacity + base * (1.0 - opacity));
}


void main()
{
	vec2 uv = var_uv;

	vec4 normalColor = BNB_TEXTURE_2D(BNB_SAMPLER_2D(tex_normal),uv);
	vec4 screenColor = BNB_TEXTURE_2D(BNB_SAMPLER_2D(tex_screen),uv);
	vec4 dodgColor = BNB_TEXTURE_2D(BNB_SAMPLER_2D(tex_dodge),uv);

	uv.y = 1. - uv.y;
	vec4 bg = BNB_TEXTURE_2D(BNB_SAMPLER_2D(glfx_BACKGROUND),uv);
	vec3 mix1 = blendColorDodge(bg.rgb,dodgColor.rgb,0.20);
	vec3 mix2 = blendScreen(mix1,screenColor.rgb,0.64);
	bnb_FragColor = vec4(blendNormal(mix2, normalColor.rgb,normalColor.a),1.);
}

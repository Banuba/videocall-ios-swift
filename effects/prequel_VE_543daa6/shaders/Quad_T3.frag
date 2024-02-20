#include <bnb/glsl.frag>


BNB_IN(0) vec2 var_uv;
BNB_IN(1) float var_offset;



BNB_DECLARE_SAMPLER_2D(2, 3, glfx_BACKGROUND);

BNB_DECLARE_SAMPLER_2D(0, 1, tex_dodge);

float blendColorDodge(float base, float blend) {
	return (blend==1.0)?blend:min(base/(1.0-blend),1.0);
}

vec3 blendColorDodge(vec3 base, vec3 blend) {
	return vec3(blendColorDodge(base.r,blend.r),blendColorDodge(base.g,blend.g),blendColorDodge(base.b,blend.b));
}

vec3 blendColorDodge(vec3 base, vec3 blend, float opacity) {
	return (blendColorDodge(base, blend) * opacity + base * (1.0 - opacity));
}

void main()
{
	vec2 uv = var_uv;

	vec4 dodgeColor = BNB_TEXTURE_2D(BNB_SAMPLER_2D(tex_dodge),uv);
	
	uv.y = 1. - uv.y;
	vec4 bg = BNB_TEXTURE_2D(BNB_SAMPLER_2D(glfx_BACKGROUND),uv);
	vec3 mix1 = blendColorDodge(bg.rgb,dodgeColor.rgb);
	bnb_FragColor = vec4(mix1,1.);
}

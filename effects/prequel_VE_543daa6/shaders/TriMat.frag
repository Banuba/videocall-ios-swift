#include <bnb/glsl.frag>

#define COLOR_COEFbnb_FragColor 0.1

#define X_FREQ 1.5
#define X_AMP 0.1

#define Y_FREQ 0.5
#define Y_AMP 0.1

#define PULSE_FREQ 0.2
#define PULSE_AMP 0.0


BNB_IN(0) vec2 var_uv;
BNB_IN(1) vec2 var_bgmask_uv;

BNB_IN(2) vec4 random;



BNB_DECLARE_SAMPLER_2D(2, 3, glfx_BACKGROUND);

BNB_DECLARE_SAMPLER_2D(0, 1, glfx_BG_MASK);

float time;

float filtered_bg_simple( BNB_DECLARE_SAMPLER_2D_ARGUMENT(mask_tex), vec2 uv )
{
	float bg1 = BNB_TEXTURE_2D(BNB_SAMPLER_2D(mask_tex), uv ).x;
	if( bg1 > 0.98 || bg1 < 0.02 )
		return bg1;

	vec2 o = 1./vec2(textureSize(BNB_SAMPLER_2D(mask_tex),0));
	float bg2 = BNB_TEXTURE_2D(BNB_SAMPLER_2D(mask_tex), uv + vec2(o.x,0.) ).x;
	float bg3 = BNB_TEXTURE_2D(BNB_SAMPLER_2D(mask_tex), uv - vec2(o.x,0.) ).x;
	float bg4 = BNB_TEXTURE_2D(BNB_SAMPLER_2D(mask_tex), uv + vec2(0.,o.y) ).x;
	float bg5 = BNB_TEXTURE_2D(BNB_SAMPLER_2D(mask_tex), uv - vec2(0.,o.y) ).x;

	return 0.2*(bg1+bg2+bg3+bg4+bg5);
}

float rand_pulse() {
	return abs(sin(time * PULSE_FREQ) * PULSE_AMP);
}

float rand_x () {
    return sin(time * X_FREQ) * X_AMP;
}

float rand_y () {
    return sin(time * Y_FREQ) * Y_AMP;
}

void main()
{	
	time = random.x;

	vec2 uvR = var_uv;
	vec2 uvG = var_uv;
	vec2 uvB = var_uv;

	vec2 uvR_bg = var_bgmask_uv;
	vec2 uvB_bg = var_bgmask_uv;

	uvR_bg.y = var_bgmask_uv.y * 1.0 + (rand_x() + rand_pulse()) * 0.152;
	uvB_bg.y = var_bgmask_uv.y * 1.0 - (rand_x() + rand_pulse()) * 0.152;

	uvR.x = var_uv.x * 1.0 - (rand_x() + rand_pulse()) * 0.152;
	uvB.x = var_uv.x * 1.0 + (rand_x() + rand_pulse()) * 0.152;

	uvR.y = var_uv.y * 1.0 - rand_y() * 0.152;
	uvB.y = var_uv.y * 1.0 + rand_y() * 0.152;

	uvR_bg.x = var_bgmask_uv.x * 1.0 + rand_y() * 0.152;
	uvB_bg.x = var_bgmask_uv.x * 1.0 - rand_y() * 0.152;

	vec4 c;
	c.r = mix(BNB_TEXTURE_2D(BNB_SAMPLER_2D(glfx_BACKGROUND), uvR).r, BNB_TEXTURE_2D(BNB_SAMPLER_2D(glfx_BACKGROUND), var_uv).r, COLOR_COEFbnb_FragColor);
	c.r = mix (c.r, BNB_TEXTURE_2D(BNB_SAMPLER_2D(glfx_BACKGROUND), var_uv).r, filtered_bg_simple( BNB_PASS_SAMPLER_ARGUMENT(glfx_BG_MASK), uvR_bg ));

	c.g = BNB_TEXTURE_2D(BNB_SAMPLER_2D(glfx_BACKGROUND), uvG).g;

	c.b = mix (BNB_TEXTURE_2D(BNB_SAMPLER_2D(glfx_BACKGROUND), uvB).b, BNB_TEXTURE_2D(BNB_SAMPLER_2D(glfx_BACKGROUND), var_uv).b, COLOR_COEFbnb_FragColor);
	c.b = mix (c.b, BNB_TEXTURE_2D(BNB_SAMPLER_2D(glfx_BACKGROUND), var_uv).b, filtered_bg_simple( BNB_PASS_SAMPLER_ARGUMENT(glfx_BG_MASK), uvB_bg ));
	
	c.w = 1.0;

	bnb_FragColor = c;
}

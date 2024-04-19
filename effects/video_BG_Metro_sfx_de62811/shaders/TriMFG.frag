#include <bnb/glsl.frag>

#define setY1 0.0
#define setY2 0.8494088363410081
#define setX1 0.0
#define setX2 1.0





BNB_IN(0) vec2 var_uv;
BNB_IN(1) vec2 var_bg_mask_uv;


BNB_DECLARE_SAMPLER_VIDEO(2, 3, glfx_VIDEO);

BNB_DECLARE_SAMPLER_2D(0, 1, glfx_BACKGROUND);

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

vec2 aspect_fill_uv_tex(vec2 uv)
{
    vec2 texSize = vec2(textureSize(BNB_SAMPLER_2D(glfx_VIDEO), 0));
    float aspect_ratio = bnb_SCREEN.y / bnb_SCREEN.x;
    float texture_aspect_ratio = texSize.y / texSize.x;
    float scale_x = 1.;
    float scale_y = 1.;

    if (texture_aspect_ratio >= aspect_ratio) {
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
    int mode = int(js_bg_mode.x);
    #ifdef BNB_VK_1
	    uv.y = 1. - uv.y;
    #endif
    vec3 base_color = BNB_TEXTURE_2D(BNB_SAMPLER_2D(glfx_BACKGROUND),uv).rgb;

	uv = aspect_fill_uv_tex(uv);
    
	
    /*
    uv.y *= setY2-setY1;
    uv.y += setY1;
    uv.x *= setX2-setX1;
    uv.x += setX1;
    */
    vec3 texture_color = BNB_TEXTURE_2D(BNB_SAMPLER_2D(glfx_VIDEO), uv).rgb;
	texture_color *= 0.8;
	texture_color += 0.5;

    //float alpha = texture(tex, uv).a;
    float alpha = 1.0;
    switch (3) {
    case 1:
        texture_color = blendMultiply(base_color,texture_color);
        break;
    case 2:
        texture_color = blendScreen(base_color,texture_color);
        break;
    case 3:
        texture_color = blendSoftLight(base_color,texture_color);
        break;
    case 4:
        texture_color = blendOverlay(base_color,texture_color);
        break;
    case 5:
        texture_color = blendColorDodge(base_color,texture_color);
        break;
    case 6:
        texture_color = blendLighten(base_color,texture_color);
        break;
    case 7:
        texture_color = blendAdd(base_color,texture_color);
        break;
    }

    bnb_FragColor = vec4(texture_color,alpha);
}
function Effect() {
    var self = this;

    var l_color = [0.631,0.847,0.812];

    this.lights = [
        { pos: [80,50,100], radiance:l_color },
        { pos: [-80,50,100], radiance:l_color },
        { pos: [80,-50,100], radiance:l_color },
        { pos: [-80,-50,100], radiance:l_color }
    ];

    this.updateLights = function() {
        Api.print("updateLights");
        for(var i = 0; i != 4; ++i) {
            var p = self.lights[i].pos;
            var r = self.lights[i].radiance;
            Api.meshfxMsg("shaderVec4", 0, i+1,   String(p[0]) + " " + String(p[1]) + " " + String(p[2]));
            Api.meshfxMsg("shaderVec4", 0, i+5, String(r[0]) + " " + String(r[1]) + " " + String(r[2]));
        }
    };

    this.play = function() {
        self.updateLights();
    };

    this.init = function() {

        Api.meshfxMsg("spawn", 3, 0, "!glfx_FACE");

        Api.meshfxMsg("spawn", 1, 0, "BeautyFace.bsm2");
        Api.meshfxMsg("spawn", 2, 0, "eyelash.bsm2");
        Api.meshfxMsg("spawn", 5, 0, "quad.bsm2");

        self.updateLights();

        Api.meshfxMsg("shaderVec4", 0, 1+4*2, "0.671 0.357 0.443 0.9");
        // [0] sCoef -- color saturation
        // [1] vCoef -- shine brightness (intensity)
        // [2] sCoef1 -- shine saturation (color bleeding)
        // [3] bCoef -- darkness (more is less)
        Api.meshfxMsg("shaderVec4", 0, 2+4*2, "1.0 0.347 0.598 1.0");
        
        Api.showRecordButton();
    };

    this.restart = function() {
        Api.meshfxReset();       
        self.init();
    };

    this.faceActions = [function(){ Api.meshfxMsg("shaderVec4", 0, 0, "1."); }];
    this.noFaceActions = [function(){ Api.meshfxMsg("shaderVec4", 0, 0, "0."); }];


    this.videoRecordStartActions = [];
    this.videoRecordFinishActions = [];
    this.videoRecordDiscardActions = [this.restart];
}

configure(new Effect());
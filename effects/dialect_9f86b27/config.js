function Effect() {
    var self = this;

    this.init = function() {
        Api.meshfxMsg("spawn", 0, 0, "!glfx_FACE");
        //Api.meshfxMsg("spawn", 1, 0, "Beauty09.bsm2");
        Api.meshfxMsg("spawn", 2, 0, "eyelash.bsm2");
        Api.meshfxMsg("spawn", 3, 0, "quad.bsm2");

        Api.meshfxMsg("shaderVec4", 0, 0, "1.0 0.5176 0.5372 1.0");
        
        Api.showRecordButton();
    };

    this.restart = function() {
        Api.meshfxReset();
        self.init();
    };

    this.faceActions = [function(){ Api.meshfxMsg("shaderVec4", 0, 1, "1."); }];
    this.noFaceActions = [function(){ Api.meshfxMsg("shaderVec4", 0, 1, "0."); }];

    this.videoRecordStartActions = [];
    this.videoRecordFinishActions = [];
    this.videoRecordDiscardActions = [this.restart];
}

configure(new Effect());
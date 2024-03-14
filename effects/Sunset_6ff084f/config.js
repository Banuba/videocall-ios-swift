function Effect()
{
    var self = this;

    this.init = function() {
        Api.meshfxMsg("spawn", 0, 0, "!glfx_FACE");
        Api.meshfxMsg("spawn", 1, 0, "tri1.bsm2");
        Api.meshfxMsg("tex", 1, 0, "LUT_1.png");
        Api.meshfxMsg("spawn", 2, 0, "quad_tex1.bsm2");
    };

    this.restart = function() {
        Api.meshfxReset();
        self.init();
    };

    this.faceActions = [];
    this.noFaceActions = [];

    this.videoRecordStartActions = [];
    this.videoRecordFinishActions = [];
    this.videoRecordDiscardActions = [];
}

configure(new Effect());
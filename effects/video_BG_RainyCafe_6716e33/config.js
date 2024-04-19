function Effect() {
    var self = this;

    this.init = function() {
        //Api.meshfxMsg("spawn", 0, 0, "!glfx_FACE");
        Api.meshfxMsg("spawn", 0, 0, "triFG1.bsm2");
        Api.meshfxMsg("spawn", 1, 0, "tri.bsm2");
        Api.meshfxMsg("spawn", 2, 0, "tri2.bsm2");

        Api.playVideo("frx", true, 1.);
 
        //Api.showRecordButton();
    };

    this.restart = function() {
        Api.meshfxReset();


        self.init();
    };

    this.faceActions = [];
    this.noFaceActions = [];

    this.videoRecordStartActions = [];
    this.videoRecordFinishActions = [];
    this.videoRecordDiscardActions = [this.restart];
}

configure(new Effect());
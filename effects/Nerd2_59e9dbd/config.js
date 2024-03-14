function Effect() {
    var self = this;
    var timer = new Date().getTime();
    var delay = 3000;

    this.hide = function() {
        var now = new Date().getTime();
        if(now >= timer + delay) {
            Api.hideHint();
            this.faceActions = [];
        }
    };

    this.init = function() {
        Api.meshfxMsg("spawn", 2, 0, "!glfx_FACE");
        Api.meshfxMsg("spawn", 0, 0, "glasses.bsm2");
        // Api.meshfxMsg("animOnce", 0, 0, "static");
        Api.meshfxMsg("spawn", 1, 0, "morph.bsm2");
        // Api.meshfxMsg("animOnce", 1, 0, "static");
        if (Api.getPlatform().toLowerCase() == 'ios') {
            Api.showHint("Voice сhanger");
        };

        Api.showRecordButton();
    };

    this.restart = function() {
        Api.meshfxReset();
        self.init();
        Api.hideHint();
    };

    this.faceActions = [this.hide];
    this.noFaceActions = [];

    this.videoRecordStartActions = [];
    this.videoRecordFinishActions = [];
    this.videoRecordDiscardActions = [this.restart];
}

configure(new Effect());
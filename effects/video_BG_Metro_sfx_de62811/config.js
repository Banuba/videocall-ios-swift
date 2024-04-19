function Effect() {
    var self = this;


    this.init = function() {

        Api.meshfxMsg("spawn", 0, 0, "!glfx_FACE");
        Api.meshfxMsg("spawn", 1, 0, "metro.bsm2");
        Api.meshfxMsg("animLoop", 1, 0, "Take 001");
        Api.meshfxMsg("spawn", 2, 0, "tri.bsm2");
        Api.meshfxMsg("spawn", 3, 0, "triFG.bsm2");
        Api.meshfxMsg("spawn", 4, 0, "tri6FG.bsm2");

        Api.playVideo("frx", true, 1.);
        Api.playSound("bg_metro", true, 1.0);
        setForegroundBlending("softlight");      

        Api.showRecordButton();
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
function setForegroundBlending(blendingMode){
    var shaderId = 1;
    var blendModeValue = 0;
    switch (blendingMode) {
        case "normal":
            blendModeValue = 0;
            break;
        case "multiply":
            blendModeValue = 1;
            break;
        case "screen":
            blendModeValue = 2;
            break;
        case "softlight":
            blendModeValue = 3;
            break;
        case "overlay":
            blendModeValue = 4;
            break;
        case "colordodge":
            blendModeValue = 5;
            break;
        case "lighten":
            blendModeValue = 6;
            break;
        case "add":
            blendModeValue = 7;
            break;
    }
    Api.meshfxMsg("shaderVec4", 0, shaderId, blendModeValue + " 0 0 0");
}
configure(new Effect());


function setSoundVolume(vol){
    bnb.scene.getAssetManager().findAudioTrack("bg_metro").setVolume(vol);
}
setSoundVolume(0.4)

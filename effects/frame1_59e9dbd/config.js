var settings = {
    effectName: "frame1"
};
var textures = [
    'lut_1.png',
    'lut_2.png',
    'lut_3.png',
    'lut_4.png',
    'lut_5.png',
    'lut_6.png',
    'lut_7.png'
];
var i = 0;

var spendTime = 0;

function Effect() {
    var self = this;

    this.init = function() {
        Api.meshfxMsg("spawn", 0, 0, "BeautyFace_SP_OPT.bsm2");
        Api.meshfxMsg("spawn", 1, 0, "!glfx_FACE");

        Api.meshfxMsg("spawn", 5, 0, "tri.bsm2");
        Api.meshfxMsg("tex", 5, 0, textures[i]);

        playCycle();

        // onTouchesBegan();
        // onTouchesBegan();

        Api.showRecordButton();
    };

    this.restart = function() {
        Api.meshfxReset();
        self.init();
    };

    this.timeUpdate = function () { 
        if (self.lastTime === undefined) self.lastTime = (new Date()).getTime();
    
        var now = (new Date()).getTime();
        self.delta = now - self.lastTime;
        if (self.delta < 3000) { // dont count spend time if application is minimized
            spendTime += self.delta;
        }
        self.lastTime = now;
    };
    
    this.faceActions = [this.timeUpdate];
    this.noFaceActions = [this.timeUpdate];

    this.videoRecordStartActions = [];
    this.videoRecordFinishActions = [];
    this.videoRecordDiscardActions = [this.restart];
}

function playCycle(){

    Api.meshfxMsg("spawn", 2, 0, "quad_video.bsm2");

    Api.meshfxMsg("spawn", 0, 0, "animation_1.bsm2");
    Api.meshfxMsg("animLoop", 0, 0, "Take 001");

    Api.meshfxMsg("spawn", 3, 0, "animation_2.bsm2");
    Api.meshfxMsg("animLoop", 3, 0, "Take 001");

    Api.meshfxMsg("spawn", 4, 0, "animation_3.bsm2");
    Api.meshfxMsg("animLoop", 4, 0, "Take 001");

    Api.playVideo("frx", false, 1.0);

    timeOut(7967, function(){
        resetAnim();
        playCycle();
    });
}

function resetAnim(){
    // Api.meshfxMsg("del", 0);
    // Api.meshfxMsg("del", 2);
    // Api.meshfxMsg("del", 3);
    // Api.meshfxMsg("del", 4);
    Api.stopVideo("frx");
}

configure(new Effect());

function timeOut(delay, callback) {
    var timer = new Date().getTime();

    effect.faceActions.push(removeAfterTimeOut);
    effect.noFaceActions.push(removeAfterTimeOut);

    function removeAfterTimeOut() {
        var now = new Date().getTime();

        if (now >= timer + delay) {
            var idx = effect.faceActions.indexOf(removeAfterTimeOut);
            effect.faceActions.splice(idx, 1);
            idx = effect.noFaceActions.indexOf(removeAfterTimeOut);
            effect.noFaceActions.splice(idx, 1);
            callback();
        }
    }
}
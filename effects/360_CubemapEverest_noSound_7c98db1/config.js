
let startRotation = new Array();
let Angle = 10;
let state = false;
function Effect() {
    var self = this;

    this.waitHint = function() {
        if((new Date()).getTime() > self.t) {
            Api.hideHint();
            self.faceActions = [];
        }
    };

    this.init = function() {

        Api.meshfxMsg("spawn", 3, 0, "tri.bsm2");
        Api.meshfxMsg("spawn", 2, 0, "!glfx_FACE");
        Api.meshfxMsg("spawn", 0, 0, "CubemapEverest.bsm2");
        Api.meshfxMsg("spawn", 1, 0, "CubemapEverestMorph.bsm2");
        Api.meshfxMsg("spawn", 4, 0, "plane.bsm2");
        Api.playVideo("frx", true, 1)
        timeOut(1000, () => {
            startRotation = Api.getRotationVector();
        })
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

configure(new Effect());

function onDataUpdate(){
    var q = Api.getRotationVector();
    if(!state){
        if(Math.abs((Math.asin(q[3])*2 * 180 / 3.14) - (Math.asin(startRotation[3])*2 * 180 / 3.14)) >= Angle){
            state = true;
            return state;
        }else{
            return state;
        }
    } else{
        return state;
    }

}

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
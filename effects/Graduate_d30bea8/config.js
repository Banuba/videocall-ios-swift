// CATRigHub001
// CATRigTail1  -> CATRigHub001
// CATRigTail2  -> CATRigTail1
// CATRigTail3  -> CATRigTail2
// CATRigTail4  -> CATRigTail3
// CATRigTail5  -> CATRigTail4
// CATRigTail6  -> CATRigTail5
// CATRigTail7  -> CATRigTail6
// CATRigTail8  -> CATRigTail7
function Effect() {
    var self = this;

    this.init = function() {
        Api.meshfxMsg("spawn", 4, 0, "!glfx_FACE");
        Api.meshfxMsg("spawn", 0, 0, "hat_physicss.bsm2"); 
        Api.meshfxMsg("spawn", 1, 0, "mesh.bsm2");
        Api.meshfxMsg("spawn", 2, 0, "cut.bsm2");
        Api.meshfxMsg("spawn", 3, 0, "BeautyFaceSP.bsm2");

        Api.meshfxMsg("dynImass", 0, 0, "CATRigHub001");

        Api.meshfxMsg("dynImass", 0, 1, "CATRigTail1");
        Api.meshfxMsg("dynImass", 0, 2, "CATRigTail2");
        Api.meshfxMsg("dynImass", 0, 2, "CATRigTail3");
        Api.meshfxMsg("dynImass", 0, 3, "CATRigTail4");
        Api.meshfxMsg("dynImass", 0, 3, "CATRigTail5");
        Api.meshfxMsg("dynImass", 0, 6, "CATRigTail6");
        Api.meshfxMsg("dynImass", 0, 8, "CATRigTail7");
        Api.meshfxMsg("dynImass", 0, 10, "CATRigTail8");
        
        Api.meshfxMsg("dynSphere", 0, 0, "0 31 20 100");
        Api.meshfxMsg("dynSphere", 0, 1, "0 -43 25 87");

        Api.meshfxMsg("dynDamping", 0, 98)
        Api.meshfxMsg("dynGravity", 0, 0, "0 -980 0");
        
        // Api.showHint("Open mouth");
        // Api.playVideo("frx",true,1);
        Api.showRecordButton();
    };

    this.restart = function() {
        Api.meshfxReset();
        // Api.stopVideo("frx");
        // Api.stopSound("sfx.aac");
        self.init();
    };

    this.faceActions = [];
    this.noFaceActions = [];

    this.videoRecordStartActions = [];
    this.videoRecordFinishActions = [];
    this.videoRecordDiscardActions = [this.restart];
}

configure(new Effect());
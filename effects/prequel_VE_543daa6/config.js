var settings = {
    effectName: "prequel"
};

var spendTime = 0;

var i = 5;

var analytic = {
    spendTimeSec: 0,
    taps: 0
};
function sendAnalyticsData() {
    var _analytic;
    analytic.spendTimeSec = Math.round(spendTime / 1000);
    _analytic = {
        'Event Name': 'Effects Stats',
        'Effect Name': settings.effectName,
        'Effect Action': 'Tap',
        'Action Count': String(analytic.taps),
        'Spend Time': String(analytic.spendTimeSec)
    };
    Api.print('sended analytic: ' + JSON.stringify(_analytic));
    Api.effectEvent('analytic', _analytic);
}

function onStop() {
    try {
        sendAnalyticsData();
    } catch (err) {
        Api.print(err);
    }
}

function onFinish() {
    try {
        sendAnalyticsData();
    } catch (err) {
        Api.print(err);
    }
}

function Effect()
{
    var self = this;
    var c = 0.5;
	var sec = 0;
	var lastFrame;
	this.play = function() {
		var now = (new Date()).getTime();
		sec += (now - lastFrame)/1000;
		Api.meshfxMsg("shaderVec4", 0, 0, String(sec));
		//Api.showHint(String(sec));
		lastFrame = now;
	}

	function frac(f) {
		return f % 1;
	}

    this.init = function() {
        spawnSet(5);

		lastFrame = (new Date()).getTime();
    };

    this.sendTime = function () {
		var nowSeconds = new Date().getTime()/1000;

		Api.meshfxMsg("shaderVec4", 0, 6, nowSeconds + " 0 0 0");
	};

    this.restart = function() {
        Api.meshfxReset();
        self.init();
    };


    this.timeUpdate = function () { 
        if (self.lastTime === undefined) self.lastTime = (new Date()).getTime();
    
        var now = (new Date()).getTime();

        Api.meshfxMsg("shaderVec4", 0, 6, now/1000 + " 0 0 0");

        self.delta = now - self.lastTime;
        if (self.delta < 3000) { // dont count spend time if application is minimized
            spendTime += self.delta;
        }
        self.lastTime = now;
    };
    
    this.faceActions = [this.timeUpdate,self.play];
    this.noFaceActions = [this.timeUpdate];

    this.videoRecordStartActions = [this.delHint];
    this.videoRecordFinishActions = [];
    this.videoRecordDiscardActions = [];
}

configure(new Effect());

function calcUVShift1(num) {
    var result = [];
    switch (num) {
        case 0:
            result[0] = 0.;
            result[1] = 0.;
            break;
        case 1:
            result[0] = 0.25;
            result[1] = 0.;
            break;
        case 2:
            result[0] = 0.5;
            result[1] = 0.;
            break;
        case 3:
            result[0] = 0.75;
            result[1] = 0.;
            break;
        case 4:
            result[0] = 0.;
            result[1] = -1./3.;
            break;
        case 5:
            result[0] = 0.25;
            result[1] = -1./3.;
            break;
        case 6:
            result[0] = 0.5;
            result[1] = -1./3.;
            break;
        case 7:
            result[0] = 0.75;
            result[1] = -1./3.;
            break;
        case 8:
            result[0] = 0.;
            result[1] = -2./3.;
            break;
        case 9:
            result[0] = 0.25;
            result[1] = -2./3.;
            break;
        default:
            break;
    }
    return result;
}

function calcUVShift2(dateType,num) {
    var result = [];
    var xStartMonth = 0.05;
    var xShiftMonth = 0.46;

    var yShiftMonth = 1./6.;
    var yShiftYear = 0.0725;
    if (dateType == 'month'){
        switch (num) {
            case 1:
                result[0] = xStartMonth;
                result[1] = 0.;
                break;
            case 2:
                result[0] = xStartMonth;
                result[1] = 0. - yShiftMonth;
                break;
            case 3:
                result[0] = xStartMonth;
                result[1] = 0. - yShiftMonth * 2;
                break;
            case 4:
                result[0] = xStartMonth;
                result[1] = 0. - yShiftMonth * 3;
                break;
            case 5:
                result[0] = xStartMonth;
                result[1] = 0. - yShiftMonth * 4;
                break;
            case 6:
                result[0] = xStartMonth;
                result[1] = 0. - yShiftMonth * 5;
                break;
            case 7:
                result[0] = xStartMonth + xShiftMonth;
                result[1] = 0;
                break;
            case 8:
                result[0] = xStartMonth + xShiftMonth;
                result[1] = 0. - yShiftMonth;
                break;
            case 9:
                result[0] = xStartMonth + xShiftMonth;
                result[1] = 0. - yShiftMonth * 2;
                break;
            case 10:
                result[0] = xStartMonth + xShiftMonth;
                result[1] = 0. - yShiftMonth * 3;
                break;
            case 11:
                result[0] = xStartMonth + xShiftMonth;
                result[1] = 0. - yShiftMonth * 4;
                break;
            case 12:
                result[0] = xStartMonth + xShiftMonth;
                result[1] = 0. - yShiftMonth * 5;
                break;
            default:
                break;
        }
        return result;
    } else if (dateType == "year") {
        result[0] = 0;
        result[1] = 0. + (num - 1) * yShiftYear;
        return result;
    } else {
        Api.print("calcUVShift2() - passed dateType param should be 'month' or 'year'");
    }
}

function spawnDate(type) {

    var xPosDigit = 0.;
    var yPosDigit = -0.25;

    var scaleDigit = .75;
    var angleDigit = 90;

    var xPosScript = 0.25;
    var yPosScript = 0.3;

    var scaleScript = 1.;
    var angleScript = -90;

    var day = (new Date()).getDate();
    var month = (new Date()).getMonth();
    var year = (new Date()).getFullYear();

    var yearDigit3 = parseInt(year.toString().substring(2,3));
    var yearDigit4 = parseInt(year.toString().substring(3,4));

    if (type == 1) {

        Api.meshfxMsg("spawn", 17, 0, "geo_digital.bsm2");

        if(month.toString().length == 2) {
            var monthDigit1 = parseInt(month.toString().substring(0,1));
            var monthDigit2 = parseInt(month.toString().substring(1,2)) + 1;
        } else {
            var monthDigit1 = 0;
            var monthDigit2 = parseInt(month.toString().substring(0,1)) + 1;
        }
        var shiftMonth1 = calcUVShift1(monthDigit1);
        var shiftMonth2 = calcUVShift1(monthDigit2);

        if(day.toString().length == 2) {
            var dayDigit1 = parseInt(day.toString().substring(0,1));
            var dayDigit2 = parseInt(day.toString().substring(1,2));
        } else {
            var dayDigit1 = 0;
            var dayDigit2 = parseInt(day.toString().substring(0,1));
        }
        var shiftDay1 = calcUVShift1(dayDigit1);
        var shiftDay2 = calcUVShift1(dayDigit2);

        var shiftYear1 = calcUVShift1(yearDigit3);
        var shiftYear2 = calcUVShift1(yearDigit4);

            // Send pos and scale edit
        Api.meshfxMsg("shaderVec4", 0, 2, xPosDigit + " " + yPosDigit + " " + scaleDigit + " " + angleDigit);
            
            // Send time data
        Api.meshfxMsg("shaderVec4", 0, 3, shiftMonth1[0] + " " + shiftMonth1[1] + " " + shiftMonth2[0] + " " + shiftMonth2[1]); // month
        Api.meshfxMsg("shaderVec4", 0, 4, shiftDay1[0] + " " + shiftDay1[1] + " " + shiftDay2[0] + " " + shiftDay2[1]); // day
        Api.meshfxMsg("shaderVec4", 0, 5, shiftYear1[0] + " " + shiftYear1[1] + " " + shiftYear2[0] + " " + shiftYear2[1]); // year

    } else if (type == 2) {
        var shiftMonth1 = calcUVShift2('month',month + 1);

        var shiftYear1 = calcUVShift2('year',-yearDigit3+1);
        var shiftYear2 = calcUVShift2('year',-yearDigit4+1);

            // Send pos and scale edit
        Api.meshfxMsg("shaderVec4", 0, 2, xPosScript + " " + yPosScript + " " + scaleScript + " " + angleScript);
            // Send time data
        Api.meshfxMsg("shaderVec4", 0, 3, shiftMonth1[0] + " " + shiftMonth1[1] + " 0 0"); // month
        Api.meshfxMsg("shaderVec4", 0, 4, shiftYear1[0] + " " + shiftYear1[1] + " " + shiftYear2[0] + " " + shiftYear2[1]);

        Api.meshfxMsg("spawn", 17, 0, "geo_script.bsm2");
    }
}

function spawnSet(num){
    switch (num) {
        case 0:
            Api.meshfxReset();
            Api.meshfxMsg("spawn", 0, 0, "!glfx_FACE");
            Api.meshfxMsg("spawn", 1, 0, "tri1.bsm2");
            Api.meshfxMsg("tex", 1, 0, "glitch.png");
            Api.meshfxMsg("spawn", 4, 0, "tri.bsm2");
            break;
        case 1:
            Api.meshfxReset();
            Api.meshfxMsg("spawn", 0, 0, "!glfx_FACE");
            Api.meshfxMsg("spawn", 1, 0, "tri1.bsm2");
            Api.meshfxMsg("tex", 1, 0, "LUT_1.png");
            Api.meshfxMsg("spawn", 11, 0, "quad_tex1.bsm2");
            break;
        case 2:
            Api.meshfxReset();
            Api.meshfxMsg("spawn", 0, 0, "!glfx_FACE");
            //Api.meshfxMsg("spawn", 3, 0, "quad_noize.bsm2");
            Api.meshfxMsg("shaderVec4", 0, 1, "15. 0 0 0");
            Api.meshfxMsg("spawn", 1, 0, "tri1.bsm2");
            Api.meshfxMsg("tex", 1, 0, "LUT_2.png");
            Api.meshfxMsg("spawn", 12, 0, "quad_tex2.bsm2");
            spawnDate(2);
            break;
        case 3:
            Api.meshfxReset();
            Api.meshfxMsg("spawn", 0, 0, "!glfx_FACE");
            Api.meshfxMsg("spawn", 1, 0, "tri1.bsm2");
            Api.meshfxMsg("tex", 1, 0, "LUT_3.png");
            Api.meshfxMsg("spawn", 13, 0, "quad_tex3.bsm2");
            break;
        case 4:
            Api.meshfxReset();
            Api.meshfxMsg("spawn", 0, 0, "!glfx_FACE");
            //Api.meshfxMsg("spawn", 3, 0, "quad_noize.bsm2");
            Api.meshfxMsg("shaderVec4", 0, 1, "10. 0 0 0");
            Api.meshfxMsg("spawn", 1, 0, "tri1.bsm2");
            Api.meshfxMsg("tex", 1, 0, "LUT_4.png");
            Api.meshfxMsg("spawn", 14, 0, "quad_tex4.bsm2");
            break;
        case 5:
            Api.meshfxReset();
            Api.meshfxMsg("spawn", 0, 0, "!glfx_FACE");
            Api.meshfxMsg("spawn", 1, 0, "tri1.bsm2");
            Api.meshfxMsg("tex", 1, 0, "LUT_5.png");
            Api.meshfxMsg("spawn", 15, 0, "quad_tex5.bsm2");
            spawnDate(1);
            break;
        default:
            break;
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
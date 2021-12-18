const buttonManager = require("buttons");
const http = require("http");
const url = "https://wap.tplinkcloud.com/";
const user = "...";
const password = "...";
const devices = [
	"8006FBA19A95E8E229B1026B70A6FCCE1A070D80",
	"800601A64756A1207C339DFBD4EDC1431A073487"
];
var token = null;

login();

buttonManager.on("buttonSingleOrDoubleClickOrHold", function(obj) {
	toggle_all(devices);
})

function toggle_all(devices, idx) {
  get_states(devices, function(states) {
		const counts = {0: 0, 1: 0};
    states.forEach(function (x) { counts[x] = (counts[x] || 0) + 1; });
		if(counts[0] < counts[1]) {
			set_states(devices, 0);
		}
		else {
			set_states(devices, 1);
		}
	})
}

function set_states(devices, state) {
	for (var i = 0; i < devices.length; i++) {
		set_state(devices[i], state);
  }
}

function set_state(deviceId, state) {
	call(deviceId, {system:{set_relay_state:{state}}})
}

function get_states(devices, callback, idx, res) {
	idx = idx ? idx : 0;
	res = res ? res : [];
	if (idx >= devices.length) {
		callback(res)
	}
	else {
		get_state(devices[idx], function(state) {
			res.push(state);
		  get_states(devices, callback, idx + 1, res);
		});
	}
}

function get_state(deviceId, callback) {
	call(deviceId, {system:{get_sysinfo:null}},
		function(res) {
			callback(res.system.get_sysinfo.relay_state)
		}
	)
}

function call(deviceId, command, callback) {
	post({
    method: "passthrough",
		params: {
			deviceId,
			token,
			requestData: JSON.stringify(command),
		}
  }, function(res) {
		callback && callback(JSON.parse(res.responseData))
	})
}

function login() {
	post({
		method: "login",
		params: {
			"appType": "Kasa_Android",
			"cloudUserName": user,
			"cloudPassword": password,
			"terminalUUID": "TermId"
		}
	}, function(res) {
		token = res.token;
		setTimeout(login, 59 * 60 * 1000);
	})
}

function post(params, callback) {
	http.makeRequest({
		url,
		method: "POST",
		headers: {"Content-Type": "application/json"},
		content: JSON.stringify(params),		
	}, function(err, res) {
		callback && callback(JSON.parse(res.content).result);
	});
}

console.log("Listening")

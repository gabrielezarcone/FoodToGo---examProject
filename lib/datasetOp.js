
function upload_initial_state(){
		var xhr = new XMLHttpRequest();
		xhr.onload = ()=>{
				var data_init = xhr.response;
				localStorage.setItem("db", JSON.stringify(data_init));
				console.log(db());
		}
		xhr.responseType = 'json';
		xhr.open('GET', 'data/initial_setup/data_init.json');
		xhr.send();
}

function db(){
		return JSON.parse(localStorage.db);
}


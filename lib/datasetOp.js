
function upload_initial_state(){
		var xhr = new XMLHttpRequest();
		xhr.onload = ()=>{
				console.log(xhr.response);
		}
		xhr.responseType = 'json';
		xhr.open('GET', 'data/*');
		xhr.send();
}


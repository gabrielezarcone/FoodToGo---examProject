
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

//Restituisce il json del db salvato nel localStorage
// usarlo per avere la versione aggiornata del db
function db(){													
		return JSON.parse(localStorage.db);
}
// Una volta che viene modificato il json del db preso da db() se si vuole rendere definitiva la modifica usare update_db()
// come parametro usare il nuovo json modificato
// da usare in coppia con db()
function update_db(new_db){
		localStorage.setItem("db", new_db);				
}

// Controllo validità form di login
function valid_login(){
		event.preventDefault();
		var lf = document.forms["login_form"]; // lf = login_form
		var data = db();
		if(data[lf["user_type"].value][lf["username"].value]==undefined){
				alert("Username o password non corretti");	
				return false; //per bloccare l'invio del form
		}
		return true;
}

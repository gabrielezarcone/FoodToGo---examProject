
function upload_initial_state(){
		var xhr = new XMLHttpRequest();
		xhr.onload = ()=>{
				var data_init = xhr.response;
				var clienti = data_init.clienti;
				var ristoratori = data_init.ristoratori;
				var piatti = data_init.piatti;
				var ristoranti = data_init.ristoranti;
				var vende = data_init.vende;
				var acquista = data_init.acquista;
				localStorage.setItem("clienti", JSON.stringify(clienti));
				localStorage.setItem("ristoratori", JSON.stringify(ristoratori));
				localStorage.setItem("piatti", JSON.stringify(piatti));
				localStorage.setItem("ristoranti", JSON.stringify(ristoranti));
				localStorage.setItem("vende", JSON.stringify(vende));
				localStorage.setItem("acquista", JSON.stringify(acquista));
		}
		xhr.responseType = 'json';
		xhr.open('GET', 'data/data.json'); // utilizzare data/initial_setup/data_init.json solamente come backup di una situazione iniziale 
		xhr.send();
}

//Restituisce il json del db salvato nel localStorage
// usarlo per avere la versione aggiornata del db
function db(table){													
		return JSON.parse(localStorage.getItem(table));
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
		var user_type = lf["user_type"].value;
		var users = db(user_type);
		var user = users[lf["username"].value];
		var password = lf["password"].value;
		if(user!=undefined && password==user.password){
				document.getElementById('login_form').remove();		
				return true;
		}
		else{
				alert("Username o password non corretti");	
				return false; //per bloccare l'invio del form
		}
}


// Generatore lista dei ristoranti
function list_ristoranti(){
		var ristoranti = db("ristoranti");
		var ristoranti_list = document.getElementById('ristoranti_list');
		for(r in ristoranti){
				var ristorante = document.createElement('div');
				var titolo_ristorante = document.createElement('h1');
				ristorante.className = 'ristorante';
				ristorante.setAttribute('onclick','list_piatti_rist(\"'+r+'\");');
				titolo_ristorante.innerText = r;
				ristorante.appendChild(titolo_ristorante);
				ristoranti_list.appendChild(ristorante);				
		}		
}

// Generatore lista dei piattti del ristorante
function list_piatti_rist(ristorante){
		var piatti_rist = db('vende');
		var piatti_list = document.getElementById('piatti_list');
		piatti_list.innerHTML = '';
		for(p of piatti_rist){
				if(p.ristorante == ristorante){
						var piatto = document.createElement('div');
						var titolo_piatto = document.createElement('h1');
						piatto.className = 'piatto';
						titolo_piatto.innerText = p.piatto;
						piatto.appendChild(titolo_piatto);
						info_piatto(p.piatto,piatto);
						piatti_list.appendChild(piatto);				
				}
		}		
}

function info_piatto(piatto,piatto_node){
		var infoBox = document.createElement('div');
		var image = document.createElement('img');
		var ingredienti = document.createElement('div');
		var lista_ingredienti = document.createElement('ul');
		var price = document.createElement('p');
		var type = document.createElement('p');
		var piatti = db('piatti');
		var this_piatto = piatti[piatto];
		image.setAttribute('src',this_piatto.foto);
		price.innerText = this_piatto.prezzo;
		type.innerText = this_piatto.tipologia;
		for(ing of this_piatto.ingredienti){
				var ingrediente = document.createElement('li');
				ingrediente.innerText = ing;
				lista_ingredienti.appendChild(ingrediente);
		}
		ingredienti.appendChild(lista_ingredienti);
		piatto_node.appendChild(infoBox);
		infoBox.appendChild(image);
		infoBox.appendChild(ingredienti);
		infoBox.appendChild(price);
		infoBox.appendChild(type);
}


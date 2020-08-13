//------------------------------- DATABASE OPERATION -----------------------------
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
function update_db(table,new_db){
		localStorage.setItem(table, new_db);				
}
//-------------------------------------------------------------------------------------------


// Mostra il form di login
function show_login(){
		var form = document.getElementById('login_form');
		if(sessionStorage.getItem('user')==null){
				console.log(sessionStorage.getItem('user'));
				form.style = '';
		}
		else{
				show_user_icon();	
		}
}

// Aggiunge l'icone user una volta che l'utente è valido
function show_user_icon(){
		var header = document.getElementById('header');
		var usr_img = document.createElement('img');
		usr_img.src = 'media/user.png';
		usr_img.className = 'user_img';
		usr_img.setAttribute('onclick','show_user_info();' )
		header.appendChild(usr_img);
}

// Controllo validità form di login
function valid_login(){
		event.preventDefault();
		var lf = document.forms["login_form"]; // lf = login_form
		var user_type = lf["user_type"].value;
		var users = db(user_type);
		var username = lf["username"].value
		var user = users[username];
		var password = lf["password"].value;
		if(user!=undefined && password==user.password){
				document.getElementById('login_form').remove();		
				sessionStorage.setItem('user', username);
				show_user_icon();
				return true;
		}
		else{
				alert("Username o password non corretti");	
				return false; //per bloccare l'invio del form
		}
}

// Mostra informazioni cliente 
function show_user_info(){
		var user_info = document.getElementById('user_info');
		if(user_info.style.display == 'none'){
				user_info.style = '';
		}
		else{
				user_info.style = 'display:none;';	
		}
}
function fill_user_info(){
		var clienti = db('clienti');
		var user = sessionStorage.getItem('user');
		var user_info = document.getElementById('user_info');
		for(field of user_info.children){
				var key = field.dataset.key;
				var field_value = field.children[1];
				var value = clienti[user][key];
				if(key=='pagamento'){
						field.children[2].innerText=value['tipo'];
						field.children[4].innerText=value['numero'];
				}
				else{
						field_value.innerText = value;
				}
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
		list_ristorante_info(ristorante);
		var piatti_rist = db('vende');
		var piatti_list = document.getElementById('piatti_list');
		piatti_list.innerHTML = '<h1 class="piatti_list_title">'+ristorante+'</h1>';
		for(p of piatti_rist){
				if(p.ristorante == ristorante){
						var piatto = document.createElement('div');
						var piatto_title_div = document.createElement('div');
						var titolo_piatto = document.createElement('h1');
						piatto_title_div.setAttribute('class', 'piatto_title_div');
						piatto.className = 'piatto';
						piatto.setAttribute('onclick', 'open_piatto_info()');
						piatto.setAttribute('data-info', 'hidden');
						titolo_piatto.innerText = p.piatto;
						piatto_title_div.appendChild(titolo_piatto);
						piatto.appendChild(piatto_title_div);
						info_piatto(p.piatto,piatto);
						piatti_list.appendChild(piatto);				
				}
		}		
}

function info_piatto(piatto,piatto_node){
		var infoBox = document.createElement('div');
		var infoFooter = document.createElement('div');
		var image = document.createElement('img');
		var ingredienti = document.createElement('div');
		var lista_ingredienti = document.createElement('ul');
		var price = document.createElement('p');
		var type = document.createElement('p');
		//-------------------------------------
		var piatti = db('piatti');
		var this_piatto = piatti[piatto];
		//-------------------------------------
		infoBox.setAttribute('class', 'piatto_info');
		infoFooter.setAttribute('class', 'piatto_footer');
		ingredienti.setAttribute('class', 'piatto_ingredienti');
		lista_ingredienti.setAttribute('class', 'piatto_lista_ingredienti');
		price.setAttribute('class', 'piatto_price');
		type.setAttribute('class', 'piatto_type');
		image.setAttribute('class', 'piatto_img');
		image.setAttribute('src',this_piatto.foto);
		//-------------------------------------
		price.innerText = this_piatto.prezzo+'\u20AC';
		type.innerText = this_piatto.tipologia;
		ingredienti.innerHTML = '<h2 class="ingredienti_title">Ingredienti</h2>';
		//-------------------------------------
		for(ing of this_piatto.ingredienti){
				var ingrediente = document.createElement('li');
				ingrediente.setAttribute('class', 'piatto_ingrediente');
				ingrediente.innerText = ing;
				lista_ingredienti.appendChild(ingrediente);
		}
		//-------------------------------------
		ingredienti.appendChild(lista_ingredienti);
		piatto_node.appendChild(infoBox);
		piatto_node.appendChild(infoFooter);
		infoBox.appendChild(image);
		infoBox.appendChild(ingredienti);
		infoBox.appendChild(price);
		infoFooter.appendChild(type);
}

// Open and close piatto info curtain
function open_piatto_info(){
		var piatto = event.currentTarget;
		var piatto_children = piatto.childNodes;
		var display = '';
		if(piatto.dataset.info == 'hidden'){
				piatto.dataset.info = 'shown';
				display = 'flex';
		}
		else{
				piatto.dataset.info = 'hidden';
				display = 'none';
		}
		for(child of piatto_children){
				if(child.className != 'piatto_title_div'){
						child.style.display = display;
				}
		}
}


// List information about ristorante selected
function list_ristorante_info(ristorante){
		var ristJSON = db('ristoranti')[ristorante];
		//----------------------------------------------
		var info = document.getElementById('ristorante_info');
		info.style.display = 'block';
		for(field of info.children){
				var value = ristJSON[field.id];
				var field_children = field.children;
				if(field.id=='recensioni'){
						show_recensioni(value);
				}
				else{
						field_children[1].innerText = value;
				}
		}
}
function show_recensioni(recensioni){
		var html_element = document.getElementById('recensioni');
		html_element.innerHTML = '<h1 class="rist_info_h1">Recensioni:</h1>'
		for(rec of recensioni){
				var recensione = document.createElement('div'); 
				var cliente = document.createElement('h3');
				var testo = document.createElement('text');
				//------------------------------------------
				recensione.className = 'recensione';
				cliente.className = 'cliente_recensione';
				testo.className = 'testo_recensione';
				//------------------------------------------
				cliente.innerHTML = rec['cliente'];
				testo.innerHTML = rec['testo'];
				//------------------------------------------
				recensione.appendChild(cliente);
				recensione.appendChild(testo);
				html_element.appendChild(recensione);
		}
}

// Entra in modalità modifica delle informazioni dell'utente
function change_user_info(){
		var user_info = event.currentTarget.parentElement;
		formify(user_info);
}

// Trasforma un div in un form. Ogni elemneto del div con data-edit=true diventa un campo modificabile
function formify(div){
		event.currentTarget.remove();
		var form = document.createElement('form');
		form.innerHTML = div.innerHTML;
		form.id = div.id;
		form.setAttribute('onsubmit','event.preventDefault();update_user_info();');
		div.after(form);
		div.remove();
		for(parent_element of form.children){
				for(element of parent_element.children){
						if(element.dataset.edit=="true"){
								var form_element = document.createElement('input');
								form_element.innerHTML = element.innerHTML;
								form_element.className = element.className;
								form_element.setAttribute('placeholder', element.innerHTML);
								element.after(form_element);
								element.remove();
						}
				}
		}		
		var submit = document.createElement('input');
		//submit.className = "submit user_info_button"
		//submit.setAttribute('onclick', 'update_user_info();');
		submit.setAttribute('type', 'submit');
		submit.innerHTML = 'Salva';
		form.appendChild(submit);
}

// Aggiorna le informazioni dell'utente al click di Salva
function update_user_info(){
		console.log('Form submitted');	
}

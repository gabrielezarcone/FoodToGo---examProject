//------------------------------- DATABASE OPERATION -----------------------------
function upload_initial_state(){
		var xhr = new XMLHttpRequest();
		xhr.onload = ()=>{
				localStorage.clear();
				//-----------------------------
				var data_init = JSON.parse(xhr.response);
				var clienti = data_init.clienti;
				var ristoratori = data_init.ristoratori;
				var piatti = data_init.piatti;
				var ristoranti = data_init.ristoranti;
				var vende = data_init.vende;
				var acquista = data_init.acquista;
				//-----------------------------
				load("clienti", clienti);
				load("ristoratori", ristoratori);
				load("piatti", piatti);
				load("ristoranti", ristoranti);
				load("vende",vende);
				load("acquista", acquista);
				//-----------------------------
		}
		xhr.responseType = 'text';
		xhr.open('GET', 'data/data.json'); // utilizzare data/initial_setup/data_init.json solamente come backup di una situazione iniziale 
		xhr.send();
		//-----------------------------
		function load(table_name, table_obj){
			localStorage.setItem(table_name, JSON.parse(table_obj));
			return true;
		}
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
		localStorage.setItem(table, JSON.stringify(new_db));	
		updateServer();	
}

function updateServer(){
	var new_file = {};
	new_file['clienti'] = JSON.stringify(localStorage.getItem("clienti"));
	new_file['ristoratori'] = JSON.stringify(localStorage.getItem("ristoratori"));
	new_file['piatti'] = JSON.stringify(localStorage.getItem("piatti"));
	new_file['ristoranti'] = JSON.stringify(localStorage.getItem("ristoranti"));
	new_file['vende'] = JSON.stringify(localStorage.getItem("vende"));
	new_file['acquista'] = JSON.stringify(localStorage.getItem("acquista"));
	var xhr = new XMLHttpRequest();
	xhr.onload = ()=>{
		//gestire il caso in cui il server non risponda o risponda che il file non è stato aggiornato
		console.log(xhr.response);
	} 
	xhr.open('POST', 'service/upload_data.php', false);   // La richiesta è sincrona così che non vengano fatti reload della pagina mentre si stanno aggiornando i datti
	//xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
	xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
	xhr.send("json="+JSON.stringify(new_file));
}
//-------------------------------------------------------------------------------------------


// Mostra il form di login:x
//
function show_login(){
		var form = document.getElementById('login_form');
		if(username()==null){
				form.style = '';
		}
		else{
				user_logged();	
		}
}

// Restituisce il tipo di utente (clienti o ristoratori)
function userType(){
	return sessionStorage.getItem('user_type');
}
// Restituisce il nome utente
function username(){
	return sessionStorage.getItem('user');
}

// Aggiunge l'icone user una volta che l'utente è valido
function show_user_icon(){
		var header = document.getElementById('header_icons');
		var usr_img = document.createElement('img');
		usr_img.src = 'media/user.png';
		usr_img.className = 'user_img';
		usr_img.setAttribute('onclick','show_user_info();' )
		header.appendChild(usr_img);
		//-------------------------------------------------
		var sign_div = document.getElementById('sign_div');
		sign_div.style.display = 'none';
}

// Aggiunge icona del carrello
function show_cart_icon(){
	var header = document.getElementById('header_icons');
	var cart_img = document.createElement('img');
	cart_img.src = 'media/cart.svg';
	cart_img.className = 'cart_img';
	cart_img.setAttribute('onclick','show_cart();' )
	header.appendChild(cart_img);
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
				sessionStorage.setItem('user_type', user_type);
				user_logged();
				fill_user_info();
				location.reload(true);
				return true;
		}
		else{
				alert("Username o password non corretti");	
				return false; //per bloccare l'invio del form
		}
}

//Operazioni da effettuare se un user e` collegato
function user_logged(){
	var header_icons = document.getElementById('header_icons');
	header_icons.style = '';
	//-------------------------------------------
	show_user_icon();
	if(userType()=='clienti'){
		show_orders_icon();
		show_cart_icon();
	}
	//-------------------------------------------
	homepage();
}

// Mostra informazioni cliente 
function show_user_info(){
		toggle_div('user_info');
}
function fill_user_info(){
		var user_type = userType();
		var usersDB = db(user_type);
		var user = username();
		var user_info = document.getElementById('user_info');
		if(user_type=='ristoratori'){
			var pagamento = document.getElementById('pagamento_cliente');
			pagamento.remove();
		}
		for(field of user_info.children){
				var key = field.dataset.key;
				var field_value = field.children[1];
				var value = usersDB[user][key];
				if(key=='pagamento'){
						field.children[2].innerText=value['tipo'];
						field.children[4].innerText=value['numero'];
				}
				else if(key=='preferences'){
						field_value.innerText = value.join(', ');
				}
				else if(key!=undefined){
						field_value.innerText = value;
				}
		}
}

// Mostra contenuto del carrello
function show_cart(){
	var cart = db(userType())[username()]['carrello'];
	var cart_div = document.getElementById('cart');
	//------------------------------------------------
	var sum = 0;
	//---Apre e chiude il carrello--------------------
	cart_div.innerHTML = '';
	toggle_div('cart');	
	var buy = document.createElement('div');
	buy.className = 'button cart_btn buy_btn';
	buy.innerText = 'Effettua l\'ordine';
	buy.setAttribute('onclick', 'show_buy_window()');
	cart_div.appendChild(buy);
	//------------------------------------------------
	//------------------------------------------------
	var delete_elem = document.createElement('div');
	delete_elem.className = 'button cart_btn delete_elem_cart';
	delete_elem.innerText = 'Svuota carrello';
	delete_elem.setAttribute('onclick', 'empty_cart()');
	cart_div.appendChild(delete_elem);
	//------------------------------------------------
	for(piatto of cart){
		var item = document.createElement('div');
		item.className = 'order_item';
		//------------------------------------------------
		var nome = document.createElement('p');
		var ristorante = document.createElement('p');
		var prezzo = document.createElement('p');
		//------------------------------------------------
		nome.className = 'order_item_name';
		ristorante.className = 'order_item_rist';
		prezzo.className = 'order_item_price';
		//------------------------------------------------
		nome.innerText = piatto.piatto;
		ristorante.innerText = piatto.ristorante;
		prezzo.innerText = piatto.prezzo;
		sum += piatto.prezzo
		//------------------------------------------------
		item.appendChild(nome);
		item.appendChild(ristorante);
		item.appendChild(prezzo);
		cart_div.appendChild(item);
	}
	//------------------------------------------------
	var total = document.createElement('div');
	total.className = 'total_price';
	total.innerText = sum + '\u20AC';
	cart_div.insertBefore(total, cart_div.firstChild);
}

// Generatore lista dei ristoranti
function list_ristoranti(){
		var ristoranti = db("ristoranti");
		var ristoranti_list = document.getElementById('ristoranti_list');
		//---------------------------------------------------------
		var user_type = userType();
		var user = username(); 
		//---------------------------------------------------------
		for(r in ristoranti){
			var owner = ristoranti[r]['proprietario'];
			if(user_type!='ristoratori' || owner==user){
				var ristorante = document.createElement('div');
				var titolo_ristorante = document.createElement('h1');
				ristorante.className = 'ristorante';
				ristorante.setAttribute('onclick','list_piatti_rist(\"'+r+'\");');
				titolo_ristorante.innerText = r;
				ristorante.appendChild(titolo_ristorante);
				ristoranti_list.appendChild(ristorante);
			}
		}	
		if(user_type=='ristoratori'){
			var ristorante = document.createElement('div');
			var titolo_ristorante = document.createElement('h1');
			ristorante.className = 'ristorante add_ristorante';
			ristorante.setAttribute('onclick','newRistorante();');
			titolo_ristorante.innerText = '+';
			ristorante.appendChild(titolo_ristorante);
			ristoranti_list.appendChild(ristorante);
		}	
}

// Generatore lista dei piattti del ristorante
function list_piatti_rist(ristorante){
		sessionStorage.setItem('ristorante', ristorante);
		list_ristorante_info(ristorante);
		var user_type = userType();
		var piatti_rist = db('vende');
		var piatti_list = document.getElementById('piatti_list');
		piatti_list.innerHTML = '<h1 class="piatti_list_title">'+ristorante+'</h1>';
		if(user_type=='ristoratori'){
			var addPiatto = document.createElement('div');
			addPiatto.setAttribute('onclick', 'addPiatto();');
			addPiatto.className = 'button addPiattoButton';
			addPiatto.innerText = 'Aggiungi un piatto'
			piatti_list.appendChild(addPiatto);	
		}
		for(p of piatti_rist){
				if(p.ristorante == ristorante){
					create_piatto(p,piatti_list)
				}
		}		
}

// Crea una scheda piatto e la aggiunge al div piatti_list dove piatto è un oggetto piatto fatto di {piatto,ristorante}
function create_piatto(piatto, piatti_list){
	var piatto_div = document.createElement('div');
	var piatto_title_div = document.createElement('div');
	var titolo_piatto = document.createElement('h1');
	//-------------------------------------
	piatto_title_div.setAttribute('class', 'piatto_title_div');
	piatto_div.className = 'piatto';
	piatto_div.setAttribute('onclick', 'open_piatto_info()');
	piatto_div.setAttribute('data-info', 'hidden');
	piatto_div.setAttribute('data-ristorante', piatto.ristorante);
	titolo_piatto.innerText = piatto.piatto;
	//-------------------------------------
	piatto_title_div.appendChild(titolo_piatto);
	piatto_div.appendChild(piatto_title_div);
	info_piatto(piatto.piatto,piatto_div);
	piatti_list.appendChild(piatto_div);
}

function info_piatto(piatto,piatto_node){
		var user_type = userType();
		//-------------------------------------
		var infoBox = document.createElement('div');
		var infoFooter = document.createElement('div');
		var image = document.createElement('img');
		var ingredienti = document.createElement('div');
		var lista_ingredienti = document.createElement('ul');
		var price = document.createElement('p');
		var type = document.createElement('p');
		var addToCart = document.createElement('div');
		//-------------------------------------
		var piatti = db('piatti');
		var this_piatto = piatti[piatto];
		var ristorante = piatto_node.dataset.ristorante;
		//-------------------------------------
		infoBox.setAttribute('class', 'piatto_info');
		infoFooter.setAttribute('class', 'piatto_footer');
		ingredienti.setAttribute('class', 'piatto_ingredienti');
		lista_ingredienti.setAttribute('class', 'piatto_lista_ingredienti');
		price.setAttribute('class', 'piatto_price');
		type.setAttribute('class', 'piatto_type');
		image.setAttribute('class', 'piatto_img');
		image.setAttribute('src',this_piatto.foto);
		addToCart.setAttribute('onclick', 'addToCart("'+piatto+'","'+ristorante+'",'+this_piatto.prezzo+');')
		addToCart.className = 'button addToCart_btn';
		//-------------------------------------
		price.innerText = this_piatto.prezzo+'\u20AC';
		type.innerText = this_piatto.tipologia;
		ingredienti.innerHTML = '<h2 class="ingredienti_title">Ingredienti</h2>';
		addToCart.innerText = 'Aggiungi al carrello';
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
		if(user_type=='clienti'){
			infoBox.appendChild(addToCart);
		}
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
		//----------------------------------------------
		update_eta();
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
		var user_type = userType();
		var form = formify(user_info);
		if(user_type=='clienti'){
			form[3].name = 'tipo';
			form[4].name = 'numero';
		}
		preferences_change(form['preferences']);
		//------------------------------------------
		form['submit'].className = 'button user_info_button save_btn';
		//------------------------------------------
		var deleteUser = document.createElement('div');
		deleteUser.className = 'button user_info_button delete_user';
		deleteUser.innerText = 'Elimina il mio account';
		deleteUser.setAttribute('onclick', 'delete_user();');
		//------------------------------------------
		document.getElementById('logout_btn').remove();
		//------------------------------------------
		form.appendChild(deleteUser);
		form.className = 'float_menu';
}

// Trasforma un div in un form. Ogni elemneto del div con data-edit=true diventa un campo modificabile
function formify(div){
		event.currentTarget.remove();
		var form = document.createElement('form');
		form.innerHTML = div.innerHTML;
		form.id = div.id;
		form.setAttribute('name','user_info_form');
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
								form_element.setAttribute('value', element.innerHTML);
								form_element.setAttribute('name', parent_element.dataset.key);
								element.after(form_element);
								element.remove();
						}
				}
		}		
		var submit = document.createElement('input');
		//submit.className = "submit user_info_button"
		//submit.setAttribute('onclick', 'update_user_info();');
		submit.setAttribute('type', 'submit');
		submit.value = 'Salva';
		submit.name = 'submit';
		form.appendChild(submit);
		return form;
}

// Aggiorna le informazioni dell'utente al click di Salva
function update_user_info(){
		var uff = document.forms['user_info_form'];
		var user = username();
		var user_type = userType();
		var clienti = db(user_type);
		//------------------------------------------------
		var preferences = [];
		//------------------------------------------------
		for(field of uff){
			if(field.name!=''){	
				if(field.name == 'preferences'){
					if(field.checked){
						preferences = preferences.concat(field.value);
					}
					clienti[user][field.name] = preferences;
				}
				else if(field.name == 'tipo' || field.name=='numero'){
					clienti[user]['pagamento'][field.name] = field.value;
				}
				else{
					clienti[user][field.name] = field.value;
				}
				update_db(user_type, clienti);
			}
		}
		location.reload(true);
}

function delete_user(){
	var user = username();
	var user_type = userType();
	var clienti = db(user_type);
	delete clienti[user];
	update_db(user_type, clienti);
	logOut();
}

function logOut(){
	//TO DO 
	sessionStorage.removeItem('user');
	sessionStorage.removeItem('user_type');
	location.reload(true);
}

function open_float_window(){
	close_float_window()
	//------------------------------------------------
	var body = document.body;
	//------------------------------------------------
	var window = document.createElement('div');
	var close = document.createElement('img');
	//------------------------------------------------
	close.src = 'media/close.svg';
	close.className = 'button close_btn';
	close.setAttribute('onclick','close_float_window()');
	window.className = "float_window";
	//------------------------------------------------
	window.appendChild(close);
	body.appendChild(window);
	//------------------------------------------------
	return window;
}
function close_float_window(){
	var windows = document.getElementsByClassName('float_window');
	for(win of windows){
		win.remove();
	}
}

function addPiatto(){
	var piatti = db('piatti');
	var ristorante = sessionStorage.getItem('ristorante');
	var addButton = event.currentTarget;
	//------------------------------------------------
	var form = document.createElement('form');
	form.name = 'addPiatto';
	form.setAttribute('onsubmit', 'event.preventDefault(); update_vende("'+ristorante+'");'); 
	//------------------------------------------------
	var datalist = document.createElement('select');
	datalist.id = 'piatto';
	//---------------------------------------------------
	var placeholder_op = document.createElement('option');
	placeholder_op.innerText = 'Seleziona il piatto da aggiungere';
	placeholder_op.value = '';
	placeholder_op.disabled = true;	
	placeholder_op.selected = true;	
	datalist.appendChild(placeholder_op);
	//------------------------------------------------
	for(p  in piatti){
		var option = document.createElement('OPTION');
		option.setAttribute('value', p);
		option.innerHTML = p;
		datalist.appendChild(option);
	}
	//------------------------------------------------
	var submit = document.createElement('input');
	submit.type = 'submit';
	//------------------------------------------------
	form.appendChild(datalist);
	form.appendChild(submit);
	//------------------------------------------------
	addButton.after(form);
}
function update_vende(ristorante){
	var vende = db('vende');
	var form = document.forms['addPiatto'];
	var piatto = form['piatto'].value.toLowerCase();	
	var obj = {"ristorante":ristorante, "piatto":piatto};
	vende.push(obj);
	update_db('vende', vende);
	location.reload(true);
}

function accedi(){
	event.currentTarget.parentElement.style.display = 'none';
	var form = document.getElementById('login_form');
	form.style.display = 'flex';
}
function registrati(){
	//event.currentTarget.parentElement.style.display = 'none';
	//---------------------------------------------------
	var win = open_float_window();
	var user_type = document.createElement('select');
	var placeholder_op = document.createElement('option');
	var clienti_op = document.createElement('option');
	var ristoratori_op = document.createElement('option');
	var form_div = document.createElement('div');
	//---------------------------------------------------
	user_type.setAttribute('onchange', 'type_choosen();')
	user_type.className = 'choose_user_type';
	//---------------------------------------------------
	clienti_op.innerText = 'Cliente';
	clienti_op.value = 'clienti';
	ristoratori_op.innerText = 'Ristoratore';
	ristoratori_op.value = 'ristoratori';
	placeholder_op.innerText = 'Seleziona tipo di utenza';
	placeholder_op.value = '';
	form_div.id = 'register_form'; 
	//---------------------------------------------------
	placeholder_op.disabled = true;	
	placeholder_op.selected = true;	
	//---------------------------------------------------
	user_type.appendChild(placeholder_op);
	user_type.appendChild(clienti_op);
	user_type.appendChild(ristoratori_op);
	//---------------------------------------------------
	win.appendChild(user_type);
	win.appendChild(form_div);
}
function type_choosen(){
	var user_type = event.currentTarget.value;
	var div = document.getElementById('register_form');
	//---------------------------------------------------
	var form = document.createElement('form');
	form.setAttribute('onsubmit', 'createUser("'+user_type+'");');
	form.name = 'create_user_form';
	form.className = 'create_form create_user_form';
	//---------------------------------------------------
	var username = document.createElement('input');
	var password = document.createElement('input');
	var name = document.createElement('input');
	var surname = document.createElement('input');
	var preferences = document.createElement('div');
	//---------------------------------------------------
	//preferences.setAttribute('onclick', 'show_preferences_list()');
	preferences.id = 'pref_input';
	//preferences.disabled = true;
	//---------------------------------------------------
	form.appendChild(username);
	form.appendChild(password);
	form.appendChild(name);
	form.appendChild(surname);
	form.appendChild(preferences);
	//---------------------------------------------------
	username.placeholder = 'username';
	password.placeholder = 'password';
	name.placeholder = 'Nome';
	surname.placeholder = 'Cognome';
	preferences.placeholder = 'Preferenze';
	//---------------------------------------------------
	username.name = 'username';
	password.name = 'password';
	name.name = 'nome';
	surname.name = 'cognome';
	preferences.name = 'preferences';
	//---------------------------------------------------
	username.className = 'create_input username_input';
	password.className = 'create_input password_input';
	name.className = 'create_input name_input';
	surname.className = 'create_input surname_input';
	preferences.className = 'create_input pref_input';
	//---------------------------------------------------
	if(user_type == 'clienti'){
		var tipo_pagamento = document.createElement('input');
		var numero_pagamento = document.createElement('input');
		form.appendChild(tipo_pagamento);
		form.appendChild(numero_pagamento);
		tipo_pagamento.placeholder = 'Tipo pagamento';
		tipo_pagamento.name = 'tipo';
		tipo_pagamento.className = 'create_input pagamento_input'
		numero_pagamento.placeholder = 'Numero carta';
		numero_pagamento.name = 'numero';
		numero_pagamento.className = 'create_input numero_input'
	}
	//---------------------------------------------------
	var submit = document.createElement('input');
	submit.type = 'submit';
	submit.value = 'Salva';
	submit.className = 'create_submit'
	form.appendChild(submit);
	//---------------------------------------------------
	div.innerHTML = '';
	div.appendChild(form);
	preferences_register();
}

function createUser(user_type){
	event.preventDefault();
	//---------------------------------------------------
	var form = document.forms['create_user_form'];
	var users = db(user_type);
	const user = form['username'].value;
	//---------------------------------------------------
	if(users[user]!=undefined){
		alert('Questo nome utente è già stato preso');
		return;
	}
	//---------------------------------------------------
	var new_user = {};
	var pagamento = {};
	var preferences = [];
	for(input of form){
		if(input.name == 'preferences' ){
			if( input.checked == true){
				var arr = new Array(input.value);
				preferences = preferences.concat(arr);
				new_user[input.name] = preferences;
			}
		}
		else if(input.name=='tipo' || input.name=='numero'){
			pagamento[input.name] = input.value; 
		}
		else if(input.name!='username' && input.name!=''){
			new_user[input.name] = input.value;
		}
	}
	if(user_type=='clienti'){
		new_user['pagamento'] = pagamento;
		new_user['carrello'] = [];
	}
	//---------------------------------------------------
	users[user] = new_user;
	update_db(user_type, users);
	location.reload(true);
}

function show_preferences_list(input){
	var piatti = db('piatti');
	//---------------------------------------------------
	for(p in piatti){
		var op = document.createElement('input');
		var label = document.createElement('label');
		label.setAttribute('for',p);
		label.innerText = p.charAt(0).toUpperCase() + p.slice(1);
		op.name = 'preferences';
		op.type = 'checkbox';
		op.value = p;
		input.appendChild(op);
		input.appendChild(label);
	}
}

// aggiunge la checkbox delle preferenze nella sezione registra utente
function preferences_register(){
	var input = document.getElementById('pref_input');
	show_preferences_list(input);
}
// aggiunge la checkbox delle preferenze nella sezione cambia informazioni
function preferences_change(form){
	var checked_pref = form.value.split(',');
	var preferences = document.createElement('div');
	//---------------------------------------------------
	show_preferences_list(preferences);
	//---------------------------------------------------
	for(op of preferences.children){
		for(ch of checked_pref){
			if(op.value==ch.trim()){
				op.checked = true;
			}
		}
	}
	//---------------------------------------------------
	form.after(preferences);
	form.remove();
}

//shows home page with user preferences information
function homepage(){
	var user_type = userType();
	var user = username();
	//---------------------------------------------------
	var home_div = document.getElementById('piatti_list');
	var vende = db('vende');
	var pref = db(user_type)[user]['preferences'];
	//---------------------------------------------------
	home_div.innerHTML = '<h1 class="home_title">I tuoi piatti preferiti vengono venduti da questi ristoranti:</h1>'
	//---------------------------------------------------
	for(piatto of vende){
		if(pref.includes(piatto.piatto)){
			var rist_name = document.createElement('h2');
			rist_name.className = 'piatti_list_title';
			rist_name.innerText = piatto.ristorante;
			//-------------------------------------------
			home_div.appendChild(rist_name);
			create_piatto(piatto, home_div);
		}
	}
}

function addToCart(piatto,ristorante,prezzo){
	//---------------------------------------------------
	var item = {"ristorante":ristorante,"piatto":piatto,"prezzo":prezzo};
	var user = username();
	//---------------------------------------------------
	var clienti = db('clienti');
	clienti[user]['carrello'] = clienti[user]['carrello'].concat(item);
	update_db('clienti',clienti);
}

function empty_cart(){
	var clienti = db('clienti');
	clienti[username()]['carrello'] = [];
	update_db('clienti', clienti);
	location.reload(true);
}

// Genera un tempo di attesa dell'ordine in maniera casuale. 
// Costruita in modo che la variazione di tempo di attesa non sia completamente casuale, ma sia piu` probabile un cambiamento di poochi minuti
function eta_generator(current_eta){
	var sign = Math.sign(0.5-Math.random());
	var number = Math.round(Math.random()*10);
	//---------------------------------------------------
	var delta_eta = 0;
	if(number>6 && number<=8){
		delta_eta = sign*1;
	}
	else if(number==9){
		delta_eta = sign*5;
	}
	//---------------------------------------------------
	var new_eta = current_eta+delta_eta;
	if(new_eta<0){
		return 0
	}
	else{
		return new_eta;
	}
}

// aggiorna il tempoi d'attesa del ristorante visualizzato
function update_eta(){
	var ristorante = sessionStorage.getItem('ristorante');
	var ristorantiJSON = db('ristoranti');
	//---------------------------------------------------
	var current_eta = ristorantiJSON[ristorante]['eta'];
	ristorantiJSON[ristorante]['eta'] = eta_generator(current_eta);
	//---------------------------------------------------
	update_db('ristoranti', ristorantiJSON);
}

// Acquista elementi dentro al carrello
function buy(){
	var cart = db('clienti')[username()]['carrello'];
	var acquista = db('acquista');
	//--------------------------------
	for(item of cart){
		var order = {};
		order.cliente = username();
		order.piatto = item.piatto;
		order.ristorante = item.ristorante;
		order.prezzo = item.prezzo;
		var now = new Date();
		order.data =  new Date();
		acquista = acquista.concat(order);
	}
	update_db('acquista',acquista);
	//--------------------------------
	empty_cart();
}

function show_buy_window(){
	toggle_div('cart');	 //chiude il carrelo
	var window = open_float_window();
	window.style.display = 'flex';
	//---------------------------------------------------
	//---------------------------------------------------
	var option1 = document.createElement('div');
	var title = document.createElement('h1');
	var message = document.createElement('div');
	var buy_btn = document.createElement('div');
	//-------------------------
	option1.className = 'buy_option';
	title.className = 'buy_option_title';
	message.className = 'buy_option_message';
	buy_btn.className = 'button option_btn prenota_btn';
	//-------------------------
	title.innerText = 'Ordina e aspettalo a casa';
	message.innerText = 'L\'attesa dipenderà dal traffico';
	buy_btn.innerText = 'Ordina';
	//-------------------------
	buy_btn.setAttribute('onclick', 'buy()');
	//-------------------------
	option1.appendChild(title);
	option1.appendChild(message);
	option1.appendChild(buy_btn);
	window.appendChild(option1)
	//---------------------------------------------------
	//---------------------------------------------------
	var option2 = document.createElement('div');
	var title2 = document.createElement('h1');
	var buy_btn2 = document.createElement('div');
	var message2 = eta_sum();
	//-------------------------
	option2.className = 'buy_option';
	title2.className = 'buy_option_title';
	message2.className = 'buy_option_message';
	buy_btn2.className = 'button option_btn takeaway_btn';
	//-------------------------
	title2.innerText = 'Prenota in ristorante';
	buy_btn2.innerText = 'Prenota';
	//-------------------------
	buy_btn2.setAttribute('onclick', 'buy()');
	//-------------------------
	option2.appendChild(title2);
	option2.appendChild(message2);
	option2.appendChild(buy_btn2);
	window.appendChild(option2)
}

function eta_sum(){
	var div = document.createElement('div');
	//---------------------------------------------------
	var cart = db('clienti')[username()]['carrello'];
	var ristoranti = db('ristoranti');
	//---------------------------------------------------
	var sum = 0;
	var cart_rist = [];
	for(item of cart){
		if(cart_rist.includes(item.ristorante)==false){
			cart_rist = cart_rist.concat(item.ristorante);
			var eta_value = ristoranti[item.ristorante]['eta'];
			sum += eta_value;
			var rist = document.createElement('div');
			var eta = document.createElement('p');
			var rist_name = document.createElement('p');
			eta.innerText = eta_value;
			rist_name.innerText = item.ristorante;
			//-------------------------
			rist.className = 'sum_eta';
			rist_name.className = 'sum_eta_rist';
			eta.className = 'sum_eta_eta'
			//-------------------------
			rist.appendChild(rist_name);
			rist.appendChild(eta);
			div.appendChild(rist);
		}
	}
	var sum_div = document.createElement('div');
	sum_div.innerHTML = 'Attesa totale: '+sum+' minuti';
	div.appendChild(sum_div);
	return div;
}


function toggle_div(div_id){
	var div = document.getElementById(div_id);
	if(div.style.display == 'none'){
		div.style = '';
	}
	else{
		div.style = 'display:none;';	
	}
}


function show_search_bar(){
	toggle_div('search_bar');
}
function search(){
	var form = document.forms['search_form'];
	var query = form[0].value.toLowerCase();
	//---------------------------------------------------
	var piatti_list = document.getElementById('piatti_list');
	piatti_list.innerHTML = '<h1 class="piatti_list_title">Risultati della ricerca:</h1>';
	//---------------------------------------------------
	var vende = db('vende');
	var miss = true;
	for(piatto of vende){		
		if(query==piatto.piatto){
			miss = false;
			//---------------------
			var rist_title = document.createElement('h2');
			rist_title.innerText = piatto.ristorante;
			rist_title.className = "piatti_list_title";
			piatti_list.appendChild(rist_title);
			//---------------------
			create_piatto(piatto,piatti_list);
		}
	}
	if(miss){
		alert('Non abbiamo questo piatto sfortunatamente :(');
	}
}

// Restituisce un array con tutte le tipologie di piatti venduti 
function types(){
	var piatti = db('piatti');
	var types = {};
	for(p in piatti){
		types[piatti[p]['tipologia']] = '';
	}
	return Object.keys(types);
}

// Mostra la tendina con tutte le categorie di piatti
function show_piatti_types(){
	var list = document.getElementById('piatti_types_list');
	list.innerHTML = '';
	for(t of types()){
		var piatto_type = document.createElement('div');
		piatto_type.innerText = t;
		piatto_type.className = 'button piatti_types_list_item';
		piatto_type.setAttribute('onclick', 'search_type("'+t+'")');
		list.appendChild(piatto_type);
	}
	toggle_div('piatti_types_list');
}

function search_type(piatto_type){
	var piatti_list = document.getElementById('piatti_list');
	piatti_list.innerHTML = '<h1 class="piatti_list_title">'+piatto_type+':</h1>';
	//---------------------------------------------------
	var vende = db('vende');
	var piatti = db('piatti');
	for(piatto of vende){		
		if(piatto_type==piatti[piatto.piatto]['tipologia']){
			//---------------------
			var rist_title = document.createElement('h2');
			rist_title.innerText = piatto.ristorante;
			rist_title.className = "piatti_list_title";
			piatti_list.appendChild(rist_title);
			//---------------------
			create_piatto(piatto,piatti_list);
		}
	}
}

function show_orders_icon(){
	var header = document.getElementById('header_icons');
	var img = document.createElement('img');
	img.src = 'media/orders.svg';
	img.className = 'orders_img';
	img.setAttribute('onclick','show_orders();' )
	header.appendChild(img);
};
function show_orders(){
	var  window = open_float_window();
	var title = document.createElement('h1');
	title.className = 'float_window_title';
	title.innerText = 'I tuoi ordini effettuati:';
	window.appendChild(title);
	var acquista = db('acquista');
	acquista = acquista.filter(filter_user);
	for(item of acquista){
		var order = document.createElement('div');
		var name = document.createElement('div');
		var price = document.createElement('div');
		var ristorante = document.createElement('div');
		var date = document.createElement('div');
		//---------------------
		order.className  = 'order_item';
		name.className  = 'order_item_name';
		price.className  = 'order_item_price';
		ristorante.className  = 'order_item_rist';
		date.className  = 'order_item_date';
		//---------------------
		name.innerHTML = item.piatto;
		price.innerHTML = item.prezzo;
		ristorante.innerHTML = item.ristorante;
		date.innerHTML = item.data;
		//---------------------
		order.appendChild(date);
		order.appendChild(name);
		order.appendChild(ristorante);
		order.appendChild(price);
		window.appendChild(order);
	}
}

function filter_user(item){
	return item.cliente==username();
}

function newRistorante(){
	var win = open_float_window();
	//---------------------
	var form = document.createElement('form');
	form.name  = 'new_ristorante';
	form.setAttribute('onsubmit', 'createRistorante();');
	form.innerHTML = '<h1 class="float_window_title">Crea o modifica ristorante</h1>';
	//---------------------
	var name = document.createElement('input'); 
	var tel = document.createElement('input');
	var p_IVA = document.createElement('input');
	var indirizzo = document.createElement('input');
	var submit = document.createElement('input');
	//---------------------
	name.name = 'name';
	tel.name = 'tel';
	p_IVA.name = 'p_IVA';
	indirizzo.name = 'indirizzo';
	//---------------------
	name.placeholder = 'Nome del ristorante';
	tel.placeholder = 'Telefono';
	p_IVA.placeholder = 'Partita IVA';
	indirizzo.placeholder = 'Indirizzo';
	//---------------------
	name.className = 'create_input name_input';
	tel.className = 'create_input tel_input';
	p_IVA.className = 'create_input pIVA_input';
	indirizzo.className = 'create_input address_input';
	//---------------------------------------------------
	submit.type = 'submit';
	submit.className = 'create_submit'
	//---------------------
	form.appendChild(name);
	form.appendChild(tel);
	form.appendChild(p_IVA);
	form.appendChild(indirizzo);
	form.appendChild(submit);
	win.appendChild(form);
}
function createRistorante(){
	event.preventDefault();
	//---------------------
	var ristoranti = db('ristoranti');
	var form = document.forms['new_ristorante'];
	//---------------------
	var name = form['name'].value;
	//---------------------
	var new_rist = {};
	new_rist.proprietario = username();
	new_rist.tel = form['tel'].value;
	new_rist.p_IVA = form['p_IVA'].value;
	new_rist.indirizzo = form['indirizzo'].value;
	new_rist.recensioni = [];
	new_rist.eta = 0;
	ristoranti[name] = new_rist;
	update_db('ristoranti', ristoranti);
	location.reload(true);
}

function header_color(){
	if(userType()=='ristoratori'){
		var header = document.getElementById('header');
		header.style.backgroundColor = '#0B91FF';
	}
}

function show_piatti_option(){
	var datalist = document.getElementById('search_datalist');
	var piatti = db('piatti');
	for(p in piatti){
		var option = document.createElement('option');
		option.innerHTML = p;
		datalist.appendChild(option);
	}
}








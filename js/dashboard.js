//verifier s'il est connecter
let auth = JSON.parse(localStorage.getItem("Auth")) ?? null;
if (!auth) window.location.assign("../index.html");


//afficher les infos de l'utilisateur connecté
let loggedName = `<span>${auth.email} </span><span>( ${auth.username} )</span>`;
document.getElementById("auth-username").innerHTML = loggedName;



// Ouvrir une base de données IndexedDB au nom de RegistreVente
let db;
let request = window.indexedDB.open("RegistreVente", 1);

//en cas d'erreur
request.onerror = function (event) {
  console.log("Erreur d'ouverture de la base de données");
};

//en cas de reussite
request.onsuccess = function (event) {
  db = request.result;
  //afficher les ventes
  afficherVentes();
};

//en cas de changement sur la bd
request.onupgradeneeded = function (event) {
  let db = event.target.result;

  //si la table (objet de stockage) ventes n'existe pas on la crée
  if (!db.objectStoreNames.contains("ventes")) {
    let objectStore = db.createObjectStore("ventes", {
      keyPath: "id",
      autoIncrement: true,
    });
  }
};



function afficherVentes() {
  //on recupere la tables des ventes
  let objectStore = db.transaction("ventes").objectStore("ventes");

  // on pointe sur chaque ligne de cette table et pour chacune d'elle on appelle une fonction qui
  // se chargera de recuperer les valeur et les ajouter dans la table
  objectStore.openCursor().onsuccess = function (event) {
    let cursor = event.target.result;
    if (cursor) {
      let vente = cursor.value;
      //on verifie si la vente recuperée correspond à celle de l'utilisateur connecté
      if (vente.userName === auth.username) {
        //si oui on l'ajoute dans la table
        ajouterVenteDansTableau(vente, cursor.key);
      }
      cursor.continue();
    }
  };
}



function ajouterVenteDansTableau(vente, key) {
  //creer une ligne de la table
  let row = document.createElement("tr");

  //creer les cellules de cette ligne
  let cell = document.createElement("td");
  cell.textContent = vente.client;
  row.appendChild(cell);

  cell = document.createElement("td");
  cell.textContent = vente.produit;
  row.appendChild(cell);

  cell = document.createElement("td");
  cell.textContent = vente.quantite;
  row.appendChild(cell);

  cell = document.createElement("td");
  cell.textContent = vente.prix;
  row.appendChild(cell);

  cell = document.createElement("td");
  cell.textContent = vente.date;
  row.appendChild(cell);

  //creer le boutton supprimer ainsi que son texte et sa classe
  let deleteButton = document.createElement("button");
  deleteButton.textContent = "x";
  deleteButton.className = "trash";
  //creer le boutton supprimer ainsi que son texte et sa classe
  let editButton = document.createElement("a");
  editButton.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" height="15"
  width="15" viewBox="0 0 576 512"><!--!Font Awesome Free 6.5.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.--><path d="M402.6 83.2l90.2 90.2c3.8 3.8 3.8 10 0 13.8L274.4 405.6l-92.8 10.3c-12.4 1.4-22.9-9.1-21.5-21.5l10.3-92.8L388.8 83.2c3.8-3.8 10-3.8 13.8 0zm162-22.9l-48.8-48.8c-15.2-15.2-39.9-15.2-55.2 0l-35.4 35.4c-3.8 3.8-3.8 10 0 13.8l90.2 90.2c3.8 3.8 10 3.8 13.8 0l35.4-35.4c15.2-15.3 15.2-40 0-55.2zM384 346.2V448H64V128h229.8c3.2 0 6.2-1.3 8.5-3.5l40-40c7.6-7.6 2.2-20.5-8.5-20.5H48C21.5 64 0 85.5 0 112v352c0 26.5 21.5 48 48 48h352c26.5 0 48-21.5 48-48V306.2c0-10.7-12.9-16-20.5-8.5l-40 40c-2.2 2.3-3.5 5.3-3.5 8.5z"/></svg>`;
  editButton.className = "edit";
  editButton.href = "./edit.html?key=" + key;
  //ajouter l'evenement de click sur ce boutton pour pouvoir supprimer une ligne
  deleteButton.onclick = function () {
    supprimerVente(key);
    row.parentNode.removeChild(row);
  };

  //la cellule comportant ce boutton de suppression
  cell = document.createElement("td");
  cell.appendChild(editButton);
  cell.appendChild(deleteButton);
  row.appendChild(cell);

  //inserer la ligne et ses cellules dans le body de la table
  document.getElementById("bodyTable").appendChild(row);
}



function supprimerVente(key) {
  //initialiser une transaction
  let transaction = db.transaction(["ventes"], "readwrite");
  let objectStore = transaction.objectStore("ventes");

  //supprimer une vente
  let request = objectStore.delete(key);

  request.onsuccess = function (event) {
    alert("Sale deleted successfully !");
  };

  request.onerror = function (event) {
    alert("An error when we try to delete sale");
  };
}



//pointer sur le formulaire d'ajout
const formVente = document.getElementById("formVente");

//ecouter l'evenement d'enboie du formulaire
formVente.addEventListener("submit", function (event) {
  event.preventDefault();

  //recuperer les données du formulaire
  let client = document.getElementById("client").value;
  let produit = document.getElementById("produit").value;
  let quantite = document.getElementById("quantite").value;
  let prix = document.getElementById("prix").value;
  let date = document.getElementById("date").value;

  //creer la nouvelle vente
  let vente = {
    userName: auth.username,
    client: client,
    produit: produit,
    quantite: quantite,
    prix: prix,
    date: date,
  };

  //initier les transactions sur la tables des ventes
  let transaction = db.transaction(["ventes"], "readwrite");
  let objectStore = transaction.objectStore("ventes");

  //inserer la nouvelle vente en bd
  let request = objectStore.add(vente);

  //si tous s'est bien passée
  request.onsuccess = function (event) {
    //on l'ajoute dans la table
    ajouterVenteDansTableau(vente, event.srcElement.result);
    gererLesChamps("", "", "", "", "");
    sessionStorage.clear();
    alert("sale added successfully !");
  };
  //sinon
  request.onerror = function (event) {
    alert("An error when we try to add sale");
  };
});



//pointer sur le bouton de deconnexion
let btnLogout = document.getElementById("logout");
//ecouter le click dessus pour deconnecter l'utilisateur
btnLogout.addEventListener("click", (event) => {
  event.preventDefault();
  //recuperer tous les comptes courant afin de les preserver
  let accounts = JSON.parse(localStorage.getItem("Accounts")) ?? [];

  //tous effacer dans le local et la session
  localStorage.clear();
  sessionStorage.clear();

  //restaurer les comptes
  localStorage.setItem("Accounts", JSON.stringify(accounts));

  window.location.assign("../index.html");
});



//pointer sur les inputs du formulaire d'ajout courant
const inputs = document.querySelectorAll("input");
inputs.forEach((input) => {
  // pour chacun d'eux ecouter un evenement de changement
  input.addEventListener("input", () => {
    let client = document.getElementById("client").value;
    let produit = document.getElementById("produit").value;
    let quantite = document.getElementById("quantite").value;
    let prix = document.getElementById("prix").value;
    let date = document.getElementById("date").value;

    //enregistrer la nouvelle vente
    let vente = {
      userName: auth.username,
      client: client,
      client: client,
      produit: produit,
      quantite: quantite,
      prix: prix,
      date: date,
    };

    //placer les données de la nouvelle vente en session
    sessionStorage.setItem("vente", JSON.stringify(vente));
  });
});



//charger le formulaire avec les données de ventes sauvegardé en session
gererLesChamps(
  JSON.parse(sessionStorage.getItem("vente"))
    ? JSON.parse(sessionStorage.getItem("vente")).client
    : "",
  JSON.parse(sessionStorage.getItem("vente"))
    ? JSON.parse(sessionStorage.getItem("vente")).produit
    : "",
  JSON.parse(sessionStorage.getItem("vente"))
    ? JSON.parse(sessionStorage.getItem("vente")).quantite
    : "",
  JSON.parse(sessionStorage.getItem("vente"))
    ? JSON.parse(sessionStorage.getItem("vente")).prix
    : "",
  JSON.parse(sessionStorage.getItem("vente"))
    ? JSON.parse(sessionStorage.getItem("vente")).date
    : ""
);



//fonction pour remplir ou vider les champs
function gererLesChamps(c, p, q, pr, d) {
  document.getElementById("client").value = c;
  document.getElementById("produit").value = p;
  document.getElementById("quantite").value = q;
  document.getElementById("prix").value = pr;
  document.getElementById("date").value = d;
}

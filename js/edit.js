//verifier s'il est connecter
let auth = JSON.parse(localStorage.getItem("Auth")) ?? null;
if (!auth) window.location.assign("../index.html");



//afficher les infos de l'utilisateur connecté
let loggedName = `<span>${auth.email} </span><span>( ${auth.username} )</span>`;
document.getElementById("auth-username").innerHTML = loggedName;



//recuper l'id de la vente a modifier
let key = Number(window.location.search.replace("?key=", ""));



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
  getVente();
};



function getVente() {
  //initialiser une transaction
  let transaction = db.transaction(["ventes"], "readwrite");
  let objectStore = transaction.objectStore("ventes");

  //recuper la vente corespondante en bd
  let request = objectStore.get(key);

  request.onsuccess = function (event) {
    //si tout es okey preremplir les champs avec les valeurs
    const vente = event.target.result;

    //pointer sur le formulaire d'ajout
    const formEditVente = document.getElementById("formEditVente");
    //ecouter l'evenement d'enboie du formulaire
    formEditVente.addEventListener("submit", function (event) {
      event.preventDefault();

      //recuperer les données du formulaire
      let client = document.getElementById("editClient").value;
      let produit = document.getElementById("editProduit").value;
      let quantite = document.getElementById("editQuantite").value;
      let prix = document.getElementById("editPrix").value;
      let date = document.getElementById("editDate").value;

      //enregistrer les nouvelle valeur de cette vente
      vente.client = client;
      vente.produit = produit;
      vente.quantite = quantite;
      vente.prix = prix;
      vente.date = date;

      //initialiser une nouvelle transaction
      let transaction = db.transaction(["ventes"], "readwrite");
      let objectStore = transaction.objectStore("ventes");

      //modifier la nouvelle vente en bd
      let request = objectStore.put(vente);

      //si tous s'est bien passée
      request.onsuccess = function (event) {
        alert("sale updated successfully !");
        window.location.assign("./dashboard.html");
      };
      //sinon
      request.onerror = function (event) {
        alert("An error when we try to update sale");
      };
    });
    gererLesChamps(
      vente.client,
      vente.produit,
      vente.quantite,
      vente.prix,
      vente.date
    );
  };

  request.onerror = function (event) {
    alert("An error when we try to get sale");
  };
}



//fonction pour remplir ou vider les champs
function gererLesChamps(c, p, q, pr, d) {
  document.getElementById("editClient").value = c;
  document.getElementById("editProduit").value = p;
  document.getElementById("editQuantite").value = q;
  document.getElementById("editPrix").value = pr;
  document.getElementById("editDate").value = d;
}



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

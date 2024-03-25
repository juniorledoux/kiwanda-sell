//pointer sur le formulaire
const formRegister = document.getElementById("formRegister");

//ecouter l'evenement d'envoie du formulaire
formRegister.addEventListener("submit", (event) => {
  //empecher que le formulaire se recharge
  event.preventDefault();

  //recuperer les données du formulaire
  let username = document.getElementById("username").value;
  let email = document.getElementById("email").value;
  let password = document.getElementById("password").value;

  let account = {
    username: username,
    email: email,
    password: password,
  };

  //créer le nouveau compte
  createAccount(account);
});



function createAccount(newAccount) {
  //recuperer l'ensemble des comptes existant
  let accounts = JSON.parse(localStorage.getItem("Accounts")) ?? [];

  //verifier si un compte existe deja avec les identifiants du nouveau compte
  if (userNameExist(newAccount, accounts) === true) {
    alert("An account already exist with this user name.");
  } else if (emailExist(newAccount, accounts) === true) {
    alert("An account already exist with this email.");
  } else {
    // ajouter le nouveau compte
    accounts.push(newAccount);
    localStorage.setItem("Accounts", JSON.stringify(accounts));
    alert("Account created successfully ! \nPlease login now.");
    //rediriger vers la page de connexion
    window.location.assign("../index.html");
  }
}



function emailExist(account, accounts) {
  let exist = false;
  accounts.forEach((element) => {
    //comparer l'email du nouveau compte avec ceux des comptes deja existant
    if (element.email === account.email) {
      //si ca existe: oui
      exist = true;
    }
  });
  return exist;
}



function userNameExist(account, accounts) {
  let exist = false;
  accounts.forEach((element) => {
    //comparer le username du nouveau compte avec ceux des comptes deja existant
    if (element.username === account.username) {
      //si ca existe: oui
      exist = true;
    }
  });
  return exist;
}

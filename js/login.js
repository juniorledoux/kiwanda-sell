//verifier s'il y'a deja quelqu'un connecter
let auth = JSON.parse(localStorage.getItem("Auth")) ?? null;
if (auth) window.location.assign("./views/dashboard.html");



// Récupérez l'identifiant de l'utilisateur du cookie, s'il existe
let username = getCookie("username");
if (username) {
  //l'inserer dans le champ du user name
  document.getElementById("username").value = username;
}



//pointer sur le formulaire
const formLogin = document.getElementById("formLogin");

//ecouter l'evenement d'envoie du formulaire
formLogin.addEventListener("submit", (event) => {
  //empecher que le formulaire se recharge
  event.preventDefault();

  //recuperer les données du formulaire
  username = document.getElementById("username").value;
  let password = document.getElementById("password").value;

  //le connecter
  if (!login(username, password)) alert("User name or password not match!");
});



function login(username, password) {
  //recuperer l'ensemble des comptes existant
  let accounts = JSON.parse(localStorage.getItem("Accounts")) ?? [];
  let logged = false;
  accounts.forEach((account) => {
    // Vérifiez les identifiants de connexion
    if (account.username === username && account.password === password) {
      //Si les identifiants de connexion sont corrects,
      localStorage.setItem("Auth", JSON.stringify(account));
      logged = true;
      alert("You're logged in !");
      //enregistrez le username de l'utilisateur dans un cookie pour 30 jours
      setCookie("username", username, 30);
      //rediriger vers le dashboard
      window.location.assign("./views/dashboard.html");
    }
  });
  return logged;
}



function setCookie(name, value, days) {
  //formater la date d'expiration du cookie
  let date = new Date();
  date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
  let expires = "expires=" + date.toUTCString();
  //enregistrer le cookie
  document.cookie = name + "=" + value + ";" + expires + ";path=/";
}



function getCookie(name) {
  let nameEQ = name + "=";
  let ca = document.cookie.split(";");
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) == " ") c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
  }
  return null;
}

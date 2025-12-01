// Je génère un identifiant unique pour l'utilisateur mais quand la base de donné sera prete, il faudra le récupérer depuis la base de donnée
export function getOrCreateUserId(): string {
    let id = localStorage.getItem("userId");
    if (!id) {
        id = crypto.randomUUID(); // identifiant unique aléatoire
        localStorage.setItem("userId", id);
    }
    return id;
}
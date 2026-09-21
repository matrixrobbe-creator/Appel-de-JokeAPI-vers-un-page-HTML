// script.js - Gestion JokeAPI et stockage local
document.addEventListener('DOMContentLoaded', () => {
    const selectCategorie = document.getElementById('select-categorie');
    const btnAjouter = document.getElementById('btn-ajouter');
    const btnVider = document.getElementById('btn-vider');
    const tableauCorps = document.getElementById('tableau-corps');

    // Récupération des blagues enregistrées ou tableau vide
    let blagues = JSON.parse(localStorage.getItem('sauvegarde_blagues')) || [];

    // Sauvegarde dans le navigateur
    function sauvegarder() {
        localStorage.setItem('sauvegarde_blagues', JSON.stringify(blagues));
    }

    // Affichage des blagues dans le tableau HTML
    function afficherTableau() {
        tableauCorps.innerHTML = '';

        if (blagues.length === 0) {
            tableauCorps.innerHTML = `
                <tr>
                    <td colspan="3" class="text-center" style="padding: 1.5rem; color: #666;">
                        Aucune blague sous la main. Clique sur « Nouvelle blague » !
                    </td>
                </tr>
            `;
            return;
        }

        blagues.forEach((item, index) => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td><span class="tag-categorie">${item.categorie}</span></td>
                <td>${item.texte}</td>
                <td style="text-align: center;">
                    <button class="button error comic-btn" style="padding: 0.2rem 0.6rem; font-size: 0.8rem;" onclick="supprimerBlague(${index})">
                        Supprimer
                    </button>
                </td>
            `;
            tableauCorps.appendChild(tr);
        });
    }

    // Fonction globale pour la suppression d'une seule ligne
    window.supprimerBlague = (index) => {
        blagues.splice(index, 1);
        sauvegarder();
        afficherTableau();
    };

    // Appel à l'API distante lors du clic
    btnAjouter.addEventListener('click', () => {
        const categorie = selectCategorie.value;
        // URL de l'API JokeAPI avec les filtres imposés dans le TP afin d'éviter les blagues offessantes ou innapropriées
        const url = `https://v2.jokeapi.dev/joke/${categorie}?lang=fr&blacklistFlags=nsfw,religious,political,racist,sexist,explicit`;

        btnAjouter.disabled = true;

        fetch(url)
            .then(res => res.json())
            .then(data => {
                console.log("Réponse JokeAPI reçue :");
                console.table(data);

                if (data.error) {
                    alert("Aucune blague trouvée avec ces critères.");
                    return;
                }

                // Format simple ou en deux temps (setup / delivery)
                const texteBlague = data.type === 'single'
                    ? data.joke
                    : `<span>${data.setup}</span><span class="chute-blague">👉 ${data.delivery}</span>`;

                // Ajout en début de liste
                blagues.unshift({
                    categorie: data.category,
                    texte: texteBlague
                });

                sauvegarder();
                afficherTableau();
            })
            .catch(err => {
                console.error("Erreur API :", err);
                alert("Impossible de contacter JokeAPI.");
            })
            .finally(() => {
                btnAjouter.disabled = false;
            });
    });

    // Vider l'intégralité du tableau
    btnVider.addEventListener('click', () => {
        if (blagues.length > 0 && confirm("Supprimer toutes les blagues enregistrées ?")) {
            blagues = [];
            sauvegarder();
            afficherTableau();
        }
    });

    // Chargement initial
    afficherTableau();
});
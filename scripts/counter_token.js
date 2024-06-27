const fs = require('fs');
const { encode } = require('gpt-3-encoder');
const cliProgress = require('cli-progress');

// Chemin vers votre fichier JSON
const filePath = "./split_files/illustrations_part_1.json";

// Créer une nouvelle barre de progression
const progressBar = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic);

console.log("🚀 Démarrage du script...");

// Lire le fichier JSON
fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
        console.error("❌ Erreur lors de la lecture du fichier:", err);
        return;
    }

    console.log("📂 Fichier lu avec succès.");

    // Parser le fichier JSON
    const jsonData = JSON.parse(data);
    console.log("🔍 JSON parsé avec succès.");

    // Initialiser la barre de progression
    progressBar.start(jsonData.length, 0);

    // Compter les tokens
    let totalTokens = 0;
    jsonData.forEach((entry, index) => {
        const tokens = encode(entry);
        totalTokens += tokens.length;

        // Mettre à jour la barre de progression
        progressBar.update(index + 1);
    });

    // Terminer la barre de progression
    progressBar.stop();

    console.log(`✅ Total number of tokens: ${totalTokens}`);
});

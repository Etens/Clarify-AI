import fs from 'fs';
import path from 'path';
import cliProgress from 'cli-progress';

// 📁 Définir le chemin du fichier source et du dossier de destination
const sourceFilePath = './scripts/illustrations.json';
const destinationFolder = 'split_files';
const numberOfFiles = 50;

// 📊 Initialiser la barre de progression
const progressBar = new cliProgress.SingleBar({
    format: 'Progress | {bar} | {percentage}% | {value}/{total} Chunks | ETA: {eta}s',
    barCompleteChar: '\u2588',
    barIncompleteChar: '\u2591',
    hideCursor: true
}, cliProgress.Presets.shades_classic);

// 📝 Lire et analyser le fichier source
console.log('Lecture du fichier source...');
const data = fs.readFileSync(sourceFilePath, 'utf8');
const jsonData = JSON.parse(data);
console.log('Fichier source chargé avec succès');

// 🧮 Calculer la taille des fichiers
const totalTokens = 127531482;  // Nombre total de tokens dans le fichier
const tokensPerFile = Math.ceil(totalTokens / numberOfFiles);
const itemsPerFile = Math.ceil(jsonData.length / numberOfFiles);

console.log(`Total de tokens: ${totalTokens}`);
console.log(`Nombre de fichiers à créer: ${numberOfFiles}`);
console.log(`Tokens par fichier: ${tokensPerFile}`);
console.log(`Éléments par fichier: ${itemsPerFile}`);

// 📂 Créer le dossier de destination s'il n'existe pas
if (!fs.existsSync(destinationFolder)) {
    fs.mkdirSync(destinationFolder);
    console.log(`Dossier créé: ${destinationFolder}`);
}

// 🏁 Initialiser la barre de progression
progressBar.start(numberOfFiles, 0);

// 🔄 Diviser le fichier en plusieurs fichiers
for (let i = 0; i < numberOfFiles; i++) {
    const start = i * itemsPerFile;
    const end = start + itemsPerFile;
    const chunk = jsonData.slice(start, end);

    const outputFilePath = path.join(destinationFolder, `illustrations_part_${i + 1}.json`);
    fs.writeFileSync(outputFilePath, JSON.stringify(chunk, null, 2));
    progressBar.update(i + 1);

    console.log(`📁 Fichier créé: illustrations_part_${i + 1}.json (éléments ${start + 1} à ${end})`);
}

// 🏁 Terminer la barre de progression
progressBar.stop();

// 📊 Afficher les statistiques finales
console.log('Processus terminé avec succès!');
console.log(`Nombre total de fichiers créés: ${numberOfFiles}`);
console.log(`Fichiers enregistrés dans le dossier: ${destinationFolder}`);
console.log(`Tous les fichiers ont été créés avec succès et le fichier source est intact.`);

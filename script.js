// -------- 0. CONFIGURATION FIREBASE --------
const FIREBASE_URL = 'https://checklist-reglementaire-dm-ia-default-rtdb.europe-west1.firebasedatabase.app';

let currentUserKey = null; // ID unique de l'utilisateur connecté

// -------- 1. Modèle de Données (Template) --------
// Nous utilisons "let" car cette variable sera écrasée par les données de la BDD à la connexion
let checklist = [
  { section: true, titre: "A – DÉFINITION DU CONTEXTE D'UTILISATION" },
  { n:"A.1", act:"Former les équipes cœur (conception, développement, validation) aux spécificités des systèmes IA embarqués dans les DM.", obj:"S'assurer de la compétence des acteurs clés pour identifier, évaluer et maîtriser les risques IA.", ref:"Règlement (UE) 2024/1689 art.4", statut:"", resp:"", comm:"", nomFichier:"", critChecks:[true,true,true,true] },
  { n:"A.2", act:"Préparer la spécification d'utilisation (indications, population cible, profil utilisateur, environnement, principe de fonctionnement, justification IA).", obj:"Définir le contexte médical, utilisateur et le système IA dès le début du projet.", ref:"IEC 62366-1 §5.1 ; IEC 22989 §6.2.2", statut:"", resp:"", comm:"", nomFichier:"", critChecks:[true,true,true,false] },
  { n:"A.3", act:"Adapter le contenu et la durée de formation selon le contexte d'utilisation et les profils d'utilisateurs visés.", obj:"Ajuster la formation en fonction des risques, de l'autonomie et des compétences.", ref:"Règlement (UE) 2024/1689 Art.4 ; ISO 62366-1 §5.3", statut:"", resp:"", comm:"", nomFichier:"", critChecks:[true,true,true,false] },
  { n:"A.4", act:"Prendre en compte le contexte d'utilisation dans la conception des jeux de données.", obj:"Aligner données d'entraînement, de validation et de test sur le contexte clinique réel.", ref:"Règlement (UE) 2024/1689 art.10 §4 ; ISO 62366-1 §5.3", statut:"", resp:"", comm:"", nomFichier:"", critChecks:[true,true,false,false] },
  { n:"A.5", act:"Prendre en compte les groupes vulnérables dans le design.", obj:"Adapter interfaces et messages pour les populations sensibles.", ref:"Règlement (UE) 2024/1689 art.9 §9 & art.5(b)", statut:"", resp:"", comm:"", nomFichier:"", critChecks:[true,true,false,false] },
  { n:"A.6", act:"Décrire les limites, les performances et les conditions d'emploi.", obj:"Permettre à l'utilisateur d'évaluer la fiabilité et les limites du système.", ref:"Règlement (UE) 2024/1689 art.13 §3 b (ii-iii)", statut:"", resp:"", comm:"", nomFichier:"", critChecks:[true,true,false,false] },

  { section: true, titre: "B – PILOTAGE DU PROCESSUS D'APTITUDE À L'UTILISATION" },
  { n:"B.1", act:"Établir, documenter, mettre en œuvre et maintenir un processus d'ingénierie de l'aptitude à l'utilisation (PIAU).", obj:"Assurer un pilotage clair du processus d'aptitude à l'utilisation sur tout le cycle de vie.", ref:"IEC 62366-1 §4.1.1", statut:"", resp:"", comm:"", nomFichier:"", critChecks:[true,true,true,false] },
  { n:"B.2", act:"Adapter le niveau d'effort et les méthodes d'ingénierie selon la complexité de l'interface, la gravité des risques et les caractéristiques du dispositif.", obj:"Structurer et documenter l'ensemble des activités liées à l'aptitude à l'utilisation.", ref:"IEC 62366-1 §5.1", statut:"", resp:"", comm:"", nomFichier:"", critChecks:[true,true,true,false] },
  { n:"B.3", act:"Consigner tous les résultats du processus d'ingénierie dans le Dossier d'Ingénierie de l'Aptitude à l'Utilisation (DIAU).", obj:"Garantir une vision partagée des exigences d'utilisation et des risques associés.", ref:"IEC 62366-1 §4.1.2", statut:"", resp:"", comm:"", nomFichier:"", critChecks:[true,true,false,false] },
  { n:"B.4", act:"Documenter les mesures de supervision humaine", obj:"Détecter précocement les écarts et adapter le processus si nécessaire.", ref:"IEC 62366-1 §5.8", statut:"", resp:"", comm:"", nomFichier:"", critChecks:[true,true,false,false] },

  { section: true, titre: "C – MAÎTRISE DU RISQUE D'USAGE" },
  { n:"C.1", act:"Transparence et informations à l'utilisateur (UI + IFU).", obj:"Permettre un usage avisé et éviter les interprétations erronées.", ref:"Règlement (UE) 2024/1689 art.13", statut:"", resp:"", comm:"", nomFichier:"", critChecks:[true,true,true,true] },
  { n:"C.2", act:"Appliquer la maîtrise du risque pour la conception de l'interface utilisateur en respectant l'ordre de priorité : sécurité inhérente, mesures de protection, informations de sécurité.", obj:"Réduire les risques d'erreurs d'utilisation et assurer la sûreté de conception.", ref:"IEC 62366-1 §4.1.2", statut:"", resp:"", comm:"", nomFichier:"", critChecks:[true,true,true,true] },
  { n:"C.3", act:"Intégrer les informations relatives à la sécurité dans le processus d'ingénierie pour s'assurer qu'elles sont perceptibles et compréhensibles par les utilisateurs.", obj:"Assurer la pertinence des informations de sécurité fournies aux utilisateurs.", ref:"IEC 62366-1 §4.1.3", statut:"", resp:"", comm:"", nomFichier:"", critChecks:[true,true,true,true] },
  { n:"C.4", act:"Mettre en place un plan d'évaluations formatives (IEC 62366) ciblant l'IA.", obj:"Détecter précocement les erreurs d'utilisation liées à l'IA.", ref:"Règlement (UE) 2024/1689 art.13–14–15 (via IEC 62366)", statut:"", resp:"", comm:"", nomFichier:"", critChecks:[true,true,true,true] },
  { n:"C.5", act:"Prendre en compte les groupes vulnérables dans l'analyse de risques.", obj:"Protéger les groupes à risque d'effets disproportionnés.", ref:"Règlement (UE) 2024/1689 art. 9 §9", statut:"", resp:"", comm:"", nomFichier:"", critChecks:[true,true,true,false] },
  { n:"C.6", act:"Identifier et analyser les risques prévisibles liés à l'usage et à l'environnement.", obj:"Garantir la sécurité d'usage et la robustesse fonctionnelle.", ref:"Règlement (UE) 2024/1689 art. 9 §2(a-b) ; ISO 62366-1 §5.4", statut:"", resp:"", comm:"", nomFichier:"", critChecks:[true,true,false,false] },
  { n:"C.7", act:"Déterminer et appliquer les mesures de maîtrise adaptées.", obj:"Assurer un risque résiduel acceptable.", ref:"Règlement (UE) 2024/1689 art. 9 §2(d)-§5", statut:"", resp:"", comm:"", nomFichier:"", critChecks:[true,true,true,true] },
  { n:"C.8", act:"Empêcher l'exploitation de vulnérabilités individuelles.", obj:"Protéger les utilisateurs vulnérables.", ref:"Règlement (UE) 2024/1689 art. 5(1)(b)", statut:"", resp:"", comm:"", nomFichier:"", critChecks:[true,true,true,false] },
  { n:"C.9", act:"Concevoir pour éliminer ou réduire le risque à la source.", obj:"Réduire le risque par design (“safety by design”).", ref:"Règlement (UE) 2024/1689 art. 9 §5(a) ; IEC 62304 §5.2", statut:"", resp:"", comm:"", nomFichier:"", critChecks:[true,true,true,true] },
  { n:"C.10", act:"Former et qualifier les utilisateurs et déployeurs.", obj:"Garantir que toute personne utilisant le DM IA comprend son fonctionnement, ses limites et ses risques.", ref:"Règlement (UE) 2024/1689 art. 4 §1", statut:"", resp:"", comm:"", nomFichier:"", critChecks:[true,true,true,false] },
  { n:"C.11", act:"Concevoir la robustesse et la fiabilité perçue par l'utilisateur.", obj:"S'assurer que le système réagit de manière stable, compréhensible et prévisible.", ref:"Règlement (UE) 2024/1689 art. 15 §1-3", statut:"", resp:"", comm:"", nomFichier:"", critChecks:[true,true,true,true] },
  { n:"C.12", act:"Fournir une notice d'utilisation claire, concise et adaptée.", obj:"Assurer que la documentation fournie est compréhensible, complète et utilisable.", ref:"Règlement (UE) 2024/1689 art. 13 §2 & §3 b (i-iii)", statut:"", resp:"", comm:"", nomFichier:"", critChecks:[true,true,true,true] },
  { n:"C.13", act:"Informer sur la maintenance, les mises à jour et la durée de vie.", obj:"Garantir que l'utilisateur sache comment maintenir la performance et la sécurité.", ref:"Règlement (UE) 2024/1689 art. 13 §3 e", statut:"", resp:"", comm:"", nomFichier:"", critChecks:[true,true,true,false] },
  { n:"C.14", act:"Intégrer les mesures de maîtrise du risque dans les exigences logicielles.", obj:"Inclure les mesures de maitrise du risque du logiciel dans la conception.", ref:"IEC 62304 §5.2.3", statut:"", resp:"", comm:"", nomFichier:"", critChecks:[true,true,true,true] },

  { section: true, titre: "D – SURVEILLANCE DU SYSTÈME PAR LES UTILISATEURS" },
  { n:"D.1", act:"Conception de la supervision humaine (HITL/HOTL).", obj:"Garantir la possibilité d'intervenir et corriger.", ref:"Règlement (UE) 2024/1689 art.14", statut:"", resp:"", comm:"", nomFichier:"", critChecks:[true,true,true,true] },
  { n:"D.2", act:"Identifier les caractéristiques de l'interface utilisateur liées à la sécurité et les erreurs d'utilisation possibles via l'analyse des tâches.", obj:"Identifier les facteurs de risque liés à l'interface afin de prévenir les usages incorrects.", ref:"IEC 62366-1 §5.2", statut:"", resp:"", comm:"", nomFichier:"", critChecks:[true,true,true,false] },
  { n:"D.3", act:"Identifier les phénomènes dangereux et situations dangereuses connus ou prévisibles liés à l'utilisation du dispositif médical.", obj:"Reconnaître les dangers potentiels dès la conception.", ref:"IEC 62366-1 §5.3", statut:"", resp:"", comm:"", nomFichier:"", critChecks:[true,true,false,false] },
  { n:"D.4", act:"Interdire toute fonctionnalité d'influence subliminale ou manipulatrice.", obj:"Garantir la sécurité psychologique et la prise de décision éclairée des utilisateurs.", ref:"Règlement (UE) 2024/1689 art. 5(1)(a)", statut:"", resp:"", comm:"", nomFichier:"", critChecks:[true,true,false,false] },
  { n:"D.5", act:"Éviter toute inférence émotionnelle ou biométrique non médicale.", obj:"Garantir la finalité médicale et limiter l'usage des données biométriques.", ref:"Règlement (UE) 2024/1689 art. 5(1)(f)-(g)", statut:"", resp:"", comm:"", nomFichier:"", critChecks:[true,true,false,false] },
  { n:"D.6", act:"Démontrer la maîtrise humaine du système.", obj:"S'assurer que l'humain conserve la capacité de contrôler, interrompre ou corriger le système.", ref:"Règlement (UE) 2024/1689 art. 4 §1 & 14 §1-3", statut:"", resp:"", comm:"", nomFichier:"", critChecks:[true,true,true,true] },
  { n:"D.7", act:"Fournir une transparence suffisante pour interpréter les sorties.", obj:"Concevoir le système de sorte que les résultats puissent être compris et expliqués.", ref:"Règlement (UE) 2024/1689 art. 13 §1 & §3 b (iv, vii)", statut:"", resp:"", comm:"", nomFichier:"", critChecks:[true,true,true,true] },
  { n:"D.8", act:"Prévoir des mécanismes d'alerte et de retour utilisateur.", obj:"Permettre de signaler un dysfonctionnement, une incertitude ou un doute sur la sortie.", ref:"Règlement (UE) 2024/1689 art. 14 §2-3", statut:"", resp:"", comm:"", nomFichier:"", critChecks:[true,true,true,true] },
  { n:"D.9", act:"Garantir la traçabilité des interactions homme-IA.", obj:"Enregistrer automatiquement les événements d'utilisation pertinents.", ref:"Règlement (UE) 2024/1689 art. 12 §1-3 a-d", statut:"", resp:"", comm:"", nomFichier:"", critChecks:[true,true,true,false] },
  { n:"D.10", act:"Expliquer la logique du modèle ou les critères de décision.", obj:"Permettre à l'utilisateur de comprendre pourquoi une sortie ou recommandation a été produite.", ref:"Règlement (UE) 2024/1689 art. 13 §1", statut:"", resp:"", comm:"", nomFichier:"", critChecks:[true,true,true,true] },

  { section: true, titre: "E – AMÉLIORATION CONTINUE" },
  { n:"E.1", act:"Plan de PMS IA et de détection de dérive (prévu dès la conception).", obj:"Faciliter le suivi post-marché et l'amélioration continue.", ref:"Règlement (UE) 2024/1689 art.72 (PMS), art.73 (incidents)", statut:"", resp:"", comm:"", nomFichier:"", critChecks:[true,true,true,false] },
  { n:"E.2", act:"Identifier et combler les lacunes dans les données via un processus de détection des données manquantes ou insuffisantes et décrire comment elles sont complétées.", obj:"Éviter les défaillances fonctionnelles dues à un jeu de données incomplet.", ref:"Règlement (UE) 2024/1689 art. 10 §2(h)", statut:"", resp:"", comm:"", nomFichier:"", critChecks:[true,true,false,false] }
];

// -------- 2. GESTION UTILISATEUR & BDD (CONNEXION) --------

function generateUserID(nom, prenom) {
  // Création d'un ID simple
  return (nom.trim() + "_" + prenom.trim()).toLowerCase().replace(/\s+/g, '');
}

function validateForm() {
  const nom = document.getElementById('nom').value.trim();
  const prenom = document.getElementById('prenom').value.trim();
  const mdp = document.getElementById('motdepasse').value.trim();
  
  if (!nom || !prenom || !mdp) {
    showError("Merci de remplir Nom, Prénom et Mot de passe.");
    return null;
  }
  return { nom, prenom, mdp };
}

function showError(msg) {
  const errDiv = document.getElementById('error-msg');
  errDiv.textContent = msg;
  errDiv.style.display = 'block';
}

// --- INSCRIPTION ---
async function handleRegister() {
  const form = validateForm();
  if (!form) return;
  const userId = generateUserID(form.nom, form.prenom);

  try {
    // 1. Vérifier si l'utilisateur existe déjà
    const checkResp = await fetch(`${FIREBASE_URL}/users/${userId}.json`);
    const existingUser = await checkResp.json();

    if (existingUser) {
      showError("Cet utilisateur existe déjà. Veuillez vous connecter.");
      return;
    }

    // 2. Créer l'objet utilisateur avec la checklist par défaut
    const newUser = {
      nom: form.nom,
      prenom: form.prenom,
      motdepasse: form.mdp, // Non sécurisé (demo)
      societe: document.getElementById('societe').value,
      profession: document.getElementById('profession').value,
      checklistData: checklist // On sauvegarde le modèle vide
    };

    // 3. Envoyer à Firebase
    const saveResp = await fetch(`${FIREBASE_URL}/users/${userId}.json`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newUser)
    });

    if (saveResp.ok) {
      alert("Compte créé avec succès ! Connectez-vous maintenant.");
    } else {
      showError("Erreur lors de l'inscription.");
    }
  } catch (e) {
    showError("Erreur réseau : " + e.message);
  }
}

// --- CONNEXION ---
async function handleLogin() {
  const form = validateForm();
  if (!form) return;
  const userId = generateUserID(form.nom, form.prenom);

  try {
    const response = await fetch(`${FIREBASE_URL}/users/${userId}.json`);
    const userData = await response.json();

    if (!userData) {
      showError("Utilisateur inconnu. Veuillez vous inscrire.");
      return;
    }

    if (userData.motdepasse !== form.mdp) {
      showError("Mot de passe incorrect.");
      return;
    }

    
    // Connexion réussie
    currentUserKey = userId;
    
    // Remplir les champs manquants
    document.getElementById('societe').value = userData.societe || "";
    document.getElementById('profession').value = userData.profession || "";

    // Charger les données de la checklist sauvegardée (ou garder défaut si vide)
    if (userData.checklistData) {
      checklist = userData.checklistData;
      // Conversion si Firebase transforme les tableaux en objets
      if (!Array.isArray(checklist)) {
         checklist = Object.values(checklist);
      }
    }

    startApp(); // Lancer l'interface principale

  } catch (e) {
    showError("Erreur de connexion : " + e.message);
  }
}

// --- SAUVEGARDE MANUELLE (BOUTON ENREGISTRER) ---
async function saveDataToFirebase() {
  if (!currentUserKey) {
    alert("Erreur: Vous n'êtes pas connecté.");
    return;
  }

  try {
    // On met à jour uniquement la partie checklistData de l'utilisateur
    const response = await fetch(`${FIREBASE_URL}/users/${currentUserKey}/checklistData.json`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(checklist)
    });

    if (response.ok) {
        alert("Données (Statut, Responsable, Commentaires, Nom de fichier) enregistrées avec succès !");
    } else {
        alert("Erreur lors de l'enregistrement.");
    }
  } catch (e) {
    console.error("Erreur de sauvegarde", e);
    alert("Erreur réseau lors de la sauvegarde.");
  }
}


// -------- 3. Fonctions d’interface --------

function startApp() {
  document.getElementById('connexion').classList.add('hide');
  document.getElementById('app').classList.remove('hide');

  showTab('checklist');
  renderChecklist();
}

function showTab(tab) {
  document.getElementById('guide').classList.add('hide');
  document.getElementById('glossaire').classList.add('hide');
  document.getElementById('checklist').classList.add('hide');
  document.getElementById('faq').classList.add('hide');

  const classification = document.getElementById('classification');
  if (tab === 'checklist') {
    classification.classList.remove('hide');
  } else {
    classification.classList.add('hide');
  }

  document.getElementById(tab).classList.remove('hide');

  let tbs = document.querySelectorAll('.tab-btn');
  for (let i = 0; i < tbs.length; i++) tbs[i].classList.remove('selected');
  if (tab === 'guide') tbs[0].classList.add('selected');
  if (tab === 'glossaire') tbs[1].classList.add('selected');
  if (tab === 'checklist') tbs[2].classList.add('selected');
}


// -------- 4. Calcul du score --------
function computeGlobalCoef() {
  const classe = parseFloat(document.getElementById('classeMdr').value || "1");
  const seku = parseFloat(document.getElementById('iaSecu').value || "1");
  const role = parseFloat(document.getElementById('roleAuto').value || "1");
  return classe * seku * role; 
}

function applyClassification() {
  const coef = computeGlobalCoef();
  document.getElementById('coefGlobalDisplay').textContent =
    "Score de classification : " + coef.toFixed(2);

  checklist.forEach(item => {
    if (item.section) return;
    const checks = item.critChecks || [];
    const sumCrit = checks.reduce((acc, c) => acc + (c ? 1 : 0), 0);
    item.score = sumCrit * coef;
  });

  renderChecklist();
}

function getScoreColor(score) {
  if (isNaN(score)) return '';
  if (score < 7) return '#5cb85c';        // VERT (0 à <7)
  if (score >= 7 && score < 14) return '#f0ad4e';  // ORANGE (7 à <14)
  return '#d9534f';                        // ROUGE (>=14)
}

// -------- 5. Affichage de la checklist --------
function renderChecklist() {
  const tbody = document.getElementById('tbodyChecklist');
  tbody.innerHTML = '';

  checklist.forEach((item, idx) => {
    if (item.section) {
      const trSec = document.createElement('tr');
      trSec.className = 'section-row';
      const tdSec = document.createElement('td');
      tdSec.colSpan = 9;
      tdSec.textContent = item.titre;
      trSec.appendChild(tdSec);
      tbody.appendChild(trSec);
      return;
    }

    const tr = document.createElement('tr');

    let td = document.createElement('td');
    td.textContent = item.n;
    tr.appendChild(td);

    td = document.createElement('td');
    td.textContent = item.act;
    tr.appendChild(td);

    td = document.createElement('td');
    td.style.verticalAlign = "top";
    td.style.padding = "4px";

    const critLabels = [
      "Impact sur la sécurité d'usage / risque d'erreur humaine",
      "Impact sur la compréhension / interprétation de l'IA",
      "Impact sur la supervision humaine",
      "Impact sur la conformité réglementaire (IA Act / MDR)"
    ];
    // Checkboxes en lecture seule (pas de onclick)
    const checks = item.critChecks || [false,false,false,false];

    critLabels.forEach((label, i) => {
      const row = document.createElement('div');
      row.style.display = "flex";
      row.style.alignItems = "center";
      row.style.marginBottom = "2px";

      const svgEmpty = '<svg width="14" height="14" viewBox="0 0 14 14" xmlns="http://www.w3.org/2000/svg"><rect x="1" y="1" width="12" height="12" fill="white" stroke="#555" stroke-width="1.2"/></svg>';
      const svgFull = '<svg width="14" height="14" viewBox="0 0 14 14" xmlns="http://www.w3.org/2000/svg"><rect x="1" y="1" width="12" height="12" fill="#04284b" stroke="#04284b" stroke-width="1.2"/><polyline points="3,8 6,11 11,4" fill="none" stroke="white" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>';

      const icon = document.createElement('span');
      icon.innerHTML = checks[i] ? svgFull : svgEmpty;
      icon.style.display = "inline-block";
      icon.style.marginRight = "4px";

      const span = document.createElement('span');
      span.textContent = " " + label;
      span.style.fontSize = "0.72em";

      row.appendChild(icon);
      row.appendChild(span);
      td.appendChild(row);
    });
    tr.appendChild(td);

    // Score calculé
    td = document.createElement('td');
    td.style.textAlign = "center";
    td.style.fontWeight = "bold";

    if (item.score !== undefined) {
      const scoreVal = item.score;
      td.textContent = scoreVal.toFixed(1);
      const color = getScoreColor(scoreVal);
      if (color) {
          td.style.backgroundColor = color;
          td.style.color = "#ffffff";
      }
    } else {
      td.textContent = "";
    }
    tr.appendChild(td);

    td = document.createElement('td');
    td.textContent = item.obj;
    tr.appendChild(td);

    td = document.createElement('td');
    td.textContent = item.ref;
    tr.appendChild(td);

    // STATUT (Modifiable)
    td = document.createElement('td');
    const select = document.createElement('select');
    ["", "À faire", "En cours", "Terminé"].forEach(opt => {
      const o = document.createElement('option');
      o.value = opt;
      o.text = opt;
      if (item.statut === opt) o.selected = true;
      select.appendChild(o);
    });
    select.onchange = function(){ checklist[idx].statut = this.value; };
    td.appendChild(select);
    tr.appendChild(td);

    // RESPONSABLE (Modifiable)
    td = document.createElement('td');
    const inresp = document.createElement('input');
    inresp.type = 'text';
    inresp.value = item.resp || "";
    inresp.oninput = function(){ checklist[idx].resp = this.value; };
    td.appendChild(inresp);
    tr.appendChild(td);

    // COMMENTAIRE ET FICHIER (Modifiable)
    td = document.createElement('td');
    td.style.fontSize = "0.8em";
    td.style.color = "#555";
    td.style.backgroundColor = "#f5f5f5";
    td.style.whiteSpace = "normal";
    td.style.maxWidth = "260px";

    const commInput = document.createElement('textarea');
    commInput.value = item.comm || "";
    commInput.style.width="95%";
    commInput.rows=2;
    commInput.placeholder = "Commentaires...";
    commInput.oninput = function(){ checklist[idx].comm = this.value; };

    // Gestion de fichier (Nom seulement)
    const fileContainer = document.createElement('div');
    fileContainer.style.marginTop = "5px";
    
    // Affichage du nom du fichier s'il existe déjà
    const fileNameDisplay = document.createElement('div');
    fileNameDisplay.style.fontSize = "0.85em";
    fileNameDisplay.style.fontStyle = "italic";
    fileNameDisplay.style.marginBottom = "2px";
    if (item.nomFichier) {
        fileNameDisplay.textContent = "📎 : " + item.nomFichier;
    }

    const fileInput = document.createElement('input');
    fileInput.type = "file";
    fileInput.style.fontSize = "0.75em";
    fileInput.onchange = function() {
        if (this.files && this.files.length > 0) {
            // On stocke juste le nom, car la BDD Realtime ne stocke pas de binaires lourds
            checklist[idx].nomFichier = this.files[0].name;
            fileNameDisplay.textContent = "📎 : " + this.files[0].name;
        }
    };

    fileContainer.appendChild(fileNameDisplay);
    fileContainer.appendChild(fileInput);

    td.appendChild(commInput);
    td.appendChild(fileContainer);
    tr.appendChild(td);

    tbody.appendChild(tr);
  });
}

// -------- 6. PDF --------
function generatePDF() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF('l', 'mm', 'a4');

  doc.setFontSize(16);
  doc.setFont(undefined, 'bold');
  doc.text("Checklist Réglementaire - Validation de l'Aptitude à l'Utilisation", 14, 15);

  const nom = document.getElementById('nom').value || '—';
  const prenom = document.getElementById('prenom').value || '—';
  const societe = document.getElementById('societe').value || '—';
  const profession = document.getElementById('profession').value || '—';

  doc.setFontSize(10);
  doc.setFont(undefined, 'normal');
  doc.text(`Nom: ${nom} | Prénom: ${prenom} | Société: ${societe} | Profession: ${profession}`, 14, 22);

  const classeMdr = document.getElementById('classeMdr')?.value || '—';
  const iaSecu = document.getElementById('iaSecu')?.value || '—';
  const roleAuto = document.getElementById('roleAuto')?.value || '—';

  let coefText = '—';
  try {
    const coef = computeGlobalCoef();
    if (!isNaN(coef)) coefText = coef.toFixed(2);
  } catch(e) {
    coefText = '—';
  }

  doc.setFontSize(9);
  doc.setFont(undefined, 'bold');
  doc.text("Classification du dispositif :", 14, 28);

  doc.setFont(undefined, 'normal');
  doc.text(`Classe MDR: ${classeMdr} | IA composante de sécurité: ${iaSecu} | Rôle autonome: ${roleAuto}`, 14, 33);
  doc.text(`Score de classification global: ${coefText}`, 14, 38);

  const headers = ['N°', 'Exigence/Action', 'Score', 'Objectif', 'Référence', 'Statut', 'Responsable', 'Commentaires'];
  const tableData = [];

  checklist.forEach(item => {
    if (item.section) {
      tableData.push([{
        content: item.titre,
        colSpan: headers.length,
        styles: { fillColor: [223, 238, 255], fontStyle: 'bold', halign: 'center' }
      }]);
    } else {
      const critChecked = (item.critChecks || []).filter(c => c).length;
      const critStr = `${critChecked}/4`;
      
      // Ajout du nom de fichier dans le PDF si présent
      let commFull = `${critStr} · ${item.comm}`;
      if (item.nomFichier) commFull += `\n[Fichier: ${item.nomFichier}]`;

      tableData.push([
        item.n,
        item.act,
        item.score !== undefined ? item.score.toFixed(1) : '',
        item.obj,
        item.ref,
        item.statut || '—',
        item.resp || '—',
        commFull
      ]);
    }
  });

  doc.autoTable({
    head: [headers],
    body: tableData,
    startY: 44,
    margin: 10,
    styles: { fontSize: 8, cellPadding: 2, overflow: 'linebreak', halign: 'left' },
    headStyles: { fillColor: [130,184,234], textColor: [0,0,0], fontStyle: 'bold' },
    alternateRowStyles: { fillColor: [245,245,245] },
    didParseCell: function (data) {
        if (data.section === 'body' && data.column.index === 2) {
        const raw = data.cell.raw;
        const score = parseFloat(raw);
        if (!isNaN(score)) {
            let fill = null;
            if (score >= 0 && score < 7) {
            fill = [92, 184, 92];      
            } else if (score >= 7 && score < 14) {
            fill = [240, 173, 78];     
            } else if (score >= 14 && score < 36) {
            fill = [217, 83, 79];      
            }
            if (fill) {
            data.cell.styles.fillColor = fill;
            data.cell.styles.textColor = [255, 255, 255];
            }
        }
        }
    }
    });

  const timestamp = new Date().toISOString().split('T')[0];
  doc.save(`Checklist-${prenom}-${nom}-${timestamp}.pdf`);
}
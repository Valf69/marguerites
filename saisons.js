/* Les Marguerites du Vieux : région 2 « Le Défi des Saisons », quiz, animaux, titres, défis, codes. */
(function (D) {
  'use strict';
  Object.assign(D.names, {
    odile: 'Odile, garde du parc', lea: 'Léa, monitrice de VTT', karim: 'Karim, traileur',
    yann: 'Yann, moniteur de parapente', maud: 'Maud, monitrice de plongée', bastien: 'Bastien, moniteur de ski'
  });

  D.regions = [
    { id: 'alpes', name: 'Les Alpes du Vieux', levels: [0, 1, 2, 3, 4, 5, 6, 7] },
    { id: 'saisons', name: 'Le Défi des Saisons', levels: [8, 9, 10, 11, 12, 13], needs: 0,
      map: [{ x: 120, y: 390 }, { x: 250, y: 290 }, { x: 380, y: 170 }, { x: 540, y: 120 }, { x: 620, y: 290 }, { x: 820, y: 170 }] }
  ];

  D.region2Intro = [
    { scene: 'shop', caption: 'Quelques jours plus tard, à la boutique.', lines: [
      ['margot', 'Le Vieux ! Les copains organisent le Défi des Saisons : six épreuves, de l\'automne à l\'hiver.'],
      ['vieux', 'Orientation, VTT, trail, parapente, plongée et ski ? Je n\'ai plus vingt ans, moi !'],
      ['margot', 'Chaque épreuve te rapporte un tampon sur ta carte Club, et trois pages pour l\'édition d\'été de ton carnet.'],
      ['vieux', 'Trois pages de plus par épreuve… Bon, d\'accord. C\'est parti !']] }
  ];

  D.levels.push(
    { id: 'brume', name: 'Le Sentier des Balises', activity: 'Orientation', exit: 'refuge', npc: 'odile', gear: 'topo', music: 'lake',
      intro: [['vieux', 'Quel brouillard… On n\'y voit pas à dix mètres.'],
              ['vieux', 'Le balisage blanc et rouge, c\'est celui des GR. Une croix, ça veut dire « pas par ici ».']],
      outro: [['odile', 'Bien joué ! Beaucoup se perdent ici quand le brouillard tombe.'],
              ['odile', 'Prends cette carte topographique. Elle t\'aidera à ne plus jamais perdre le nord.'],
              ['odile', 'Léa t\'attend en bas de la forêt, avec son VTT.']] },
    { id: 'vtt', par: [28, 34, 45], name: 'La Descente des Écureuils', activity: 'VTT', exit: 'village', npc: 'lea', gear: 'pneus', music: 'river',
      intro: [['lea', 'Salut le Vieux ! Casque bien attaché ? La descente des Écureuils est un régal.'],
              ['lea', 'Sonne avec X pour prévenir les randonneurs : sur le chemin, le piéton est prioritaire.']],
      outro: [['lea', 'Super descente ! Et tu as été poli avec les randonneurs.'],
              ['lea', 'Prends ces pneus crantés : la boue ne te freinera plus.'],
              ['lea', 'Karim t\'attend au pied du Kilomètre Vertical. Accroche-toi !']] },
    { id: 'kv', par: [18, 23, 32], name: 'Le Kilomètre Vertical', activity: 'Trail', exit: 'summit', npc: 'karim', gear: 'trail', music: 'cliff',
      intro: [['karim', 'Mille mètres de dénivelé, tout droit vers le ciel ! Maintiens X pour sprinter, mais pas tout le temps.'],
              ['karim', 'Gère ton énergie et ne rate pas les ravitaillements.']],
      outro: [['karim', 'Quel finish ! Tu as bien géré ton effort.'],
              ['karim', 'Prends mes chaussures de trail : tu auras plus d\'endurance.'],
              ['karim', 'D\'ici, Yann décolle en parapente. Il t\'a gardé une place !']] },
    { id: 'parapente', par: [80, 95, 120], name: 'Le Grand Vol du Lac', activity: 'Parapente', exit: 'target', npc: 'yann', gear: 'voile', music: 'glacier',
      intro: [['yann', 'Prêt à voler ? Tapote X pour donner des coups de voile et prendre de la hauteur.'],
              ['yann', 'Chaque coup use ton élan. Les colonnes d\'air chaud, là où les oiseaux tournent, le rechargent et te font monter. Évite les nuages d\'orage, puis pose-toi au centre de la cible avec ↓.']],
      outro: [['yann', 'Joli posé ! Tu as un vrai sens du vol.'],
              ['yann', 'Garde cette voile miniature en souvenir. Maud t\'attend au bord de la mer, dans les calanques.'],
              ['vieux', 'La mer ? Après la montagne, pourquoi pas !']] },
    { id: 'plongee', par: [38, 50, 70], name: 'Les Calanques Bleues', activity: 'Plongée', exit: 'boat', npc: 'maud', gear: 'masque', music: 'cave',
      intro: [['maud', 'Bienvenue dans les calanques ! Surveille ta jauge d\'air : remonte respirer ou passe dans les bulles.'],
              ['maud', 'On regarde, on ne touche pas. Seuls les déchets se ramassent.']],
      outro: [['maud', 'Magnifique plongée ! Tu as vu le mérou ?'],
              ['maud', 'Garde ce masque. Bastien t\'attend pour la dernière épreuve : le slalom de nuit.'],
              ['vieux', 'Du ski de nuit ? Il va falloir remonter vers les sommets !']] },
    { id: 'slalom', par: [33, 40, 52], name: 'Le Slalom des Étoiles', activity: 'Ski', exit: 'village', npc: 'bastien', gear: 'skis', music: 'snow',
      intro: [['bastien', 'Dernière épreuve, le Slalom des Étoiles ! Chaque porte ratée, c\'est trois secondes de pénalité.'],
              ['bastien', 'Certaines portes sont au ras de la neige, d\'autres en l\'air, au-dessus des tremplins.']],
      outro: [['bastien', 'Six tampons sur ta carte Club : tu as gagné le Défi des Saisons !'],
              ['vieux', 'Quelle aventure ! Allez, tout le monde à la boutique pour fêter ça.']] }
  );

  D.epilogue2 = [
    ['vieux', 'Le Défi des Saisons est bouclé !'],
    ['lea', 'Et l\'été prochain, on remet ça ?'],
    ['maud', 'Avec une plongée de nuit, cette fois !'],
    ['vieux', '{pages}'],
    ['vieux', 'Merci à tous. Et maintenant, une bonne soupe, puis on va marcher pour de vrai, dehors.']
  ];

  D.cards.push(
    { id: 'topo', name: 'Carte topographique', from: 'Offerte par Odile', power: 'Pour ne plus jamais perdre le nord.', tip: 'Une carte papier ne tombe jamais en panne de batterie.' },
    { id: 'pneus', name: 'Pneus crantés', from: 'Offerts par Léa', power: 'La boue ne te ralentit plus à VTT.', tip: 'Adapte la pression de tes pneus au terrain.' },
    { id: 'trail', name: 'Chaussures de trail', from: 'Offertes par Karim', power: '+40 % d\'endurance en trail.', tip: 'Une bonne accroche et un bon maintien, surtout en descente.' },
    { id: 'voile', name: 'Voile de parapente', from: 'Offerte par Yann', power: 'Souvenir de ton premier grand vol.', tip: 'Une voile se plie et se range au sec, à l\'abri du soleil.' },
    { id: 'masque', name: 'Masque et tuba', from: 'Offerts par Maud', power: '+30 % d\'air en plongée.', tip: 'Rince ton matériel à l\'eau douce après chaque baignade en mer.' },
    { id: 'skis', name: 'Skis de slalom', from: 'Offerts par Bastien', power: 'Les skis du vainqueur.', tip: 'Fais régler tes fixations par un professionnel.' },
    { id: 'medaille', name: 'Médaille du Défi des Saisons', from: 'Les six épreuves réussies', power: 'Tu as gagné le Défi des Saisons !', tip: 'Le plus beau trophée, c\'est la sortie qu\'on fait ensuite, dehors.' }
  );

  D.pages.push(
    'Avant de partir, repère l\'itinéraire sur une carte et note les endroits où tu pourrais te tromper.',
    'Le balisage blanc et rouge indique un GR, le jaune un sentier de petite randonnée. Une croix signifie « mauvaise direction ».',
    'Dans le brouillard, ralentis, reste sur le sentier et n\'hésite pas à faire demi-tour.',
    'Le casque est indispensable à VTT, et les gants protègent tes mains en cas de chute.',
    'Sur un chemin partagé, le randonneur est prioritaire : ralentis et préviens de ton arrivée.',
    'Vérifie la pression de tes pneus et l\'état de tes freins avant chaque sortie.',
    'En trail, bois un peu et souvent, avant d\'avoir soif.',
    'Dans les montées très raides, marcher vite est souvent plus efficace que courir.',
    'Emporte toujours une couche chaude et une veste imperméable, même pour une course courte en montagne.',
    'Le parapente s\'apprend dans une école, avec un moniteur diplômé.',
    'Avant de voler, renseigne-toi sur la météo et le vent du site : on vole par conditions calmes.',
    'Ne vole jamais sous un nuage qui grossit vite : il peut aspirer la voile vers le haut.',
    'On ne plonge jamais seul : le binôme est la règle de base.',
    'Remonte lentement et respecte les paliers indiqués par ton ordinateur de plongée.',
    'Ne touche ni la faune ni la flore : la posidonie protège les fonds de la Méditerranée.',
    'Adapte ta vitesse à ton niveau et à la visibilité, et garde toujours le contrôle de tes skis.',
    'Fais régler tes fixations par un professionnel, selon ton poids et ton niveau.',
    'Respecte le balisage des pistes : une piste fermée l\'est toujours pour une bonne raison.'
  );

  /* Une question par étape, posée à la fin (bonne réponse : la première, mélangée à l'affichage) */
  D.quiz = [
    ['Que faut-il emporter, même pour une petite randonnée ?', 'De l\'eau, de quoi manger et une veste', 'Seulement un téléphone', 'Rien, c\'est une petite sortie'],
    ['Où installer son bivouac ?', 'À un endroit plat et abrité du vent', 'Au sommet, pour la vue', 'Au bord du torrent, pour l\'eau'],
    ['Combien de sources de lumière emporter sous terre ?', 'Plusieurs, avec de quoi les recharger', 'Une seule suffit', 'Aucune, les yeux s\'habituent'],
    ['Que vérifie-t-on avant de grimper ?', 'Les nœuds et les baudriers, les uns des autres', 'Que la paroi est sèche, c\'est tout', 'Rien, si on est expérimenté'],
    ['Quand porte-t-on le gilet en kayak ?', 'Tout le temps', 'Seulement dans les rapides', 'Seulement si on ne sait pas nager'],
    ['Pourquoi s\'encorde-t-on sur un glacier enneigé ?', 'La neige peut cacher des crevasses', 'Pour avancer plus vite', 'Pour ne pas se perdre'],
    ['L\'orage approche et tu es sur une crête. Que fais-tu ?', 'Je quitte la crête au plus vite', 'Je m\'abrite sous le seul arbre', 'Je continue vers le sommet'],
    ['Que consulter avant de sortir des pistes ?', 'Le bulletin d\'estimation du risque d\'avalanche', 'Le nombre de remontées ouvertes', 'Rien, la neige fraîche est sans danger'],
    ['Que signifie une croix sur le balisage ?', 'Mauvaise direction', 'Point de vue', 'Source d\'eau potable'],
    ['Sur un chemin partagé, qui est prioritaire ?', 'Le randonneur', 'Le vététiste le plus rapide', 'Celui qui descend'],
    ['Quand faut-il boire en trail ?', 'Un peu et souvent, avant d\'avoir soif', 'Seulement à l\'arrivée', 'Uniquement quand on a très soif'],
    ['Comment repère-t-on une colonne d\'air chaud ?', 'Aux oiseaux qui tournent en montant', 'À la couleur de l\'herbe', 'Au bruit du vent'],
    ['Quelle est la règle de base en plongée ?', 'Ne jamais plonger seul', 'Descendre le plus vite possible', 'Garder sa respiration en remontant'],
    ['Qui doit régler tes fixations de ski ?', 'Un professionnel, selon ton poids et ton niveau', 'Personne, elles sont réglées d\'usine', 'N\'importe qui, au plus serré']
  ];

  /* Carnet naturaliste : vus en passant près d'eux */
  D.animals = [
    { id: 'm', name: 'Marmotte', fact: 'Elle hiberne près de six mois par an. Son sifflement prévient ses voisines d\'un danger.' },
    { id: 'g', name: 'Bouquetin', fact: 'Ses sabots lui permettent de grimper sur des parois presque verticales. Il a failli disparaître au XIXe siècle.' },
    { id: 'c', name: 'Chamois', fact: 'Plus léger que le bouquetin, il porte de petites cornes recourbées en crochet.' },
    { id: 'gypaete', name: 'Gypaète barbu', fact: 'Le plus grand rapace des Alpes, avec près de trois mètres d\'envergure. Il se nourrit surtout d\'os.' },
    { id: 'H', name: 'Chouette hulotte', fact: 'Elle chasse la nuit. Son « hou-hou » est l\'un des chants les plus connus des forêts.' },
    { id: 'e', name: 'Écureuil roux', fact: 'Il cache des réserves pour l\'hiver et en oublie une partie : il aide ainsi la forêt à pousser.' },
    { id: 'k', name: 'Banc de saupes', fact: 'Ces poissons argentés rayés d\'or nagent en bancs serrés près des herbiers de posidonie.' },
    { id: 'O', name: 'Poulpe', fact: 'Il change de couleur en un instant pour se fondre dans le décor.' },
    { id: 'U', name: 'Mérou', fact: 'Protégé en Méditerranée française, ce gros poisson curieux peut vivre plusieurs dizaines d\'années.' }
  ];

  D.titles = [
    [0, 'Randonneur du dimanche'], [300, 'Marcheur curieux'], [800, 'Baroudeur'], [1500, 'Montagnard'],
    [2500, 'Alpiniste confirmé'], [4000, 'Guide de haute montagne'], [6000, 'Légende du Vieux Campeur']
  ];

  D.daily = [
    { id: 'nohit', text: 'sans perdre une seule carte Club' },
    { id: 'flowers', text: 'en ramassant au moins 80 % des pâquerettes' },
    { id: 'silver', text: 'en battant le temps de la médaille d\'argent' },
    { id: 'pages', text: 'en trouvant les 3 pages dans la même partie' }
  ];
  D.dailyReward = 60;

  /* Codes magasin : à remplacer par les vrais codes (un QR code par magasin peut ouvrir le jeu avec ?code=XXXX) */
  D.codes = {
    'VIEUX-DEMO': { label: 'Code de démonstration', reward: 50 },
    'VIEUX-BIENVENUE': { label: 'Bienvenue dans l\'aventure', reward: 100 }
  };

  /* Liens vers le site (recherche du catalogue) pour chaque carte de matériel */
  D.shopLinks = {
    boots: 'chaussures randonnée', poles: 'bâtons randonnée', lamp: 'lampe frontale', rope: 'corde escalade', axe: 'piolet',
    vest: 'gilet kayak', jacket: 'doudoune', board: 'snowboard', topo: 'carte IGN', pneus: 'pneus VTT', trail: 'chaussures trail',
    voile: 'parapente', masque: 'masque tuba', skis: 'skis'
  };
})(window.DATA);

/* ═════════ Une seule grande traversée : ordre des étapes et enchaînement de l'histoire ═════════ */
(function (D) {
  'use strict';
  const ORDER = ['torrent', 'brume', 'lac', 'grotte', 'vtt', 'falaises', 'kv', 'parapente', 'riviere', 'plongee', 'glacier', 'arete', 'slalom', 'descente'];
  const orig = D.levels.map(l => l.id);
  const at = id => orig.indexOf(id);
  D.pages = ORDER.flatMap(id => D.pages.slice(at(id) * 3, at(id) * 3 + 3));
  D.quiz = ORDER.map(id => D.quiz[at(id)]);
  D.levels = ORDER.map(id => D.levels[at(id)]);
  const L = id => D.levels.find(l => l.id === id);

  D.prologue[2].lines = [
    ['vieux', 'Quarante-deux pages… Elles sont parties partout : forêts, lacs, grottes, falaises, et même jusqu\'à la mer !'],
    ['vieux', 'Bon. Mes chaussures, mon sac, et en route ! Les amis de la montagne m\'aideront.']
  ];
  D.prologue[0].lines[0] = ['vieux', 'Voilà, mon carnet est presque prêt. Quarante-deux conseils pour celles et ceux qui partent découvrir la nature.'];

  L('torrent').outro = [
    ['margot', 'Te voilà enfin ! Une de tes pages est venue se coller à ma fenêtre.'],
    ['margot', 'Tiens, prends ces bâtons. Avec un bon appui, tu pourras sauter une deuxième fois en l\'air.'],
    ['margot', 'Le vent a poussé d\'autres pages vers la forêt des Balises. Le brouillard y tombe vite : Odile, la garde du parc, t\'y attend.']];
  L('brume').outro = [
    ['odile', 'Bien joué ! Beaucoup se perdent ici quand le brouillard tombe.'],
    ['odile', 'Prends cette carte topographique, elle t\'aidera à garder le cap.'],
    ['odile', 'J\'ai vu des pages filer vers le lac des Alpages. Nina y bivouaque ce soir.']];
  L('grotte').outro = [
    ['jules', 'Bravo pour la traversée ! Les Caillou-Boules ne t\'ont pas trop embêté ?'],
    ['jules', 'Prends ma corde et mon baudrier : tu en auras besoin sur les falaises. Et tu pourras retourner chercher les pages que tu as laissées en route.'],
    ['jules', 'De l\'autre côté de la colline, la forêt des Écureuils. Léa t\'y attend avec deux VTT !']];
  L('vtt').outro = [
    ['lea', 'Super descente ! Et tu as été poli avec les randonneurs.'],
    ['lea', 'Prends ces pneus crantés : la boue ne te freinera plus.'],
    ['lea', 'Regarde là-haut : des pages se sont accrochées aux falaises du Bouquetin. Sacha y grimpe tous les matins.']];
  L('falaises').outro = [
    ['sacha', 'Pas mal du tout ! Tu as la grimpe dans le sang.'],
    ['sacha', 'Garde mon piolet et mes crampons, ils te serviront plus tard, sur le glacier.'],
    ['sacha', 'Des pages sont restées coincées tout en haut du Kilomètre Vertical. Karim s\'y entraîne, il t\'attend.']];
  L('kv').outro = [
    ['karim', 'Quel finish ! Tu as bien géré ton effort.'],
    ['karim', 'Prends mes chaussures de trail : tu auras plus d\'endurance.'],
    ['karim', 'Le vent a soufflé tes pages au-dessus du lac. Yann décolle juste ici en parapente : il t\'a gardé une place !']];
  L('parapente').outro = [
    ['yann', 'Joli posé ! Tu as un vrai sens du vol.'],
    ['yann', 'Garde cette voile miniature en souvenir. D\'en haut, j\'ai vu des pages tomber dans la rivière Turquoise.'],
    ['yann', 'Théo, le moniteur de kayak, t\'attend au bord de l\'eau.']];
  L('riviere').outro = [
    ['theo', 'Belle descente ! Mais le courant a emporté les dernières pages… jusqu\'à la mer !'],
    ['theo', 'Garde le gilet. Si tu tombes à l\'eau, tu remonteras vite sur la rive.'],
    ['theo', 'Ma cousine Maud est monitrice de plongée dans les calanques. Elle les retrouvera avec toi.']];
  L('plongee').outro = [
    ['maud', 'Magnifique plongée ! Tu as vu le mérou ?'],
    ['maud', 'Garde ce masque. Une tempête a renvoyé tes dernières pages vers les sommets, sur le glacier des Séracs.'],
    ['vieux', 'De la mer jusqu\'au glacier… Quelle traversée ! Inès, la guide, saura me mener là-haut.']];
  L('glacier').intro = [
    ['ines', 'Te voilà enfin, le Vieux ! Maud m\'a appelée. Le glacier est magnifique, mais il ne pardonne rien.'],
    ['ines', 'Les ponts de neige peuvent cacher des crevasses. On reste attentif, surtout sous les séracs.']];
  L('arete').outro = [
    ['vieux', 'Ouf, à l\'abri. Leçon retenue : quand l\'orage menace, on ne traîne pas sur les crêtes.'],
    ['vieux', 'Tiens… mon vieux snowboard ! Je l\'avais laissé ici il y a des années.'],
    ['vieux', 'En bas, la station s\'illumine : Bastien organise le slalom de nuit. Une page est accrochée à la dernière porte !']];
  L('slalom').outro = [
    ['bastien', 'Bravo, toutes ces portes ! Voilà ta page, et ces skis en souvenir.'],
    ['bastien', 'Les dernières pages sont sur la grande pente, au-dessus du village. La neige est chargée : prends ton snowboard et ne traîne pas.'],
    ['vieux', 'Alors, une dernière descente… et direction la boutique !']];
  L('slalom').intro = [
    ['bastien', 'Bienvenue au Slalom des Étoiles ! Chaque porte ratée, c\'est trois secondes de pénalité.'],
    ['bastien', 'Certaines portes sont au ras de la neige, d\'autres en l\'air, au-dessus des tremplins.']];
  L('descente').outro = [['vieux', 'Le village ! Ouf. Et la boutique n\'est plus très loin.']];

  D.epilogue = [
    ['vieux', 'Me revoilà à la boutique, mon carnet sous le bras.'],
    ['margot', 'Et tout le monde est venu te voir !'],
    ['maud', 'De la montagne jusqu\'à la mer, quelle traversée !'],
    ['vieux', '{pages}'],
    ['vieux', 'Ce carnet, je le pose ici, sur le comptoir. Pour celles et ceux qui partent découvrir la nature.'],
    ['vieux', 'Parce que la montagne, la mer et la forêt, ça se partage.']
  ];
  D.regions = [{ id: 'traversee', name: 'La Grande Traversée du Vieux', levels: ORDER.map((_, i) => i) }];
  D.map = [
    { x: 96, y: 410 }, { x: 196, y: 340 }, { x: 132, y: 236 }, { x: 262, y: 186 }, { x: 330, y: 268 }, { x: 392, y: 160 }, { x: 492, y: 108 },
    { x: 590, y: 212 }, { x: 512, y: 312 }, { x: 610, y: 348 }, { x: 700, y: 196 }, { x: 790, y: 112 }, { x: 846, y: 168 }, { x: 900, y: 262 }
  ];
  const c = D.cards.find(k => k.id === 'carnet'); c.from = 'Les 42 pages retrouvées';
  const m = D.cards.find(k => k.id === 'medaille'); m.name = 'Médaille de la Grande Traversée'; m.from = 'Les 14 étapes réussies'; m.power = 'Tu as bouclé la Grande Traversée !';
})(window.DATA);

/* Succès à débloquer */
window.DATA.achievements = [
  { id: 'premier', name: 'Premiers pas', desc: 'Termine ta première étape.' },
  { id: 'nohit', name: 'Sans une égratignure', desc: 'Termine une étape sans perdre de carte Club.' },
  { id: 'or1', name: 'Première médaille d\'or', desc: 'Décroche une médaille d\'or.' },
  { id: 'or7', name: 'Collectionneur d\'or', desc: 'Décroche 7 médailles d\'or.' },
  { id: 'combo20', name: 'Bouquet de pâquerettes', desc: 'Enchaîne 20 pâquerettes sans t\'arrêter.' },
  { id: 'pepite1', name: 'Pâquerette d\'or', desc: 'Trouve ta première pâquerette d\'or.' },
  { id: 'pepite14', name: 'Le jardin doré', desc: 'Trouve les 14 pâquerettes d\'or.' },
  { id: 'secret', name: 'Fouineur', desc: 'Découvre un passage secret.' },
  { id: 'caillou10', name: 'Chasseur de Caillou-Boules', desc: 'Assomme 10 Caillou-Boules.' },
  { id: 'double50', name: 'Ressort', desc: 'Fais 50 doubles sauts.' },
  { id: 'figure10', name: 'Freestyle', desc: 'Réussis 10 figures en glisse.' },
  { id: 'poli', name: 'Dring dring', desc: 'Préviens tous les randonneurs de la descente à VTT.' },
  { id: 'eco', name: 'Plongeur écolo', desc: 'Ramasse tous les déchets des calanques.' },
  { id: 'pose', name: 'Posé parfait', desc: 'Pose-toi au centre de la cible en parapente.' },
  { id: 'slalom', name: 'Sans faute', desc: 'Passe toutes les portes du slalom.' },
  { id: 'nature', name: 'Naturaliste', desc: 'Observe les 9 animaux.' },
  { id: 'quiz', name: 'Incollable', desc: 'Réponds juste aux 14 questions du Vieux.' },
  { id: 'carnet', name: 'Le carnet complet', desc: 'Retrouve les 42 pages.' },
  { id: 'fin', name: 'La Grande Traversée', desc: 'Termine l\'aventure.' }
];
window.DATA.goldReward = 25;

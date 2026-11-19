/* Les Marguerites du Vieux : l'Été du Vieux (canyoning, triathlon, pêche sous-marine), corde dès le départ, déchets, montures. */
(function (D) {
  'use strict';
  const L = id => D.levels.find(l => l.id === id);

  /* ───── La corde fait partie de l'équipement de départ ; Jules offre un casque ───── */
  const rope = D.cards.find(c => c.id === 'rope');
  rope.from = 'Ton équipement de départ';
  const ci = D.cards.indexOf(rope);
  D.cards.splice(ci + 1, 0, { id: 'casque', name: 'Casque de spéléo', from: 'Offert par Jules', power: 'Une fois par étape, il encaisse une chute de pierre ou de stalactite.', tip: 'Le casque protège des chutes de pierres, même quand on ne grimpe pas.' });
  L('grotte').gear = 'casque';
  L('grotte').outro = [
    ['jules', 'Bravo pour la traversée ! Les Caillou-Boules ne t\'ont pas trop embêté ?'],
    ['jules', 'Tiens, prends mon casque. Sous terre comme en falaise, une pierre qui tombe, ça arrive vite.'],
    ['jules', 'De l\'autre côté de la colline, la forêt des Écureuils. Léa t\'y attend avec deux VTT !']];
  L('torrent').intro = [
    ['vieux', 'Le sentier longe le torrent jusqu\'au refuge de Margot. Quelques pages ont dû s\'y poser.'],
    ['vieux', 'J\'ai pris ma corde et mon baudrier : avec les ancrages, j\'irai chercher les pages les plus haut perchées !']];

  /* ───── Étapes allongées : nouveaux temps des médailles ───── */
  L('vtt').par = [35, 42, 56]; L('parapente').par = [100, 120, 150]; L('plongee').par = [46, 61, 85]; L('slalom').par = [40, 48, 63];
  delete L('kv').par; // le Kilomètre Vertical a été refait : temps calculés automatiquement
  L('kv').intro = [['karim', 'Mille mètres de dénivelé ! Cours : les marches se montent toutes seules. Maintiens X pour sprinter, mais pas tout le temps.'],
                   ['karim', 'Saute par-dessus les rochers, gère ton énergie et ne rate pas les ravitaillements.']];

  /* ───── Récompense des déchets ───── */
  D.cleanReward = 20;

  /* ───── Nouveaux amis ───── */
  D.names.lou = 'Lou, guide de canyoning';

  /* ───── Les trois étapes de l'Été ───── */
  D.levels.push(
    { id: 'canyon', name: 'Le Canyon des Cascades', activity: 'Canyoning', exit: 'canyon', npc: 'lou', gear: 'neoprene', music: 'river',
      goal: 'Descends le canyon jusqu\'à Lou',
      intro: [['lou', 'Salut le Vieux ! Casque, combinaison, baudrier : on descend le canyon des Cascades.'],
              ['lou', 'Saute dans les vasques, et pour les grandes cascades, accroche-toi aux ancrages avec X.']],
      outro: [['lou', 'Superbe descente ! Tu as sauté comme un pro.'],
              ['lou', 'Garde cette combinaison néoprène : dans l\'eau fraîche, tu tiendras plus longtemps.'],
              ['lou', 'Karim t\'attend au bord du lac. Il paraît qu\'il prépare un triathlon !']] },
    { id: 'triathlon', name: 'Le Triathlon du Lac', activity: 'Triathlon', exit: 'arch', npc: 'karim', gear: 'trifonction', music: 'cliff', par: [62, 76, 100],
      goal: 'Nage, roule, cours !',
      intro: [['karim', 'Le Vieux ! Trois sports d\'affilée : la natation, le vélo, puis la course à pied.'],
              ['karim', 'À la nage, Espace pour éviter les bouées. À vélo, X pour la sonnette. En course, maintiens X pour sprinter : les marches se franchissent toutes seules.']],
      outro: [['karim', 'Quelle arrivée ! Tu as géré tes transitions comme un champion.'],
              ['karim', 'Prends ma trifonction : elle te fera gagner quelques secondes partout.'],
              ['karim', 'Maud t\'attend dans les calanques. Cette fois, ce n\'est pas pour regarder les poissons…']] },
    { id: 'peche', name: 'La Pointe aux Sars', activity: 'Pêche sous-marine', exit: 'boat', npc: 'maud', gear: 'bouee', music: 'cave', par: [45, 60, 85], apnea: true,
      goal: 'Pêche 6 poissons, jamais les petits',
      intro: [['maud', 'Bienvenue à la Pointe aux Sars ! Ici, on pêche en apnée : pas de bouteille, on remonte respirer à la surface.'],
              ['maud', 'X près d\'un poisson pour le pêcher. Les petits, on les laisse grandir. Et le mérou est protégé : on n\'y touche jamais !']],
      outro: [['maud', 'Belle pêche, et responsable ! C\'est comme ça qu\'il restera des poissons demain.'],
              ['maud', 'Garde cette bouée de signalisation : elle montre aux bateaux qu\'un plongeur est dessous.'],
              ['vieux', 'Merci Maud ! Allez, tout le monde à la boutique : c\'est la fête de l\'été !']] }
  );

  D.pages.push(
    'Avant un canyon, vérifie la météo : un orage en amont peut faire monter l\'eau très vite.',
    'Ne saute jamais dans une vasque sans avoir vérifié sa profondeur.',
    'Pour débuter le canyoning, pars avec un guide diplômé, casque et combinaison néoprène obligatoires.',
    'En triathlon, attache ton casque avant de prendre ton vélo dans le parc à vélos.',
    'Un bonnet de bain de couleur vive permet de te repérer pendant la natation.',
    'Entraîne-toi aux transitions : enchaîner nage, vélo et course, ça s\'apprend.',
    'La chasse sous-marine se pratique en apnée : avec une bouteille de plongée, elle est interdite.',
    'Signale toujours ta présence avec une bouée, et ne pêche jamais seul : un binôme veille depuis la surface.',
    'Respecte les tailles minimales de capture et les espèces protégées, comme le mérou en Méditerranée.'
  );

  D.cards.push(
    { id: 'neoprene', name: 'Combinaison néoprène', from: 'Offerte par Lou', power: '+25 % d\'air en apnée.', tip: 'Rince-la à l\'eau douce et fais-la sécher à l\'ombre.' },
    { id: 'trifonction', name: 'Trifonction', from: 'Offerte par Karim', power: 'Tu cours un peu plus vite partout.', tip: 'Une seule tenue pour nager, rouler et courir : pas besoin de se changer.' },
    { id: 'bouee', name: 'Bouée de signalisation', from: 'Offerte par Maud', power: 'Souvenir de ta pêche responsable.', tip: 'Les bateaux doivent voir où tu plonges : la bouée te suit partout.' }
  );
  Object.assign(D.shopLinks, { casque: 'casque spéléologie', neoprene: 'combinaison néoprène', trifonction: 'trifonction', bouee: 'bouée chasse sous-marine' });

  // positions sur la carte : le long de la côte, puis en mer
  D.map.push({ x: 735, y: 300 }, { x: 500, y: 405 }, { x: 590, y: 488 });
  D.regions[0].levels = D.levels.map((_, i) => i);

  D.eteIntro = [
    { scene: 'shop', caption: 'L\'été suivant, à la boutique.', lines: [
      ['maud', 'Le Vieux ! L\'été est là, et la Bise a encore emporté des pages de ton édition d\'été.'],
      ['vieux', 'Encore ? Bon… Où sont-elles parties, cette fois ?'],
      ['maud', 'Dans le canyon des Cascades, au bord du lac du triathlon, et jusque sous la mer, à la Pointe aux Sars.'],
      ['vieux', 'Canyoning, triathlon et pêche sous-marine ? Alors on y va. Et je ramasse tous les déchets que je croise !']] }
  ];
  D.epilogue3 = [
    ['vieux', 'Ça y est, l\'édition d\'été du carnet est complète !'],
    ['maud', 'Et tu as laissé la nature plus propre que tu ne l\'as trouvée.'],
    ['karim', 'La prochaine fois, on fait le triathlon ensemble ?'],
    ['vieux', 'Avec plaisir. Mais d\'abord, une bonne glace !']
  ];

  /* ───── Succès ───── */
  D.achievements = D.achievements.filter(a => a.id !== 'quiz');
  const pep = D.achievements.find(a => a.id === 'pepite14'); if (pep) pep.desc = 'Trouve toutes les pâquerettes d\'or.';
  const fin = D.achievements.find(a => a.id === 'fin'); if (fin) fin.desc = 'Termine la Grande Traversée.';
  D.achievements.push(
    { id: 'propre', name: 'Main verte', desc: 'Ramasse tous les déchets d\'une étape.' },
    { id: 'propreAll', name: 'Gardien de la nature', desc: 'Nettoie toutes les étapes.' },
    { id: 'monture', name: 'Cavalier des cimes', desc: 'Monte sur un chamois ou une marmotte.' },
    { id: 'pecheur', name: 'Pêcheur responsable', desc: 'Pêche 6 poissons sans aucune erreur.' },
    { id: 'ete', name: 'L\'Été du Vieux', desc: 'Termine le chapitre de l\'été.' }
  );
})(window.DATA);

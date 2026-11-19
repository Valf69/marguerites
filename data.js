/* Les Marguerites du Vieux : histoire, personnages, matériel, conseils. */
window.DATA = {
  names: {
    vieux: 'Le Vieux', margot: 'Margot, gardienne de refuge', nina: 'Nina, accompagnatrice', jules: 'Jules, spéléologue',
    sacha: 'Sacha, grimpeuse', theo: 'Théo, moniteur de kayak', ines: 'Inès, guide de haute montagne'
  },

  prologue: [
    { scene: 'shop', caption: 'Un soir d\'automne, à la boutique.', lines: [
      ['vieux', 'Voilà, mon carnet est presque prêt. Vingt-quatre conseils pour celles et ceux qui partent découvrir la montagne.'],
      ['vieux', 'Je l\'ouvrirai demain sur le comptoir, comme chaque année. Allez, une dernière relecture…']] },
    { scene: 'wind', caption: 'Mais la Bise s\'engouffre par la fenêtre…', lines: [
      ['vieux', 'Mes pages ! Non, non, non, revenez !'],
      ['vieux', 'Elles s\'envolent au-dessus des toits… droit vers la montagne.']] },
    { scene: 'map', caption: 'Le lendemain matin.', lines: [
      ['vieux', 'Le torrent, le lac, la grotte, les falaises… Mes pages sont éparpillées partout.'],
      ['vieux', 'Bon. Mes chaussures, mon sac, et en route ! Les amis de la montagne m\'aideront.']] }
  ],

  levels: [
    { id: 'torrent', name: 'Le Sentier du Torrent', activity: 'Randonnée', exit: 'refuge', npc: 'margot', gear: 'poles', music: 'forest',
      intro: [['vieux', 'Le sentier longe le torrent jusqu\'au refuge de Margot. Quelques pages ont dû s\'y poser.'],
              ['vieux', 'On y va à son rythme : en montagne, celui qui part trop vite arrive rarement le premier.']],
      outro: [['margot', 'Te voilà enfin ! Une de tes pages est venue se coller à ma fenêtre.'],
              ['margot', 'Tiens, prends ces bâtons. Avec un bon appui, tu pourras sauter une deuxième fois en l\'air.'],
              ['vieux', 'Merci Margot. Le vent a emporté le reste vers le lac des Alpages.'],
              ['margot', 'Nina y bivouaque ce soir. Elle connaît le coin comme sa poche.']] },
    { id: 'lac', name: 'Le Lac des Alpages', activity: 'Bivouac', exit: 'tent', npc: 'nina', gear: 'lamp', music: 'lake',
      intro: [['vieux', 'Le soleil descend sur le lac. Il me faudra un bon coin pour la nuit.'],
              ['vieux', 'Nina le répète toujours : avant de planter la tente, regarde d\'où vient le vent.']],
      outro: [['nina', 'Bien vu ! Derrière ces rochers, on est à l\'abri des rafales.'],
              ['nina', 'J\'ai vu des pages filer vers la grotte aux Échos, mais il y fait trop sombre pour entrer sans lumière.'],
              ['nina', 'Prends ma frontale. Et n\'oublie jamais les piles de rechange !'],
              ['vieux', 'Promis. Demain, j\'irai retrouver Jules à la sortie de la grotte.']] },
    { id: 'grotte', name: 'La Grotte aux Échos', activity: 'Spéléologie', exit: 'cave', npc: 'jules', gear: 'rope', music: 'cave',
      intro: [['vieux', 'La grotte aux Échos… Jules m\'attend à l\'autre sortie.'],
              ['vieux', 'Échooo… échooo… Bon. Il avait raison, ça résonne.']],
      outro: [['jules', 'Bravo pour la traversée ! Les Caillou-Boules ne t\'ont pas trop embêté ?'],
              ['jules', 'Tes pages ont continué vers les falaises du Bouquetin. Là-haut, il te faudra ça.'],
              ['jules', 'Ma corde et mon baudrier. Repère les ancrages dans la paroi et accroche-toi.'],
              ['vieux', 'Avec une corde, je pourrai aussi retourner chercher les pages que j\'ai dû laisser derrière moi !']] },
    { id: 'falaises', name: 'Les Falaises du Bouquetin', activity: 'Escalade', exit: 'summit', npc: 'sacha', gear: 'axe', music: 'cliff',
      intro: [['sacha', 'Salut le Vieux ! Jules m\'a prévenue. On grimpe jusqu\'au sommet des falaises ?'],
              ['sacha', 'Casque bien serré, nœud vérifié. Et lève souvent la tête : ici, des pierres tombent.']],
      outro: [['sacha', 'Pas mal du tout ! Tu as la grimpe dans le sang.'],
              ['sacha', 'D\'ici, j\'ai vu des pages flotter sur la rivière, puis s\'envoler vers le glacier.'],
              ['sacha', 'Prends mon piolet et mes crampons pour la glace. Mais d\'abord, Théo t\'attend au bord de l\'eau.'],
              ['vieux', 'Le kayak de Théo ? Ça fait bien longtemps que je n\'ai pas pagayé !']] },
    { id: 'riviere', name: 'La Rivière Turquoise', activity: 'Kayak', exit: 'kayak', npc: 'theo', gear: 'vest', music: 'river',
      intro: [['theo', 'Salut le Vieux ! Gilet bien serré ? On descend la rivière Turquoise.'],
              ['theo', 'Le courant te porte. Toi, tu évites les rochers et tu ramasses tout ce qui flotte !']],
      outro: [['theo', 'Belle descente ! Tu as vu toutes ces pages qui flottaient ?'],
              ['theo', 'Garde le gilet. Si tu tombes dans un lac glaciaire, tu remonteras vite sur la rive.'],
              ['theo', 'Inès, la guide, t\'attend au pied du glacier des Séracs.'],
              ['vieux', 'Alors en route pour la haute montagne !']] },
    { id: 'glacier', name: 'Le Glacier des Séracs', activity: 'Alpinisme', exit: 'summit', npc: 'ines', gear: 'jacket', music: 'glacier',
      intro: [['ines', 'Bonjour le Vieux. Le glacier est magnifique, mais il ne pardonne rien.'],
              ['ines', 'Les ponts de neige peuvent cacher des crevasses. On reste attentif, surtout sous les séracs.']],
      outro: [['ines', 'Te voilà de l\'autre côté. Joli travail.'],
              ['ines', 'Le ciel se charge vers l\'arête. Tes dernières pages sont là-haut, près du refuge d\'hiver.'],
              ['ines', 'Prends ma doudoune : les rafales te pousseront deux fois moins. Et si l\'orage éclate, ne traîne pas sur la crête.'],
              ['vieux', 'Promis, Inès. Je file me mettre à l\'abri au refuge.']] },
    { id: 'arete', name: 'L\'Arête de la Tempête', activity: 'Alpinisme d\'hiver', exit: 'winter', npc: null, gear: 'board', music: 'storm',
      intro: [['vieux', 'Brr… L\'orage arrive plus vite que prévu.'],
              ['vieux', 'Le refuge d\'hiver est le plus proche. Je file m\'y abriter, sans m\'arrêter sur la crête.']],
      outro: [['vieux', 'Ouf, à l\'abri. Leçon retenue : quand l\'orage menace, on ne traîne pas sur les crêtes.'],
              ['vieux', 'Tiens… mon vieux snowboard ! Je l\'avais laissé ici il y a des années.'],
              ['vieux', 'L\'orage est passé et la neige fraîche est tombée. Il est temps de rentrer à la boutique.']],
      outroScene: 'board' },
    { id: 'descente', name: 'La Grande Descente', activity: 'Snowboard', exit: 'village', npc: null, gear: null, music: 'snow',
      intro: [['vieux', 'Cette neige fraîche est instable. J\'ai lu le bulletin avalanche ce matin : risque marqué.'],
              ['vieux', 'Je reste sur l\'itinéraire balisé et je descends sans m\'arrêter. Et si ça part derrière moi… je file !']],
      outro: [['vieux', 'Le village ! Ouf. Et la boutique n\'est plus très loin.']] }
  ],

  epilogue: [
    ['vieux', 'Me revoilà à la boutique, mon carnet sous le bras.'],
    ['margot', 'Et tout le monde est venu te voir !'],
    ['jules', 'Il fallait bien fêter ça.'],
    ['vieux', '{pages}'],
    ['vieux', 'Ce carnet, je le pose ici, sur le comptoir. Pour celles et ceux qui partent découvrir la montagne.'],
    ['vieux', 'Parce que la montagne, ça se partage.']
  ],

  cards: [
    { id: 'boots', name: 'Chaussures de randonnée', from: 'Ton équipement de départ', power: 'Marcher, sauter, explorer.', tip: 'Fais-les à tes pieds avant une longue sortie : tu éviteras les ampoules.' },
    { id: 'poles', name: 'Bâtons de randonnée', from: 'Offerts par Margot', power: 'Double saut : appuie une deuxième fois sur Saut en l\'air.', tip: 'Ils soulagent les genoux, surtout dans les descentes.' },
    { id: 'lamp', name: 'Lampe frontale', from: 'Prêtée par Nina', power: 'Éclaire les grottes et les passages sombres.', tip: 'Toujours des piles ou une batterie de rechange dans le sac.' },
    { id: 'rope', name: 'Corde et baudrier', from: 'Prêtés par Jules', power: 'X (ou Maj) près d\'un ancrage pour t\'accrocher. ↑ ↓ pour monter ou descendre, Saut pour te lancer.', tip: 'Une corde se vérifie et se range avec soin après chaque sortie.' },
    { id: 'axe', name: 'Piolet et crampons', from: 'Prêtés par Sacha', power: 'Tu ne glisses plus sur la glace.', tip: 'Vérifie que tes crampons sont compatibles avec tes chaussures.' },
    { id: 'vest', name: 'Gilet de kayak', from: 'Prêté par Théo', power: 'Tomber à l\'eau ne te coûte plus de carte Club.', tip: 'Sur l\'eau, le gilet se porte toujours, et bien serré.' },
    { id: 'jacket', name: 'Doudoune', from: 'Prêtée par Inès', power: 'Les rafales te poussent deux fois moins.', tip: 'Le duvet garde sa chaleur tant qu\'il reste au sec.' },
    { id: 'board', name: 'Snowboard', from: 'Retrouvé au refuge d\'hiver', power: 'Pour la grande descente.', tip: 'Casque et protections, même pour une descente tranquille.' },
    { id: 'carnet', name: 'Le carnet du Vieux', from: 'Les 24 pages retrouvées', power: 'Le carnet est complet !', tip: 'La montagne, ça se partage.' }
  ],

  pages: [
    'Avant de partir, consulte la météo montagne. Et n\'hésite jamais à renoncer si elle se dégrade.',
    'Dis toujours à quelqu\'un où tu vas et à quelle heure tu comptes rentrer.',
    'Même pour une petite sortie : de l\'eau, de quoi grignoter, une couche chaude et une veste de pluie.',
    'Pour bivouaquer, choisis un endroit plat, abrité du vent, loin des pentes d\'où des pierres peuvent tomber.',
    'Renseigne-toi avant de partir : dans les parcs nationaux et certains sites, le bivouac est réglementé.',
    'Ne laisse aucune trace : tu repars avec tous tes déchets, même les épluchures.',
    'Sous terre, emporte toujours plusieurs sources de lumière et de quoi les recharger.',
    'On ne part jamais seul sous terre, et on prévient quelqu\'un de l\'heure de sortie prévue.',
    'La pluie dehors peut faire monter l\'eau dedans : vérifie la météo avant d\'entrer dans une grotte.',
    'Avant de grimper, vérifiez mutuellement vos nœuds, vos baudriers et votre système d\'assurage.',
    'Le casque protège des chutes de pierres, même quand ce n\'est pas toi qui grimpes.',
    'Fais un nœud en bout de corde : elle ne pourra pas filer entre tes mains ou dans le système d\'assurage.',
    'Sur l\'eau, le gilet d\'aide à la flottabilité se porte toujours, bien ajusté.',
    'Repère depuis la berge les passages difficiles avant de t\'y engager. Au moindre doute, on porte le bateau.',
    'L\'eau de montagne est froide : une combinaison néoprène te protège en cas de dessalage.',
    'Sur un glacier enneigé, on s\'encorde : la neige peut cacher des crevasses.',
    'En altitude, monte progressivement et bois régulièrement, même sans avoir soif.',
    'Pars tôt le matin : la neige et les ponts de neige sont plus solides tant qu\'il fait froid.',
    'Si l\'orage menace, quitte les crêtes et les sommets, et éloigne-toi des objets métalliques.',
    'Superpose tes couches : une couche respirante, une couche chaude, une couche coupe-vent et imperméable.',
    'Lunettes de soleil et crème solaire : en altitude, la neige renvoie une grande partie des UV.',
    'Avant de sortir des pistes, consulte le bulletin d\'estimation du risque d\'avalanche.',
    'Hors-piste : détecteur de victimes d\'avalanche, pelle et sonde, et savoir s\'en servir. Jamais seul.',
    'Le casque en snowboard, c\'est comme la ceinture en voiture : à chaque fois.'
  ],

  shop: [
    { id: 'gourde', name: 'Option Assistance', desc: '+1 carte Club au départ de chaque étape.', price: 60, gear: 'gourde' },
    { id: 'barres', name: 'Barres de céréales', desc: 'Les cairns te rendent toutes tes cartes Club.', price: 80, gear: 'barres' },
    { id: 'boussole', name: 'Boussole', desc: 'Une flèche t\'indique la page la plus proche.', price: 120, gear: 'boussole' },
    { id: 'trousse', name: 'Option Famille', desc: '+1 carte Club au départ de chaque étape.', price: 150, gear: 'trousse', needs: 'gourde' },
    { id: 'sac', name: 'Sac léger', desc: 'Tu marches un peu plus vite.', price: 170, gear: 'sac' }
  ],

  // positions sur la carte (960 x 540)
  map: [
    { x: 150, y: 400 }, { x: 260, y: 312 }, { x: 196, y: 205 }, { x: 330, y: 128 },
    { x: 470, y: 270 }, { x: 618, y: 170 }, { x: 760, y: 92 }, { x: 880, y: 210 }
  ],
  shopNode: { x: 70, y: 476 }
};

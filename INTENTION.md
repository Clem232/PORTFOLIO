# Note d'intention — Brain Cube

## But du jeu

**Brain Cube** est un jeu de puzzle 3D inspiré du classique *Bloxorz*. Le joueur contrôle un bloc rectangulaire qu'il fait rouler sur une grille suspendue dans le vide. L'objectif est simple : faire tomber le bloc **debout** dans le trou cible (case violette) en un minimum de déplacements.

## Mécaniques principales

- **Déplacement par roulement** : le bloc ne glisse pas — il bascule sur son arête, ce qui change son orientation (debout, couché sur X, couché sur Z). Maîtriser cette physique est la clé du jeu.
- **Cases fragiles** : certaines cases ne supportent pas le poids du bloc lorsqu'il est debout dessus et s'effondrent immédiatement.
- **Switchs et ponts** : des interrupteurs activent ou désactivent des segments de pont. Les switchs légers se déclenchent au moindre contact ; les switchs lourds (marqués X) n'acceptent que le poids total du bloc debout.
- **Système de vies** : le joueur commence avec 3 vies. Chaque chute lui en coûte une. Compléter un niveau lui en redonne une (jusqu'au maximum). À zéro vies, c'est le Game Over — il faut recommencer depuis le niveau 1.

## Économie de jeu

| Économie | Mécanique |
|---|---|
| Principale | Score (coups × malus) : moins de déplacements = meilleur score |
| Secondaire | Vies (3 max) : perdre une vie par chute, gagner une vie par niveau réussi |

## Progression

8 niveaux de difficulté croissante :
1. **Premiers pas** – prise en main du roulement
2. **Le virage en L** – navigation sur un plateau en L
3. **La fourche** – choix de chemin
4. **Cases fragiles** – gestion du poids
5. **Le pont** – activation d'un switch + traversée de pont
6. **L'ascenseur** – switch positionné au centre de la plateforme
7. **Switch lourd** – maîtrise de l'orientation du bloc
8. **Labyrinthe final** – combinaison de toutes les mécaniques

## Choix de game design

- **Caméra fixe légèrement inclinée** : donne une lisibilité maximale de la grille tout en conservant la profondeur 3D, sans distraire le joueur.
- **Feedback couleur** : chaque type de case a une couleur distincte et intuitive (fragile = orange chaud, switch = cyan, case cible = rose).
- **Transition de fond par niveau** : chaque niveau dispose d'une teinte de fond unique pour renforcer le sentiment de progression sans alourdir l'interface.
- **Animations** : le roulement avec pivot physique et le son synthétisé renforcent la satisfaction tactile à chaque déplacement.
- **Musique générative** : un arpège doux généré par Web Audio API tourne en boucle sans fichier audio externe, garantissant légèreté et portabilité.
- **Score partageable** : le score est calculé à partir du niveau atteint et du nombre de coups, puis soumis à un leaderboard global via l'API back-end.

## Identité visuelle

Le jeu adopte une palette pastel douce (pêche, rose, lavande) avec une typographie monospace pour évoquer un univers "puzzle cérébral" accessible, ni trop enfantin ni trop austère. Les décorations SVG en arrière-plan restent discrètes pour ne pas concurrencer la lisibilité de la grille.

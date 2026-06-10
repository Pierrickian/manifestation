import { QUESTION_BANK } from '../data/staticQuestions.js'
import { generateAnswers } from './generateAnswers.js'

export function generateQuestion(context) {
  const dominantNeed = context.discovery?.dominantNeed || context.rankedNeeds?.[0]
  const stepIndex = context.phaseIndex ?? context.answers?.length ?? 0
  const phase = context.phase || 1
  const phaseChoice = context.phaseChoice
  const needId = dominantNeed?.id || 'red'
  const questions = QUESTION_BANK[needId] || QUESTION_BANK.red
  const question = phase === 1 && stepIndex === 0 && context.feeling?.seedQuestion
    ? context.feeling.seedQuestion
    : getPhaseQuestion({
        phase,
        stepIndex,
        needId,
        question: questions[stepIndex % questions.length],
        phaseChoice,
        beingSettings: context.beingSettings
      })

  return {
    id: `question-${phase}-${stepIndex}-${needId}`,
    question,
    answers: generateAnswers({
      rankedNeeds: context.discovery?.rankedNeeds || context.rankedNeeds,
      stepIndex: (phase - 1) * 10 + stepIndex
    }),
    source: 'local'
  }
}

function getPhaseQuestion({ phase, stepIndex, needId, question, phaseChoice, beingSettings }) {
  if (phase === 2) {
    const opening = phaseChoice?.label
      ? `Dans l'orientation "${phaseChoice.label}", `
      : ''

    const byNeed = {
      violet: ['quelle idee demande a etre clarifiee sans etre forcee ?', 'quel lien discret commence a apparaitre ?'],
      indigo: ['quelle direction attire ton attention, meme timidement ?', 'quelle image pourrait servir de boussole provisoire ?'],
      blue: ["qu'est-ce qui voudrait etre formule plus justement ?", "ou pourrais-tu reprendre un peu d'espace ?"],
      green: ['quel lien pourrait etre nourri sans te trahir ?', 'quelle presence rendrait la situation moins seule ?'],
      yellow: ["quelle part de ta valeur attend d'etre reconnue ?", 'ou pourrais-tu te donner un peu plus de legitimite ?'],
      orange: ['quelle curiosite pourrait revenir dans la scene ?', 'quel essai neuf serait assez petit pour exister ?'],
      red: ['quel appui rendrait le prochain pas moins lourd ?', 'quelle base simple manque encore ?']
    }

    return `${opening}${byNeed[needId]?.[stepIndex % 2] || question}`
  }

  if (phase === 3) {
    const commitment = Number(beingSettings?.commitment ?? 34)
    const lowCommitment = {
      violet: ['quel constat peux-tu simplement reconnaitre ?', 'quelle phrase peut rester ouverte sans t enfermer ?', "qu'est-ce qui devient un peu plus clair ?"],
      indigo: ['quelle route pourrais-tu observer sans encore choisir ?', "quel signal merite juste d'etre note ?", 'quelle hypothese peut rester vivante ?'],
      blue: ['quelle limite peux-tu reconnaitre interieurement ?', 'quel mot juste peut exister sans etre encore dit ?', 'quelle liberte veux-tu garder visible ?'],
      green: ['quel soutien serait bon a envisager ?', 'quel lien compte assez pour etre remarque ?', "quelle forme d'amour peux-tu laisser possible ?"],
      yellow: ['quelle place peux-tu reconnaitre en toi ?', 'quelle valeur peux-tu cesser de nier ?', 'quel signe de legitimite peux-tu noter ?'],
      orange: ['quel essai pourrait rester minuscule ?', 'quel changement peut rester reversible ?', 'quelle petite envie peux-tu laisser revenir ?'],
      red: ['quel pas peux-tu seulement preparer ?', 'quel support serait utile a reperer ?', 'quelle base peux-tu imaginer sans te forcer ?']
    }
    const highCommitment = {
      violet: ['quel sens choisis-tu de prendre au serieux ?', 'quelle phrase peut devenir ton cap maintenant ?', "qu'est-ce qui est assez clair pour etre acte ?"],
      indigo: ['quelle route choisis-tu de tester ?', 'quel signal vas-tu suivre en premier ?', 'quel choix provisoire engages-tu ?'],
      blue: ['quelle limite vas-tu poser plus nettement ?', 'quelle demande peux-tu formuler vraiment ?', 'quelle liberte concrete reprends-tu ?'],
      green: ['quel soutien vas-tu demander ou accepter ?', 'quel lien vas-tu nourrir par un geste ?', "quelle forme d'amour deviens-tu pret a recevoir ?"],
      yellow: ['quelle place choisis-tu de prendre ?', "quelle preuve de valeur arretes-tu d'attendre ?", 'quel geste confirme ta legitimite ?'],
      orange: ['quel essai vas-tu lancer ?', "quel rituel neuf remplace l'ancien automatisme ?", 'quelle creation ouvre la suite ?'],
      red: ['quel premier pas vas-tu faire ?', 'quel support mets-tu autour de toi ?', 'quelle base tiens-tu cette semaine ?']
    }
    const byNeed = {
      violet: ['quel constat peux-tu accepter comme point de depart ?', 'quelle phrase simple pourrait garder le cap ?', "qu'est-ce qui devient assez clair pour etre acte ?"],
      indigo: ['quelle route peux-tu tester sans tout garantir ?', "quel signal merite d'etre suivi maintenant ?", 'quel choix provisoire ferait avancer la vision ?'],
      blue: ['quelle limite ou demande peut devenir plus nette ?', 'quel mot juste changerait deja la position ?', 'quelle liberte concrete peux-tu reprendre ?'],
      green: ['quel soutien peux-tu demander ou recevoir ?', 'quel lien merite une action simple ?', "quelle forme d'amour devient praticable ?"],
      yellow: ['quelle place peux-tu prendre sans te justifier ?', "quelle preuve de valeur peux-tu cesser d'attendre ?", 'quel geste confirmerait ta legitimite ?'],
      orange: ['quel essai peux-tu lancer sans enjeu enorme ?', "quel rituel neuf peut remplacer l'ancien automatisme ?", 'quelle petite creation peut ouvrir la suite ?'],
      red: ['quel pas concret peux-tu faire en premier ?', 'quel support peux-tu mettre autour de toi ?', 'quelle base peux-tu tenir cette semaine ?']
    }

    if (commitment < 40) return lowCommitment[needId]?.[stepIndex % 3] || question
    if (commitment > 65) return highCommitment[needId]?.[stepIndex % 3] || question
    return byNeed[needId]?.[stepIndex % 3] || question
  }

  return question
}

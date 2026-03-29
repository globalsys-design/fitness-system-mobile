export interface GuideInfo {
  image: string;
  tip: string;
}

export const guideImages: Record<string, GuideInfo> = {
  // ── Perímetros ──
  pescoco: {
    image: "/guides/pescoco.png",
    tip: "Posicione a fita logo abaixo da proeminência laríngea (pomo de adão), perpendicular ao eixo longo do pescoço.",
  },
  ombro: {
    image: "/guides/ombro.png",
    tip: "Passe a fita sobre os pontos mais laterais dos músculos deltoides, com os braços relaxados ao lado do corpo.",
  },
  torax: {
    image: "/guides/torax.png",
    tip: "Posicione a fita na altura dos mamilos (homens) ou logo acima do busto (mulheres), ao final de uma expiração normal.",
  },
  cintura: {
    image: "/guides/cintura.png",
    tip: "Meça no ponto médio entre a última costela e a crista ilíaca, ao final de uma expiração normal.",
  },
  abdomen: {
    image: "/guides/abdomen.png",
    tip: "Posicione a fita na altura da cicatriz umbilical, horizontalmente, sem comprimir a pele.",
  },
  quadril: {
    image: "/guides/quadril.png",
    tip: "Meça na maior protuberância dos glúteos, com os pés juntos e músculos relaxados.",
  },
  braco_relaxado: {
    image: "/guides/braco_relaxado.png",
    tip: "Meça o ponto médio entre o acrômio e o olécrano, com o braço relaxado ao lado do corpo.",
  },
  braco_contraido: {
    image: "/guides/braco_contraido.png",
    tip: "Com o cotovelo flexionado a 90° e o bíceps contraído, meça o maior perímetro do braço.",
  },
  antebraco: {
    image: "/guides/antebraco.png",
    tip: "Meça a maior circunferência do antebraço, com o braço estendido e a palma voltada para cima.",
  },
  punho: {
    image: "/guides/punho.png",
    tip: "Meça sobre os processos estilóides do rádio e da ulna (menor circunferência do punho).",
  },
  coxa_proximal: {
    image: "/guides/coxa_proximal.png",
    tip: "Meça logo abaixo da prega glútea, com o peso distribuído igualmente entre as pernas.",
  },
  coxa_medial: {
    image: "/guides/coxa_medial.png",
    tip: "Meça no ponto médio entre a prega inguinal e a borda superior da patela.",
  },
  coxa_distal: {
    image: "/guides/coxa_distal.png",
    tip: "Meça logo acima dos côndilos femorais (acima do joelho).",
  },
  perna: {
    image: "/guides/perna.png",
    tip: "Meça a maior circunferência da panturrilha, com o peso distribuído igualmente.",
  },
  tornozelo: {
    image: "/guides/tornozelo.png",
    tip: "Meça a menor circunferência logo acima dos maléolos.",
  },

  // ── Dobras Cutâneas ──
  tricipital: {
    image: "/guides/tricipital.png",
    tip: "Prega vertical na face posterior do braço, sobre o músculo tríceps, no ponto médio entre acrômio e olécrano.",
  },
  subescapular: {
    image: "/guides/subescapular.png",
    tip: "Prega diagonal (45°) a 2cm abaixo do ângulo inferior da escápula.",
  },
  bicipital: {
    image: "/guides/bicipital.png",
    tip: "Prega vertical na face anterior do braço, sobre o músculo bíceps, no ponto médio.",
  },
  peitoral: {
    image: "/guides/peitoral.png",
    tip: "Prega diagonal entre a linha axilar anterior e o mamilo. Homens: mais próximo à axila. Mulheres: 1/3 da distância.",
  },
  axilar_media: {
    image: "/guides/axilar_media.png",
    tip: "Prega horizontal ou levemente oblíqua na linha axilar média, na altura do processo xifóide.",
  },
  suprailiaca: {
    image: "/guides/suprailiaca.png",
    tip: "Prega diagonal logo acima da crista ilíaca, na linha axilar média.",
  },
  abdominal: {
    image: "/guides/abdominal.png",
    tip: "Prega vertical a 2cm à direita da cicatriz umbilical.",
  },
  coxa_medial_dc: {
    image: "/guides/coxa_medial_dc.png",
    tip: "Prega vertical na face anterior da coxa, no ponto médio entre a prega inguinal e a patela.",
  },
  perna_medial: {
    image: "/guides/perna_medial.png",
    tip: "Prega vertical na face medial (interna) da perna, no nível da maior circunferência.",
  },

  // ── Diâmetros ──
  biestiloide: {
    image: "/guides/biestiloide.png",
    tip: "Meça a distância entre os processos estilóides do rádio e da ulna com o paquímetro.",
  },
  biepicondilo_umeral: {
    image: "/guides/biepicondilo_umeral.png",
    tip: "Com o cotovelo flexionado a 90°, meça a distância entre os epicôndilos medial e lateral do úmero.",
  },
  biepicondilo_femoral: {
    image: "/guides/biepicondilo_femoral.png",
    tip: "Com o joelho flexionado a 90°, meça entre os epicôndilos medial e lateral do fêmur.",
  },
};

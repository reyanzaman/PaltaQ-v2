// rankings.ts

interface RankDetails {
  colorCode: string;
  icon: string;
}

const rankDictionary: { [key: string]: RankDetails } = {
  novice: { colorCode: "1a5870", icon: "1.png" },
  apprentice: { colorCode: "207aa7", icon: "2.png" },
  adept: { colorCode: "8a4c19", icon: "3.png" },
  expert: { colorCode: "d18100", icon: "4.png" },
  master: { colorCode: "1d916e", icon: "5.png" },
  legendary: { colorCode: "555eab", icon: "6.png" },
  mythical: { colorCode: "3b7652", icon: "7.png" },
  outstanding: { colorCode: "0050b3", icon: "8.png" },
  masterOfQueries: { colorCode: "9c4375", icon: "9.png" },
  grandInquisitor: { colorCode: "910022", icon: "10.png" },
};

const getRankDetails = (score: number): RankDetails => {
  if (score >= 551 && score <= 1500) {
    return rankDictionary.apprentice;
  } else if (score > 1500 && score <= 3000) {
    return rankDictionary.adept;
  } else if (score > 3000 && score <= 5000) {
    return rankDictionary.expert;
  } else if (score > 5000 && score <= 7000) {
    return rankDictionary.master;
  } else if (score > 7000 && score <= 15000) {
    return rankDictionary.legendary;
  } else if (score > 15000 && score <= 25000) {
    return rankDictionary.mythical;
  } else if (score > 25000 && score <= 35000) {
    return rankDictionary.outstanding;
  } else if (score > 35000 && score <= 50000) {
    return rankDictionary.masterOfQueries;
  } else if (score > 50000) {
    return rankDictionary.grandInquisitor;
  } else {
    return rankDictionary.novice;
  }
};

export { rankDictionary, getRankDetails };  
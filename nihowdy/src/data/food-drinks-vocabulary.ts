export type VocabItem = {
  word: string
  pronunciation?: string
  meaning: string
  category: "food" | "drink"
}

export type LanguageVocab = {
  language: string
  items: VocabItem[]
}

export const FOOD_DRINKS_BY_LANGUAGE: Record<string, LanguageVocab> = {
  Mandarin: {
    language: "Chinese (Mandarin)",
    items: [
      { word: "水", pronunciation: "shuǐ", meaning: "water", category: "drink" },
      { word: "茶", pronunciation: "chá", meaning: "tea", category: "drink" },
      { word: "咖啡", pronunciation: "kāfēi", meaning: "coffee", category: "drink" },
      { word: "苹果", pronunciation: "píngguǒ", meaning: "apple", category: "food" },
      { word: "米饭", pronunciation: "mǐfàn", meaning: "rice", category: "food" },
      { word: "面包", pronunciation: "miànbāo", meaning: "bread", category: "food" },
      { word: "牛奶", pronunciation: "niúnǎi", meaning: "milk", category: "drink" },
      { word: "果汁", pronunciation: "guǒzhī", meaning: "juice", category: "drink" },
      { word: "蔬菜", pronunciation: "shūcài", meaning: "vegetables", category: "food" },
      { word: "肉", pronunciation: "ròu", meaning: "meat", category: "food" },
    ],
  },
  Chinese: {
    language: "Chinese (Mandarin)",
    items: [
      { word: "水", pronunciation: "shuǐ", meaning: "water", category: "drink" },
      { word: "茶", pronunciation: "chá", meaning: "tea", category: "drink" },
      { word: "咖啡", pronunciation: "kāfēi", meaning: "coffee", category: "drink" },
      { word: "苹果", pronunciation: "píngguǒ", meaning: "apple", category: "food" },
      { word: "米饭", pronunciation: "mǐfàn", meaning: "rice", category: "food" },
      { word: "面包", pronunciation: "miànbāo", meaning: "bread", category: "food" },
      { word: "牛奶", pronunciation: "niúnǎi", meaning: "milk", category: "drink" },
      { word: "果汁", pronunciation: "guǒzhī", meaning: "juice", category: "drink" },
      { word: "蔬菜", pronunciation: "shūcài", meaning: "vegetables", category: "food" },
      { word: "肉", pronunciation: "ròu", meaning: "meat", category: "food" },
    ],
  },
  Spanish: {
    language: "Spanish",
    items: [
      { word: "agua", meaning: "water", category: "drink" },
      { word: "té", meaning: "tea", category: "drink" },
      { word: "café", meaning: "coffee", category: "drink" },
      { word: "manzana", meaning: "apple", category: "food" },
      { word: "arroz", meaning: "rice", category: "food" },
      { word: "pan", meaning: "bread", category: "food" },
      { word: "leche", meaning: "milk", category: "drink" },
      { word: "zumo", meaning: "juice", category: "drink" },
      { word: "verduras", meaning: "vegetables", category: "food" },
      { word: "carne", meaning: "meat", category: "food" },
    ],
  },
  Japanese: {
    language: "Japanese",
    items: [
      { word: "水", pronunciation: "mizu", meaning: "water", category: "drink" },
      { word: "お茶", pronunciation: "ocha", meaning: "tea", category: "drink" },
      { word: "コーヒー", pronunciation: "kōhī", meaning: "coffee", category: "drink" },
      { word: "りんご", pronunciation: "ringo", meaning: "apple", category: "food" },
      { word: "ご飯", pronunciation: "gohan", meaning: "rice", category: "food" },
      { word: "パン", pronunciation: "pan", meaning: "bread", category: "food" },
      { word: "牛乳", pronunciation: "gyūnyū", meaning: "milk", category: "drink" },
      { word: "ジュース", pronunciation: "jūsu", meaning: "juice", category: "drink" },
      { word: "野菜", pronunciation: "yasai", meaning: "vegetables", category: "food" },
      { word: "肉", pronunciation: "niku", meaning: "meat", category: "food" },
    ],
  },
  French: {
    language: "French",
    items: [
      { word: "eau", meaning: "water", category: "drink" },
      { word: "thé", meaning: "tea", category: "drink" },
      { word: "café", meaning: "coffee", category: "drink" },
      { word: "pomme", meaning: "apple", category: "food" },
      { word: "riz", meaning: "rice", category: "food" },
      { word: "pain", meaning: "bread", category: "food" },
      { word: "lait", meaning: "milk", category: "drink" },
      { word: "jus", meaning: "juice", category: "drink" },
      { word: "légumes", meaning: "vegetables", category: "food" },
      { word: "viande", meaning: "meat", category: "food" },
    ],
  },
  Korean: {
    language: "Korean",
    items: [
      { word: "물", pronunciation: "mul", meaning: "water", category: "drink" },
      { word: "차", pronunciation: "cha", meaning: "tea", category: "drink" },
      { word: "커피", pronunciation: "keopi", meaning: "coffee", category: "drink" },
      { word: "사과", pronunciation: "sagwa", meaning: "apple", category: "food" },
      { word: "밥", pronunciation: "bap", meaning: "rice", category: "food" },
      { word: "빵", pronunciation: "ppang", meaning: "bread", category: "food" },
      { word: "우유", pronunciation: "uyu", meaning: "milk", category: "drink" },
      { word: "주스", pronunciation: "juseu", meaning: "juice", category: "drink" },
      { word: "채소", pronunciation: "chaeso", meaning: "vegetables", category: "food" },
      { word: "고기", pronunciation: "gogi", meaning: "meat", category: "food" },
    ],
  },
  English: {
    language: "English",
    items: [
      { word: "water", meaning: "agua / 水 / 물", category: "drink" },
      { word: "tea", meaning: "té / 茶 / 차", category: "drink" },
      { word: "coffee", meaning: "café / 咖啡 / 커피", category: "drink" },
      { word: "apple", meaning: "manzana / 苹果 / 사과", category: "food" },
      { word: "rice", meaning: "arroz / 米饭 / 밥", category: "food" },
      { word: "bread", meaning: "pan / 面包 / 빵", category: "food" },
      { word: "milk", meaning: "leche / 牛奶 / 우유", category: "drink" },
      { word: "juice", meaning: "zumo / 果汁 / 주스", category: "drink" },
      { word: "vegetables", meaning: "verduras / 蔬菜 / 채소", category: "food" },
      { word: "meat", meaning: "carne / 肉 / 고기", category: "food" },
    ],
  },
}

export const VOCAB_SET = "food-drinks"

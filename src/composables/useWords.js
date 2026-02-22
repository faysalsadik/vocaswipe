import { ref, computed, watch } from 'vue';

const STORAGE_KEY = 'vocaswipe_progress';
const RANGE_STORAGE_KEY = 'vocaswipe_vocab_range';

const words = ref([]);
const wordStates = ref({});
const currentIndex = ref(0);
const vocabularyRange = ref([1, null]); // Use null instead of Infinity for "all"

const loadFromStorage = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const data = JSON.parse(stored);
      wordStates.value = data.states || {};
      currentIndex.value = data.currentIndex || 0;
    }
    const storedRange = localStorage.getItem(RANGE_STORAGE_KEY);
    if (storedRange) {
      try {
        const parsed = JSON.parse(storedRange);
        vocabularyRange.value = Array.isArray(parsed) && parsed.length === 2 ? parsed : [1, null];
      } catch (e) {
        vocabularyRange.value = [1, null];
      }
    }
    // If no saved range, leave as [1, null] - will be set to all words when words load
  } catch (e) {
    console.error('Failed to load progress:', e);
  }
};

const saveToStorage = () => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      states: wordStates.value,
      currentIndex: currentIndex.value
    }));
  } catch (e) {
    console.error('Failed to save progress:', e);
  }
};

loadFromStorage();

// Set default range to all words when words are loaded
watch(words, (newWords) => {
  if (newWords.length > 0 && vocabularyRange.value[1] === null) {
    vocabularyRange.value = [1, newWords.length];
  }
}, { immediate: true });

const getWordState = (wordId) => {
  return wordStates.value[wordId] || { status: 'new', bookmarked: false };
};

const getNewWords = computed(() => {
  const maxRange = vocabularyRange.value[1] ?? words.value.length;
  return words.value.filter(w => {
    if (w.serialNo < vocabularyRange.value[0] || w.serialNo > maxRange) return false;
    const state = getWordState(w.serialNo);
    return state.status === 'new';
  });
});

const getLearnedWords = computed(() => {
  const maxRange = vocabularyRange.value[1] ?? words.value.length;
  return words.value.filter(w => {
    if (w.serialNo < vocabularyRange.value[0] || w.serialNo > maxRange) return false;
    const state = getWordState(w.serialNo);
    return state.status === 'learned';
  });
});

const getReviewWords = computed(() => {
  const maxRange = vocabularyRange.value[1] ?? words.value.length;
  return words.value.filter(w => {
    if (w.serialNo < vocabularyRange.value[0] || w.serialNo > maxRange) return false;
    const state = getWordState(w.serialNo);
    return state.status === 'review';
  });
});

const getBookmarkedWords = computed(() => {
  const maxRange = vocabularyRange.value[1] ?? words.value.length;
  return words.value.filter(w => {
    if (w.serialNo < vocabularyRange.value[0] || w.serialNo > maxRange) return false;
    const state = getWordState(w.serialNo);
    return state.bookmarked;
  });
});

const getProgress = computed(() => {
  const maxRange = vocabularyRange.value[1] ?? words.value.length;
  const filteredWords = words.value.filter(w =>
    w.serialNo >= vocabularyRange.value[0] && w.serialNo <= maxRange
  );
  return {
    total: filteredWords.length,
    learned: getLearnedWords.value.length,
    review: getReviewWords.value.length,
    new: getNewWords.value.length,
    bookmarked: getBookmarkedWords.value.length
  };
});

export function useWords() {
  const setWords = (wordList) => {
    words.value = wordList;
  };

  const updateWordState = (wordId, updates) => {
    const current = getWordState(wordId);
    wordStates.value[wordId] = { ...current, ...updates };
    saveToStorage();
  };

  const markAsLearned = (wordId) => {
    updateWordState(wordId, { status: 'learned' });
  };

  const markAsReview = (wordId) => {
    updateWordState(wordId, { status: 'review' });
  };

  const toggleBookmark = (wordId) => {
    const state = getWordState(wordId);
    updateWordState(wordId, { bookmarked: !state.bookmarked });
  };

  const getWordsByRoot = (root) => {
    return words.value.filter(w => w.root === root);
  };

  const nextWord = () => {
    if (currentIndex.value < words.value.length - 1) {
      currentIndex.value++;
      saveToStorage();
    }
  };

  const prevWord = () => {
    if (currentIndex.value > 0) {
      currentIndex.value--;
      saveToStorage();
    }
  };

  const setVocabularyRange = (min, max) => {
    vocabularyRange.value = [min, max];
    localStorage.setItem(RANGE_STORAGE_KEY, JSON.stringify([min, max]));
    currentIndex.value = 0; // Reset index when pool changes
    saveToStorage();
  };

  return {
    words,
    setWords,
    getWordState,
    updateWordState,
    markAsLearned,
    markAsReview,
    toggleBookmark,
    getNewWords,
    getLearnedWords,
    getReviewWords,
    getBookmarkedWords,
    getWordsByRoot,
    getProgress,
    currentIndex,
    nextWord,
    prevWord,
    vocabularyRange,
    setVocabularyRange
  };
}

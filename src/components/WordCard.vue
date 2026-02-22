<template>
  <div 
    class="word-card" 
    :class="{ 'is-revealed': meaningRevealed }"
    @click="handleTap"
  >
    <div class="card-header">
      <div class="arabic-word">{{ word.arabic }}</div>
      <button 
        class="bookmark-btn" 
        :class="{ 'is-bookmarked': isBookmarked }"
        @click.stop="handleBookmark"
        aria-label="Toggle bookmark"
      >
        <svg v-if="isBookmarked" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
          <path d="M17 3H7c-1.1 0-2 .9-2 2v16l7-3 7 3V5c0-1.1-.9-2-2-2z"/>
        </svg>
        <svg v-else width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M17 3H7c-1.1 0-2 .9-2 2v16l7-3 7 3V5c0-1.1-.9-2-2-2z"/>
          <line x1="7" y1="3" x2="7" y2="21" stroke-linecap="round"/>
        </svg>
      </button>
    </div>

    <div class="word-meta">
      <span class="root" @click.stop="handleRootClick">{{ word.root }}</span>
      <span class="frequency">{{ frequencyLabel }}</span>
    </div>

    <div class="meaning-section" :class="{ 'is-revealed': meaningRevealed }">
      <button class="reveal-btn" @click.stop="toggleMeaning">
        <span v-if="!meaningRevealed">Tap to reveal meaning</span>
        <span v-else>{{ word.meaning }}</span>
      </button>
    </div>

    <div class="ayah-section" v-if="showExample">
      <div class="ayah-ref">{{ exampleRef }}</div>
      <div class="ayah-text" v-html="highlightedAyah"></div>
    </div>

    <div class="swipe-hints">
      <span class="hint-left">← Review</span>
      <span class="hint-right">Learn →</span>
    </div>

    <div v-if="swipeFeedback" class="swipe-feedback" :class="swipeFeedback">
      {{ swipeFeedback === 'learned' ? '✓ Learned!' : '↺ Review Later' }}
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';

const props = defineProps({
  word: {
    type: Object,
    required: true
  },
  isBookmarked: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['bookmark', 'learn', 'review', 'root']);

const meaningRevealed = ref(false);
const swipeFeedback = ref(null);
const showExample = ref(true);

const checkShowMeaning = () => {
  const saved = localStorage.getItem('vocaswipe_showmeaning');
  if (saved === 'true') {
    meaningRevealed.value = true;
  } else {
    meaningRevealed.value = false;
  }
};

const checkShowExample = () => {
  const saved = localStorage.getItem('vocaswipe_showexample');
  if (saved === 'false') {
    showExample.value = false;
  } else {
    showExample.value = true;
  }
};

watch(() => props.word, () => {
  checkShowMeaning();
});

const frequencyLabel = computed(() => {
  if (!props.word.frequency) return '';
  const freq = props.word.frequency;
  if (freq >= 1000) {
    return `${(freq / 1000).toFixed(1)}k× in the Quran`;
  }
  return `${freq}× in the Quran`;
});

const exampleRef = computed(() => {
  if (!props.word.example) return '';
  return props.word.example.split('|')[0];
});

const exampleText = computed(() => {
  if (!props.word.example) return '';
  const parts = props.word.example.split('|');
  return parts[1] || parts[0];
});

const highlightedAyah = computed(() => {
  let text = exampleText.value;
  const arabic = props.word.arabic;
  
  if (text.includes(arabic)) {
    return text.replace(
      new RegExp(`(${arabic})`, 'g'),
      '<span class="highlighted">$1</span>'
    );
  }
  
  const shortArabics = text.match(/[\u0600-\u06FF]+/g) || [];
  if (shortArabics.length > 0) {
    const closest = shortArabics.reduce((prev, curr) => {
      return Math.abs(curr.length - arabic.length) < Math.abs(prev.length - arabic.length) ? curr : prev;
    });
    return text.replace(
      new RegExp(`(${closest})`, 'g'),
      '<span class="highlighted">$1</span>'
    );
  }
  
  return text;
});

const toggleMeaning = () => {
  meaningRevealed.value = !meaningRevealed.value;
};

const handleBookmark = () => {
  emit('bookmark', props.word.serialNo);
};

const handleRootClick = () => {
  emit('root', props.word.root);
};

const showFeedback = (type) => {
  swipeFeedback.value = type;
  setTimeout(() => {
    swipeFeedback.value = null;
  }, 800);
};

const handleSwipe = (direction) => {
  if (direction === 'right') {
    showFeedback('learned');
    emit('learn', props.word.serialNo);
  } else if (direction === 'left') {
    showFeedback('review');
    emit('review', props.word.serialNo);
  }
};

const handleShowMeaningChange = (e) => {
  meaningRevealed.value = e.detail;
};

const handleShowExampleChange = (e) => {
  showExample.value = e.detail;
};

onMounted(() => {
  checkShowMeaning();
  checkShowExample();
  window.addEventListener('show-meaning-changed', handleShowMeaningChange);
  window.addEventListener('show-example-changed', handleShowExampleChange);
});

onUnmounted(() => {
  window.removeEventListener('show-meaning-changed', handleShowMeaningChange);
  window.removeEventListener('show-example-changed', handleShowExampleChange);
});

defineExpose({ handleSwipe });
</script>

<style scoped>
.word-card {
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.4);
  border-radius: var(--radius-xl);
  padding: var(--space-lg);
  box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.05);
  min-height: 60vh;
  display: flex;
  flex-direction: column;
  position: relative;
  cursor: pointer;
  transition: transform 0.15s cubic-bezier(0.2, 0.8, 0.2, 1), box-shadow 0.2s ease;
}

[data-theme="dark"] .word-card {
  background: rgba(45, 45, 45, 0.7);
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.3);
}

.word-card:active {
  transform: scale(0.98);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: var(--space-xs);
}

.arabic-word {
  font-family: var(--font-arabic);
  font-size: var(--arabic-font-size);
  color: var(--color-primary);
  line-height: 1.4;
  flex: 1;
  padding-right: var(--space-md);
  margin-bottom: 0;
}

.bookmark-btn {
  color: var(--text-muted);
  padding: var(--space-xs);
  border-radius: var(--radius-sm);
  transition: all 0.2s ease;
}

.bookmark-btn:hover {
  background: var(--color-review-bg);
}

.bookmark-btn.is-bookmarked {
  color: var(--color-accent);
}

.word-meta {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-sm);
}

.root {
  color: var(--text-secondary);
  font-size: 1rem;
  cursor: pointer;
}

.root:hover {
  color: var(--color-primary);
}

.frequency {
  color: var(--text-muted);
  font-size: 0.85rem;
}

.ayah-section {
  background: var(--bg-primary);
  border-radius: var(--radius-md);
  padding: var(--space-md);
  margin-bottom: var(--space-lg);
  min-height: 20vh;
  max-height: 40vh;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
}

.ayah-ref {
  color: var(--color-primary);
  font-weight: 600;
  font-size: 0.9rem;
  margin-bottom: var(--space-sm);
}

.ayah-text {
  font-family: var(--font-arabic);
  font-size: calc(var(--arabic-font-size) * 0.7);
  line-height: 1.8;
  color: var(--text-primary);
}

.ayah-text :deep(.highlighted) {
  color: var(--color-highlight);
  background: var(--color-highlight-bg);
  padding: 2px 6px;
  border-radius: 4px;
  font-weight: 600;
}

.meaning-section {
  margin-bottom: var(--space-lg);
}

.reveal-btn {
  width: 100%;
  padding: var(--space-md);
  border-radius: var(--radius-md);
  background: var(--bg-primary);
  color: var(--text-secondary);
  font-size: 1rem;
  transition: all 0.3s ease;
}

.reveal-btn:hover {
  background: var(--color-primary);
  color: var(--text-inverse);
}

.meaning-section.is-revealed .reveal-btn {
  background: var(--color-learned-bg);
  color: var(--color-learned);
  font-size: 1.3rem;
  font-weight: 600;
  text-align: center;
}

.swipe-hints {
  display: flex;
  justify-content: space-between;
  color: var(--text-muted);
  font-size: 0.75rem;
  padding: var(--space-sm) 0;
}

.swipe-feedback {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  padding: var(--space-md) var(--space-xl);
  border-radius: var(--radius-lg);
  font-size: 1.5rem;
  font-weight: 700;
  color: white;
  animation: popIn 0.3s ease;
  z-index: 10;
}

.swipe-feedback.learned {
  background: var(--color-learned);
}

.swipe-feedback.review {
  background: var(--color-review);
}

@keyframes popIn {
  0% {
    opacity: 0;
    transform: translate(-50%, -50%) scale(0.5);
  }
  100% {
    opacity: 1;
    transform: translate(-50%, -50%) scale(1);
  }
}
</style>

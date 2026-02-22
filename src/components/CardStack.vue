<template>
  <div 
    class="card-stack" 
    ref="stackRef"
    @touchstart="handleTouchStart"
    @touchmove="handleTouchMove"
    @touchend="handleTouchEnd"
    @mousedown="handleMouseDown"
    @mousemove="handleMouseMove"
    @mouseup="handleMouseUp"
    @mouseleave="handleMouseUp"
  >
    <div 
      class="card-wrapper"
      :style="cardStyle"
      v-if="currentWord"
    >
      <WordCard
        ref="cardRef"
        :word="currentWord"
        :is-bookmarked="isCurrentBookmarked"
        @bookmark="handleBookmark"
        @learn="handleLearn"
        @review="handleReview"
        @root="handleRoot"
      />
    </div>
    
    <div class="empty-wrapper" v-show="!currentWord">
      <div class="empty-state">
        <div class="empty-icon">📭</div>
        <h3>{{ emptyTitle }}</h3>
        <p>{{ emptyMessage }}</p>
      </div>
    </div>

    <div v-if="swipeDirection" class="swipe-overlay" :class="swipeDirection">
      <span v-if="swipeDirection === 'left'">↺ Review</span>
      <span v-else-if="swipeDirection === 'right'">✓ Learned</span>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useWords } from '../composables/useWords';
import WordCard from './WordCard.vue';
import { Haptics, ImpactStyle } from '@capacitor/haptics';

const props = defineProps({
  mode: {
    type: String,
    default: 'flow'
  }
});

const emit = defineEmits(['mode-change', 'root-click']);

const { 
  getNewWords, 
  getLearnedWords,
  getReviewWords, 
  getBookmarkedWords,
  getWordState,
  markAsLearned, 
  markAsReview, 
  toggleBookmark,
  getProgress
} = useWords();

const stackRef = ref(null);
const cardRef = ref(null);
const currentIndex = ref(0);
const startX = ref(0);
const startY = ref(0);
const currentX = ref(0);
const isDragging = ref(false);
const swipeDirection = ref(null);

const currentWords = computed(() => {
  switch (props.mode) {
    case 'learned':
      return getLearnedWords.value;
    case 'review':
      return getReviewWords.value;
    case 'bookmarks':
      return getBookmarkedWords.value;
    default:
      return getNewWords.value;
  }
});

const currentWord = computed(() => {
  if (currentWords.value.length === 0) return null;
  const idx = currentIndex.value % currentWords.value.length;
  return currentWords.value[idx];
});

const isCurrentBookmarked = computed(() => {
  if (!currentWord.value) return false;
  return getWordState(currentWord.value.serialNo).bookmarked;
});

const emptyTitle = computed(() => {
  switch (props.mode) {
    case 'learned': return 'No learned words yet';
    case 'review': return 'No words to review';
    case 'bookmarks': return 'No bookmarks yet';
    default: return 'All done!';
  }
});

const emptyMessage = computed(() => {
  switch (props.mode) {
    case 'learned': return 'Swipe right on words to mark them as learned';
    case 'review': return 'Words marked for review will appear here';
    case 'bookmarks': return 'Tap the bookmark icon to save words';
    default: return 'You\'ve seen all the words in this mode';
  }
});

const cardStyle = computed(() => {
  if (!isDragging.value || !currentX.value) return {};
  
  const rotate = currentX.value * 0.06; // slightly more rotation for better physics
  const opacity = 1 - (Math.abs(currentX.value) / window.innerWidth);
  
  return {
    transform: `translateX(${currentX.value}px) rotate(${rotate}deg)`,
    opacity: Math.max(opacity, 0.1)
  };
});

const handleTouchStart = (e) => {
  startX.value = e.touches[0].clientX;
  startY.value = e.touches[0].clientY;
  isDragging.value = true;
};

const handleTouchMove = async (e) => {
  if (!isDragging.value) return;
  
  const deltaX = e.touches[0].clientX - startX.value;
  const deltaY = e.touches[0].clientY - startY.value;
  
  if (Math.abs(deltaX) > Math.abs(deltaY)) {
    e.preventDefault();
    currentX.value = deltaX;
    
    const previousDirection = swipeDirection.value;
    updateSwipeDirection();
    
    // Trigger lightweight haptic feedback when crossing the threshold
    if (swipeDirection.value && swipeDirection.value !== previousDirection) {
      try {
        await Haptics.impact({ style: ImpactStyle.Light });
      } catch (err) {} // Ignore error on non-native platform
    }
  }
};

const handleTouchEnd = () => {
  handleSwipeEnd();
};

const handleMouseDown = (e) => {
  startX.value = e.clientX;
  startY.value = e.clientY;
  isDragging.value = true;
};

const handleMouseMove = async (e) => {
  if (!isDragging.value) return;
  
  const deltaX = e.clientX - startX.value;
  const deltaY = e.clientY - startY.value;
  
  if (Math.abs(deltaX) > Math.abs(deltaY)) {
    currentX.value = deltaX;
    
    const previousDirection = swipeDirection.value;
    updateSwipeDirection();
    
    if (swipeDirection.value && swipeDirection.value !== previousDirection) {
      try {
        await Haptics.impact({ style: ImpactStyle.Light });
      } catch (err) {}
    }
  }
};

const handleMouseUp = () => {
  handleSwipeEnd();
};

const updateSwipeDirection = () => {
  if (currentX.value > 50) {
    swipeDirection.value = 'right';
  } else if (currentX.value < -50) {
    swipeDirection.value = 'left';
  } else {
    swipeDirection.value = null;
  }
};

const handleSwipeEnd = () => {
  if (!isDragging.value) return;
  
  const threshold = 100;
  
  if (currentX.value > threshold) {
    handleLearn(currentWord.value?.serialNo);
  } else if (currentX.value < -threshold) {
    handleReview(currentWord.value?.serialNo);
  }
  
  currentX.value = 0;
  isDragging.value = false;
  swipeDirection.value = null;
};

const handleLearn = (wordId) => {
  if (wordId) {
    markAsLearned(wordId);
    animateCardOut('right');
  }
};

const handleReview = (wordId) => {
  if (wordId) {
    markAsReview(wordId);
    animateCardOut('left');
  }
};

const handleBookmark = (wordId) => {
  toggleBookmark(wordId);
};

const handleRoot = (root) => {
  emit('root-click', root);
};

const animateCardOut = async (direction) => {
  const finalX = direction === 'right' ? window.innerWidth : -window.innerWidth;
  
  const card = stackRef.value?.querySelector('.card-wrapper');
  if (card) {
    card.style.transition = 'all 0.3s cubic-bezier(0.2, 0.8, 0.2, 1)';
    card.style.transform = `translateX(${finalX}px) rotate(${finalX * 0.05}deg)`;
    card.style.opacity = '0';
  }
  
  try {
    await Haptics.impact({ style: ImpactStyle.Heavy });
  } catch(err) {}
  
  setTimeout(() => {
    // If we're marking as 'learned' or 'review', the current array shrinks.
    // So we shouldn't increment currentIndex if the item was removed.
    // However, if we swipe something that doesn't disappear from the current mode
    // (like if we're in "bookmarks" and mark as learned, it stays bookmarked),
    // we would theoretically need to skip it. But actually, "markAsLearned" only changes state,
    // so if the current mode filters it out, the length shrinks.
    // Let's just reset the style and rely on Vue reactivity to show the next card.
    
    if (card) {
      card.style.transition = '';
      card.style.transform = '';
      card.style.opacity = '';
    }
  }, 300);
};

onMounted(() => {
  currentIndex.value = 0;
});
</script>

<style scoped>
.card-stack {
  position: relative;
  width: 100%;
  min-width: 100%;
  max-width: 400px;
  margin: 0 auto;
  touch-action: none;
  user-select: none;
  box-sizing: border-box;
}

.card-wrapper {
  width: 100%;
  min-width: 100%;
  transition: transform 0.1s ease-out;
  position: relative;
  z-index: 2;
}

.empty-wrapper {
  width: 100%;
  min-width: 100%;
  box-sizing: border-box;
  position: absolute;
  top: 0;
  left: 0;
  z-index: 1;
}

.empty-state {
  text-align: center;
  padding: var(--space-xl);
  color: var(--text-secondary);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: var(--bg-card);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-lg);
  box-sizing: border-box;
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: var(--space-md);
}

.empty-state h3 {
  font-size: 1.5rem;
  margin-bottom: var(--space-sm);
  color: var(--text-primary);
}

.empty-state p {
  color: var(--text-muted);
}

.swipe-overlay {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  padding: var(--space-md) var(--space-xl);
  border-radius: var(--radius-lg);
  font-size: 1.5rem;
  font-weight: 700;
  color: white;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.2s ease;
  z-index: 100;
}

.swipe-overlay.left {
  background: var(--color-review);
}

.swipe-overlay.right {
  background: var(--color-learned);
}

.swipe-overlay:not(.swipe-overlay) {
  opacity: 0;
}

.swipe-overlay.left:not(.left),
.swipe-overlay.right:not(.right) {
  opacity: 0;
}
</style>

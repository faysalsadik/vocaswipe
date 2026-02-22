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
    <!-- Next card (behind) -->
    <div 
      v-if="nextWord"
      class="card-wrapper next-card"
    >
      <WordCard
        :word="nextWord"
        :is-bookmarked="isNextBookmarked"
      />
    </div>

    <!-- Current card -->
    <div 
      class="card-wrapper"
      :class="{ 
        'swiping-left': swipeDirection === 'left', 
        'swiping-right': swipeDirection === 'right',
        'is-animating': isAnimating
      }"
      :style="cardStyle"
      v-if="currentWord"
    >
      <div class="card-overlay" :class="swipeDirection" :style="overlayStyle"></div>
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

    <!-- Swipe labels -->
    <div 
      class="swipe-label label-learn" 
      :class="{ visible: swipeDirection === 'right' }"
      :style="labelStyle"
    >
      <span>✓ LEARNED</span>
    </div>
    <div 
      class="swipe-label label-review" 
      :class="{ visible: swipeDirection === 'left' }"
      :style="labelStyle"
    >
      <span>↺ REVIEW</span>
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
const isAnimating = ref(false);
const threshold = 100;

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

const nextWord = computed(() => {
  if (currentWords.value.length <= 1) return null;
  const nextIdx = (currentIndex.value + 1) % currentWords.value.length;
  return currentWords.value[nextIdx];
});

const isCurrentBookmarked = computed(() => {
  if (!currentWord.value) return false;
  return getWordState(currentWord.value.serialNo).bookmarked;
});

const isNextBookmarked = computed(() => {
  if (!nextWord.value) return false;
  return getWordState(nextWord.value.serialNo).bookmarked;
});

const swipeProgress = computed(() => {
  return Math.min(Math.abs(currentX.value) / threshold, 1);
});

const overlayStyle = computed(() => {
  const progress = swipeProgress.value;
  if (!swipeDirection.value) return { opacity: 0 };
  
  if (swipeDirection.value === 'right') {
    return { 
      opacity: progress * 0.4,
      background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.3) 0%, rgba(34, 197, 94, 0.1) 100%)'
    };
  } else {
    return { 
      opacity: progress * 0.4,
      background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.3) 0%, rgba(239, 68, 68, 0.1) 100%)'
    };
  }
});

const labelStyle = computed(() => {
  const progress = swipeProgress.value;
  const scale = 0.5 + (progress * 0.5);
  const opacity = Math.max(0, (progress - 0.3) / 0.7);
  
  return {
    opacity,
    transform: `translate(-50%, -50%) scale(${scale})`
  };
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
  if (!isDragging.value && !isAnimating.value) return {};
  
  const rotate = currentX.value * 0.04;
  const scale = 1 - (Math.abs(currentX.value) / window.innerWidth * 0.1);
  
  return {
    transform: `translateX(${currentX.value}px) rotate(${rotate}deg) scale(${Math.max(scale, 0.9)})`
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
  
  if (Math.abs(currentX.value) > threshold) {
    // Swipe successful - animate out
    if (currentX.value > threshold) {
      animateCardOut('right');
    } else {
      animateCardOut('left');
    }
  } else {
    // Swipe cancelled - spring back to center
    springBack();
  }
  
  isDragging.value = false;
};

const springBack = async () => {
  isAnimating.value = true;
  const startX = currentX.value;
  const duration = 300;
  const startTime = performance.now();
  
  const animate = (currentTime) => {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    
    // Ease out cubic
    const eased = 1 - Math.pow(1 - progress, 3);
    currentX.value = startX * (1 - eased);
    
    updateSwipeDirection();
    
    if (progress < 1) {
      requestAnimationFrame(animate);
    } else {
      currentX.value = 0;
      swipeDirection.value = null;
      isAnimating.value = false;
    }
  };
  
  requestAnimationFrame(animate);
};

const handleLearn = (wordId) => {
  if (wordId) {
    markAsLearned(wordId);
  }
};

const handleReview = (wordId) => {
  if (wordId) {
    markAsReview(wordId);
  }
};

const handleBookmark = (wordId) => {
  toggleBookmark(wordId);
};

const handleRoot = (root) => {
  emit('root-click', root);
};

const animateCardOut = async (direction) => {
  isAnimating.value = true;
  const startX = currentX.value;
  const finalX = direction === 'right' ? window.innerWidth * 1.5 : -window.innerWidth * 1.5;
  const duration = 250;
  const startTime = performance.now();
  
  try {
    await Haptics.impact({ style: ImpactStyle.Heavy });
  } catch(err) {}
  
  const animate = (currentTime) => {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    
    // Ease in cubic
    const eased = progress * progress * progress;
    currentX.value = startX + (finalX - startX) * eased;
    
    if (progress < 1) {
      requestAnimationFrame(animate);
    } else {
      // Animation complete - reset state
      currentX.value = 0;
      swipeDirection.value = null;
      isAnimating.value = false;
      currentIndex.value++;
    }
  };
  
  requestAnimationFrame(animate);
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

.card-wrapper.next-card {
  position: absolute;
  top: 0;
  left: 0;
  transform: scale(0.92) translateY(10px);
  z-index: 1;
  opacity: 0.7;
  pointer-events: none;
}

.card-wrapper.swiping-left,
.card-wrapper.swiping-right {
  z-index: 10;
}

.card-wrapper.is-animating {
  transition: none;
}

.card-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  border-radius: var(--radius-xl);
  pointer-events: none;
  z-index: 5;
  opacity: 0;
  transition: opacity 0.15s ease;
}

.card-overlay.left {
  background: linear-gradient(135deg, rgba(239, 68, 68, 0.4) 0%, rgba(239, 68, 68, 0.1) 100%);
}

.card-overlay.right {
  background: linear-gradient(135deg, rgba(34, 197, 94, 0.4) 0%, rgba(34, 197, 94, 0.1) 100%);
}

.swipe-label {
  position: absolute;
  top: 40%;
  left: 50%;
  transform: translate(-50%, -50%) scale(0.5);
  padding: var(--space-md) var(--space-xl);
  border-radius: var(--radius-lg);
  font-size: 1.5rem;
  font-weight: 800;
  letter-spacing: 2px;
  opacity: 0;
  pointer-events: none;
  z-index: 100;
  white-space: nowrap;
  border: 3px solid;
}

.swipe-label.visible {
  opacity: 1;
}

.label-learn {
  color: var(--color-learned);
  background: rgba(255, 255, 255, 0.9);
  border-color: var(--color-learned);
  box-shadow: 0 0 20px rgba(34, 197, 94, 0.5);
}

.label-review {
  color: var(--color-review);
  background: rgba(255, 255, 255, 0.9);
  border-color: var(--color-review);
  box-shadow: 0 0 20px rgba(239, 68, 68, 0.5);
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
</style>

<template>
  <Transition name="fade">
    <div v-if="isOpen" class="root-explorer">
      <div class="explorer-header">
        <button class="back-btn" @click="$emit('close')">
          ← Back
        </button>
        <h3>{{ root }}</h3>
      </div>
      
      <div class="root-words">
        <div 
          v-for="word in wordsWithRoot" 
          :key="word.serialNo"
          class="root-word-item"
          @click="selectWord(word)"
        >
          <span class="word-arabic">{{ word.arabic }}</span>
          <span class="word-meaning">{{ word.meaning }}</span>
          <span class="word-frequency">{{ word.frequency }}×</span>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { computed } from 'vue';
import { useWords } from '../composables/useWords';

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false
  },
  root: {
    type: String,
    default: ''
  }
});

const emit = defineEmits(['close', 'select']);

const { words, getWordsByRoot } = useWords();

const wordsWithRoot = computed(() => {
  return getWordsByRoot(props.root);
});

const selectWord = (word) => {
  emit('select', word);
};
</script>

<style scoped>
.root-explorer {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: var(--bg-primary);
  z-index: 2000;
  overflow-y: auto;
}

.explorer-header {
  display: flex;
  align-items: center;
  gap: var(--space-md);
  padding: var(--space-md);
  background: var(--bg-card);
  box-shadow: var(--shadow-md);
  position: sticky;
  top: 0;
}

.back-btn {
  padding: var(--space-sm) var(--space-md);
  background: var(--bg-primary);
  border-radius: var(--radius-sm);
  color: var(--text-primary);
  font-weight: 500;
}

.explorer-header h3 {
  font-size: 1.2rem;
  color: var(--color-primary);
}

.root-words {
  padding: var(--space-md);
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
}

.root-word-item {
  display: flex;
  align-items: center;
  gap: var(--space-md);
  padding: var(--space-md);
  background: var(--bg-card);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all 0.2s ease;
}

.root-word-item:hover {
  transform: translateX(4px);
  box-shadow: var(--shadow-md);
}

.word-arabic {
  font-family: var(--font-arabic);
  font-size: 1.5rem;
  color: var(--color-primary);
  min-width: 80px;
}

.word-meaning {
  flex: 1;
  color: var(--text-primary);
}

.word-frequency {
  font-size: 0.8rem;
  color: var(--text-muted);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>

<template>
  <div class="mode-tabs">
    <button 
      v-for="tab in tabs" 
      :key="tab.id"
      class="tab-btn"
      :class="{ active: modelValue === tab.id }"
      @click="$emit('update:modelValue', tab.id)"
    >
      <span class="tab-icon">{{ tab.icon }}</span>
      <span class="tab-label">{{ tab.label }}</span>
      <span v-if="tab.count !== undefined" class="tab-count">{{ tab.count }}</span>
    </button>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useWords } from '../composables/useWords';

const props = defineProps({
  modelValue: {
    type: String,
    default: 'flow'
  }
});

defineEmits(['update:modelValue']);

const { getProgress } = useWords();

const tabs = computed(() => [
  { id: 'flow', label: 'Flow', icon: '📖', count: getProgress.value.new },
  { id: 'learned', label: 'Learned', icon: '✓', count: getProgress.value.learned },
  { id: 'review', label: 'Review', icon: '🔄', count: getProgress.value.review },
  { id: 'bookmarks', label: 'Saved', icon: '🔖', count: getProgress.value.bookmarked }
]);
</script>

<style scoped>
.mode-tabs {
  display: flex;
  gap: var(--space-sm);
  padding: var(--space-sm);
  background: rgba(255, 255, 255, 0.6);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-md);
}

[data-theme="dark"] .mode-tabs {
  background: rgba(45, 45, 45, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.tab-btn {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-xs);
  padding: var(--space-sm) var(--space-md);
  border-radius: var(--radius-md);
  color: var(--text-secondary);
  transition: all 0.2s ease;
}

.tab-btn:hover {
  background: var(--bg-primary);
}

.tab-btn.active {
  background: var(--color-primary);
  color: var(--text-inverse);
}

.tab-icon {
  font-size: 1.25rem;
}

.tab-label {
  font-size: 0.8rem;
  font-weight: 500;
}

.tab-count {
  font-size: 0.7rem;
  padding: 2px 6px;
  background: rgba(255,255,255,0.2);
  border-radius: 10px;
}

.tab-btn:not(.active) .tab-count {
  background: var(--color-review-bg);
  color: var(--color-review);
}
</style>

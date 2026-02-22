<template>
  <div class="progress-bar">
    <div class="progress-stats">
      <span class="stat">
        <span class="stat-value">{{ progress.learned }}</span>
        <span class="stat-label">Learned</span>
      </span>
      <span class="stat">
        <span class="stat-value">{{ progress.review }}</span>
        <span class="stat-label">Review</span>
      </span>
      <span class="stat">
        <span class="stat-value">{{ progress.total }}</span>
        <span class="stat-label">Total</span>
      </span>
    </div>
    <div class="progress-track">
      <div 
        class="progress-fill learned" 
        :style="{ width: learnedPercent + '%' }"
      ></div>
      <div 
        class="progress-fill review" 
        :style="{ width: reviewPercent + '%' }"
      ></div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useWords } from '../composables/useWords';

const { getProgress } = useWords();
const progress = computed(() => getProgress.value);

const learnedPercent = computed(() => {
  if (progress.value.total === 0) return 0;
  return (progress.value.learned / progress.value.total) * 100;
});

const reviewPercent = computed(() => {
  if (progress.value.total === 0) return 0;
  return (progress.value.review / progress.value.total) * 100;
});
</script>

<style scoped>
.progress-bar {
  padding: var(--space-sm) var(--space-md);
  background: var(--bg-card);
  border-radius: var(--radius-md);
}

.progress-stats {
  display: flex;
  justify-content: space-around;
  margin-bottom: var(--space-sm);
}

.stat {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stat-value {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--text-primary);
}

.stat-label {
  font-size: 0.7rem;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.progress-track {
  height: 6px;
  background: var(--bg-primary);
  border-radius: 3px;
  overflow: hidden;
  display: flex;
}

.progress-fill {
  height: 100%;
  transition: width 0.3s ease;
}

.progress-fill.learned {
  background: var(--color-learned);
}

.progress-fill.review {
  background: var(--color-review);
}
</style>

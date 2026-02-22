<script setup>
import { ref, onMounted, computed } from 'vue';
import { useWords } from './composables/useWords';
import CardStack from './components/CardStack.vue';
import ModeTabs from './components/ModeTabs.vue';
import ProgressBar from './components/ProgressBar.vue';
import SettingsPanel from './components/SettingsPanel.vue';
import RootExplorer from './components/RootExplorer.vue';

const { setWords, words } = useWords();

const currentMode = ref('flow');
const isLoading = ref(true);
const showRootExplorer = ref(false);
const selectedRoot = ref('');

const loadWords = async () => {
  try {
    const response = await fetch('/words.json');
    const data = await response.json();
    setWords(data);
  } catch (error) {
    console.error('Failed to load words:', error);
  } finally {
    isLoading.value = false;
  }
};

const handleRootClick = (root) => {
  selectedRoot.value = root;
  showRootExplorer.value = true;
};

const handleRootSelect = (word) => {
  showRootExplorer.value = false;
};

onMounted(() => {
  loadWords();
});
</script>

<template>
  <div class="app">
    <header class="app-header">
      <div class="header-spacer"></div>
      <div class="logo">
        <span class="logo-icon">📖</span>
        <span class="logo-text">VocaSwipe</span>
      </div>
      <SettingsPanel />
    </header>

    <ProgressBar />

    <main class="app-main">
      <ModeTabs v-model="currentMode" />
      
      <div v-if="isLoading" class="loading">
        <div class="loading-spinner"></div>
        <p>Loading vocabulary...</p>
      </div>
      
      <CardStack 
        v-else
        :mode="currentMode"
        @root-click="handleRootClick"
      />
    </main>

    <RootExplorer 
      :is-open="showRootExplorer"
      :root="selectedRoot"
      @close="showRootExplorer = false"
      @select="handleRootSelect"
    />
  </div>
</template>

<style>
@import './assets/base.css';

.app {
  flex: 1;
  width: 100%;
  display: flex;
  flex-direction: column;
  max-width: 480px;
  margin: 0 auto;
  background: transparent;
  position: relative;
}

.app-header {
  padding: var(--space-md);
  padding-top: calc(env(safe-area-inset-top, 10px) + var(--space-md));
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.header-spacer {
  width: 40px;
}

.logo {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-sm);
}

.logo-icon {
  font-size: 1.5rem;
}

.logo-text {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--color-primary);
}

.app-main {
  flex: 1;
  padding: var(--space-md);
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}

.loading {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--space-md);
  color: var(--text-secondary);
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid var(--border-color);
  border-top-color: var(--color-primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.empty {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-muted);
}
</style>

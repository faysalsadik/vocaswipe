<template>
  <div class="settings-panel">
    <button class="settings-toggle" @click="isOpen = !isOpen">
      <span>⚙️</span>
    </button>
    
    <Transition name="slide">
      <div v-if="isOpen" class="settings-menu">
        <div class="setting-group">
          <label>Dark Mode</label>
          <button 
            class="toggle-btn" 
            :class="{ active: isDark }"
            @click="toggleTheme"
          >
            <span class="toggle-track">
              <span class="toggle-thumb"></span>
            </span>
          </button>
        </div>

        <div class="setting-group">
          <label>Auto Reveal</label>
          <button 
            class="toggle-btn" 
            :class="{ active: showMeaning }"
            @click="toggleShowMeaning"
          >
            <span class="toggle-track">
              <span class="toggle-thumb"></span>
            </span>
          </button>
        </div>

        <div class="setting-group">
          <label>Example</label>
          <button 
            class="toggle-btn" 
            :class="{ active: showExample }"
            @click="toggleShowExample"
          >
            <span class="toggle-track">
              <span class="toggle-thumb"></span>
            </span>
          </button>
        </div>
        
        <div class="setting-group column-group">
          <label>Font Size</label>
          <div class="font-size-controls">
            <button 
              v-for="size in fontSizes" 
              :key="size.value"
              class="size-btn"
              :class="{ active: currentFontSize === size.value }"
              @click="setFontSize(size.value)"
            >
              {{ size.label }}
            </button>
          </div>
        </div>
        <div class="setting-group column-group">
          <label class="slider-label">
            Focus
            <span class="slider-value">{{ localMin }} - {{ currentMaxLabel }}</span>
          </label>
          <div class="slider-container double-slider">
            <div class="slider-track"></div>
            <input 
              type="range" 
              min="1" 
              :max="maxWords" 
              step="1"
              v-model.number="localMin"
              @change="applyVocabularyRange"
              class="vocab-slider vocab-slider-min"
            />
            <input 
              type="range" 
              min="1" 
              :max="maxWords" 
              step="1"
              v-model.number="localMax"
              @change="applyVocabularyRange"
              class="vocab-slider vocab-slider-max"
            />
            <div class="slider-marks">
              <span>1</span>
              <span>{{ maxWords }}</span>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import { Capacitor } from '@capacitor/core';
import { StatusBar, Style } from '@capacitor/status-bar';
import { useWords } from '../composables/useWords';

const { words, vocabularyRange, setVocabularyRange } = useWords();

const isOpen = ref(false);
const isDark = ref(false);
const currentFontSize = ref('medium');
const showMeaning = ref(false);
const showExample = ref(true);

const maxWords = computed(() => words.value.length > 0 ? words.value.length : 1475);

const localMin = ref(1);
const localMax = ref(null);

const currentMaxLabel = computed(() => {
  return localMax.value >= maxWords.value ? maxWords.value : localMax.value;
});

watch(maxWords, (newVal) => {
  if (localMax.value === null) {
    localMax.value = newVal;
  }
});

const applyVocabularyRange = () => {
  // Enforce min < max
  if (localMin.value > localMax.value) {
    const temp = localMin.value;
    localMin.value = localMax.value;
    localMax.value = temp;
  }
  setVocabularyRange(localMin.value, localMax.value >= maxWords.value ? Infinity : localMax.value);
};

const fontSizes = [
  { value: 'small', label: 'S' },
  { value: 'medium', label: 'M' },
  { value: 'large', label: 'L' },
  { value: 'xlarge', label: 'XL' }
];

const updateStatusBarStyle = async (isDarkMode) => {
  if (Capacitor.isNativePlatform()) {
    try {
      await StatusBar.setStyle({ style: isDarkMode ? Style.Dark : Style.Light });
      // Optional: Set overlay if needed, but safe areas are more consistent
      await StatusBar.setOverlaysWebView({ overlay: true });
    } catch (e) {
      console.warn('StatusBar configuration failed', e);
    }
  }
};

const toggleTheme = () => {
  isDark.value = !isDark.value;
  document.documentElement.setAttribute('data-theme', isDark.value ? 'dark' : 'light');
  localStorage.setItem('vocaswipe_theme', isDark.value ? 'dark' : 'light');
  updateStatusBarStyle(isDark.value);
};

const toggleShowMeaning = () => {
  showMeaning.value = !showMeaning.value;
  localStorage.setItem('vocaswipe_showmeaning', showMeaning.value ? 'true' : 'false');
  window.dispatchEvent(new CustomEvent('show-meaning-changed', { detail: showMeaning.value }));
};

const toggleShowExample = () => {
  showExample.value = !showExample.value;
  localStorage.setItem('vocaswipe_showexample', showExample.value ? 'true' : 'false');
  window.dispatchEvent(new CustomEvent('show-example-changed', { detail: showExample.value }));
};

const setFontSize = (size) => {
  currentFontSize.value = size;
  document.documentElement.setAttribute('data-font-size', size);
  localStorage.setItem('vocaswipe_fontsize', size);
};

onMounted(() => {
  const savedTheme = localStorage.getItem('vocaswipe_theme');
  if (savedTheme === 'dark') {
    isDark.value = true;
    document.documentElement.setAttribute('data-theme', 'dark');
  }
  updateStatusBarStyle(isDark.value);
  
  const savedFontSize = localStorage.getItem('vocaswipe_fontsize');
  if (savedFontSize) {
    currentFontSize.value = savedFontSize;
    document.documentElement.setAttribute('data-font-size', savedFontSize);
  }

  const savedShowMeaning = localStorage.getItem('vocaswipe_showmeaning');
  if (savedShowMeaning === 'true') {
    showMeaning.value = true;
  }

  const savedShowExample = localStorage.getItem('vocaswipe_showexample');
  if (savedShowExample === 'false') {
    showExample.value = false;
  }
  
  // Sync initial slider values
  const storedMin = vocabularyRange.value[0];
  const storedMax = vocabularyRange.value[1] === Infinity ? maxWords.value : Math.min(vocabularyRange.value[1], maxWords.value);
  localMin.value = storedMin;
  localMax.value = storedMax || maxWords.value;
});
</script>

<style scoped>
.settings-panel {
  position: relative;
  z-index: 1000;
}

.settings-toggle {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: var(--bg-card);
  box-shadow: var(--shadow-md);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  transition: transform 0.2s ease;
}

.settings-toggle:hover {
  transform: rotate(90deg);
}

.settings-menu {
  position: absolute;
  top: 50px;
  right: 0;
  width: 200px;
  background: var(--bg-card);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-lg);
  padding: var(--space-md);
}

.setting-group {
  margin-bottom: var(--space-md);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.setting-group:last-child {
  margin-bottom: 0;
}

.setting-group label {
  font-size: 0.9rem;
  color: var(--text-primary);
  font-weight: 500;
}

.setting-group.column-group {
  flex-direction: column;
  align-items: stretch;
}

.setting-group.column-group label {
  margin-bottom: var(--space-sm);
}

.toggle-btn {
  width: 50px;
  height: 28px;
  padding: 2px;
}

.toggle-track {
  display: block;
  width: 100%;
  height: 100%;
  background: var(--bg-primary);
  border-radius: 14px;
  position: relative;
  transition: background 0.2s ease;
}

.toggle-btn.active .toggle-track {
  background: var(--color-primary);
}

.toggle-thumb {
  position: absolute;
  top: 2px;
  left: 2px;
  width: 24px;
  height: 24px;
  background: white;
  border-radius: 50%;
  transition: transform 0.2s ease;
  box-shadow: var(--shadow-sm);
}

.toggle-btn.active .toggle-thumb {
  transform: translateX(22px);
}

.font-size-controls {
  display: flex;
  gap: var(--space-xs);
}

.size-btn {
  flex: 1;
  padding: var(--space-xs) var(--space-sm);
  border-radius: var(--radius-sm);
  background: var(--bg-primary);
  color: var(--text-secondary);
  font-size: 0.8rem;
  font-weight: 600;
  transition: all 0.2s ease;
}

.size-btn:hover {
  background: var(--color-review-bg);
}

.size-btn.active {
  background: var(--color-primary);
  color: var(--text-inverse);
}

.slider-label {
  display: flex !important;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.slider-value {
  color: var(--color-primary);
  font-weight: 700;
  font-size: 0.8rem;
  background: var(--bg-primary);
  padding: 2px 8px;
  border-radius: 12px;
}

.double-slider {
  position: relative;
  height: 50px;
}

.slider-track {
  position: absolute;
  top: 15px;
  width: 100%;
  height: 6px;
  background: var(--bg-primary);
  border-radius: 3px;
}

.vocab-slider {
  position: absolute;
  top: 15px;
  -webkit-appearance: none;
  width: 100%;
  height: 6px;
  background: transparent;
  outline: none;
  margin: 0;
  pointer-events: none;
}

.vocab-slider::-webkit-slider-thumb {
  pointer-events: all;
  -webkit-appearance: none;
  appearance: none;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: var(--color-primary);
  cursor: pointer;
  box-shadow: 0 2px 6px rgba(102, 126, 234, 0.4);
  transition: transform 0.1s;
  position: relative;
  z-index: 2;
}

.vocab-slider::-webkit-slider-thumb:active {
  transform: scale(1.2);
  z-index: 3;
}

.slider-marks {
  position: absolute;
  top: 35px;
  width: 100%;
  display: flex;
  justify-content: space-between;
  font-size: 0.7rem;
  color: var(--text-muted);
  padding: 0 4px;
}

.slide-enter-active,
.slide-leave-active {
  transition: all 0.2s ease;
}

.slide-enter-from,
.slide-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>

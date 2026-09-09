<script setup>
import { TYPE_COLORS } from '../types.js'

defineProps({
  pokemon: { type: Object, required: true },
})

defineEmits(['select'])
</script>

<template>
  <button class="card" :style="{ '--type-color': TYPE_COLORS[pokemon.types[0]] }" @click="$emit('select', pokemon.id)">
    <span v-if="pokemon.captured" class="captured-badge">Capturé</span>
    <div class="card-image">
      <img v-if="pokemon.image" :src="pokemon.image" :alt="pokemon.name" />
      <span v-else class="no-image">{{ pokemon.name.slice(0, 1) }}</span>
    </div>
    <div class="card-info">
      <span class="number">#{{ String(pokemon.number).padStart(3, '0') }}</span>
      <h3>{{ pokemon.name }}</h3>
      <div class="types">
        <span v-for="type in pokemon.types" :key="type" class="type" :style="{ background: TYPE_COLORS[type] }">
          {{ type }}
        </span>
      </div>
    </div>
  </button>
</template>

<style scoped>
.card {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 20px 16px;
  border: 1px solid var(--border);
  border-top: 4px solid var(--type-color, var(--accent));
  border-radius: 12px;
  background: var(--card-bg);
  cursor: pointer;
  transition: transform 0.15s, box-shadow 0.15s;
}

.card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow);
}

.captured-badge {
  position: absolute;
  top: 10px;
  right: 10px;
  font-size: 11px;
  padding: 2px 8px;
  border-radius: 999px;
  background: var(--accent-bg);
  color: var(--accent);
}

.card-image {
  width: 110px;
  height: 110px;
  border-radius: 50%;
  background: var(--image-bg);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.card-image img {
  width: 90%;
  height: 90%;
  object-fit: contain;
}

.no-image {
  font-size: 48px;
  font-weight: bold;
  color: var(--accent);
}

.card-info {
  text-align: center;
}

.number {
  font-family: var(--mono);
  font-size: 13px;
  color: var(--text-muted);
}

h3 {
  margin: 4px 0 8px;
  font-size: 18px;
  color: var(--text-h);
  text-transform: capitalize;
}

.types {
  display: flex;
  gap: 6px;
  justify-content: center;
}

.type {
  font-size: 11px;
  font-weight: 600;
  color: white;
  padding: 2px 10px;
  border-radius: 999px;
  text-transform: uppercase;
  letter-spacing: 0.4px;
}
</style>

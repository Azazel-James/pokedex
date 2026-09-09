<script setup>
import { TYPE_COLORS } from '../types.js'

defineProps({
  pokemon: { type: Object, required: true },
})

defineEmits(['close', 'edit', 'remove', 'toggleCaptured'])
</script>

<template>
  <div class="overlay" @click.self="$emit('close')">
    <article class="detail" :style="{ '--type-color': TYPE_COLORS[pokemon.types[0]] }">
      <button class="close" aria-label="Fermer" @click="$emit('close')">×</button>

      <div class="detail-image">
        <img v-if="pokemon.image" :src="pokemon.image" :alt="pokemon.name" />
        <span v-else class="no-image">{{ pokemon.name.slice(0, 1) }}</span>
      </div>

      <div class="detail-info">
        <div class="head">
          <span class="number">#{{ String(pokemon.number).padStart(3, '0') }}</span>
          <div class="types">
            <span v-for="type in pokemon.types" :key="type" class="type" :style="{ background: TYPE_COLORS[type] }">
              {{ type }}
            </span>
          </div>
        </div>

        <h2>{{ pokemon.name }}</h2>

        <p v-if="pokemon.description" class="description">{{ pokemon.description }}</p>

        <div class="stats">
          <div class="stat">
            <span class="stat-label">Taille</span>
            <span class="stat-value">{{ pokemon.height || '—' }}</span>
          </div>
          <div class="stat">
            <span class="stat-label">Poids</span>
            <span class="stat-value">{{ pokemon.weight || '—' }}</span>
          </div>
        </div>

        <div class="actions">
          <button class="btn" :class="{ captured: pokemon.captured }" @click="$emit('toggleCaptured', pokemon.id)">
            {{ pokemon.captured ? 'Relâcher' : 'Capturer' }}
          </button>
          <button class="btn" @click="$emit('edit', pokemon.id)">Modifier</button>
          <button class="btn danger" @click="$emit('remove', pokemon.id)">Supprimer</button>
        </div>
      </div>
    </article>
  </div>
</template>

<style scoped>
.overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  z-index: 20;
}

.detail {
  position: relative;
  display: flex;
  gap: 24px;
  width: 100%;
  max-width: 620px;
  background: var(--card-bg);
  border: 1px solid var(--border);
  border-top: 4px solid var(--type-color, var(--accent));
  border-radius: 16px;
  padding: 28px;
  box-shadow: var(--shadow);
}

@media (max-width: 640px) {
  .detail {
    flex-direction: column;
    text-align: center;
  }
}

.close {
  position: absolute;
  top: 10px;
  right: 14px;
  font-size: 26px;
  line-height: 1;
  background: none;
  border: none;
  color: var(--text-muted);
  cursor: pointer;
}

.detail-image {
  width: 180px;
  height: 180px;
  min-width: 180px;
  border-radius: 50%;
  background: var(--image-bg);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.detail-image img {
  width: 92%;
  height: 92%;
  object-fit: contain;
}

.no-image {
  font-size: 72px;
  font-weight: bold;
  color: var(--accent);
}

.detail-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.number {
  font-family: var(--mono);
  color: var(--text-muted);
}

.types {
  display: flex;
  gap: 6px;
}

.type {
  font-size: 12px;
  font-weight: 600;
  color: white;
  padding: 3px 12px;
  border-radius: 999px;
  text-transform: uppercase;
  letter-spacing: 0.4px;
}

h2 {
  margin: 0;
  color: var(--text-h);
  font-size: 28px;
  text-transform: capitalize;
}

.description {
  color: var(--text);
  line-height: 1.5;
}

.stats {
  display: flex;
  gap: 12px;
}

.stat {
  flex: 1;
  border: 1px solid var(--border);
  border-radius: 10px;
  padding: 10px 14px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
}

.stat-label {
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.4px;
  color: var(--text-muted);
}

.stat-value {
  font-weight: 600;
  color: var(--text-h);
}

.actions {
  display: flex;
  gap: 10px;
  margin-top: 8px;
  flex-wrap: wrap;
}

.btn {
  font: inherit;
  font-weight: 600;
  font-size: 14px;
  padding: 8px 16px;
  border-radius: 8px;
  border: 1px solid var(--border);
  background: transparent;
  color: var(--text-h);
  cursor: pointer;
  flex: 1;
  min-width: 110px;
}

.btn.captured {
  background: var(--accent);
  border-color: var(--accent);
  color: white;
}

.btn.danger {
  color: #e0245e;
  border-color: rgba(224, 36, 94, 0.4);
}

.btn.danger:hover {
  background: rgba(224, 36, 94, 0.1);
}
</style>

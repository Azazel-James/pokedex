<script setup>
import { TYPE_COLORS, TAG_COLORS } from '../types.js'

defineProps({
  person: { type: Object, required: true },
})

defineEmits(['select'])

const formatDate = (v) => {
  if (!v) return ''
  const s = String(v).trim()
  // JJ/MM/AAAA ou MM/AAAA : afficher tel quel (compact)
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(s) || /^\d{2}\/\d{4}$/.test(s)) return s
  // Legacy ISO AAAA-MM-JJ
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) {
    try { return new Date(s).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' }) } catch { return s }
  }
  return s
}
</script>

<template>
  <button class="card" :style="{ '--type-color': TYPE_COLORS[person.types?.[0]] || TAG_COLORS[person.tags?.[0]] }" @click="$emit('select', person.id)">
    <span v-if="person.favorite" class="fav-badge">★ Favori</span>
    <div class="card-image">
      <img v-if="person.photo" :src="person.photo" :alt="person.name" />
      <span v-else class="no-image">{{ person.name.slice(0, 1).toUpperCase() }}</span>
    </div>
    <div class="card-info">
      <h3>{{ person.name }}</h3>
      <p v-if="person.whereMet" class="where">{{ person.whereMet }}</p>
      <p v-if="person.dateMet" class="when">{{ formatDate(person.dateMet) }}</p>
      <p v-if="person.phone || person.email" class="contacts-hint">
        <span v-if="person.phone" title="Téléphone">📞</span>
        <span v-if="person.email" title="Email">✉️</span>
      </p>
      <div class="badges">
        <span v-for="type in (person.types || [])" :key="type" class="badge type" :style="{ background: TYPE_COLORS[type] }">
          {{ type }}
        </span>
        <span v-for="tag in (person.tags || [])" :key="tag" class="badge tag" :style="{ background: TAG_COLORS[tag] }">
          {{ tag }}
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
  width: 100%;
  min-width: 0;
  overflow: hidden;
  text-align: center;
}

.card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow);
}

.fav-badge {
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
  width: clamp(80px, 30vw, 110px);
  height: clamp(80px, 30vw, 110px);
  flex-shrink: 0;
  border-radius: 50%;
  background: var(--image-bg);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  margin: 0 auto;
}

.card-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.no-image {
  font-size: clamp(28px, 10vw, 48px);
  font-weight: bold;
  color: var(--accent);
}

.card-info {
  text-align: center;
  width: 100%;
  min-width: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
}

h3 {
  margin: 0;
  font-size: clamp(16px, 4vw, 18px);
  color: var(--text-h);
  text-transform: capitalize;
  overflow-wrap: anywhere;
  word-break: break-word;
  hyphens: auto;
  max-width: 100%;
}

.where {
  margin: 4px 0 0;
  font-size: 13px;
  color: var(--text-muted);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  overflow-wrap: anywhere;
  word-break: break-word;
  white-space: normal;
  max-width: 100%;
}

.when {
  margin: 2px 0 0;
  font-size: 12px;
  color: var(--text-muted);
  font-family: var(--mono);
  overflow-wrap: anywhere;
  word-break: break-word;
}

.contacts-hint {
  margin: 4px 0 0;
  font-size: 12px;
  letter-spacing: 4px;
}

.badges {
  display: flex;
  gap: 6px;
  justify-content: center;
  margin-top: 10px;
  flex-wrap: wrap;
  width: 100%;
  min-width: 0;
}

.badge {
  font-size: 11px;
  font-weight: 600;
  color: white;
  padding: 2px 10px;
  border-radius: 999px;
  text-transform: uppercase;
  letter-spacing: 0.4px;
  overflow-wrap: anywhere;
  word-break: break-word;
  max-width: 100%;
}
.badge.tag {
  outline: 1px dashed rgba(255,255,255,0.6);
  outline-offset: -2px;
}

@media (max-width: 480px) {
  .card {
    padding: 16px 12px;
    gap: 10px;
  }
  .badge {
    font-size: 10px;
    padding: 2px 8px;
  }
}
</style>

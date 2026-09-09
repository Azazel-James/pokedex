<script setup>
import { TYPE_COLORS, TAG_COLORS } from '../types.js'

defineProps({
  person: { type: Object, required: true },
})

defineEmits(['select'])

const formatDate = (iso) => {
  if (!iso) return ''
  try {
    return new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })
  } catch { return iso }
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
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.no-image {
  font-size: 48px;
  font-weight: bold;
  color: var(--accent);
}

.card-info {
  text-align: center;
  width: 100%;
}

h3 {
  margin: 0;
  font-size: 18px;
  color: var(--text-h);
  text-transform: capitalize;
}

.where {
  margin: 4px 0 0;
  font-size: 13px;
  color: var(--text-muted);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.when {
  margin: 2px 0 0;
  font-size: 12px;
  color: var(--text-muted);
  font-family: var(--mono);
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
}

.badge {
  font-size: 11px;
  font-weight: 600;
  color: white;
  padding: 2px 10px;
  border-radius: 999px;
  text-transform: uppercase;
  letter-spacing: 0.4px;
}
.badge.tag {
  outline: 1px dashed rgba(255,255,255,0.6);
  outline-offset: -2px;
}
</style>

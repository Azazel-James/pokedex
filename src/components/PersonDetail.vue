<script setup>
import { TYPE_COLORS, TAG_COLORS } from '../types.js'

defineProps({
  person: { type: Object, required: true },
})

defineEmits(['close', 'edit', 'remove', 'toggleFavorite'])

const formatDate = (iso) => {
  if (!iso) return '—'
  try {
    return new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
  } catch { return iso }
}
</script>

<template>
  <div class="overlay" @click.self="$emit('close')">
    <article class="detail" :style="{ '--type-color': TYPE_COLORS[person.types?.[0]] || TAG_COLORS[person.tags?.[0]] }">
      <button class="close" aria-label="Fermer" @click="$emit('close')">×</button>

      <div class="detail-image">
        <img v-if="person.photo" :src="person.photo" :alt="person.name" />
        <span v-else class="no-image">{{ person.name.slice(0, 1).toUpperCase() }}</span>
      </div>

      <div class="detail-info">
        <div class="head">
          <div class="badges">
            <span v-for="type in (person.types || [])" :key="type" class="badge type" :style="{ background: TYPE_COLORS[type] }">
              {{ type }}
            </span>
            <span v-for="tag in (person.tags || [])" :key="tag" class="badge tag" :style="{ background: TAG_COLORS[tag] }">
              {{ tag }}
            </span>
          </div>
          <span v-if="person.favorite" class="fav">★ Favori</span>
        </div>

        <h2>{{ person.name }}</h2>

        <div class="meta">
          <div class="meta-item">
            <span class="meta-label">Rencontré(e) à</span>
            <span class="meta-value">{{ person.whereMet || '—' }}</span>
          </div>
          <div class="meta-item">
            <span class="meta-label">Le</span>
            <span class="meta-value">{{ formatDate(person.dateMet) }}</span>
          </div>
        </div>

        <div v-if="person.phone || person.email" class="contacts">
          <a v-if="person.phone" class="contact" :href="`tel:${person.phone.replace(/\s/g, '')}`" title="Appeler">
            📞 {{ person.phone }}
          </a>
          <a v-if="person.email" class="contact" :href="`mailto:${person.email}`" title="Envoyer un email">
            ✉️ {{ person.email }}
          </a>
        </div>

        <p v-if="person.notes" class="notes">{{ person.notes }}</p>
        <p v-else class="notes empty-notes">Aucune note pour le moment.</p>

        <div class="actions">
          <button class="btn" :class="{ fav: person.favorite }" @click="$emit('toggleFavorite', person.id)">
            {{ person.favorite ? 'Retirer des favoris' : 'Ajouter en favori' }}
          </button>
          <button class="btn" @click="$emit('edit', person.id)">Modifier</button>
          <button class="btn danger" @click="$emit('remove', person.id)">Supprimer</button>
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
  width: 100%;
  height: 100%;
  object-fit: cover;
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

.fav {
  font-size: 12px;
  font-weight: 600;
  color: var(--accent);
  background: var(--accent-bg);
  padding: 3px 10px;
  border-radius: 999px;
}

.badges {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.badge {
  font-size: 12px;
  font-weight: 600;
  color: white;
  padding: 3px 12px;
  border-radius: 999px;
  text-transform: uppercase;
  letter-spacing: 0.4px;
}
.badge.tag {
  outline: 1px dashed rgba(255,255,255,0.7);
  outline-offset: -2px;
}

h2 {
  margin: 0;
  color: var(--text-h);
  font-size: 28px;
  text-transform: capitalize;
}

.meta {
  display: flex;
  gap: 12px;
}

.meta-item {
  flex: 1;
  border: 1px solid var(--border);
  border-radius: 10px;
  padding: 10px 14px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
}

.meta-label {
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.4px;
  color: var(--text-muted);
}

.meta-value {
  font-weight: 600;
  color: var(--text-h);
  font-size: 14px;
  text-align: center;
}

.contacts {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.contact {
  font-size: 13px;
  font-weight: 500;
  color: var(--accent);
  background: var(--accent-bg);
  padding: 6px 12px;
  border-radius: 999px;
  text-decoration: none;
  border: 1px solid transparent;
}

.contact:hover {
  border-color: var(--accent);
}

.notes {
  color: var(--text);
  line-height: 1.5;
  white-space: pre-wrap;
}

.empty-notes {
  color: var(--text-muted);
  font-style: italic;
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

.btn.fav {
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

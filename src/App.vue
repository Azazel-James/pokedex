<script setup>
import { ref, computed } from 'vue'
import { usePeople } from './composables/usePeople.js'
import { TYPES, TAGS } from './types.js'
import PersonCard from './components/PersonCard.vue'
import PersonForm from './components/PersonForm.vue'
import PersonDetail from './components/PersonDetail.vue'

const { people, addPerson, updatePerson, removePerson, toggleFavorite, exportData, importData, total, favorites } = usePeople()

const plural = (count, singular, pluralForm) => (count > 1 ? pluralForm : singular)

const search = ref('')
const filterType = ref('')
const filterTag = ref('')
const filterFavorite = ref('all')
const filterWhen = ref('') // specific date filter

const showForm = ref(false)
const editingPerson = ref(null)
const selectedId = ref(null)

const filtered = computed(() => {
  return people.filter((p) => {
    const q = search.value.toLowerCase()
    const matchesSearch = !q || 
      p.name.toLowerCase().includes(q) ||
      (p.whereMet && p.whereMet.toLowerCase().includes(q)) ||
      (p.notes && p.notes.toLowerCase().includes(q)) ||
      (p.phone && p.phone.toLowerCase().includes(q)) ||
      (p.email && p.email.toLowerCase().includes(q)) ||
      (p.tags || []).some(t => t.toLowerCase().includes(q)) ||
      (p.types || []).some(t => t.toLowerCase().includes(q))
    const matchesType = !filterType.value || (p.types || []).includes(filterType.value)
    const matchesTag = !filterTag.value || (p.tags || []).includes(filterTag.value)
    const matchesFavorite =
      filterFavorite.value === 'all' ||
      (filterFavorite.value === 'fav' && p.favorite) ||
      (filterFavorite.value === 'other' && !p.favorite)
    const matchesWhen = !filterWhen.value || p.dateMet === filterWhen.value
    return matchesSearch && matchesType && matchesTag && matchesFavorite && matchesWhen
  }).sort((a, b) => {
    // Recent first if date exists, else name
    if (a.dateMet && b.dateMet) return b.dateMet.localeCompare(a.dateMet)
    if (a.dateMet) return -1
    if (b.dateMet) return 1
    return a.name.localeCompare(b.name)
  })
})

const selected = computed(() => people.find((p) => p.id === selectedId.value) || null)

const openNew = () => {
  editingPerson.value = null
  showForm.value = true
}

const openEdit = (id) => {
  editingPerson.value = people.find((p) => p.id === id) || null
  showForm.value = true
  selectedId.value = null
}

const save = (data) => {
  if (editingPerson.value) {
    updatePerson(editingPerson.value.id, data)
  } else {
    addPerson(data)
  }
  showForm.value = false
  editingPerson.value = null
}

const fileInput = ref(null)
const importMode = ref('merge')

const doExport = () => {
  const json = exportData()
  const blob = new Blob([json], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `peopledex-${new Date().toISOString().slice(0,10)}.json`
  a.click()
  URL.revokeObjectURL(url)
}

const triggerImport = () => fileInput.value?.click()

const onFilePicked = async (e) => {
  const file = e.target.files?.[0]
  if (!file) return
  try {
    const text = await file.text()
    const data = JSON.parse(text)
    const arr = Array.isArray(data) ? data : [data]
    const count = importData(arr, importMode.value)
    alert(`${count} personne(s) importée(s) en mode ${importMode.value === 'merge' ? 'fusion' : 'remplacement'} !`)
  } catch (err) {
    alert(`Import échoué: ${err.message}`)
  } finally {
    e.target.value = ''
  }
}
</script>

<template>
  <main class="container">
    <header>
      <div class="logo">
        <span class="ball"></span>
        <h1>Mon PeopleDex</h1>
      </div>
      <p class="subtitle">
        {{ total }} {{ plural(total, 'personne', 'personnes') }} · {{ favorites }} {{ plural(favorites, 'favori', 'favoris') }} ★
      </p>
      <p class="tagline">Ton Pokédex, mais pour les humains rencontrés</p>
    </header>

    <div class="toolbar">
      <input v-model="search" type="search" class="search" placeholder="Rechercher (nom, lieu, téléphone, email, note, type, tag)..." />
      <select v-model="filterType" class="select">
        <option value="">Tous les types</option>
        <option v-for="(color, type) in TYPES" :key="type" :value="type">{{ type }}</option>
      </select>
      <select v-model="filterTag" class="select">
        <option value="">Tous les tags</option>
        <option v-for="(color, tag) in TAGS" :key="tag" :value="tag">{{ tag }}</option>
      </select>
      <select v-model="filterFavorite" class="select">
        <option value="all">Tous</option>
        <option value="fav">Favoris</option>
        <option value="other">Autres</option>
      </select>
      <input v-model="filterWhen" type="date" class="select date" title="Filtrer par date de rencontre" />
      <button class="btn add" @click="openNew">+ Ajouter</button>
    </div>

    <div class="toolbar secondary">
      <div class="io-group">
        <button class="btn secondary" @click="doExport">⬇ Exporter JSON</button>
        <input ref="fileInput" type="file" accept=".json,application/json" hidden @change="onFilePicked" />
        <button class="btn secondary" @click="triggerImport">⬆ Importer JSON</button>
        <select v-model="importMode" class="select small" title="Mode d'import">
          <option value="merge">Fusionner</option>
          <option value="replace">Remplacer</option>
        </select>
      </div>
      <span class="hint">Export/Import inclut téléphone & email</span>
    </div>

    <p v-if="filtered.length === 0" class="empty">
      <span v-if="people.length === 0">Aucune personne pour l'instant. Ajoute ta première rencontre !</span>
      <span v-else>Aucun résultat. Essaie une autre recherche.</span>
    </p>

    <div class="grid">
      <PersonCard v-for="p in filtered" :key="p.id" :person="p" @select="selectedId = $event" />
    </div>

    <PersonDetail
      v-if="selected"
      :person="selected"
      @close="selectedId = null"
      @edit="openEdit"
      @remove="removePerson(selectedId); selectedId = null"
      @toggle-favorite="toggleFavorite"
    />

    <PersonForm
      v-if="showForm"
      :person="editingPerson"
      @save="save"
      @close="showForm = false; editingPerson = null"
    />
  </main>
</template>

<style scoped>
.container {
  max-width: 1000px;
  margin: 0 auto;
  padding: 32px 20px;
}

header {
  text-align: center;
  margin-bottom: 24px;
}

.logo {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 14px;
}

.ball {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  border: 4px solid var(--text-h);
  background: linear-gradient(to bottom, #e0245e 0 48%, white 48% 52%, white 52%);
  box-shadow: var(--shadow);
}

h1 {
  margin: 0;
  font-size: 40px;
  color: var(--text-h);
}

.subtitle {
  color: var(--text-muted);
  margin: 8px 0 0;
  font-weight: 600;
}

.tagline {
  color: var(--text-muted);
  margin: 2px 0 0;
  font-size: 14px;
  font-style: italic;
}

.toolbar {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  margin-bottom: 24px;
}

.search {
  flex: 1;
  min-width: 220px;
  font: inherit;
  padding: 9px 12px;
  border: 1px solid var(--border);
  border-radius: 8px;
  background: var(--input-bg);
  color: var(--text-h);
}

.search:focus,
.select:focus {
  outline: 2px solid var(--accent);
  outline-offset: -1px;
}

.select {
  font: inherit;
  padding: 9px 12px;
  border: 1px solid var(--border);
  border-radius: 8px;
  background: var(--input-bg);
  color: var(--text-h);
}

.select.date {
  min-width: 150px;
}

.btn {
  font: inherit;
  font-weight: 600;
  padding: 9px 18px;
  border-radius: 8px;
  border: none;
  cursor: pointer;
}

.btn.add {
  background: var(--accent);
  color: white;
}

.toolbar.secondary {
  margin-top: -12px;
  align-items: center;
  justify-content: space-between;
}

.io-group {
  display: flex;
  gap: 8px;
  align-items: center;
  flex-wrap: wrap;
}

.btn.secondary {
  background: transparent;
  border: 1px solid var(--border);
  color: var(--text);
}

.btn.secondary:hover {
  border-color: var(--accent);
  color: var(--accent);
}

.select.small {
  padding: 6px 10px;
  font-size: 13px;
}

.hint {
  font-size: 12px;
  color: var(--text-muted);
}

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 16px;
}

.empty {
  text-align: center;
  color: var(--text-muted);
  padding: 48px 0;
}

@media (max-width: 380px) {
  .grid {
    grid-template-columns: 1fr;
  }
}

@media (min-width: 381px) and (max-width: 640px) {
  .grid {
    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  }
}

@media (max-width: 480px) {
  .container {
    padding: 20px 16px;
  }
  h1 {
    font-size: clamp(28px, 8vw, 40px);
  }
  .toolbar {
    gap: 8px;
  }
  .search {
    min-width: 0;
    flex: 1 1 100%;
  }
  .select {
    flex: 1 1 calc(50% - 4px);
    min-width: 0;
  }
  .select.date {
    flex: 1 1 100%;
    min-width: 0;
  }
  .btn.add {
    width: 100%;
  }
  .toolbar.secondary {
    flex-wrap: wrap;
    gap: 8px;
  }
  .hint {
    flex: 1 1 100%;
    text-align: center;
  }
}
</style>

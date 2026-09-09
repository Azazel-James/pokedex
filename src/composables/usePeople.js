import { reactive, computed, watch } from 'vue'
import { TYPES, TAGS } from '../types.js'

const STORAGE_KEY = 'peopledx:people'
const LEGACY_KEY = 'pokedex:pokemons'

// Reverse map: hex -> name for TYPES (to fix corrupted data where color was stored instead of name)
const HEX_TO_TYPE = Object.fromEntries(Object.entries(TYPES).map(([k, v]) => [v.toLowerCase(), k]))
const HEX_TO_TAG = Object.fromEntries(Object.entries(TAGS).map(([k, v]) => [v.toLowerCase(), k]))

const normalizeList = (list, validSet, hexMap, fallback) => {
  if (!Array.isArray(list)) return [fallback]
  const out = []
  for (const raw of list) {
    const s = String(raw).trim()
    if (!s) continue
    // If it's a hex color, map back to name
    if (/^#([0-9a-f]{3}){1,2}$/i.test(s)) {
      const name = hexMap[s.toLowerCase()]
      if (name && !out.includes(name)) out.push(name)
      continue
    }
    // valid name?
    if (validSet[s] && !out.includes(s)) out.push(s)
  }
  return out.length ? out.slice(0, 2) : [fallback]
}

const load = () => {
  try {
    const data = JSON.parse(localStorage.getItem(STORAGE_KEY))
    if (data && data.length) {
      // Normalize existing data (fix hex bug + add missing fields)
      const fixed = data.map((p) => ({
        ...p,
        phone: p.phone ?? '',
        email: p.email ?? '',
        // if old data had only tags but no types, or vice versa
        types: normalizeList(p.types || p.tags, TYPES, HEX_TO_TYPE, 'Normal'),
        tags: normalizeList(p.tags, TAGS, HEX_TO_TAG, 'Ami'),
      }))
      // If we fixed something, persist
      const needsSave = JSON.stringify(fixed) !== JSON.stringify(data)
      if (needsSave) localStorage.setItem(STORAGE_KEY, JSON.stringify(fixed))
      return fixed
    }
    // Migration from old pokedex storage
    const legacy = JSON.parse(localStorage.getItem(LEGACY_KEY))
    if (legacy && legacy.length) {
      const migrated = legacy.map((p) => ({
        id: p.id,
        name: p.name,
        photo: p.image || '',
        whereMet: '',
        dateMet: '',
        phone: '',
        email: '',
        notes: p.description || '',
        types: normalizeList(p.types, TYPES, HEX_TO_TYPE, 'Normal'),
        tags: ['Ami'],
        favorite: !!p.captured,
      }))
      localStorage.setItem(STORAGE_KEY, JSON.stringify(migrated))
      return migrated
    }
    return data || []
  } catch {
    return []
  }
}

const people = reactive(load())

watch(
  people,
  (value) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(value))
  },
  { deep: true },
)

let nextId = people.reduce((max, p) => Math.max(max, p.id), 0) + 1

// Normalize old entries missing fields
people.forEach((p) => {
  if (p.phone === undefined) p.phone = ''
  if (p.email === undefined) p.email = ''
  if (!Array.isArray(p.types)) p.types = normalizeList(p.tags, TYPES, HEX_TO_TYPE, 'Normal')
  else p.types = normalizeList(p.types, TYPES, HEX_TO_TYPE, 'Normal')
  if (!Array.isArray(p.tags)) p.tags = ['Ami']
  else p.tags = normalizeList(p.tags, TAGS, HEX_TO_TAG, 'Ami')
})

export function usePeople() {
  const addPerson = (data) => {
    const normalized = {
      phone: '',
      email: '',
      ...data,
      types: normalizeList(data.types, TYPES, HEX_TO_TYPE, 'Normal'),
      tags: normalizeList(data.tags, TAGS, HEX_TO_TAG, 'Ami'),
    }
    people.push({ id: nextId++, ...normalized })
  }

  const updatePerson = (id, data) => {
    const index = people.findIndex((p) => p.id === id)
    if (index !== -1) {
      const normalized = {
        ...data,
        types: data.types ? normalizeList(data.types, TYPES, HEX_TO_TYPE, 'Normal') : people[index].types,
        tags: data.tags ? normalizeList(data.tags, TAGS, HEX_TO_TAG, 'Ami') : people[index].tags,
      }
      people[index] = { ...people[index], ...normalized }
    }
  }

  const removePerson = (id) => {
    const index = people.findIndex((p) => p.id === id)
    if (index !== -1) people.splice(index, 1)
  }

  const toggleFavorite = (id) => {
    const person = people.find((p) => p.id === id)
    if (person) person.favorite = !person.favorite
  }

  const exportData = () => {
    return JSON.stringify(people, null, 2)
  }

  const importData = (jsonArray, mode = 'merge') => {
    if (!Array.isArray(jsonArray)) throw new Error('Format invalide: attendu un tableau')
    const normalized = jsonArray.map((p) => ({
      name: String(p.name || '').trim(),
      photo: String(p.photo || p.image || '').trim(),
      whereMet: String(p.whereMet || '').trim(),
      dateMet: String(p.dateMet || '').trim(),
      phone: String(p.phone || '').trim(),
      email: String(p.email || '').trim(),
      notes: String(p.notes || p.description || '').trim(),
      types: normalizeList(p.types || p.tags, TYPES, HEX_TO_TYPE, 'Normal'),
      tags: normalizeList(p.tags, TAGS, HEX_TO_TAG, 'Ami'),
      favorite: !!p.favorite || !!p.captured,
    })).filter((p) => p.name)

    if (mode === 'replace') {
      people.splice(0, people.length)
      nextId = 1
    }
    normalized.forEach((p) => {
      people.push({ id: nextId++, ...p })
    })
    return normalized.length
  }

  const total = computed(() => people.length)
  const favorites = computed(() => people.filter((p) => p.favorite).length)

  return { people, addPerson, updatePerson, removePerson, toggleFavorite, exportData, importData, total, favorites }
}

// Alias for backward compat
export const usePokedex = usePeople

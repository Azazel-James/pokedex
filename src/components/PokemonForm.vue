<script setup>
import { reactive, watch } from "vue";
import { TYPES } from "../types.js";

const props = defineProps({
    pokemon: { type: Object, default: null },
});

const emit = defineEmits(["save", "close"]);

const emptyForm = () => ({
    name: "",
    number: "",
    image: "",
    height: "",
    weight: "",
    description: "",
    types: ["Normal"],
    captured: false,
});

const form = reactive(emptyForm());

watch(
    () => props.pokemon,
    (pokemon) => {
        Object.assign(form, pokemon ? { ...pokemon } : emptyForm());
    },
    { immediate: true }
);

const toggleType = (type) => {
    const index = form.types.indexOf(type);
    if (index === -1) {
        if (form.types.length < 2) form.types.push(type);
    } else {
        form.types.splice(index, 1);
    }
};

const submit = () => {
    if (!form.name.trim()) return;
    emit("save", {
        name: form.name.trim(),
        number: form.number || form.name.trim(),
        image: form.image.trim(),
        height: form.height.trim(),
        weight: form.weight.trim(),
        description: form.description.trim(),
        types: form.types,
        captured: form.captured,
    });
};
</script>

<template>
    <div class="overlay" @click.self="$emit('close')">
        <form class="modal" @submit.prevent="submit">
            <h2>{{ pokemon ? "Modifier " + pokemon.name : "Nouveau Pokémon" }}</h2>

            <label>
                Nom
                <input v-model.trim="form.name" type="text" placeholder="ex: Pikachu" required />
            </label>

            <label>
                Numéro du Pokédex
                <input v-model.trim="form.number" type="number" placeholder="ex: 25" />
            </label>

            <label>
                Image (URL)
                <input v-model.trim="form.image" type="url" placeholder="https://..." />
            </label>

            <div class="row">
                <label>
                    Taille
                    <input v-model.trim="form.height" type="text" placeholder="ex: 0,4 m" />
                </label>
                <label>
                    Poids
                    <input v-model.trim="form.weight" type="text" placeholder="ex: 6,0 kg" />
                </label>
            </div>

            <fieldset>
                <legend>Types (1 ou 2)</legend>
                <div class="types-picker">
                    <button
                        v-for="type in TYPES"
                        :key="type"
                        type="button"
                        class="type-chip"
                        :class="{ selected: form.types.includes(type) }"
                        @click="toggleType(type)">
                        {{ type }}
                    </button>
                </div>
            </fieldset>

            <label>
                Description
                <textarea v-model.trim="form.description" rows="3" placeholder="Description du Pokémon..."></textarea>
            </label>

            <label class="checkbox">
                <input v-model="form.captured" type="checkbox" />
                Attrapé ?
            </label>

            <div class="actions">
                <button type="button" class="btn secondary" @click="$emit('close')">Annuler</button>
                <button type="submit" class="btn primary">Enregistrer</button>
            </div>
        </form>
    </div>
</template>

<style scoped>
.overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: flex-start;
    justify-content: center;
    padding: 32px 16px;
    z-index: 10;
    overflow-y: auto;
}

.modal {
    width: 100%;
    max-width: 480px;
    background: var(--card-bg);
    border: 1px solid var(--border);
    border-radius: 16px;
    padding: 24px;
    display: flex;
    flex-direction: column;
    gap: 14px;
    box-shadow: var(--shadow);
}

h2 {
    margin: 0 0 4px;
    color: var(--text-h);
}

label {
    display: flex;
    flex-direction: column;
    gap: 4px;
    font-size: 13px;
    font-weight: 600;
    color: var(--text-muted);
}

input,
textarea {
    font: inherit;
    padding: 8px 10px;
    border: 1px solid var(--border);
    border-radius: 8px;
    background: var(--input-bg);
    color: var(--text-h);
}

input:focus,
textarea:focus {
    outline: 2px solid var(--accent);
    outline-offset: -1px;
}

.row {
    display: flex;
    gap: 12px;
}

.row label {
    flex: 1;
}

fieldset {
    border: 1px solid var(--border);
    border-radius: 8px;
    padding: 10px 12px;
    margin: 0;
}

legend {
    font-size: 13px;
    font-weight: 600;
    color: var(--text-muted);
    padding: 0 6px;
}

.types-picker {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
}

.type-chip {
    font: inherit;
    font-size: 12px;
    padding: 4px 12px;
    border-radius: 999px;
    border: 1px solid var(--border);
    background: var(--input-bg);
    color: var(--text);
    cursor: pointer;
}

.type-chip.selected {
    border-color: var(--accent);
    background: var(--accent-bg);
    color: var(--accent);
    font-weight: 600;
}

.checkbox {
    flex-direction: row;
    align-items: center;
    gap: 8px;
    font-size: 14px;
    color: var(--text-h);
}

.actions {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
    margin-top: 4px;
}

.btn {
    font: inherit;
    font-weight: 600;
    padding: 8px 18px;
    border-radius: 8px;
    border: 1px solid transparent;
    cursor: pointer;
}

.btn.primary {
    background: var(--accent);
    color: white;
}

.btn.secondary {
    background: transparent;
    border-color: var(--border);
    color: var(--text);
}
</style>

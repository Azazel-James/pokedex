<script setup>
import { reactive, watch } from "vue";
import { TYPES, TAGS } from "../types.js";

const props = defineProps({
    person: { type: Object, default: null },
});

const emit = defineEmits(["save", "close"]);

const emptyForm = () => ({
    name: "",
    photo: "",
    whereMet: "",
    dateMet: "",
    phone: "",
    email: "",
    notes: "",
    types: ["Normal"],
    tags: ["Ami"],
    favorite: false,
});

const form = reactive(emptyForm());

watch(
    () => props.person,
    (person) => {
        if (person) {
            Object.assign(form, {
                ...person,
                types: [...(person.types || ["Normal"])],
                tags: [...(person.tags || ["Ami"])],
            });
        } else {
            Object.assign(form, emptyForm());
        }
    },
    { immediate: true }
);

const toggleType = (type) => {
    const index = form.types.indexOf(type);
    if (index === -1) {
        if (form.types.length < 2) form.types.push(type);
    } else {
        if (form.types.length > 1) form.types.splice(index, 1);
    }
};

const toggleTag = (tag) => {
    const index = form.tags.indexOf(tag);
    if (index === -1) {
        if (form.tags.length < 2) form.tags.push(tag);
    } else {
        if (form.tags.length > 1) form.tags.splice(index, 1);
    }
};

const submit = () => {
    if (!form.name.trim()) return;
    emit("save", {
        name: form.name.trim(),
        photo: form.photo.trim(),
        whereMet: form.whereMet.trim(),
        dateMet: form.dateMet,
        phone: form.phone.trim(),
        email: form.email.trim(),
        notes: form.notes.trim(),
        types: form.types.length ? form.types : ["Normal"],
        tags: form.tags.length ? form.tags : ["Ami"],
        favorite: form.favorite,
    });
};
</script>

<template>
    <div class="overlay" @click.self="$emit('close')">
        <form class="modal" @submit.prevent="submit">
            <h2>{{ person ? "Modifier " + person.name : "Nouvelle personne" }}</h2>

            <label>
                Nom / Prénom *
                <input v-model.trim="form.name" type="text" placeholder="ex: Alex Dupont" required />
            </label>

            <label>
                Photo (URL)
                <input v-model.trim="form.photo" type="url" placeholder="https://..." />
            </label>

            <div class="row">
                <label>
                    Où vous êtes-vous rencontrés ?
                    <input v-model.trim="form.whereMet" type="text" placeholder="ex: Soirée chez Léa, Travail, Parc" />
                </label>
                <label>
                    Quand ?
                    <input v-model="form.dateMet" type="date" />
                </label>
            </div>

            <div class="row">
                <label>
                    Téléphone
                    <input v-model.trim="form.phone" type="tel" placeholder="ex: 06 12 34 56 78" />
                </label>
                <label>
                    Email
                    <input v-model.trim="form.email" type="email" placeholder="ex: alex@email.com" />
                </label>
            </div>

            <fieldset>
                <legend>Types Pokédex (1 ou 2)</legend>
                <div class="tags-picker">
                    <button
                        v-for="(color, type) in TYPES"
                        :key="type"
                        type="button"
                        class="tag-chip"
                        :class="{ selected: form.types.includes(type) }"
                        :style="form.types.includes(type) ? { background: color, color: 'white', borderColor: color } : {}"
                        @click="toggleType(type)">
                        {{ type }}
                    </button>
                </div>
            </fieldset>

            <fieldset>
                <legend>Tags contexte (1 ou 2)</legend>
                <div class="tags-picker">
                    <button
                        v-for="(color, tag) in TAGS"
                        :key="tag"
                        type="button"
                        class="tag-chip"
                        :class="{ selected: form.tags.includes(tag) }"
                        :style="form.tags.includes(tag) ? { background: color, color: 'white', borderColor: color } : {}"
                        @click="toggleTag(tag)">
                        {{ tag }}
                    </button>
                </div>
            </fieldset>

            <label>
                Notes / Anecdote / Infos à retenir
                <textarea v-model.trim="form.notes" rows="4" placeholder="Comment vous vous êtes rencontrés, sujets de discussion, à recontacter pour..."></textarea>
            </label>

            <label class="checkbox">
                <input v-model="form.favorite" type="checkbox" />
                Ajouter aux favoris ★
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
    max-width: 500px;
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
    min-width: 0;
}

.row label {
    flex: 1;
    min-width: 0;
}

input,
textarea {
    min-width: 0;
    width: 100%;
}

@media (max-width: 480px) {
    .row {
        flex-direction: column;
    }
    .modal {
        padding: 20px 16px;
    }
    .overlay {
        padding: 16px;
    }
    h2 {
        font-size: 20px;
    }
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

.tags-picker {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
}

.tag-chip {
    font: inherit;
    font-size: 12px;
    padding: 4px 12px;
    border-radius: 999px;
    border: 1px solid var(--border);
    background: var(--input-bg);
    color: var(--text);
    cursor: pointer;
}

.tag-chip.selected {
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

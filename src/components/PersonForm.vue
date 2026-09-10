<script setup>
import { reactive, watch, ref } from "vue";
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
const fileInput = ref(null);
const fileError = ref("");
const isDataUrl = (v) => typeof v === "string" && v.startsWith("data:image");

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
        fileError.value = "";
        if (fileInput.value) fileInput.value.value = "";
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

const onFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    fileError.value = "";
    if (!file.type.startsWith("image/")) {
        fileError.value = "Seules les images sont acceptées.";
        e.target.value = "";
        return;
    }
    if (file.size > 2 * 1024 * 1024) {
        fileError.value = "Image trop lourde (max 2 Mo).";
        e.target.value = "";
        return;
    }
    const reader = new FileReader();
    reader.onload = () => {
        form.photo = String(reader.result);
    };
    reader.onerror = () => {
        fileError.value = "Erreur lecture fichier.";
    };
    reader.readAsDataURL(file);
};

const clearPhoto = () => {
    form.photo = "";
    fileError.value = "";
    if (fileInput.value) fileInput.value.value = "";
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
                <span class="hint">ou depuis ton appareil</span>
            </label>

            <div class="photo-upload">
                <div class="photo-preview" :class="{ empty: !form.photo }">
                    <img v-if="form.photo" :src="form.photo" alt="Aperçu" @error="fileError = 'URL invalide ou image inaccessible.'" />
                    <span v-else class="preview-placeholder">Aucune photo</span>
                </div>
                <div class="photo-actions">
                    <input ref="fileInput" type="file" accept="image/*" capture="environment" hidden @change="onFileChange" />
                    <button type="button" class="btn secondary small" @click="fileInput?.click()">📁 Choisir un fichier</button>
                    <button v-if="form.photo" type="button" class="btn secondary small danger" @click="clearPhoto">✕ Retirer</button>
                </div>
                <p v-if="isDataUrl(form.photo)" class="hint">Image stockée localement (base64, ~{{ Math.round(form.photo.length / 1024) }} Ko)</p>
                <p v-if="fileError" class="error">{{ fileError }}</p>
            </div>

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

.hint {
    font-size: 11px;
    font-weight: 400;
    color: var(--text-muted);
}

.photo-upload {
    display: flex;
    flex-direction: column;
    gap: 8px;
    border: 1px dashed var(--border);
    border-radius: 10px;
    padding: 12px;
    background: var(--image-bg);
}

.photo-preview {
    width: 96px;
    height: 96px;
    border-radius: 50%;
    overflow: hidden;
    background: var(--card-bg);
    border: 1px solid var(--border);
    display: flex;
    align-items: center;
    justify-content: center;
    align-self: center;
}

.photo-preview.empty {
    border-style: dashed;
}

.photo-preview img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.preview-placeholder {
    font-size: 12px;
    color: var(--text-muted);
}

.photo-actions {
    display: flex;
    gap: 8px;
    justify-content: center;
    flex-wrap: wrap;
}

.btn.small {
    padding: 6px 12px;
    font-size: 12px;
}

.btn.small.danger {
    color: #e0245e;
    border-color: rgba(224,36,94,0.3);
}

.error {
    font-size: 12px;
    color: #e0245e;
    margin: 0;
    text-align: center;
}

.checkbox {
    flex-direction: row;
    align-items: center;
    justify-content: flex-start;
    gap: 6px;
    font-size: 14px;
    color: var(--text-h);
    cursor: pointer;
    width: fit-content;
}

.checkbox input[type="checkbox"] {
    margin: 0;
    width: 16px;
    height: 16px;
    flex-shrink: 0;
    accent-color: var(--accent);
    cursor: pointer;
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

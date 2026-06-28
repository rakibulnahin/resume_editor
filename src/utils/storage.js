/**
 * Local persistence layer for the resume editor.
 *
 * The app is intentionally backend-free, so everything lives in the browser.
 * This module upgrades the old `sessionStorage` autosave (which was lost the
 * moment the tab closed) to `localStorage`, and adds support for multiple
 * named resume versions ("Frontend role", "PM role", ...) so the README's
 * promise of "create once, use multiple times" actually holds.
 */

const CURRENT_KEY = 'resumeData';
const VERSIONS_KEY = 'resume_editor_versions';
const LEGACY_SESSION_KEY = 'resumeData';

function safeParse(raw, fallback) {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw);
  } catch (error) {
    console.error('storage: failed to parse value', error);
    return fallback;
  }
}

function createId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `v_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

/**
 * Load the working resume. Falls back to (and migrates) the legacy
 * sessionStorage value so existing users keep their in-progress data.
 * @returns {Object|null}
 */
export function loadCurrentResume() {
  if (typeof window === 'undefined') return null;

  const fromLocal = safeParse(window.localStorage.getItem(CURRENT_KEY), null);
  if (fromLocal) return fromLocal;

  const fromSession = safeParse(window.sessionStorage.getItem(LEGACY_SESSION_KEY), null);
  if (fromSession) {
    saveCurrentResume(fromSession);
    try {
      window.sessionStorage.removeItem(LEGACY_SESSION_KEY);
    } catch (error) {
      console.error('storage: failed to clear legacy session value', error);
    }
    return fromSession;
  }

  return null;
}

/**
 * Persist the working resume.
 * @param {Object} resumeData
 */
export function saveCurrentResume(resumeData) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(CURRENT_KEY, JSON.stringify(resumeData));
  } catch (error) {
    console.error('storage: failed to save current resume', error);
  }
}

/**
 * @returns {Array<{id: string, name: string, updatedAt: string, data: Object}>}
 */
export function listVersions() {
  if (typeof window === 'undefined') return [];
  const versions = safeParse(window.localStorage.getItem(VERSIONS_KEY), []);
  return Array.isArray(versions) ? versions : [];
}

function writeVersions(versions) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(VERSIONS_KEY, JSON.stringify(versions));
  } catch (error) {
    console.error('storage: failed to write versions', error);
  }
}

/**
 * Create a new named version or update an existing one (when `id` is given).
 * @returns {{id: string, name: string, updatedAt: string, data: Object}} the saved version
 */
export function saveVersion(name, resumeData, id = null) {
  const versions = listVersions();
  const trimmedName = (name || '').trim() || 'Untitled resume';
  const snapshot = JSON.parse(JSON.stringify(resumeData));
  const now = new Date().toISOString();

  const existingIndex = id ? versions.findIndex((version) => version.id === id) : -1;

  if (existingIndex >= 0) {
    versions[existingIndex] = {
      ...versions[existingIndex],
      name: trimmedName,
      data: snapshot,
      updatedAt: now,
    };
    writeVersions(versions);
    return versions[existingIndex];
  }

  const created = { id: createId(), name: trimmedName, data: snapshot, updatedAt: now };
  versions.push(created);
  writeVersions(versions);
  return created;
}

export function deleteVersion(id) {
  writeVersions(listVersions().filter((version) => version.id !== id));
}

export function renameVersion(id, name) {
  const versions = listVersions();
  const index = versions.findIndex((version) => version.id === id);
  if (index >= 0) {
    versions[index] = { ...versions[index], name: (name || '').trim() || versions[index].name };
    writeVersions(versions);
  }
  return versions[index] || null;
}

export function getVersion(id) {
  return listVersions().find((version) => version.id === id) || null;
}

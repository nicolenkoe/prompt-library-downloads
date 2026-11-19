const key = 'prompt-library-v1';
const library = document.querySelector('#library');
const search = document.querySelector('#search');
const editor = document.querySelector('#editor');
const form = document.querySelector('#form');
const titleInput = document.querySelector('#title');
const descriptionInput = document.querySelector('#description');
const bodyInput = document.querySelector('#body');
const notice = document.querySelector('#notice');
const starter = [
  { id: 'text', title: 'Написать текст', description: 'Готовит письмо, пост или объявление под вашу аудиторию.', body: 'Напиши [письмо / пост / объявление] для [аудитория]. Цель — [желаемый результат]. Используй факты: [факты]. Тон — [тон]. Объём — до [число] слов.' },
  { id: 'compare', title: 'Сравнить варианты', description: 'Сравнивает два варианта по вашим критериям.', body: 'Сравни [вариант А] и [вариант Б] для задачи [цель]. Критерии по приоритету: [критерии]. Сделай короткую таблицу и объясни, когда лучше выбрать каждый вариант.' },
  { id: 'learn', title: 'Изучить тему', description: 'Объясняет тему на примере и предлагает упражнение.', body: 'Объясни [тему] человеку, который уже знает [что я знаю]. Начни с простого примера. Покажи, как применить это к [задача]. В конце дай одно упражнение и дождись моего ответа.' }
];
let prompts = starter;
let editedId;
try {
  const saved = localStorage.getItem(key);
  if (saved !== null) prompts = JSON.parse(saved);
} catch {
  notice.textContent = 'Не удалось открыть сохранённую библиотеку.';
}

function save(next) {
  try {
    localStorage.setItem(key, JSON.stringify(next));
  } catch {
    notice.textContent = 'Не удалось сохранить изменения на устройстве.';
    return false;
  }
  prompts = next;
  render();
  return true;
}

function openEditor(prompt) {
  editedId = prompt?.id;
  titleInput.value = prompt?.title ?? '';
  descriptionInput.value = prompt?.description ?? '';
  bodyInput.value = prompt?.body ?? '';
  document.querySelector('#editor-title').textContent = prompt ? 'Редактировать промпт' : 'Новый промпт';
  editor.showModal();
  titleInput.focus();
}

async function copy(body) {
  try {
    if (window.PromptAndroid) window.PromptAndroid.copy(body);
    else await navigator.clipboard.writeText(body);
    notice.textContent = 'Промпт скопирован.';
  } catch {
    notice.textContent = 'Копирование недоступно. Выделите текст вручную.';
  }
}

function button(label, action) {
  const element = document.createElement('button');
  element.type = 'button';
  element.textContent = label;
  element.addEventListener('click', action);
  return element;
}

function render() {
  library.replaceChildren();
  const query = search.value.trim().toLocaleLowerCase('ru');
  const matches = prompts.filter(prompt => ([prompt.title, prompt.description ?? '', prompt.body].join('\n')).toLocaleLowerCase('ru').includes(query));
  for (const prompt of matches) {
    const card = document.createElement('article');
    const title = document.createElement('h2');
    const description = document.createElement('p');
    const preview = document.createElement('details');
    const summary = document.createElement('summary');
    const body = document.createElement('p');
    const actions = document.createElement('div');
    title.textContent = prompt.title;
    description.textContent = prompt.description || prompt.body.trim().slice(0, 110) + (prompt.body.trim().length > 110 ? '…' : '');
    summary.textContent = 'Показать текст';
    body.textContent = prompt.body;
    preview.append(summary, body);
    actions.className = 'actions';
    actions.append(
      button('Копировать промпт', () => copy(prompt.body)),
      button('Изменить', () => openEditor(prompt)),
      button('Удалить', () => {
        if (confirm('Удалить промпт «' + prompt.title + '»?') && save(prompts.filter(item => item.id !== prompt.id))) {
          notice.textContent = 'Промпт удалён.';
        }
      })
    );
    card.append(title, description, actions, preview);
    library.append(card);
  }
  if (!matches.length) library.textContent = query ? 'Ничего не найдено.' : 'Добавьте первый промпт.';
}

form.addEventListener('submit', event => {
  event.preventDefault();
  const title = titleInput.value.trim();
  const body = bodyInput.value.trim();
  if (!title || !body) {
    (title ? bodyInput : titleInput).focus();
    return;
  }
  const prompt = { id: editedId ?? crypto.randomUUID(), title, description: descriptionInput.value.trim(), body };
  const next = editedId ? prompts.map(item => item.id === editedId ? prompt : item) : [prompt, ...prompts];
  if (save(next)) {
    editor.close();
    notice.textContent = 'Промпт сохранён.';
  } else {
    editor.close();
  }
});
search.addEventListener('input', render);
document.querySelector('#add').addEventListener('click', () => openEditor());
document.querySelector('#close').addEventListener('click', () => editor.close());
render();

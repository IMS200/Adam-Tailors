const menuButton = document.querySelector('.menu-toggle');
const navigation = document.querySelector('#navigation');
function closeMenu() {
  navigation.classList.remove('open');
  menuButton.setAttribute('aria-expanded', 'false');
}
menuButton.addEventListener('click', () => {
  const expanded = menuButton.getAttribute('aria-expanded') !== 'true';
  menuButton.setAttribute('aria-expanded', String(expanded));
  navigation.classList.toggle('open', expanded);
});
navigation.addEventListener('click', event => {
  if (event.target.closest('a')) closeMenu();
});
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && menuButton.getAttribute('aria-expanded') === 'true') {
    closeMenu();
    menuButton.focus();
  }
});
document.querySelector('#year').textContent = new Date().getFullYear();

// Keep the complete visitor experience in sync with the selected language.
const languageDialog = document.querySelector('#language-dialog');
const languageForm = document.querySelector('#language-form');
const languageSwitcher = document.querySelector('#language-switcher');
const storageKey = 'adam-tailors-language';
const supportedLanguages = ['en', 'ar', 'ti'];
function setLanguage(language) {
  if (!supportedLanguages.includes(language)) language = 'en';
  const copy = window.translations[language];
  document.documentElement.lang = language;
  document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
  document.querySelectorAll('[data-i18n]').forEach(element => {
    element.textContent = copy[element.dataset.i18n];
  });
  for (const attribute of ['alt', 'aria-label']) {
    document.querySelectorAll(`[data-i18n-${attribute}]`).forEach(element => {
      element.setAttribute(attribute, copy[element.getAttribute(`data-i18n-${attribute}`)]);
    });
  }
  const businessData = document.querySelector('script[type="application/ld+json"]');
  const business = JSON.parse(businessData.textContent);
  business.description = copy.metaDescription;
  businessData.textContent = JSON.stringify(business);
  document.title = copy.metaTitle;
  document.querySelector('meta[name="description"]').content = copy.metaDescription;
  document.querySelector('meta[property="og:title"]').content = copy.metaTitle;
  document.querySelector('meta[property="og:description"]').content = copy.metaDescription;
  document.querySelector('meta[property="og:image:alt"]').content = copy.metaImageAlt;
  let locale = document.querySelector('meta[property="og:locale"]');
  if (!locale) {
    locale = document.createElement('meta');
    locale.setAttribute('property', 'og:locale');
    document.head.append(locale);
  }
  locale.content = { en: 'en_GB', ar: 'ar_AR', ti: 'ti_ER' }[language];
  languageSwitcher.value = language;
  languageForm.elements.language.value = language;
}
function rememberLanguage(language) {
  try { localStorage.setItem(storageKey, language); } catch { /* Browsing works without storage. */ }
}
languageSwitcher.addEventListener('change', () => {
  setLanguage(languageSwitcher.value);
  rememberLanguage(languageSwitcher.value);
});
languageForm.addEventListener('change', () => setLanguage(languageForm.elements.language.value));
languageForm.addEventListener('submit', event => {
  event.preventDefault();
  const language = languageForm.elements.language.value;
  setLanguage(language);
  rememberLanguage(language);
  languageDialog.close();
  languageSwitcher.focus();
});
// The initial choice is completed with Continue; native dialog traps keyboard focus.
languageDialog.addEventListener('cancel', event => event.preventDefault());
let savedLanguage;
try { savedLanguage = localStorage.getItem(storageKey); } catch { /* Use first-visit flow. */ }
setLanguage(supportedLanguages.includes(savedLanguage) ? savedLanguage : 'en');
if (!supportedLanguages.includes(savedLanguage)) languageDialog.showModal();

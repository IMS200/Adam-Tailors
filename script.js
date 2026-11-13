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
const languageButtons = document.querySelectorAll('[data-language]');
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
  languageButtons.forEach(button => {
    button.setAttribute('aria-pressed', String(button.dataset.language === language));
  });
}
function rememberLanguage(language) {
  try { localStorage.setItem(storageKey, language); } catch { /* Browsing works without storage. */ }
}
languageButtons.forEach(button => {
  button.addEventListener('click', () => {
    setLanguage(button.dataset.language);
    rememberLanguage(button.dataset.language);
  });
});
let savedLanguage;
try { savedLanguage = localStorage.getItem(storageKey); } catch { /* Default to English when storage is unavailable. */ }
setLanguage(supportedLanguages.includes(savedLanguage) ? savedLanguage : 'en');

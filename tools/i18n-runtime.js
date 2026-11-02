(()=>{'use strict';
const catalogs=JSON.parse(document.getElementById('locale-catalogs').textContent),ids=['ja','en','es','pt-BR','zh-Hans','fr','de','ko','ru','it','zh-Hant','id','tr','vi','th'];
function match(value){const s=String(value||'').toLowerCase();if(s.startsWith('zh')){if(s.includes('hant'))return 'zh-Hant';if(s.includes('hans'))return 'zh-Hans';return /-(tw|hk|mo)/.test(s)?'zh-Hant':'zh-Hans';}if(s.startsWith('pt'))return 'pt-BR';return ids.find(id=>id.toLowerCase()===s||id===s.split('-')[0]);}
let saved;try{saved=localStorage.getItem('koroshine:language')}catch{}let language=ids.includes(saved)?saved:(navigator.languages||[navigator.language]).map(match).find(Boolean)||'en';
const originals=new Map(),attrs=[];const reverse=new Map(Object.entries(catalogs.ja).map(([k,v])=>[v,k]));
function t(key,values={}){const text=catalogs[language]?.[key]??catalogs.en?.[key]??catalogs.ja[key]??key;return text.replace(/\{(\w+)\}/g,(_,k)=>String(values[k]??'{'+k+'}'));}
function translate(text){if(text==='危険!')return t('danger');const key=reverse.get(text);if(key)return t(key);let m;if((m=/^(\d+)連 \+(\d+)$/.exec(text)))return t('comboScore',{count:m[1],score:m[2]});if((m=/^🔥 ファイアボール! 残り(\d+)階$/.exec(text)))return t('fireRemaining',{count:m[1]});if((m=/^(\d+)連続！一気落下チャンス$/.exec(text)))return t('comboChance',{count:m[1]});if((m=/^(\d+)連続！$/.exec(text)))return t('combo',{count:m[1]});if(text==='🔥 ファイアボール!')return t('fire');return text;}
function render(){document.documentElement.lang=language;document.querySelectorAll('[data-i18n]').forEach(el=>{const text=t(el.dataset.i18n);if(el.dataset.i18nAttr)el.setAttribute(el.dataset.i18nAttr,text);else el.textContent=text;});const select=document.getElementById('languageSelect');if(select)select.value=language;}
function setLanguage(id){if(!ids.includes(id))return;language=id;try{localStorage.setItem('koroshine:language',id)}catch{}render();window.dispatchEvent(new Event('korolanguagechange'));}
window.KoroI18n={t,translate,setLanguage,match,get language(){return language}};document.getElementById('languageSelect').addEventListener('change',e=>setLanguage(e.target.value));render();
})();

// Consumer-only locale preference. Navigation and evidence remain usable without JS.
try { localStorage.setItem('lucas-pe-lang',document.documentElement.lang); } catch {}
document.querySelectorAll('[data-history-back]').forEach(button=>button.addEventListener('click',()=>{
 if(document.referrer && new URL(document.referrer).origin===location.origin)history.back();
 else location.href='../index.html';
}));

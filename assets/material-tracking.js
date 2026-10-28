// Rondo教材クリック。URLのクエリ・個人識別子・ページ本文は送らない。
(() => {
  'use strict';
  const endpoint = 'https://rondo.earthkey.workers.dev/ingest/material-click';
  const ids = {
    'https://brmk.io/EYcuJ3': 'uradori',
    'https://brmk.io/camtep': 'ninja-illustration',
    'https://brmk.io/Yomaek': 'medical-review',
    'https://brmk.io/rnmJcc': 'ninja-starter',
    'https://brain-market.com/u/earthkey/a/b2kTN3YjMgoTZsNWa0JXY': 'uradori',
    'https://brain-market.com/u/earthkey/a/bykTN3YjMgoTZsNWa0JXY': 'ninja-illustration',
    'https://brain-market.com/u/earthkey/a/b0QjM0YjMgoTZsNWa0JXY': 'medical-review',
    'https://brain-market.com/u/earthkey/a/bxcDO4UjMgoTZsNWa0JXY': 'ninja-starter',
  };
  const sent = new Set();
  const track = product => {
    if (!Object.values(ids).includes(product) || sent.has(product) || !crypto.randomUUID) return;
    sent.add(product);
    const body = JSON.stringify({product,page:location.pathname,eventId:crypto.randomUUID()});
    if (!navigator.sendBeacon(endpoint,new Blob([body],{type:'text/plain'}))) {
      fetch(endpoint,{method:'POST',body,headers:{'Content-Type':'text/plain'},keepalive:true,credentials:'omit'}).catch(()=>{});
    }
  };
  document.addEventListener('click',event => {
    if (!event.isTrusted || event.defaultPrevented) return;
    const anchor = event.target.closest?.('a[href]');
    if (!anchor) return;
    const url = new URL(anchor.href);
    const product = ids[url.origin + url.pathname.replace(/\/$/,'')];
    if (product) track(product);
  });
  window.addEventListener('rondo-brain-outbound',event => track(event.detail));
})();

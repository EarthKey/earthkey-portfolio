// Rondo教材クリック。URLのクエリ・個人識別子・ページ本文は送らない。
(() => {
  'use strict';
  // Rondo 1.0.4 では購入者の改修の口(/local/・OPTIONS.md §18)に置いた（2026-11-03）
  const endpoint = 'https://rondo.earthkey.workers.dev/local/ingest/material-click';
  const ids = {
    'https://brmk.io/camtep': 'ninja-illustration',
    'https://brmk.io/Yomaek': 'medical-review',
    'https://brmk.io/rnmJcc': 'ninja-starter',
    'https://brain-market.com/u/earthkey/a/bykTN3YjMgoTZsNWa0JXY': 'ninja-illustration',
    'https://brain-market.com/u/earthkey/a/b0QjM0YjMgoTZsNWa0JXY': 'medical-review',
    'https://brain-market.com/u/earthkey/a/bxcDO4UjMgoTZsNWa0JXY': 'ninja-starter',
    // Kindle（2026-11-03）。1冊目の商品ページ・2冊目の購入用ページへのリンククリック。
    'https://www.amazon.co.jp/dp/B0HFBYVFZ3': 'kindle-makaseru',
    'https://earthkey.me/go/book2/buy': 'kindle-boring',
  };
  // リンクのURLでは判定しない導線（転送ページが rondo-brain-outbound で名指しするものだけ）。
  // book2-substack = 2冊目の巻末 /go/book2/ → Substack（Kindle と別に数える・2026-11-03）。Substack のURLを ids に入れると LP の他のリンクまで数える
  const eventOnly = ['book2-substack'];
  const sent = new Set();
  const track = product => {
    if (!(Object.values(ids).includes(product) || eventOnly.includes(product)) || sent.has(product) || !crypto.randomUUID) return;
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

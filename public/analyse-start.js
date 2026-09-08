/*
 * Oppstarten av Google-taggen (Analytics 4), Googles samtykkemodus v2.
 *
 * Kjøres FØR gtag.js (dette skriptet er synkront og står foran den asynkrone
 * taggen i index.html). Alt som kan lagre noe i nettleseren står på «nei»
 * til besøkeren har svart i banneret; src/lib/analyse.ts oppdaterer da
 * samtykket ut fra svaret. Med `wait_for_update` venter taggen et halvt
 * sekund på det svaret, så et lagret ja fra før gjelder allerede for den
 * første sidevisningen.
 *
 * Ligger som egen fil, ikke som innebygd skript, fordi Content-Security-
 * Policy bare tillater skript fra vår egen server og fra googletagmanager.com.
 * Målings-ID-en kommer fra data-id på dette skriptets eget element: tag-
 * elementet under er ennå ikke lest inn av nettleseren når dette kjører.
 */
;(function () {
  var meg = document.currentScript
  var id = meg && /^(G-[A-Z0-9]+)$/.exec(meg.getAttribute('data-id') || '')
  if (!id) return
  window.dataLayer = window.dataLayer || []
  function gtag() {
    window.dataLayer.push(arguments)
  }
  window.gtag = gtag
  gtag('consent', 'default', {
    ad_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied',
    analytics_storage: 'denied',
    functionality_storage: 'denied',
    personalization_storage: 'denied',
    security_storage: 'granted',
    wait_for_update: 500,
  })
  // Uten samtykke til markedsføring fjernes annonse-klikk-id-er fra det som sendes
  gtag('set', 'ads_data_redaction', true)
  gtag('set', 'url_passthrough', false)
  gtag('js', new Date())
  gtag('config', id[1])
})()

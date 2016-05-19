var admobid = {};
if( /(android)/i.test(navigator.userAgent) ) { 
  admobid = { // for Android
    banner: 'ca-app-pub-3437325100577774/3102105846',
    interstitial: 'ca-app-pub-3437325100577774/3617993043'
  };
} else if(/(ipod|iphone|ipad)/i.test(navigator.userAgent)) {
  admobid = { // for iOS
    banner: 'ca-app-pub-3437325100577774/1625372647',
    interstitial: 'ca-app-pub-3437325100577774/6211532642'
  };
} 

if(( /(ipad|iphone|ipod|android|windows phone)/i.test(navigator.userAgent) )) {
  document.addEventListener('deviceready', initApp, false);
} else {
  initApp();
}

function initApp() {
  if (! window.AdMob ) { alert( 'admob plugin not ready' ); return; }

  if( /(android)/i.test(navigator.userAgent) && window.innerHeight < 481 ) { 
    // alert(window.innerHeight);
  } else {
    AdMob.createBanner({
      adId: admobid.banner, 
      isTesting: false,
      overlap: false, 
      offsetTopBar: false, 
      position: AdMob.AD_POSITION.BOTTOM_CENTER,
      bgColor: 'black'
    });
  }
  
  AdMob.prepareInterstitial({
    adId: admobid.interstitial,
    autoShow: false
  });

}
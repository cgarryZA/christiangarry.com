window.cxs && window.cxs.setOptions({ prefix: "c2-" });
window.wsb=window.wsb||{};window.wsb["Theme13"]=window.wsb["Theme13"]||window.radpack("@widget/LAYOUT/bs-layout13-Theme-publish-Theme").then(function(t){return new t.default();});
window.wsb["FreemiumAd"]=function(e){let{adEndpoint:t,isPublish:a,containerId:o}=e;const r=1e4,l=/<script[^>]*>([\s\S]*)<\/script>/;let n,i,s;function c(e){e.preventDefault(),e.stopPropagation();const t=new CustomEvent("editor",{detail:{type:"showModal",modal:"plans",source:"freemiumAd"}});window.dispatchEvent(t)}function g(e){if(s=document.getElementById(o),!s)return;n=document.createElement("div"),n.style.cssText="width:100%;",s.prepend(n),i=document.createElement("div"),i.setAttribute("data-freemium-ad",!0),i.style.cssText=`overflow:hidden;width:100%;z-index:${r};position:fixed;left:0;`,i.innerHTML=(e||"").replace(l,""),s.prepend(i);const t=`${i.offsetHeight}px`;if(n.style.minHeight=t,window.requestAnimationFrame((()=>{const e=document.querySelector("[data-stickynav]");e&&"fixed"===e.style.position&&(e.style.top=t)})),a){const t=l.exec(e);if(t){const e=document.createElement("script");e.appendChild(document.createTextNode(t[1])),document.head.appendChild(e)}}else i.addEventListener("click",c,{useCapture:!0})}return function(){const e=a&&sessionStorage.getItem(t)||"";e?g(e):window.fetch(t).then((e=>e.ok&&e.text())).then((e=>{e&&(sessionStorage.setItem(t,e),g(e))})).catch((()=>{}))}(),function(){!a&&i.removeEventListener("click",c,{useCapture:!0}),s&&(s.removeChild(n),s.removeChild(i))}};
window.wsb["FreemiumAd"](JSON.parse("{\"adEndpoint\":\"/markup/ad\",\"isPublish\":true,\"containerId\":\"freemium-ad-188851\"}"));
window.wsb['context-bs-1']=JSON.parse("{\"env\":\"production\",\"renderMode\":\"PUBLISH\",\"fonts\":[\"playfair-display\",\"source-sans-pro\",\"montserrat\"],\"colors\":[\"#128a2a\"],\"locale\":\"en-GB\",\"language\":\"en\",\"resellerId\":1,\"internalLinks\":{},\"isInternalPage\":true,\"navigationMap\":{\"287f429b-ed6e-416e-aa2a-319409973b79\":{\"isFlyoutMenu\":false,\"active\":false,\"pageId\":\"287f429b-ed6e-416e-aa2a-319409973b79\",\"name\":\"Home\",\"href\":\"/\",\"target\":\"\",\"visible\":true,\"requiresAuth\":false,\"tags\":[],\"rel\":\"\",\"type\":\"page\",\"showInFooter\":false},\"3001777b-4a14-4913-9ac8-db7a23c35334\":{\"isFlyoutMenu\":false,\"active\":true,\"pageId\":\"3001777b-4a14-4913-9ac8-db7a23c35334\",\"name\":\"Hydrogen Fuel System\",\"href\":\"/hydrogen-fuel-system\",\"target\":\"\",\"visible\":true,\"requiresAuth\":false,\"tags\":[],\"rel\":\"\",\"type\":\"page\",\"showInFooter\":false},\"3fb700cb-942a-4f9d-a5a1-be5b671b9886\":{\"isFlyoutMenu\":false,\"active\":false,\"pageId\":\"3fb700cb-942a-4f9d-a5a1-be5b671b9886\",\"name\":\"404\",\"href\":\"/404\",\"target\":\"\",\"visible\":false,\"requiresAuth\":false,\"tags\":[\"404\"],\"rel\":\"\",\"type\":\"page\",\"showInFooter\":false},\"6a4c9aa5-c36b-4903-994e-0df15fa0c212\":{\"isFlyoutMenu\":false,\"active\":false,\"pageId\":\"6a4c9aa5-c36b-4903-994e-0df15fa0c212\",\"name\":\"Electronic Differential\",\"href\":\"/electronic-differential\",\"target\":\"\",\"visible\":true,\"requiresAuth\":false,\"tags\":[],\"rel\":\"\",\"type\":\"page\",\"showInFooter\":false},\"84d64b98-c223-4a2a-856b-c70fb683a6fe\":{\"isFlyoutMenu\":false,\"active\":false,\"pageId\":\"84d64b98-c223-4a2a-856b-c70fb683a6fe\",\"name\":\"SiC JFET RTL CPU\",\"href\":\"/sic-jfet-rtl-cpu\",\"target\":\"\",\"visible\":true,\"requiresAuth\":false,\"tags\":[],\"rel\":\"\",\"type\":\"page\",\"showInFooter\":false},\"cee9dd60-e2ce-4b3b-9703-ba597c205d08\":{\"isFlyoutMenu\":false,\"active\":false,\"pageId\":\"cee9dd60-e2ce-4b3b-9703-ba597c205d08\",\"name\":\"About Me\",\"href\":\"/about-me\",\"target\":\"\",\"visible\":true,\"requiresAuth\":false,\"tags\":[],\"rel\":\"\",\"type\":\"page\",\"showInFooter\":false}},\"dials\":{\"colors\":[{\"id\":\"#128a2a\",\"meta\":{\"primary\":\"rgb(18, 138, 42)\",\"accent\":\"rgb(17, 17, 17)\",\"neutral\":\"rgb(255, 255, 255)\"}}],\"fonts\":{\"primary\":{\"id\":\"playfair-display\",\"description\":\"Distinctive fonts that presents a 21st century take on a vintage, professional feel.\",\"tags\":[\"serif\",\"classic\",\"conservative\"],\"meta\":{\"order\":30,\"primary\":{\"id\":\"playfair-display\",\"name\":\"Playfair Display\",\"url\":\"//fonts.googleapis.com/css?family=Playfair+Display:400,700,900&display=swap\",\"family\":\"'Playfair Display', Georgia, serif\",\"size\":16,\"weight\":400,\"weights\":[400,700,900]},\"alternate\":{\"id\":\"open-sans\",\"name\":\"Open Sans\",\"url\":\"//fonts.googleapis.com/css?family=Open+Sans:300,300i,400,400i,700,700i,800&display=swap\",\"family\":\"'Open Sans', arial, sans-serif\",\"size\":16,\"weight\":400,\"weights\":[300,400,700,800],\"styles\":{\"letterSpacing\":\"normal\",\"textTransform\":\"none\"}}},\"overridesAlternate\":[{\"locales\":[\"ja-JP\"],\"meta\":{\"alternate\":{\"family\":\"Open Sans, MS Mincho, '\uFF2D\uFF33 \uFF30\u660E\u671D', serif\"}}},{\"locales\":[\"ko-KR\"],\"meta\":{\"alternate\":{\"family\":\"Open Sans, '\uBC14\uD0D5', Batang, '\uBC14\uD0D5\uCCB4', BatangChe, serif\"}}},{\"locales\":[\"th-TH\"],\"meta\":{\"alternate\":{\"family\":\"Open Sans, Krungthep, Thonburi, Tahoma, sans-serif\"}}},{\"locales\":[\"zh-CN\",\"zh-SG\"],\"meta\":{\"alternate\":{\"family\":\"Open Sans, '\u534E\u6587\u9ED1\u4F53', STHeiti, Heiti SC, sans-serif\"}}},{\"locales\":[\"zh-HK\",\"zh-TW\"],\"meta\":{\"alternate\":{\"family\":\"Open Sans, Hiragino Sans GB, sans-serif\"}}}],\"overridesPrimary\":[{\"locales\":[\"vi-VN\",\"ta-IN\",\"mr-IN\",\"hi-IN\"],\"meta\":{\"primary\":{\"family\":\"Georgia, serif\"}}},{\"locales\":[\"ja-JP\"],\"meta\":{\"primary\":{\"family\":\"Playfair Display, Hiragino Mincho Pro, '\u30D2\u30E9\u30AE\u30CE\u660E\u671DPro', Hiragino Mincho ProN, '\u30D2\u30E9\u30AE\u30CE\u660E\u671DProN', serif\"}}},{\"locales\":[\"ko-KR\"],\"meta\":{\"primary\":{\"family\":\"Playfair Display, '\uC560\uD50C\uACE0\uB515', Apple SD Gothic Neo, '\uC560\uD50C\uACE0\uB515', AppleGothic, sans-serif\"}}},{\"locales\":[\"th-TH\"],\"meta\":{\"primary\":{\"family\":\"Playfair Display, Thonburi, Tahoma, sans-serif\"}}},{\"locales\":[\"zh-CN\",\"zh-SG\"],\"meta\":{\"primary\":{\"family\":\"Playfair Display, Hiragino Sans GB, sans-serif\"}}},{\"locales\":[\"zh-HK\",\"zh-TW\"],\"meta\":{\"primary\":{\"family\":\"Playfair Display, '\u5137\u9ED1 Pro', LiHei Pro, sans-serif\"}}}]},\"alternate\":{\"id\":\"source-sans-pro\",\"description\":\"\",\"tags\":[],\"meta\":{\"order\":20,\"alternate\":{\"id\":\"source-sans-pro\",\"name\":\"Source Sans Pro\",\"url\":\"//fonts.googleapis.com/css?family=Source+Sans+Pro:300,300i,400,400i,700,700i&display=swap\",\"family\":\"'Source Sans Pro', arial, sans-serif\",\"size\":16,\"weight\":400,\"weights\":[300,400,700],\"styles\":{\"letterSpacing\":\"normal\",\"textTransform\":\"none\"}}}},\"logo\":{\"id\":\"montserrat\",\"description\":\"Urban, upright, fonts that offer stylish, contemporary professionalism.\",\"tags\":[\"sans-serif\",\"modern\",\"clean\"],\"meta\":{\"order\":23,\"logo\":{\"id\":\"montserrat\",\"name\":\"Montserrat\",\"url\":\"//fonts.googleapis.com/css?family=Montserrat:600,700&display=swap\",\"family\":\"'Montserrat', sans-serif\",\"size\":16,\"weight\":700,\"weights\":[600,700],\"styles\":{\"letterSpacing\":\"4px\",\"textTransform\":\"uppercase\",\"fontWeight\":700,\"fontSize\":\"xlarge\"}}}}}},\"theme\":\"Theme13\",\"paintJob\":\"LIGHT_ALT\"}");
Core.utils.deferBootstrap({elId:'bs-1',componentName:'@widget/LAYOUT/bs-Hamburger-Component',props:JSON.parse("{\"toggleId\":\"n-188850-navId-mobile\",\"uniqueId\":\"n-188850\",\"style\":{\"color\":\"highContrast\",\":hover\":{\"color\":\"highlight\"},\"@md\":{\"display\":\"none\"}},\"widgetId\":\"71a5b96d-5d09-4403-9988-2116efa4263f\",\"section\":\"default\",\"category\":\"accent\",\"locale\":\"en-GB\",\"env\":\"production\",\"renderMode\":\"PUBLISH\"}"),context:JSON.parse("{\"widgetId\":\"71a5b96d-5d09-4403-9988-2116efa4263f\",\"widgetType\":\"HEADER\",\"widgetPreset\":\"header9\",\"group\":\"Section\",\"groupType\":\"Default\",\"section\":\"default\",\"category\":\"accent\",\"fontSize\":\"medium\",\"fontFamily\":\"alternate\",\"websiteThemeOverrides\":{\"ButtonPrimary\":{\"value\":{\"color\":\"HIGHCONTRAST\"}},\"ButtonSpotlight\":{\"value\":{\"color\":\"HIGHCONTRAST\"}}},\"widgetThemeOverrides\":{\"LogoAlpha\":{\"byType\":{\"LogoHeading\":{\"value\":{\"fontScaleMultiplier\":0.8}}}}}}"),contextKey:'context-bs-1',radpack:"@widget/LAYOUT/bs-Hamburger-Component"},false);
window.wsb["DynamicFontScaler"]=function(e){let t,{containerId:o,targetId:n,fontSizes:r,maxLines:a,prioritizeDefault:s}=e;if("undefined"==typeof document)return;const i=document.getElementById(o),c=document.getElementById(n);function l(e){return function(e){const t=parseInt(d(e,"padding-left")||0,10),o=parseInt(d(e,"padding-right")||0,10);return e.scrollWidth+t+o}(e)<=i.clientWidth&&function(e){const t=e.offsetHeight,o=parseInt(d(e,"line-height"),10)||1;return Math.floor(t/o)}(e)<=a}function p(){if(!i||!c||t===window.innerWidth)return;if(c.hasAttribute("data-font-scaled"))return void function(){c.removeAttribute("data-last-size");const e=document.querySelector(`#${n}-style`);e&&e.parentNode.removeChild(e)}();t=window.innerWidth;const e=Array.prototype.slice.call(i.querySelectorAll(`[data-scaler-id="scaler-${o}"]`)).sort(((e,t)=>r.indexOf(e.getAttribute("data-size"))-r.indexOf(t.getAttribute("data-size"))));if(i.clientWidth&&e.length){const t=i.style.width||"";i.style.width="100%",e.forEach((e=>{e.style.display="inline-block",e.style.maxWidth=`${i.clientWidth}px`}));const o=function(e){return e.find(l)||e[e.length-1]}(e);!function(e){e.forEach((e=>{e.style.display="none",e.style.maxWidth=""}))}(e),i.style.width=t;const r=d(o,"font-size"),a=c.getAttribute("data-last-size");if(r&&r!==a){if(s){const e=d(c,"font-size");if(parseInt(r,10)>=parseInt(e,10))return}c.setAttribute("data-last-size",r);let e=document.querySelector(`#${n}-style`);e||(e=document.createElement("style"),e.id=`${n}-style`,document.head.appendChild(e)),e.textContent=`#${c.id} { font-size: ${r} !important; }`}}}function d(e,t){return document.defaultView.getComputedStyle(e).getPropertyValue(t)}p(),window.addEventListener("resize",p)};
window.wsb["DynamicFontScaler"](JSON.parse("{\"containerId\":\"logo-container-188857\",\"targetId\":\"logo-text-188858\",\"fontSizes\":[\"xxlarge\",\"xlarge\",\"large\"],\"maxLines\":3,\"prioritizeDefault\":false}"));
window.wsb["DynamicFontScaler"](JSON.parse("{\"containerId\":\"logo-container-188871\",\"targetId\":\"logo-text-188872\",\"fontSizes\":[\"xxlarge\",\"xlarge\",\"large\"],\"maxLines\":1,\"prioritizeDefault\":false}"));
Core.utils.deferBootstrap({elId:'bs-2',componentName:'@widget/LAYOUT/bs-LinkAwareComponent',props:JSON.parse("{\"toggleId\":\"more-188873\",\"label\":\"More\",\"dataAid\":\"NAV_MORE\",\"navBarId\":\"navContainer-188863\",\"widgetId\":\"71a5b96d-5d09-4403-9988-2116efa4263f\",\"section\":\"default\",\"category\":\"accent\",\"locale\":\"en-GB\",\"env\":\"production\",\"renderMode\":\"PUBLISH\"}"),context:JSON.parse("{\"widgetId\":\"71a5b96d-5d09-4403-9988-2116efa4263f\",\"widgetType\":\"HEADER\",\"widgetPreset\":\"header9\",\"group\":\"Nav\",\"groupType\":\"Default\",\"section\":\"default\",\"category\":\"accent\",\"fontSize\":\"medium\",\"fontFamily\":\"alternate\",\"websiteThemeOverrides\":{\"ButtonPrimary\":{\"value\":{\"color\":\"HIGHCONTRAST\"}},\"ButtonSpotlight\":{\"value\":{\"color\":\"HIGHCONTRAST\"}}},\"widgetThemeOverrides\":{\"LogoAlpha\":{\"byType\":{\"LogoHeading\":{\"value\":{\"fontScaleMultiplier\":0.8}}}}}}"),contextKey:'context-bs-1',radpack:"@widget/LAYOUT/bs-LinkAwareComponent"},false);
window.wsb["CalculateSplitNavSpacing"]=function(e){let{containerId:a,navId:n,splitNavId:l,logoImageId:i,inlineUtilitiesMenu:o,forceBreakpoint:r}=e;let c,s,g,p,d,u,y,m;const b=document.getElementById(n),v=document.getElementById(l);function h(){if(s||!b||!T(b))return;p=Array.from(b.children),g=Array.from(b.children),g.forEach(E),o&&(d=g.pop(),M(d)),u=g.pop();const e=u.querySelector("ul");y=e?Array.from(e.children):[],b.style.whiteSpace="normal",m=T(b.parentElement,"floor"),b.style.whiteSpace="nowrap",window.requestAnimationFrame(f)}function f(){const e=d&&d.querySelector("[data-ux='Pipe']");e&&R(e);const t=g,a=t.map((e=>T(e)));const n=d?T(d):0;let l=0,i=a.concat(n).findIndex((e=>{if(l+e>m)return e;l+=e}));i<0&&(i=a.length);const o=a.slice(0,i);let r,c,s=a.slice(i);if(k(s)+n<m)r=!1,c=0;else{r=!0,c=T(u);let e=0,t=c+n;s.some((a=>{if(t+=a,t>=m)return!0;e++})),s=s.slice(0,e)}for(;o.length>1&&B(o,s.concat([c,n]).filter(Boolean));)s.unshift(o.pop());const b=Array.from(v.children);if(I(b,0,o.length,M),I(t,0,o.length,R),I(y,0,o.length,R),I(b,o.length,o.length+s.length,R),I(t,o.length,o.length+s.length,M),I(y,o.length,o.length+s.length,R),I(b,o.length+s.length,t.length,R),I(t,o.length+s.length,t.length,R),I(y,o.length+s.length,t.length,M),r?M(u):R(u),function(){const e=p.filter((e=>"visible"===e.style.visibility&&e.classList.contains("nav-item"))),t=e[e.length-1];t&&t.classList.add("last-visible-nav-item")}(),e){t.find((e=>"visible"===e.style.visibility))&&M(e)}window.dispatchEvent(new Event("NavItemsResized"))}function w(){window.innerWidth<1024&&r&&r!==t.Q||(window.clearTimeout(c),c=window.setTimeout(h,50))}function I(e,t,a,n){e=e.slice(t,a).map(n).concat(e.slice(a))}function E(e){e.style.visibility="hidden",e.style.display="",e.classList.remove("last-visible-nav-item","visible")}function R(e){e.style.display="none",e.classList.remove("visible")}function M(e){e.style.visibility="visible",e.style.display="",e.classList.add("visible")}function k(e){return e.reduce(((e,t)=>e+t),0)}function T(e){let t=arguments.length>1&&void 0!==arguments[1]?arguments[1]:"ceil";return"ceil"===t?Math.ceil(e.getBoundingClientRect().width):Math.floor(e.getBoundingClientRect().width)}function B(e,t){if(!t.length&&e.length>1)return!0;const a=e[e.length-1],n=k(e),l=k(t);return Math.abs(n-l)>Math.abs(n-a-(l+a))}if(w(),window.ResizeObserver){const e=new window.ResizeObserver(w);return[document.getElementById(a),document.getElementById(i)].forEach((t=>t&&e.observe(t))),()=>{s=!0,e.disconnect()}}return window.addEventListener("resize",w,{passive:!0}),()=>{s=!0,window.removeEventListener("resize",w,{passive:!0})}};
window.wsb["CalculateSplitNavSpacing"](JSON.parse("{\"navId\":\"n-188850188862-navId-2\",\"inlineUtilitiesMenu\":false,\"containerId\":\"navContainer-188863\",\"splitNavId\":\"n-188850188861-navId-1\"}"));
window.wsb["StickyNav"]=function(e){let{uniqueId:t,logoHeight:o,hasAnimation:a,anchorId:n}=e;const r=o>104?120:80;let i,c,s,l,g=window.innerWidth<768,d=0;const u=()=>{const e=Array.from(document.querySelectorAll('[data-aid="HEADER_LOGO_IMAGE_RENDERED"]')).find((e=>e.offsetHeight));if(!e)return null;const t=window.getComputedStyle(e);return s=t.getPropertyValue("box-shadow"),l=t.getPropertyValue("margin-top"),e},p={i18nBar:document.querySelector('[data-aid="i18n_BAR_RENDERED"]'),stickyNav:document.getElementById(t),stickyNavParent:document.querySelector("[data-stickynav-wrapper]"),logo:u(),freemiumAd:document.querySelector("[data-freemium-ad]"),anchor:document.getElementById(n)},y=()=>{const{stickyNav:e,stickyNavParent:t}=p;let a=e.offsetHeight;g&&e.offsetHeight<o&&o<=104&&(a=o),t.style.height=`${a}px`};new IntersectionObserver((e=>e.forEach((e=>{let{isIntersecting:t}=e;return window.requestAnimationFrame((()=>(e=>{if(c===e)return;const{stickyNav:t,logo:n,i18nBar:i,freemiumAd:u,stickyNavParent:h}=p;p.freemiumAd=u||document.querySelector("[data-freemium-ad]"),d=d||p.freemiumAd?.offsetHeight,e&&h&&!h.style.height&&y(),i&&(i.style.display=e?"none":"flex"),n&&(n.style.cssText=e?`max-height:${g?50:64}px;box-shadow:none;margin-top:0px;`:`max-height:${g?r:o}px;box-shadow:${s};margin-top:${l};`,"HEADER_LOGO_OVERHANG_CONTAINER"===n.parentNode.getAttribute("data-aid")&&(n.parentNode.style.height=e?"auto":"1em")),t.style.cssText=e?`position:fixed;z-index:10000;left:0px;right:0px;top:${d||0}px;`:"",a&&(e?t.classList.add("sticky-animate","x-c-bg"):t.classList.remove("sticky-animate","x-c-bg")),c=e})(!t)))})))).observe(p.anchor);const h=/#[^\\?]*/;function m(e){const t=(e.target.href.match(h)[0]||[]).slice(1),o=document.getElementById(t);o&&f(o)}function f(e){const t=p.stickyNav.clientHeight;let o=e.offsetTop;const a=setInterval((()=>{e.offsetTop===o?(clearInterval(a),scrollTo({top:e.offsetTop-t})):o=e.offsetTop}),300)}if(Array.from(document.querySelectorAll("a")).filter((e=>h.test(e.href))).forEach((e=>e.addEventListener("click",m))),window.location.hash){const e=document.getElementById(window.location.hash.slice(1));e&&f(e)}window.addEventListener("resize",(()=>{clearTimeout(i),i=setTimeout((()=>{g=window.innerWidth<768,p.logo=u(),y()}),250)}),{passive:!0})};
window.wsb["StickyNav"](JSON.parse("{\"uniqueId\":\"header_stickynav188852\",\"anchorId\":\"header_stickynav-anchor188853\",\"logoHeight\":80,\"hasAnimation\":true}"));
window.wsb['context-bs-3']=JSON.parse("{\"env\":\"production\",\"renderMode\":\"PUBLISH\",\"fonts\":[\"playfair-display\",\"source-sans-pro\",\"montserrat\"],\"colors\":[\"#128a2a\"],\"fontScale\":\"medium\",\"locale\":\"en-GB\",\"language\":\"en\",\"resellerId\":1,\"internalLinks\":{},\"isInternalPage\":true,\"navigationMap\":{\"287f429b-ed6e-416e-aa2a-319409973b79\":{\"isFlyoutMenu\":false,\"active\":false,\"pageId\":\"287f429b-ed6e-416e-aa2a-319409973b79\",\"name\":\"Home\",\"href\":\"/\",\"target\":\"\",\"visible\":true,\"requiresAuth\":false,\"tags\":[],\"rel\":\"\",\"type\":\"page\",\"showInFooter\":false},\"3001777b-4a14-4913-9ac8-db7a23c35334\":{\"isFlyoutMenu\":false,\"active\":true,\"pageId\":\"3001777b-4a14-4913-9ac8-db7a23c35334\",\"name\":\"Hydrogen Fuel System\",\"href\":\"/hydrogen-fuel-system\",\"target\":\"\",\"visible\":true,\"requiresAuth\":false,\"tags\":[],\"rel\":\"\",\"type\":\"page\",\"showInFooter\":false},\"3fb700cb-942a-4f9d-a5a1-be5b671b9886\":{\"isFlyoutMenu\":false,\"active\":false,\"pageId\":\"3fb700cb-942a-4f9d-a5a1-be5b671b9886\",\"name\":\"404\",\"href\":\"/404\",\"target\":\"\",\"visible\":false,\"requiresAuth\":false,\"tags\":[\"404\"],\"rel\":\"\",\"type\":\"page\",\"showInFooter\":false},\"6a4c9aa5-c36b-4903-994e-0df15fa0c212\":{\"isFlyoutMenu\":false,\"active\":false,\"pageId\":\"6a4c9aa5-c36b-4903-994e-0df15fa0c212\",\"name\":\"Electronic Differential\",\"href\":\"/electronic-differential\",\"target\":\"\",\"visible\":true,\"requiresAuth\":false,\"tags\":[],\"rel\":\"\",\"type\":\"page\",\"showInFooter\":false},\"84d64b98-c223-4a2a-856b-c70fb683a6fe\":{\"isFlyoutMenu\":false,\"active\":false,\"pageId\":\"84d64b98-c223-4a2a-856b-c70fb683a6fe\",\"name\":\"SiC JFET RTL CPU\",\"href\":\"/sic-jfet-rtl-cpu\",\"target\":\"\",\"visible\":true,\"requiresAuth\":false,\"tags\":[],\"rel\":\"\",\"type\":\"page\",\"showInFooter\":false},\"cee9dd60-e2ce-4b3b-9703-ba597c205d08\":{\"isFlyoutMenu\":false,\"active\":false,\"pageId\":\"cee9dd60-e2ce-4b3b-9703-ba597c205d08\",\"name\":\"About Me\",\"href\":\"/about-me\",\"target\":\"\",\"visible\":true,\"requiresAuth\":false,\"tags\":[],\"rel\":\"\",\"type\":\"page\",\"showInFooter\":false}},\"dials\":{\"colors\":[{\"id\":\"#128a2a\",\"meta\":{\"primary\":\"rgb(18, 138, 42)\",\"accent\":\"rgb(17, 17, 17)\",\"neutral\":\"rgb(255, 255, 255)\"}}],\"fonts\":{\"primary\":{\"id\":\"playfair-display\",\"description\":\"Distinctive fonts that presents a 21st century take on a vintage, professional feel.\",\"tags\":[\"serif\",\"classic\",\"conservative\"],\"meta\":{\"order\":30,\"primary\":{\"id\":\"playfair-display\",\"name\":\"Playfair Display\",\"url\":\"//fonts.googleapis.com/css?family=Playfair+Display:400,700,900&display=swap\",\"family\":\"'Playfair Display', Georgia, serif\",\"size\":16,\"weight\":400,\"weights\":[400,700,900]},\"alternate\":{\"id\":\"open-sans\",\"name\":\"Open Sans\",\"url\":\"//fonts.googleapis.com/css?family=Open+Sans:300,300i,400,400i,700,700i,800&display=swap\",\"family\":\"'Open Sans', arial, sans-serif\",\"size\":16,\"weight\":400,\"weights\":[300,400,700,800],\"styles\":{\"letterSpacing\":\"normal\",\"textTransform\":\"none\"}}},\"overridesAlternate\":[{\"locales\":[\"ja-JP\"],\"meta\":{\"alternate\":{\"family\":\"Open Sans, MS Mincho, '\uFF2D\uFF33 \uFF30\u660E\u671D', serif\"}}},{\"locales\":[\"ko-KR\"],\"meta\":{\"alternate\":{\"family\":\"Open Sans, '\uBC14\uD0D5', Batang, '\uBC14\uD0D5\uCCB4', BatangChe, serif\"}}},{\"locales\":[\"th-TH\"],\"meta\":{\"alternate\":{\"family\":\"Open Sans, Krungthep, Thonburi, Tahoma, sans-serif\"}}},{\"locales\":[\"zh-CN\",\"zh-SG\"],\"meta\":{\"alternate\":{\"family\":\"Open Sans, '\u534E\u6587\u9ED1\u4F53', STHeiti, Heiti SC, sans-serif\"}}},{\"locales\":[\"zh-HK\",\"zh-TW\"],\"meta\":{\"alternate\":{\"family\":\"Open Sans, Hiragino Sans GB, sans-serif\"}}}],\"overridesPrimary\":[{\"locales\":[\"vi-VN\",\"ta-IN\",\"mr-IN\",\"hi-IN\"],\"meta\":{\"primary\":{\"family\":\"Georgia, serif\"}}},{\"locales\":[\"ja-JP\"],\"meta\":{\"primary\":{\"family\":\"Playfair Display, Hiragino Mincho Pro, '\u30D2\u30E9\u30AE\u30CE\u660E\u671DPro', Hiragino Mincho ProN, '\u30D2\u30E9\u30AE\u30CE\u660E\u671DProN', serif\"}}},{\"locales\":[\"ko-KR\"],\"meta\":{\"primary\":{\"family\":\"Playfair Display, '\uC560\uD50C\uACE0\uB515', Apple SD Gothic Neo, '\uC560\uD50C\uACE0\uB515', AppleGothic, sans-serif\"}}},{\"locales\":[\"th-TH\"],\"meta\":{\"primary\":{\"family\":\"Playfair Display, Thonburi, Tahoma, sans-serif\"}}},{\"locales\":[\"zh-CN\",\"zh-SG\"],\"meta\":{\"primary\":{\"family\":\"Playfair Display, Hiragino Sans GB, sans-serif\"}}},{\"locales\":[\"zh-HK\",\"zh-TW\"],\"meta\":{\"primary\":{\"family\":\"Playfair Display, '\u5137\u9ED1 Pro', LiHei Pro, sans-serif\"}}}]},\"alternate\":{\"id\":\"source-sans-pro\",\"description\":\"\",\"tags\":[],\"meta\":{\"order\":20,\"alternate\":{\"id\":\"source-sans-pro\",\"name\":\"Source Sans Pro\",\"url\":\"//fonts.googleapis.com/css?family=Source+Sans+Pro:300,300i,400,400i,700,700i&display=swap\",\"family\":\"'Source Sans Pro', arial, sans-serif\",\"size\":16,\"weight\":400,\"weights\":[300,400,700],\"styles\":{\"letterSpacing\":\"normal\",\"textTransform\":\"none\"}}}},\"logo\":{\"id\":\"montserrat\",\"description\":\"Urban, upright, fonts that offer stylish, contemporary professionalism.\",\"tags\":[\"sans-serif\",\"modern\",\"clean\"],\"meta\":{\"order\":23,\"logo\":{\"id\":\"montserrat\",\"name\":\"Montserrat\",\"url\":\"//fonts.googleapis.com/css?family=Montserrat:600,700&display=swap\",\"family\":\"'Montserrat', sans-serif\",\"size\":16,\"weight\":700,\"weights\":[600,700],\"styles\":{\"letterSpacing\":\"4px\",\"textTransform\":\"uppercase\",\"fontWeight\":700,\"fontSize\":\"xlarge\"}}}}}},\"theme\":\"Theme13\",\"paintJob\":\"LIGHT_ALT\"}");
Core.utils.deferBootstrap({elId:'bs-3',componentName:'@widget/PDF/bs-Component',props:JSON.parse("{\"pdfUrl\":\"//img1.wsimg.com/blobby/go/3c6514b3-c16b-48b5-881f-6c2a381070af/L2AHTB2%20Final%20Report%20(1).pdf\",\"staticContent\":{\"defaultSectionTitle\":\"PDF Viewer\",\"defaultDownloadLink\":\"Download PDF\",\"placeholderTextPublish\":\"File coming soon.\",\"placeholderTextEditor\":\"Add a PDF file to get started.\",\"loadingStateMessage\":\"Loading files\",\"previous\":\"Previous\",\"next\":\"Next\"},\"isMobile\":null,\"widgetId\":\"74201fbc-982f-472a-80f8-e26ba0a2590c\",\"section\":\"default\",\"category\":\"neutral\",\"locale\":\"en-GB\",\"env\":\"production\",\"renderMode\":\"PUBLISH\"}"),context:JSON.parse("{\"widgetId\":\"74201fbc-982f-472a-80f8-e26ba0a2590c\",\"widgetType\":\"PDF\",\"widgetPreset\":\"pdf1\",\"group\":\"Section\",\"groupType\":\"Default\",\"section\":\"default\",\"category\":\"neutral\",\"fontSize\":\"medium\",\"fontFamily\":\"alternate\",\"websiteThemeOverrides\":{\"ButtonPrimary\":{\"value\":{\"color\":\"HIGHCONTRAST\"}},\"ButtonSpotlight\":{\"value\":{\"color\":\"HIGHCONTRAST\"}}},\"widgetThemeOverrides\":{}}"),contextKey:'context-bs-3',radpack:"@widget/PDF/bs-Component"},false);
window.wsb["CookieBannerScript"]=function(e){let{id:t,acceptCookie:o,dismissCookie:a}=e;const n=864e5;let i,l,r;function s(e){let t=arguments.length>1&&void 0!==arguments[1]?arguments[1]:60;const o=new Date;o.setTime(o.getTime()+n*t);const a=`expires=${o.toUTCString()}`;document.cookie=`${e}=true;${a};path=/`}function c(e){return document.cookie.includes(e)}function p(){l&&l.removeEventListener("click",g),r&&r.removeEventListener("click",d),i.style.display="none"}function g(e){e.preventDefault(),u(),s(a),s(o),p()}function d(e){var t;e.preventDefault(),s(a),c(o)&&(t=o,document.cookie=`${t}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`),p()}function u(){window._allowCT=!0,window._allowCTListener&&window._allowCTListener.forEach((e=>e()))}c(o)?u():c(a)||setTimeout((()=>{i=document.getElementById(`${t}-banner`),l=document.getElementById(`${t}-accept`),r=document.getElementById(`${t}-decline`),l&&l.addEventListener("click",g),r&&r.addEventListener("click",d),i.style.transform="translateY(-500px)"}),200)};
window.wsb["CookieBannerScript"](JSON.parse("{\"id\":\"f7f8beb8-d5f9-4a36-b00f-0146b97f0c5b\",\"dismissCookie\":\"cookie_warning_dismissed\",\"acceptCookie\":\"cookie_terms_accepted\"}"));
document.getElementById('page-188849').addEventListener('click', function() {}, false);
var t=document.createElement("script");t.type="text/javascript",t.addEventListener("load",()=>{window.tti.calculateTTI(({name:t,value:e}={})=>{let i={"wam_site_hasPopupWidget":false,"wam_site_hasMessagingWidget":false,"wam_site_headerTreatment":false,"wam_site_hasSlideshow":false,"wam_site_hasFreemiumBanner":false,"wam_site_businessCategory":"coming_soon","wam_site_theme":"layout13","wam_site_locale":"en-GB","wam_site_fontPack":"playfair-display","wam_site_cookieBannerEnabled":true,"wam_site_membershipEnabled":true,"wam_site_hasHomepageHTML":false,"wam_site_hasHomepageShop":false,"wam_site_hasHomepageOla":false,"wam_site_hasHomepageBlog":false,"wam_site_hasShop":false,"wam_site_hasOla":false,"wam_site_planType":"businessPlus","wam_site_isHomepage":false,"wam_site_htmlWidget":false};window.networkInfo&&window.networkInfo.downlink&&(i=Object.assign({},i,{["wam_site_networkSpeed"]:window.networkInfo.downlink.toFixed(2)})),window.tti.setCustomProperties(i),window.tti._collectVitals({name:t,value:e})})}),t.setAttribute("src","//img1.wsimg.com/traffic-assets/js/tccl-tti.min.js"),document.body.appendChild(t);
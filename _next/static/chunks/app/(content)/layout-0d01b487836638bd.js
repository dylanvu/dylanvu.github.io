(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[948],{8565:function(e,t,r){Promise.resolve().then(r.bind(r,6332))},6332:function(e,t,r){"use strict";r.r(t),r.d(t,{default:function(){return j}});var n=r(7437),s=r(1621),i=r(2265),c=r(538);function u(){let e=(0,i.useRef)(!1);return(0,c.L)(()=>(e.current=!0,()=>{e.current=!1}),[]),e}var l=r(3041),o=r(8243),a=r(961);class f extends i.Component{getSnapshotBeforeUpdate(e){let t=this.props.childRef.current;if(t&&e.isPresent&&!this.props.isPresent){let e=this.props.sizeRef.current;e.height=t.offsetHeight||0,e.width=t.offsetWidth||0,e.top=t.offsetTop,e.left=t.offsetLeft}return null}componentDidUpdate(){}render(){return this.props.children}}function d({children:e,isPresent:t}){let r=(0,i.useId)(),n=(0,i.useRef)(null),s=(0,i.useRef)({width:0,height:0,top:0,left:0});return(0,i.useInsertionEffect)(()=>{let{width:e,height:i,top:c,left:u}=s.current;if(t||!n.current||!e||!i)return;n.current.dataset.motionPopId=r;let l=document.createElement("style");return document.head.appendChild(l),l.sheet&&l.sheet.insertRule(`
          [data-motion-pop-id="${r}"] {
            position: absolute !important;
            width: ${e}px !important;
            height: ${i}px !important;
            top: ${c}px !important;
            left: ${u}px !important;
          }
        `),()=>{document.head.removeChild(l)}},[t]),i.createElement(f,{isPresent:t,childRef:n,sizeRef:s},i.cloneElement(e,{ref:n}))}let p=({children:e,initial:t,isPresent:r,onExitComplete:n,custom:s,presenceAffectsLayout:c,mode:u})=>{let l=(0,a.h)(h),f=(0,i.useId)(),p=(0,i.useMemo)(()=>({id:f,initial:t,isPresent:r,custom:s,onExitComplete:e=>{for(let t of(l.set(e,!0),l.values()))if(!t)return;n&&n()},register:e=>(l.set(e,!1),()=>l.delete(e))}),c?void 0:[r]);return(0,i.useMemo)(()=>{l.forEach((e,t)=>l.set(t,!1))},[r]),i.useEffect(()=>{r||l.size||!n||n()},[r]),"popLayout"===u&&(e=i.createElement(d,{isPresent:r},e)),i.createElement(o.O.Provider,{value:p},e)};function h(){return new Map}var m=r(781),v=r(6567);let x=e=>e.key||"",E=({children:e,custom:t,initial:r=!0,onExitComplete:n,exitBeforeEnter:s,presenceAffectsLayout:o=!0,mode:a="sync"})=>{var f;(0,v.k)(!s,"Replace exitBeforeEnter with mode='wait'");let d=(0,i.useContext)(m.p).forceRender||function(){let e=u(),[t,r]=(0,i.useState)(0),n=(0,i.useCallback)(()=>{e.current&&r(t+1)},[t]),s=(0,i.useCallback)(()=>l.Wi.postRender(n),[n]);return[s,t]}()[0],h=u(),E=function(e){let t=[];return i.Children.forEach(e,e=>{(0,i.isValidElement)(e)&&t.push(e)}),t}(e),y=E,j=(0,i.useRef)(new Map).current,k=(0,i.useRef)(y),R=(0,i.useRef)(new Map).current,_=(0,i.useRef)(!0);if((0,c.L)(()=>{_.current=!1,function(e,t){e.forEach(e=>{let r=x(e);t.set(r,e)})}(E,R),k.current=y}),f=()=>{_.current=!0,R.clear(),j.clear()},(0,i.useEffect)(()=>()=>f(),[]),_.current)return i.createElement(i.Fragment,null,y.map(e=>i.createElement(p,{key:x(e),isPresent:!0,initial:!!r&&void 0,presenceAffectsLayout:o,mode:a},e)));y=[...y];let g=k.current.map(x),w=E.map(x),P=g.length;for(let e=0;e<P;e++){let t=g[e];-1!==w.indexOf(t)||j.has(t)||j.set(t,void 0)}return"wait"===a&&j.size&&(y=[]),j.forEach((e,r)=>{if(-1!==w.indexOf(r))return;let s=R.get(r);if(!s)return;let c=g.indexOf(r),u=e;u||(u=i.createElement(p,{key:x(s),isPresent:!1,onExitComplete:()=>{j.delete(r);let e=Array.from(R.keys()).filter(e=>!w.includes(e));if(e.forEach(e=>R.delete(e)),k.current=E.filter(t=>{let n=x(t);return n===r||e.includes(n)}),!j.size){if(!1===h.current)return;d(),n&&n()}},custom:t,presenceAffectsLayout:o,mode:a},s),j.set(r,u)),y.splice(c,0,u)}),y=y.map(e=>{let t=e.key;return j.has(t)?e:i.createElement(p,{key:x(e),isPresent:!0,presenceAffectsLayout:o,mode:a},e)}),i.createElement(i.Fragment,null,j.size?y:y.map(e=>(0,i.cloneElement)(e)))};var y=r(4033);function j(e){let{children:t}=e;return(0,y.usePathname)(),(0,n.jsxs)("div",{children:[(0,n.jsx)(s.default,{}),(0,n.jsx)("div",{className:"content-container",children:(0,n.jsx)("div",{className:"content",children:(0,n.jsx)("div",{className:"page",children:(0,n.jsx)(E,{mode:"wait",onExitComplete:()=>console.log("Animate exit"),children:t})})})})]})}},1621:function(e,t,r){"use strict";r.r(t);var n=r(7437),s=r(2265),i=r(1396),c=r.n(i);r(5637),t.default=()=>{let[e,t]=(0,s.useState)("inactive");return(0,n.jsxs)("nav",{className:"navbar ".concat(e),id:"navbar",children:[(0,n.jsx)(c(),{className:"nav-link",href:"/",children:(0,n.jsx)("span",{className:"name",children:"Dylan Vu"})}),(0,n.jsx)(c(),{className:"nav-link",style:{color:"#2081C3"},href:"/projects",children:(0,n.jsx)("span",{children:"Projects"})}),(0,n.jsx)(c(),{className:"nav-link",style:{color:"#FE5D26"},href:"/Dylan_Vu_Resume.pdf",target:"_blank",rel:"noreferrer",children:(0,n.jsx)("span",{children:"Resume"})}),(0,n.jsx)(c(),{className:"nav0link",style:{color:"#6DA34D"},href:"/contact",children:(0,n.jsx)("span",{children:"Contact"})}),(0,n.jsxs)("div",{className:"hamburger ".concat(e),id:"hamburger",onClick:()=>void("inactive"===e?t("is-responsive"):t("inactive")),children:[(0,n.jsx)("span",{className:"line"}),(0,n.jsx)("span",{className:"line"}),(0,n.jsx)("span",{className:"line"})]})]})}},5637:function(){},622:function(e,t,r){"use strict";/**
 * @license React
 * react-jsx-runtime.production.min.js
 *
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */var n=r(2265),s=Symbol.for("react.element"),i=(Symbol.for("react.fragment"),Object.prototype.hasOwnProperty),c=n.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.ReactCurrentOwner,u={key:!0,ref:!0,__self:!0,__source:!0};function l(e,t,r){var n,l={},o=null,a=null;for(n in void 0!==r&&(o=""+r),void 0!==t.key&&(o=""+t.key),void 0!==t.ref&&(a=t.ref),t)i.call(t,n)&&!u.hasOwnProperty(n)&&(l[n]=t[n]);if(e&&e.defaultProps)for(n in t=e.defaultProps)void 0===l[n]&&(l[n]=t[n]);return{$$typeof:s,type:e,key:o,ref:a,props:l,_owner:c.current}}t.jsx=l,t.jsxs=l},7437:function(e,t,r){"use strict";e.exports=r(622)},4033:function(e,t,r){e.exports=r(8165)},781:function(e,t,r){"use strict";r.d(t,{p:function(){return s}});var n=r(2265);let s=(0,n.createContext)({})},8243:function(e,t,r){"use strict";r.d(t,{O:function(){return s}});var n=r(2265);let s=(0,n.createContext)(null)},3041:function(e,t,r){"use strict";r.d(t,{Pn:function(){return u},Wi:function(){return c},frameData:function(){return l},S6:function(){return o}});var n=r(6977);class s{constructor(){this.order=[],this.scheduled=new Set}add(e){if(!this.scheduled.has(e))return this.scheduled.add(e),this.order.push(e),!0}remove(e){let t=this.order.indexOf(e);-1!==t&&(this.order.splice(t,1),this.scheduled.delete(e))}clear(){this.order.length=0,this.scheduled.clear()}}let i=["prepare","read","update","preRender","render","postRender"],{schedule:c,cancel:u,state:l,steps:o}=function(e,t){let r=!1,n=!0,c={delta:0,timestamp:0,isProcessing:!1},u=i.reduce((e,t)=>(e[t]=function(e){let t=new s,r=new s,n=0,i=!1,c=!1,u=new WeakSet,l={schedule:(e,s=!1,c=!1)=>{let l=c&&i,o=l?t:r;return s&&u.add(e),o.add(e)&&l&&i&&(n=t.order.length),e},cancel:e=>{r.remove(e),u.delete(e)},process:s=>{if(i){c=!0;return}if(i=!0,[t,r]=[r,t],r.clear(),n=t.order.length)for(let r=0;r<n;r++){let n=t.order[r];n(s),u.has(n)&&(l.schedule(n),e())}i=!1,c&&(c=!1,l.process(s))}};return l}(()=>r=!0),e),{}),l=e=>u[e].process(c),o=()=>{let s=performance.now();r=!1,c.delta=n?1e3/60:Math.max(Math.min(s-c.timestamp,40),1),c.timestamp=s,c.isProcessing=!0,i.forEach(l),c.isProcessing=!1,r&&t&&(n=!1,e(o))},a=()=>{r=!0,n=!0,c.isProcessing||e(o)},f=i.reduce((e,t)=>{let n=u[t];return e[t]=(e,t=!1,s=!1)=>(r||a(),n.schedule(e,t,s)),e},{});return{schedule:f,cancel:e=>i.forEach(t=>u[t].cancel(e)),state:c,steps:u}}("undefined"!=typeof requestAnimationFrame?requestAnimationFrame:n.Z,!0)},6567:function(e,t,r){"use strict";r.d(t,{K:function(){return s},k:function(){return i}});var n=r(6977);let s=n.Z,i=n.Z},6613:function(e,t,r){"use strict";r.d(t,{j:function(){return n}});let n="undefined"!=typeof document},6977:function(e,t,r){"use strict";r.d(t,{Z:function(){return n}});let n=e=>e},961:function(e,t,r){"use strict";r.d(t,{h:function(){return s}});var n=r(2265);function s(e){let t=(0,n.useRef)(null);return null===t.current&&(t.current=e()),t.current}},538:function(e,t,r){"use strict";r.d(t,{L:function(){return i}});var n=r(2265),s=r(6613);let i=s.j?n.useLayoutEffect:n.useEffect}},function(e){e.O(0,[396,971,596,744],function(){return e(e.s=8565)}),_N_E=e.O()}]);
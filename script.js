(function(){
  'use strict';

  // TICKER
  var items = ["✦ Web3 is for everyone","🌸 Connect & Grow","💫 The future is feminine","✨ Be early. Be iconic.","🩷 Women in Web3","⚡ DeFi like a boss","🌍 Global & Unstoppable","💅 NFTs, DAOs & You","🚀 LetsConnect"];
  var inner = document.getElementById('ticker-inner');
  var full = [...items,...items].map(function(t){ return '<span style="padding:0 2.5rem;">'+t+'</span>'; }).join('');
  inner.innerHTML = full + full;

  // CURSOR
  var mouseX = window.innerWidth/2, mouseY = window.innerHeight/2;
  var smoothX = mouseX, smoothY = mouseY;
  var cursorGlow = document.getElementById('cursorGlow');
  var cursorDot  = document.getElementById('cursorDot');
  document.addEventListener('mousemove', function(e){
    mouseX = e.clientX; mouseY = e.clientY;
    cursorDot.style.left = mouseX+'px'; cursorDot.style.top = mouseY+'px';
  });
  var glowRafId = null;
  function glowLoop(){
    smoothX += (mouseX-smoothX)*0.08; smoothY += (mouseY-smoothY)*0.08;
    cursorGlow.style.left = smoothX+'px'; cursorGlow.style.top = smoothY+'px';
    glowRafId = requestAnimationFrame(glowLoop);
  }
  glowLoop();

  // LETTERS
  var text = "LET'S CONNECT";
  var container = document.getElementById('mainText');
  var BASE_DELAY = 1.0, INTERVAL = 0.09;
  var letterEls = [];
  text.split('').forEach(function(ch, i){
    var el = document.createElement('span');
    var isSpace = ch === ' ';
    var isApostrophe = ch === "'";
    el.className = 'main-letter' + (isSpace ? ' space' : '') + (isApostrophe ? ' apostrophe' : '');
    el.textContent = (isSpace || isApostrophe) ? '' : ch;
    el.style.animationDelay = (BASE_DELAY + i*INTERVAL)+'s, 0s';
    container.appendChild(el);
    letterEls.push({el:el, isSpace:isSpace || isApostrophe});
  });
  var totalTime = (BASE_DELAY + text.length*INTERVAL + 1)*1000;
  var lettersReady = false;
  setTimeout(function(){
    letterEls.forEach(function(item){
      if(!item.isSpace) item.el.classList.add('letter-revealed');
    });
    lettersReady = true;
  }, totalTime);

  // LET'S CONNECT karakter indexleri:
  // 0:L 1:E 2:T 3:' 4:S 5:  6:C 7:O 8:N 9:N 10:E 11:C 12:T
  var phrases = {
    0:  { initial:'L', text:'Ladies first — always.\nIn Web3, women lead the way. Always have, always will. 🌸' },
    1:  { initial:'E', text:'Early is everything.\nYou found us before the crowd. That makes you OG. ✨' },
    2:  { initial:'T', text:'Together we glow.\nThe real alpha? Community. Build together, win together. 💫' },
    4:  { initial:'S', text:'She who connects, wins.\nEvery great Web3 project starts with the right people. 🚀' },
    6:  { initial:'C', text:'Community is the real alpha.\nNot a wallet. Not a token. The people. Always. 💜' },
    7:  { initial:'O', text:'On-chain and unstoppable.\nEvery step you take is forever on the blockchain. ⛓️' },
    8:  { initial:'N', text:'NGMI? Not here — WAGMI.\nWe All Gonna Make It. Especially us. 🩷' },
    9:  { initial:'N', text:'NFTs, DAOs, DeFi — yours.\nThis space was built for everyone. Own it. 👑' },
    10: { initial:'E', text:'Empowered women empower women.\nThat\'s the LetsConnect way. Always. 🌍' },
    11: { initial:'C', text:'Connect & grow, every day.\nYour next collab is one click away. Find her here. ✦' },
    12: { initial:'T', text:'The future is feminine & onchain.\nWe\'re not coming — we\'re already here. 💅' },
  };

  var overlay      = document.getElementById('popupOverlay');
  var popupInitial = document.getElementById('popupInitial');
  var popupText    = document.getElementById('popupText');
  var popupTimer   = document.getElementById('popupTimer');
  var popupOpen = false, autoClose = null;

  function openPopup(idx, el){
    var d = phrases[idx]; if(!d || popupOpen) return;
    popupOpen = true;
    el.classList.add('letter-clicked');
    popupInitial.textContent = d.initial;
    popupText.innerHTML = d.text.replace(/\n/g,'<br>');
    popupTimer.style.animation = 'none';
    void popupTimer.offsetWidth;
    popupTimer.style.animation = 'timerShrink 4s linear forwards';
    overlay.classList.remove('closing');
    overlay.classList.add('active');
    var r = el.getBoundingClientRect();
    for(var i=0; i<10; i++) burst(r.left+r.width/2, r.top+r.height/2);
    clearTimeout(autoClose);
    autoClose = setTimeout(function(){ closePopup(el); }, 4000);
  }

  function closePopup(el){
    if(!popupOpen) return;
    clearTimeout(autoClose);
    overlay.classList.add('closing');
    if(el && el.classList) el.classList.remove('letter-clicked');
    setTimeout(function(){
      overlay.classList.remove('active','closing');
      popupOpen = false;
    }, 400);
  }

  overlay.addEventListener('click', function(){
    var clicked = container.querySelector('.letter-clicked');
    closePopup(clicked);
  });

  setTimeout(function(){
    letterEls.forEach(function(item, i){
      if(item.isSpace) return;
      item.el.addEventListener('click', function(e){
        e.stopPropagation(); openPopup(i, item.el);
      });
    });
  }, totalTime);

  // LETTER MOUSE REPEL + WAVE (glow ile senkron)
  var letterRafId = null;
  var REPEL_R = 150, PUSH_S = 18;
  var WAVE_INTERVAL = 6000; // 6 saniyede bir geçiş — yavaş
  var waveStart = performance.now();

  // Glow elementi oluştur
  var glowEl = document.createElement('div');
  glowEl.style.cssText = 'position:fixed;pointer-events:none;z-index:4;border-radius:50%;width:80px;height:120px;filter:blur(18px);background:radial-gradient(ellipse, rgba(180,130,255,0.55) 0%, rgba(220,160,255,0.25) 50%, transparent 80%);transform:translate(-50%,-50%);transition:none;';
  document.body.appendChild(glowEl);

  function letterLoop(ts){
    var waveElapsed = (ts - waveStart) % WAVE_INTERVAL;
    var progress = waveElapsed / WAVE_INTERVAL; // 0 → 1

    if(lettersReady){
      // Harflerin sol ve sağ kenarını bul
      var firstR = letterEls[0].el.getBoundingClientRect();
      var lastEl = letterEls[letterEls.length-1];
      var lastR = lastEl.el.getBoundingClientRect();
      var startX = firstR.left;
      var endX = lastR.right;
      var midY = firstR.top + firstR.height / 2;

      // Glow X pozisyonu: startX'ten endX'e
      var glowX = startX + (endX - startX) * progress;
      glowEl.style.left = glowX + 'px';
      glowEl.style.top = midY + 'px';
      glowEl.style.opacity = progress < 0.05 || progress > 0.95 ? '0' : '1';

      letterEls.forEach(function(item){
        if(item.isSpace) return;
        var r = item.el.getBoundingClientRect();
        var cx = r.left + r.width / 2;
        var cy = r.top + r.height / 2;
        var dx = mouseX - cx, dy = mouseY - cy;
        var dist = Math.sqrt(dx*dx + dy*dy);

        var repelX = 0, repelY = 0, sc = 1;
        if(dist < REPEL_R){
          var intensity = (1 - dist/REPEL_R); intensity *= intensity;
          var angle = Math.atan2(dy, dx);
          repelX = -Math.cos(angle) * intensity * PUSH_S;
          repelY = -Math.sin(angle) * intensity * PUSH_S;
          sc = 1 + intensity * 0.2;
          item.el.classList.add('letter-hover');
        } else {
          item.el.classList.remove('letter-hover');
        }

        // Glow bu harfin tam üzerinde mi?
        var glowDist = Math.abs(glowX - cx);
        var waveY = 0;
        if(glowDist < 50){
          var t = 1 - (glowDist / 50);
          waveY = -Math.sin(t * Math.PI) * 14;
        }

        item.el.style.transform = 'translate(' + repelX.toFixed(1) + 'px,' + (repelY + waveY).toFixed(1) + 'px) scale(' + sc.toFixed(3) + ')';
      });
    }
    letterRafId = requestAnimationFrame(letterLoop);
  }
  letterLoop(performance.now());



  // PARTICLES — Retina optimized
  var canvas = document.getElementById('particleCanvas');
  var ctx = canvas.getContext('2d');
  function resize(){
    var dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    canvas.width  = window.innerWidth  * dpr;
    canvas.height = window.innerHeight * dpr;
    canvas.style.width  = window.innerWidth  + 'px';
    canvas.style.height = window.innerHeight + 'px';
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.scale(dpr, dpr);
  }
  resize(); window.addEventListener('resize', resize);

  var pColors = [[169,125,232],[220,160,210],[139,94,200],[195,155,240],[232,192,225]];
  var particles = [];
  for(var i=0; i<50; i++){
    var c = pColors[Math.floor(Math.random()*pColors.length)];
    particles.push({
      x:Math.random()*window.innerWidth, y:Math.random()*window.innerHeight,
      r:Math.random()*2+0.5, color:c,
      alpha:Math.random()*0.4+0.05,
      bvx:(Math.random()-0.5)*0.35, bvy:(Math.random()-0.5)*0.25-0.06,
      vx:0, vy:0, aDir:Math.random()>0.5?1:-1, aSpd:Math.random()*0.003+0.001,
    });
  }

  var pRafId = null;
  function pLoop(){
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    for(var i=0; i<particles.length; i++){
      var p = particles[i];
      var dx=p.x-mouseX, dy=p.y-mouseY, d=Math.sqrt(dx*dx+dy*dy);
      if(d<160&&d>0){ var f=(1-d/160)*1.8; p.vx+=(dx/d)*f; p.vy+=(dy/d)*f; }
      p.vx=p.vx*0.95+p.bvx; p.vy=p.vy*0.95+p.bvy;
      p.x+=p.vx; p.y+=p.vy;
      p.alpha+=p.aDir*p.aSpd;
      if(p.alpha>=0.5) p.aDir=-1; else if(p.alpha<=0.03) p.aDir=1;
      if(p.x<-20) p.x=window.innerWidth+20;
      if(p.x>window.innerWidth+20) p.x=-20;
      if(p.y<-20) p.y=window.innerHeight+20;
      if(p.y>window.innerHeight+20) p.y=-20;

      var g=ctx.createRadialGradient(p.x,p.y,0,p.x,p.y,p.r*4);
      g.addColorStop(0,'rgba('+p.color[0]+','+p.color[1]+','+p.color[2]+','+(p.alpha*0.7).toFixed(3)+')');
      g.addColorStop(0.4,'rgba('+p.color[0]+','+p.color[1]+','+p.color[2]+','+(p.alpha*0.2).toFixed(3)+')');
      g.addColorStop(1,'rgba('+p.color[0]+','+p.color[1]+','+p.color[2]+',0)');
      ctx.beginPath(); ctx.arc(p.x,p.y,p.r*4,0,Math.PI*2);
      ctx.fillStyle=g; ctx.fill();
      ctx.beginPath(); ctx.arc(p.x,p.y,p.r*0.5,0,Math.PI*2);
      ctx.fillStyle='rgba('+Math.min(p.color[0]+50,255)+','+Math.min(p.color[1]+50,255)+','+Math.min(p.color[2]+50,255)+','+p.alpha.toFixed(3)+')';
      ctx.fill();
    }
    // Connections
    for(var ci=0; ci<particles.length; ci++){
      for(var cj=ci+1; cj<particles.length; cj++){
        var dx=particles[ci].x-particles[cj].x, dy=particles[ci].y-particles[cj].y;
        var d=Math.sqrt(dx*dx+dy*dy);
        if(d<110){
          var lo=(1-d/110)*0.12;
          var mx=(particles[ci].x+particles[cj].x)/2, my=(particles[ci].y+particles[cj].y)/2;
          var md=Math.sqrt((mx-mouseX)*(mx-mouseX)+(my-mouseY)*(my-mouseY));
          if(md<180) lo*=1+(1-md/180)*3;
          ctx.beginPath(); ctx.moveTo(particles[ci].x,particles[ci].y);
          ctx.lineTo(particles[cj].x,particles[cj].y);
          ctx.strokeStyle='rgba(169,125,232,'+lo.toFixed(4)+')';
          ctx.lineWidth=0.5; ctx.stroke();
        }
      }
    }
    pRafId = requestAnimationFrame(pLoop);
  }
  pLoop();

  // BURST
  function burst(ox, oy){
    var p = document.createElement('div'); p.className='burst-particle';
    var angle=Math.random()*Math.PI*2, speed=Math.random()*100+40;
    var tx=Math.cos(angle)*speed, ty=Math.sin(angle)*speed;
    var size=Math.random()*5+2, dur=Math.random()*800+400;
    var colors=['#8B5EC8','#C9A8F0','#E0A0C8','#A070E0','#D4B0F0'];
    var col=colors[Math.floor(Math.random()*colors.length)];
    p.style.cssText='left:'+ox+'px;top:'+oy+'px;width:'+size+'px;height:'+size+'px;background:'+col+';box-shadow:0 0 '+(size*2)+'px '+col+';transform:translate(-50%,-50%);';
    document.body.appendChild(p);
    var a=p.animate([
      {transform:'translate(-50%,-50%) scale(1)',opacity:1},
      {transform:'translate(calc(-50% + '+tx+'px),calc(-50% + '+ty+'px)) scale(0)',opacity:0}
    ],{duration:dur,easing:'cubic-bezier(0.23,1,0.32,1)',fill:'forwards'});
    a.onfinish=function(){ p.remove(); };
  }
  document.addEventListener('click', function(e){
    for(var i=0; i<12; i++) burst(e.clientX, e.clientY);
  });

  // GAME — scoped state, no global pollution
  var gameState = { open: false };

  function pauseAllLoops(){
    cancelAnimationFrame(glowRafId);
    cancelAnimationFrame(letterRafId);
    cancelAnimationFrame(pRafId);
    glowEl.style.opacity = '0';
    letterEls.forEach(function(item){
      if(!item.isSpace){ item.el.style.transform=''; item.el.classList.remove('letter-hover'); }
    });
  }

  function resumeAllLoops(){
    cancelAnimationFrame(glowRafId);
    cancelAnimationFrame(letterRafId);
    cancelAnimationFrame(pRafId);
    waveStart = performance.now(); // glow animasyonunu sıfırla
    glowLoop();
    letterRafId = requestAnimationFrame(letterLoop);
    pLoop();
  }

  window.openGame = function(){
    if(gameState.open) return;
    gameState.open = true;
    pauseAllLoops();
    document.body.classList.add('game-open');
    document.getElementById('game-iframe').src = 'game.html';
    document.getElementById('game-modal').style.display = 'flex';
  };

  window.closeGame = function(){
    if(!gameState.open) return;
    gameState.open = false;
    document.getElementById('game-iframe').src = '';
    document.getElementById('game-modal').style.display = 'none';
    document.body.classList.remove('game-open');
    resumeAllLoops();
  };

  document.getElementById('game-modal').addEventListener('click', function(e){
    if(e.target === this) window.closeGame();
  });

})();

// APPLY MODAL
(function(){
  function openApply(){
    var modal = document.getElementById('apply-modal');
    modal.style.display = 'flex';
    document.getElementById('apply-form-wrap').style.display = 'block';
    document.getElementById('apply-success').style.display = 'none';
    document.getElementById('applyForm').reset();
    setWeb3('Yes');
  }
  function closeApply(){
    document.getElementById('apply-modal').style.display = 'none';
  }
  function setWeb3(val){
    document.getElementById('web3Value').value = val;
    document.getElementById('toggleYes').classList.toggle('active', val === 'Yes');
    document.getElementById('toggleNo').classList.toggle('active', val === 'No');
  }

  document.getElementById('applyForm').addEventListener('submit', function(e){
    e.preventDefault();
    var btn = document.getElementById('applySubmitBtn');
    btn.textContent = 'Sending...';
    btn.style.opacity = '0.7';
    btn.disabled = true;

    var data = new FormData(this);
    fetch('https://api.web3forms.com/submit', {
      method:'POST',
      body: data
    })
    .then(function(res){ return res.json(); })
    .then(function(res){
      if(res.success){
        document.getElementById('apply-form-wrap').style.display = 'none';
        document.getElementById('apply-success').style.display = 'block';
      } else {
        alert('Something went wrong. Please try again.');
        btn.textContent = 'Send Application →';
        btn.style.opacity = '1';
        btn.disabled = false;
      }
    })
    .catch(function(){
      alert('Something went wrong. Please try again.');
      btn.textContent = 'Send Application →';
      btn.style.opacity = '1';
      btn.disabled = false;
    });
  });

  // Overlay'e tıklayınca kapat
  document.getElementById('apply-modal').addEventListener('click', function(e){
    if(e.target === this) closeApply();
  });

  window.openApply = openApply;
  window.closeApply = closeApply;
  window.setWeb3 = setWeb3;
})();
(function(){
  var navbar = document.getElementById('navbar');
  if(!navbar) return;
  window.addEventListener('scroll', function(){
    if(window.scrollY > 20) navbar.classList.add('scrolled');
    else navbar.classList.remove('scrolled');
  }, { passive:true });
})();

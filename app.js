[1mdiff --git a/app.js b/app.js[m
[1mindex 2e17a19..5256357 100644[m
[1m--- a/app.js[m
[1m+++ b/app.js[m
[36m@@ -1258,21 +1258,178 @@[m [mclass CharoenApp {[m
 [m
                     if (whyItems.length === 0) break;[m
 [m
[32m+[m[32m                    // Extract Background Appearance Settings (Milestone 4.5.1 Section Background Manager for Why Choose Us)[m
[32m+[m[32m                    const whyBgStyle = sec.content?.backgroundStyle || sec.backgroundStyle || 'line_art';[m
[32m+[m[32m                    const whyBgImg = sec.content?.backgroundImage || sec.backgroundImage || '';[m
[32m+[m[32m                    const whyRawOverlay = sec.content?.backgroundOverlay ?? sec.backgroundOverlay;[m
[32m+[m[32m                    const whyBgOverlay = (function(raw) {[m
[32m+[m[32m                        if (raw === undefined || raw === null || raw === '') return 55;[m
[32m+[m[32m                        let val = Number(raw);[m
[32m+[m[32m                        if (!Number.isFinite(val)) return 55;[m
[32m+[m[32m                        if (val > 0 && val <= 1) val = val * 100;[m
[32m+[m[32m                        return Math.min(80, Math.max(0, Math.round(val)));[m
[32m+[m[32m                    })(whyRawOverlay);[m
[32m+[m[32m                    const whyBgPos = sec.content?.backgroundPosition || sec.backgroundPosition || 'center center';[m
[32m+[m[32m                    const whyBgBrightness = sec.content?.backgroundBrightness !== undefined ? sec.content.backgroundBrightness : 100;[m
[32m+[m[32m                    const whyBgTextTheme = sec.content?.backgroundTextTheme || sec.backgroundTextTheme || 'auto';[m
[32m+[m
[32m+[m[32m                    const whyHasImageBg = (whyBgStyle === 'image' || whyBgStyle === 'image_line_art') && Boolean(whyBgImg);[m
[32m+[m[32m                    const whyHasLineArt = whyBgStyle === 'line_art' || whyBgStyle === 'image_line_art' || (!whyHasImageBg && whyBgStyle === 'image');[m
[32m+[m
[32m+[m[32m                    const whyIsLightText = (whyHasImageBg && (whyBgTextTheme === 'auto' || whyBgTextTheme === 'light')) || whyBgTextTheme === 'light';[m
[32m+[m[32m                    const whyTitleTextColorStyle = whyIsLightText ? 'color: #ffffff !important;' : '';[m
[32m+[m
[32m+[m[32m                    const whyAccentBgs = ['rgba(255,107,0,0.08)', 'rgba(29,78,216,0.08)', 'rgba(34,197,94,0.08)'];[m
[32m+[m[32m                    const whyAccentIcons = ['#ff6b00', '#1d4ed8', '#22c55e'];[m
[32m+[m
[32m+[m[32m                    const whyCoffeeBgPatternLeft = `[m
[32m+[m[32m                        <svg class="pattern-left-art" viewBox="0 0 360 480" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg">[m
[32m+[m[32m                            <!-- Branded Plastic PET Cup with Rabbit Logo -->[m
[32m+[m[32m                            <g transform="translate(15, 30)">[m
[32m+[m[32m                                <path d="M 40 125 L 140 125 L 136 112 C 136 108 130 104 120 104 L 60 104 C 50 104 44 108 44 112 Z" />[m
[32m+[m[32m                                <rect x="35" y="125" width="110" height="10" rx="2" />[m
[32m+[m[32m                                <path d="M 42 135 L 54 275 C 55 282 62 288 70 288 L 110 288 C 118 288 125 282 126 275 L 138 135" />[m
[32m+[m[32m                                <!-- Rabbit Logo -->[m
[32m+[m[32m                                <g transform="translate(90, 200)">[m
[32m+[m[32m                                    <path d="M -4 -8 C -7 -20 -1 -22 -1 -12 M -1 -12 C -1 -8 -3 -7 -4 -8" />[m
[32m+[m[32m                                    <path d="M 4 -8 C 7 -20 1 -22 1 -12 M 1 -12 C 1 -8 3 -7 4 -8" />[m
[32m+[m[32m                                    <path d="M -9 -3 C -11 3 -9 9 0 10 C 9 9 11 3 9 -3 C 7 -8 -7 -8 -9 -3" />[m
[32m+[m[32m                                    <path d="M -1.5 3 Q 0 1.5 1.5 3" />[m
[32m+[m[32m                                    <path d="M 0 3 L 0 5 Q -2.5 7 -4 5 M 0 5 Q 2.5 7 4 5" />[m
[32m+[m[32m                                    <circle cx="-3.5" cy="0" r="0.8" fill="currentColor" />[m
[32m+[m[32m                                    <circle cx="3.5" cy="0" r="0.8" fill="currentColor" />[m
[32m+[m[32m                                </g>[m
[32m+[m[32m                            </g>[m
[32m+[m[32m                            <!-- 3 Coffee Beans -->[m
[32m+[m[32m                            <g>[m
[32m+[m[32m                                <g transform="translate(220, 140) rotate(25)">[m
[32m+[m[32m                                    <ellipse cx="0" cy="0" rx="13" ry="18" />[m
[32m+[m[32m                                    <path d="M 0 -16 C -5 -4 -5 4 0 14" />[m
[32m+[m[32m                                </g>[m
[32m+[m[32m                                <g transform="translate(250, 260) rotate(-35)">[m
[32m+[m[32m                                    <ellipse cx="0" cy="0" rx="11" ry="16" />[m
[32m+[m[32m                                    <path d="M 0 -13 C 4 -3 4 3 0 13" />[m
[32m+[m[32m                                </g>[m
[32m+[m[32m                                <g transform="translate(190, 360) rotate(15)">[m
[32m+[m[32m                                    <ellipse cx="0" cy="0" rx="10" ry="14" />[m
[32m+[m[32m                                    <path d="M 0 -11 C -4 -3 -4 3 0 11" />[m
[32m+[m[32m                                </g>[m
[32m+[m[32m                            </g>[m
[32m+[m[32m                            <!-- Subtle Curved Flow Line -->[m
[32m+[m[32m                            <path d="M 40 40 Q 180 180 300 420" stroke-dasharray="5 5" opacity="0.4" />[m
[32m+[m[32m                        </svg>[m
[32m+[m[32m                    `;[m
[32m+[m
[32m+[m[32m                    const whyCoffeeBgPatternRight = `[m
[32m+[m[32m                        <svg class="pattern-right-art" viewBox="0 0 320 480" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg">[m
[32m+[m[32m                            <!-- Ceramic Coffee Cup & Saucer -->[m
[32m+[m[32m                            <g transform="translate(110, 240)">[m
[32m+[m[32m                                <ellipse cx="70" cy="95" rx="55" ry="12" />[m
[32m+[m[32m                                <path d="M 30 45 C 30 90 110 90 110 45 Z" />[m
[32m+[m[32m                                <path d="M 28 45 L 112 45" />[m
[32m+[m[32m                                <path d="M 110 52 C 125 52 125 75 105 80" />[m
[32m+[m[32m                                <path d="M 55 32 C 52 20 60 12 55 0" />[m
[32m+[m[32m                                <path d="M 70 28 C 67 16 75 8 70 -4" />[m
[32m+[m[32m                                <path d="M 85 32 C 82 20 90 12 85 0" />[m
[32m+[m[32m                                <!-- Rabbit Logo on Front -->[m
[32m+[m[32m                                <g transform="translate(70, 65)">[m
[32m+[m[32m                                    <path d="M -4 -8 C -7 -20 -1 -22 -1 -12 M -1 -12 C -1 -8 -3 -7 -4 -8" />[m
[32m+[m[32m                                    <path d="M 4 -8 C 7 -20 1 -22 1 -12 M 1 -12 C 1 -8 3 -7 4 -8" />[m
[32m+[m[32m                                    <path d="M -9 -3 C -11 3 -9 9 0 10 C 9 9 11 3 9 -3 C 7 -8 -7 -8 -9 -3" />[m
[32m+[m[32m                                    <path d="M -1.5 3 Q 0 1.5 1.5 3" />[m
[32m+[m[32m                                    <path d="M 0 3 L 0 5 Q -2.5 7 -4 5 M 0 5 Q 2.5 7 4 5" />[m
[32m+[m[32m                                    <circle cx="-3.5" cy="0" r="0.8" fill="currentColor" />[m
[32m+[m[32m                                    <circle cx="3.5" cy="0" r="0.8" fill="currentColor" />[m
[32m+[m[32m                                </g>[m
[32m+[m[32m                            </g>[m
[32m+[m[32m                            <!-- Coffee Leaves Branch -->[m
[32m+[m[32m                            <g transform="translate(20, 40)">[m
[32m+[m[32m                                <path d="M 140 20 Q 90 130 160 240" />[m
[32m+[m[32m                                <path d="M 130 50 C 85 40 65 70 65 70 C 65 70 95 90 130 50 Z" />[m
[32m+[m[32m                                <path d="M 130 50 Q 100 60 65 70" />[m
[32m+[m[32m                                <path d="M 115 130 C 70 120 50 150 50 150 C 50 150 80 170 115 130 Z" />[m
[32m+[m[32m                                <path d="M 115 130 Q 85 140 50 150" />[m
[32m+[m[32m                            </g>[m
[32m+[m[32m                            <!-- 3 Coffee Beans -->[m
[32m+[m[32m                            <g>[m
[32m+[m[32m                                <g transform="translate(70, 240) rotate(-25)">[m
[32m+[m[32m                                    <ellipse cx="0" cy="0" rx="12" ry="17" />[m
[32m+[m[32m                                    <path d="M 0 -13 C 4 -3 4 3 0 13" />[m
[32m+[m[32m                                </g>[m
[32m+[m[32m                                <g transform="translate(45, 360) rotate(30)">[m
[32m+[m[32m                                    <ellipse cx="0" cy="0" rx="11" ry="15" />[m
[32m+[m[32m                                    <path d="M 0 -12 C -4 -3 -4 3 0 12" />[m
[32m+[m[32m                                </g>[m
[32m+[m[32m                                <g transform="translate(85, 415) rotate(-10)">[m
[32m+[m[32m                                    <ellipse cx="0" cy="0" rx="10" ry="14" />[m
[32m+[m[32m                                    <path d="M 0 -11 C 3 -3 3 3 0 11" />[m
[32m+[m[32m                                </g>[m
[32m+[m[32m                            </g>[m
[32m+[m[32m                        </svg>[m
[32m+[m[32m                    `;[m
[32m+[m
                     html += `[m
[31m-                        <!-- Why Choose Us Section -->[m
[31m-                        <section class="section-padding" style="background-color: var(--bg-sec); border-bottom: 1px solid var(--border-color);">[m
[31m-                            <div class="container">[m
[32m+[m[32m                        <!-- Why Choose Us Section (Milestone 4.5.1 Section Background Manager Enabled) -->[m
[32m+[m[32m                        <section class="section-padding section-bg-manager ${whyHasImageBg ? 'has-bg-image' : ''}" style="position: relative; overflow: hidden; background-color: var(--bg-sec); border-bottom: 1px solid var(--border-color);" data-section="why_us" data-overlay="${whyBgOverlay}">[m
[32m+[m[32m                            ${whyHasImageBg ? `[m
[32m+[m[32m                                <!-- CSS Background Image Layer -->[m
[32m+[m[32m                                <div class="sec-bg-img-layer" style="[m
[32m+[m[32m                                    position: absolute; top: 0; left: 0; width: 100%; height: 100%;[m
[32m+[m[32m                                    background-image: url('${whyBgImg}');[m
[32m+[m[32m                                    background-size: cover;[m
[32m+[m[32m                                    background-position: ${whyBgPos};[m
[32m+[m[32m                                    background-repeat: no-repeat;[m
[32m+[m[32m                                    filter: brightness(${whyBgBrightness}%);[m
[32m+[m[32m                                    z-index: 0;[m
[32m+[m[32m                                    pointer-events: none;[m
[32m+[m[32m                                "></div>[m
[32m+[m[32m                                <!-- Dark Overlay Layer -->[m
[32m+[m[32m                                <div class="sec-bg-overlay-layer" style="[m
[32m+[m[32m                                    position: absolute; top: 0; left: 0; width: 100%; height: 100%;[m
[32m+[m[32m                                    background-color: rgba(0, 0, 0, ${whyBgOverlay / 100});[m
[32m+[m[32m                                    z-index: 0;[m
[32m+[m[32m                                    pointer-events: none;[m
[32m+[m[32m                                "></div>[m
[32m+[m[32m                            ` : ''}[m
[32m+[m
[32m+[m[32m                            ${whyHasLineArt ? `[m
[32m+[m[32m                                <div class="section-pattern-wrapper pattern-why-us-wrapper ${whyHasImageBg ? 'pattern-white-tint' : ''}" style="z-index: 1;">[m
[32m+[m[32m                                    ${whyCoffeeBgPatternLeft}[m
[32m+[m[32m                                    ${whyCoffeeBgPatternRight}[m
[32m+[m[32m                                </div>[m
[32m+[m[32m                            ` : ''}[m
[32m+[m
[32m+[m[32m                            <div class="container" style="position: relative; z-index: 2;">[m
                                 <div class="text-center">[m
[31m-                                    <h2 class="section-title">${this.lang === 'th' ? whyTitleTh : whyTitleEn}</h2>[m
[32m+[m[32m                                    <h2 class="section-title" style="${whyTitleTextColorStyle}">${this.lang === 'th' ? whyTitleTh : whyTitleEn}</h2>[m
                                 </div>[m
[31m-                                <div class="grid-3" style="margin-top:40px;">[m
[31m-                                    ${whyItems.map((item, idx) => `[m
[31m-                                        <div style="background:var(--bg-main); padding: 35px 30px; border-radius:var(--radius-md); border:1px solid var(--border-color); position:relative; overflow:hidden;">[m
[31m-                                            <span style="position:absolute; right:15px; bottom:-10px; font-size:6.5rem; font-weight:900; color:rgba(0,0,0,0.03); line-height:1; user-select:none;">0${idx+1}</span>[m
[31m-                                            <h4 style="font-size:1.25rem; font-weight:700; color:var(--primary); margin-bottom:15px; position:relative; z-index:2;"><i class="fas fa-check-circle" style="color:var(--secondary); margin-right:8px;"></i> ${this.lang === 'th' ? (item.title_th || '') : (item.title_en || '')}</h4>[m
[31m-                                            <p style="font-size:0.95rem; color:var(--text-sec); line-height:1.65; position:relative; z-index:2;">${this.lang === 'th' ? (item.desc_th || '') : (item.desc_en || '')}</p>[m
[31m-                                        </div>[m
[31m-                                    `).join('')}[m
[32m+[m[32m                                <div class="why-us-grid">[m
[32m+[m[32m                                    ${whyItems.map((item, idx) => {[m
[32m+[m[32m                                        const itemImg = item.img_src || item.img || item.image || '';[m
[32m+[m[32m                                        const title = this.lang === 'th' ? (item.title_th || '') : (item.title_en || '');[m
[32m+[m[32m                                        const desc = this.lang === 'th' ? (item.desc_th || '') : (item.desc_en || '');[m
[32m+[m[32m                                        const iconClass = item.icon || 'fa-check-circle';[m
[32m+[m[32m                                        const circleBg = whyAccentBgs[idx % whyAccentBgs.length];[m
[32m+[m[32m                                        const iconColor = whyAccentIcons[idx % whyAccentIcons.length];[m
[32m+[m[32m                                        const formattedNum = (idx + 1) < 10 ? `0${idx + 1}` : `${idx + 1}`;[m
[32m+[m
[32m+[m[32m                                        return `[m
[32m+[m[32m                                            <div class="why-us-card">[m
[32m+[m[32m                                                <span class="why-us-watermark">${formattedNum}</span>[m
[32m+[m[41m                                                [m
[32m+[m[32m                                                <div class="why-us-circle-box" style="background-color: ${circleBg}; color: ${iconColor};">[m
[32m+[m[32m                                                    ${itemImg ? `[m
[32m+[m[32m                                                        <img src="${itemImg}" alt="${title}" class="why-us-img" loading="lazy" onerror="this.onerror=null; this.parentElement.innerHTML='<i class=\\'fas ${iconClass}\\'></i>';">[m
[32m+[m[32m                                                    ` : `[m
[32m+[m[32m                                                        <i class="fas ${iconClass}"></i>[m
[32m+[m[32m                                                    `}[m
[32m+[m[32m                                                </div>[m
[32m+[m[41m                                                [m
[32m+[m[32m                                                <h3 class="why-us-title">${title}</h3>[m
[32m+[m[32m                                                <p class="why-us-desc">${desc}</p>[m
[32m+[m[32m                                            </div>[m
[32m+[m[32m                                        `;[m
[32m+[m[32m                                    }).join('')}[m
                                 </div>[m
                             </div>[m
                         </section>[m

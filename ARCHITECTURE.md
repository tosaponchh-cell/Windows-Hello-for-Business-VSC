# AuthLearn — Architecture Reference
> อ่านไฟล์นี้ก่อนแตะโค้ดทุกครั้ง — ห้ามเปลี่ยน architecture โดยไม่อัปเดตเอกสารนี้

---

## โครงสร้างไฟล์

```
whfb-app/
├── index.html          ← App shell เท่านั้น (~50 lines) ห้ามใส่ content
├── css/app.css         ← Styles ทั้งหมด CSS variables อยู่ที่ :root
├── js/app.js           ← Router + nav builder + fetch loader (ไม่มี framework)
├── data/nav.json       ← Navigation structure — เพิ่ม module/section แก้ที่นี่เท่านั้น
└── pages/
    ├── whfb/           ← WHfB content pages (s01.html - s14.html)
    ├── vsc/            ← Virtual Smart Card pages (s01-s11 + a01 animated)
    └── linux/          ← Placeholder
```

---

## กฎที่ห้ามละเมิด

1. **ห้ามใส่ logic ใน index.html** — shell เท่านั้น
2. **ห้ามใส่ inline style ใน page partials** ถ้า style นั้นจะใช้ซ้ำ → เพิ่มใน app.css
3. **ห้ามใช้ JavaScript framework** (React, Vue ฯลฯ) — vanilla JS เท่านั้น
4. **ห้ามใช้ external CDN** นอกจาก Google Fonts — app ต้องทำงาน offline ได้
5. **ห้ามเปลี่ยน routing system** — ใช้ hash routing (#module/section) ตลอด
6. **page partials ต้องเป็น HTML fragment** — ไม่มี <html>, <head>, <body>

---

## Routing System

```
URL: http://localhost:8080/#whfb/s01
     ↓
app.js อ่าน hash → split('/') → ['whfb', 's01']
     ↓
fetch('pages/whfb/s01.html')
     ↓
inject into #content-area
```

**เพิ่ม module ใหม่:** แก้ `data/nav.json` + สร้างไฟล์ใน `pages/[module]/`
ไม่ต้องแตะ `app.js` หรือ `index.html`

---

## CSS Conventions

- CSS variables อยู่ที่ `:root` ใน app.css — ใช้ `var(--name)` เสมอ ห้าม hardcode สี
- Component classes ที่ใช้ใน page partials:
  - `.page-header` `.ph-num` `.ph-sub` — page headers
  - `.flow-steps` `.flow-step` `.step-num` — numbered steps
  - `.callout.info/.warn/.tip` — callout boxes
  - `.tbl-wrap table` — tables
  - `pre` with `.cm .ck .cv .cs .ct .cn .ch` — code syntax highlight
  - `.struct-box` `.struct-row` `.soff .sfld .styp .sdsc` — struct diagrams
  - `.eventlog` `.eventlog-header` `.eventlog-body` — event log style
  - `.tab-container` `.tab-nav` `.tab-btn` `.tab-pane` — tabs (ต้องมี data-pane attr)
- Animation classes (VSC a01 เท่านั้น) prefix ด้วย `.sc-`

---

## nav.json Structure

```json
{
  "modules": [
    {
      "id": "whfb",           ← ใช้ใน URL hash และ fetch path
      "label": "Full name",
      "short": "Short",       ← แสดงใน header tab
      "icon": "🔐",
      "accent": "#0a3d6b",    ← CSS variable --active-accent
      "groups": [
        {
          "label": "Group Name",
          "sections": [
            { "id": "s01", "icon": "🏛", "title": "Section Title" }
          ]
        }
      ]
    }
  ]
}
```

---

## Page Partial Template

```html
<!-- ไม่มี DOCTYPE, html, head, body -->
<div class="page-header">
  <div class="ph-num" style="background:[module accent color]">XX — CATEGORY</div>
  <h1>Page Title</h1>
  <p class="ph-sub">Subtitle</p>
</div>

<!-- content using existing CSS components only -->
```

---

## Tabs ใน Page Partial

```html
<div class="tab-container">
  <div class="tab-nav">
    <button class="tab-btn active" data-pane="tab-id-1" onclick="switchTab(this)">Tab 1</button>
    <button class="tab-btn" data-pane="tab-id-2" onclick="switchTab(this)">Tab 2</button>
  </div>
  <div id="tab-id-1" class="tab-pane active">...</div>
  <div id="tab-id-2" class="tab-pane">...</div>
</div>
```

`switchTab()` คือ global function ใน app.js — ใช้ได้จาก page partial ทุกไฟล์

---

## Deployment

- **Local:** `python -m http.server 8080` จาก `whfb-app/` folder
- **Vercel:** Push to GitHub → import → Framework: Other → Build: none → Output: ./
- **ไม่มี build step** — deploy ไฟล์ตรงๆ ทั้งหมด

---

## สิ่งที่ยังไม่ได้ทำ (Backlog)

- [ ] Linux Auth & Security module (pages/linux/)
- [ ] WHfB animated flow diagram (เหมือน pages/vsc/a01.html)
- [ ] Search functionality
- [ ] Dark/Light mode toggle
- [ ] Print stylesheet

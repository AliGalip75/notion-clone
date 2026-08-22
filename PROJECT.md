# Kişisel İlerleme ve Not Uygulaması — Sistem Mimarisi

## Teknoloji Stack'i

### Frontend

- React
- Vite
- TypeScript
- Tailwind CSS
- shadcn/ui
- React Router
- TanStack Query
- Recharts
- Zustand

### Backend

- Python
- Django
- Django REST Framework

### Veritabanı

- PostgreSQL

### Authentication

- JWT
- Django REST Framework SimpleJWT

## 1. Projenin amacı

Bu proje, kullanıcıların kendi hedeflerini, ilerlemelerini, notlarını ve verilerini tek bir yerde tutabilecekleri, Notion'dan daha basit ve kullanımı daha kolay bir web uygulamasıdır.

Uygulamanın temel yaklaşımı:

> **Kullanıcı → Sayfalar → Alt Sayfalar + Bloklar**

Kullanıcı istediği konuda bir sayfa oluşturabilir. Bir sayfanın içerisinde başka sayfalar oluşturabilir. Sayfaların içerisinde ise farklı içerik blokları bulunabilir.

Örneğin:

```text
Kullanıcı
│
├── 📚 İngilizce
│   │
│   ├── 📖 Konular
│   │   ├── Grammar
│   │   │   ├── Tenses
│   │   │   └── Conditionals
│   │   │
│   │   └── Vocabulary
│   │
│   └── 📝 Sorular
│       ├── Grammar Questions
│       └── Vocabulary Questions
│
├── 💪 Fitness
│   ├── Antrenmanlar
│   └── Beslenme
```

Bu yapı sayesinde uygulama farklı kullanım amaçlarına uyarlanabilir.

---

# 2. Temel kavramlar

Sistemin üç temel kavramı vardır:

1. **Page**
2. **Child Page**
3. **Block**

Bunların birbirinden net şekilde ayrılması önemlidir.

---

# 3. Page nedir?

Page, kullanıcının oluşturduğu bir çalışma alanıdır.

Örneğin:

```text
📚 İngilizce
```

bir Page'dir.

Başka örnekler:

```text
💪 Fitness
💰 Finans
📖 Kitaplar
💻 Projeler
🎓 Üniversite
```

Page'in kendisi bir içerik türü değildir.

Page, içeriklerin ve alt sayfaların bulunduğu kapsayıcıdır.

Örneğin:

```text
📚 İngilizce
│
├── Text Block
├── Progress Block
├── Chart Block
├── Checklist Block
│
├── 📖 Konular
└── 📝 Sorular
```

Burada `İngilizce` bir Page'dir.

---

# 4. Page içerisinde başka Page olabilir

Sistemin önemli özelliklerinden biri budur.

Bir Page'in içerisinde başka Page'ler oluşturulabilir.

Örneğin:

```text
📚 İngilizce
│
├── 📖 Konular
└── 📝 Sorular
```

Burada:

* `İngilizce` → Parent Page
* `Konular` → Child Page
* `Sorular` → Child Page

`Konular` sayfasının içerisinde de başka sayfalar olabilir:

```text
📚 İngilizce
│
└── 📖 Konular
    │
    ├── Grammar
    │   ├── Tenses
    │   └── Conditionals
    │
    └── Vocabulary
```

Dolayısıyla Page sistemi teorik olarak sınırsız derinliğe sahip olabilir.

```text
Page
 └── Page
      └── Page
           └── Page
                └── Page
```

Ancak kullanıcı arayüzünde aşırı derin yapılar teşvik edilmemelidir.

---

# 5. Block nedir?

Block, bir Page'in içerisinde bulunan tek bir içerik parçasıdır.

Örneğin:

```text
📚 İngilizce

İngilizce öğrenme hedefim C1 seviyesine ulaşmak.

████████████░░░░ 75%

Bu hafta 8 saat çalıştım.

[ Haftalık çalışma grafiği ]

☑ 50 kelime öğren
☑ Present Perfect çalış
☐ Speaking çalış
```

Buradaki içerikler farklı Block'lardır:

```text
"İngilizce öğrenme hedefim..."
        ↓
Text Block

████████████░░░░ 75%
        ↓
Progress Block

"Bu hafta 8 saat çalıştım."
        ↓
Number Block

[ Haftalık çalışma grafiği ]
        ↓
Chart Block

☑ 50 kelime öğren
☑ Present Perfect çalış
☐ Speaking çalış
        ↓
Checklist Block
```

Yani:

> **Page = içeriklerin bulunduğu alan**

> **Block = o alanın içerisindeki içerik**

---

# 6. Page ile Block arasındaki temel fark

Page:

```text
📚 İngilizce
```

bir çalışma alanıdır.

Block:

```text
📝 Not
📊 Grafik
☑ Checklist
🎯 Progress
📋 Tablo
```

sayfanın içerisindeki içeriktir.

Bir Page hem Block hem de Child Page içerebilir.

Örneğin:

```text
📚 İngilizce
│
├── 📝 Text Block
├── 🎯 Progress Block
├── 📊 Chart Block
├── ☑ Checklist Block
│
├── 📖 Konular
└── 📝 Sorular
```

Burada `Konular` ve `Sorular` Block değildir.

Bunlar Child Page'dir.

---

# 7. Önerilen temel Page yapısı

Bir Page'in yapısı şu şekilde düşünülebilir:

```text
Page
│
├── Metadata
│   ├── title
│   ├── icon
│   ├── cover
│   ├── created_at
│   └── updated_at
│
├── Child Pages
│   ├── Page
│   ├── Page
│   └── Page
│
└── Blocks
    ├── Block
    ├── Block
    ├── Block
    └── Block
```

Örneğin:

```text
📚 İngilizce
│
├── Metadata
│   ├── title = "İngilizce"
│   └── icon = "📚"
│
├── Child Pages
│   ├── 📖 Konular
│   └── 📝 Sorular
│
└── Blocks
    ├── Text
    ├── Progress
    ├── Chart
    └── Checklist
```

---

# 8. Veritabanı yapısı

İlk sürüm için temel olarak şu tablolar yeterlidir:

```text
User
Page
Block
```

İleride ihtiyaç oldukça başka tablolar eklenebilir.

---

# 9. Page modeli

Page tablosu yaklaşık olarak şu alanlara sahip olabilir:

```text
Page
--------------------------------
id
user_id
parent_id
title
icon
cover
position
created_at
updated_at
```

### id

Sayfanın benzersiz ID'sidir.

Örneğin:

```text
id = 15
```

### user_id

Sayfanın hangi kullanıcıya ait olduğunu belirtir.

```text
user_id = 42
```

Bu sayede kullanıcılar birbirlerinin sayfalarını göremez.

### parent_id

Page'in başka bir Page'in altında olup olmadığını belirtir.

Örneğin:

```text
İngilizce
id = 1
parent_id = null
```

`İngilizce` ana sayfadır.

```text
Konular
id = 2
parent_id = 1
```

`Konular`, `İngilizce` sayfasının altındadır.

```text
Sorular
id = 3
parent_id = 1
```

`Sorular` da `İngilizce` sayfasının altındadır.

Bu yapı sayesinde:

```text
İngilizce
├── Konular
└── Sorular
```

oluşturulabilir.

---

# 10. Self-referencing Page ilişkisi

`parent_id`, Page tablosunun yine Page tablosuna bağlanması anlamına gelir.

Örneğin:

```text
Page
---------------------------
id | title        | parent_id
---------------------------
1  | İngilizce    | null
2  | Konular      | 1
3  | Sorular      | 1
4  | Grammar      | 2
5  | Tenses       | 4
```

Bunun sonucunda:

```text
İngilizce
│
├── Konular
│   │
│   └── Grammar
│       │
│       └── Tenses
│
└── Sorular
```

oluşur.

Bu sisteme **recursive / self-referencing relationship** denir.

Django tarafında kabaca:

```python
class Page(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    parent = models.ForeignKey(
        "self",
        null=True,
        blank=True,
        on_delete=models.CASCADE,
        related_name="children"
    )

    title = models.CharField(max_length=200)
    icon = models.CharField(max_length=50, blank=True)

    position = models.IntegerField(default=0)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
```

Burada:

```python
parent = models.ForeignKey("self", ...)
```

kritik noktadır.

Bu, bir Page'in başka bir Page'in parent'ı olabilmesini sağlar.

---

# 11. Block modeli

Block tablosu yaklaşık olarak şöyle olabilir:

```text
Block
--------------------------------
id
page_id
type
position
data
created_at
updated_at
```

### page_id

Block'un hangi Page'e ait olduğunu belirtir.

Örneğin:

```text
Page
id = 1
title = İngilizce
```

ve:

```text
Block
id = 10
page_id = 1
type = text
```

Bu block `İngilizce` sayfasında gösterilir.

---

# 12. Block type

Block'un ne tür bir içerik olduğunu `type` belirler.

Örneğin:

```text
text
heading
checklist
progress
number
chart
table
image
quote
divider
```

İlk sürümde fazla block eklemek gerekli değildir.

Önerilen MVP:

```text
text
heading
checklist
progress
number
chart
table
```

---

# 13. Block data

Her Block'un farklı verisi vardır.

Örneğin Text Block:

```json
{
  "content": "Bugün 2 saat İngilizce çalıştım."
}
```

Progress Block:

```json
{
  "title": "İngilizce C1 hedefi",
  "value": 72,
  "max": 100
}
```

Number Block:

```json
{
  "title": "Toplam çalışma",
  "value": 47,
  "unit": "saat"
}
```

Checklist Block:

```json
{
  "items": [
    {
      "text": "50 kelime öğren",
      "completed": true
    },
    {
      "text": "Speaking çalış",
      "completed": false
    }
  ]
}
```

Chart Block:

```json
{
  "chartType": "line",
  "title": "Haftalık çalışma",
  "xAxis": "date",
  "yAxis": "hours",
  "data": [
    {
      "date": "2026-08-18",
      "value": 2
    },
    {
      "date": "2026-08-19",
      "value": 3
    }
  ]
}
```

Bu veriler `JSONField` içerisinde tutulabilir.

---

# 14. Neden Block verisini JSON olarak tutmak mantıklı?

Çünkü her Block'un yapısı farklıdır.

Text Block:

```text
content
```

Progress Block:

```text
title
value
max
```

Chart Block:

```text
chartType
data
```

Checklist:

```text
items
```

Bunların hepsini tek bir tablo yapısında ayrı ayrı kolonlara koymak gereksiz derecede karmaşık olur.

Bunun yerine:

```text
Block
-----------------------------
id
page_id
type
data
position
```

şeklinde tutulabilir.

Örneğin:

```text
type = "progress"
data = {
    "value": 72,
    "max": 100
}
```

ve:

```text
type = "chart"
data = {
    "chartType": "line",
    "data": [...]
}
```

---

# 15. Position alanı

Block'ların sayfa içerisindeki sırasını belirlemek gerekir.

Örneğin:

```text
Block
-----------------------------
id | type       | position
-----------------------------
1  | heading    | 0
2  | text       | 1
3  | progress   | 2
4  | chart      | 3
5  | checklist  | 4
```

Kullanıcı:

```text
Chart
```

block'unu yukarı taşıdığında `position` değerleri güncellenir.

Sonuç:

```text
Heading
Chart
Text
Progress
Checklist
```

olabilir.

İleride drag & drop özelliği eklenebilir.

---

# 16. Örnek gerçek Page

Kullanıcı `İngilizce` isimli bir Page oluşturdu:

```text
Page
--------------------------------
id: 1
user_id: 42
parent_id: null
title: İngilizce
icon: 📚
```

Bu Page'in Child Page'leri:

```text
Page
--------------------------------
id: 2
user_id: 42
parent_id: 1
title: Konular
icon: 📖

id: 3
user_id: 42
parent_id: 1
title: Sorular
icon: 📝
```

`İngilizce` Page'inin Block'ları:

```text
Block
--------------------------------
page_id: 1
type: heading
data: {"content": "İngilizce Öğrenme"}

page_id: 1
type: text
data: {"content": "C1 seviyesine ulaşmak istiyorum."}

page_id: 1
type: progress
data: {"value": 72, "max": 100}

page_id: 1
type: chart
data: {...}
```

Sonuç kullanıcıya:

```text
📚 İngilizce

İngilizce Öğrenme

C1 seviyesine ulaşmak istiyorum.

██████████████░░░░ 72%

📊 Haftalık çalışma
[ Grafik ]

📖 Konular →
📝 Sorular →
```

şeklinde gösterilir.

---

# 17. Kullanıcı yeni Page oluşturduğunda

Kullanıcı `İngilizce` sayfasındayken:

```text
+ Yeni
```

butonuna basar.

Menü:

```text
+ Yeni

📄 Sayfa
📝 Metin
☑ Checklist
📊 Grafik
🎯 İlerleme
🔢 Sayı
📋 Tablo
```

çıkar.

Kullanıcı:

```text
📄 Sayfa
```

seçerse:

```text
İngilizce
└── Yeni Sayfa
```

oluşturulur.

Kullanıcı:

```text
📊 Grafik
```

seçerse:

```text
İngilizce
└── Chart Block
```

oluşturulur.

Bu ayrım UI'ın temel mantığıdır.

---

# 18. Sidebar yapısı

Uygulamanın sol tarafında Page ağacı gösterilebilir.

Örneğin:

```text
┌─────────────────────┐
│ My Space             │
│                     │
│ 📚 İngilizce        │
│   ├─ 📖 Konular     │
│   │   ├─ Grammar    │
│   │   └─ Vocabulary │
│   └─ 📝 Sorular     │
│                     │
│ 💪 Fitness          │
│   ├─ Antrenman      │
│   └─ Beslenme       │
│                     │
│ 💻 Projeler         │
│                     │
│ + Yeni Sayfa        │
└─────────────────────┘
```

Sidebar yalnızca Page ağacını gösterir.

Block'lar sidebar'da gösterilmez.

Block'lar Page'in ana içeriğinde gösterilir.

---

# 19. Sayfa ekranı

Örneğin kullanıcı `İngilizce` sayfasına tıkladığında:

```text
┌───────────────────────────────────────────────┐
│ 📚 İngilizce                           ⋯      │
├───────────────────────────────────────────────┤
│                                               │
│ İngilizce Öğrenme                             │
│                                               │
│ C1 seviyesine ulaşmak istiyorum.              │
│                                               │
│ 🎯 İlerleme                                   │
│ ███████████████░░░░ 72%                       │
│                                               │
│ 📊 Haftalık çalışma                           │
│                                               │
│              [ GRAFİK ]                       │
│                                               │
│ 📝 Bu haftanın hedefleri                      │
│                                               │
│ ☑ 50 kelime öğren                             │
│ ☑ Present Perfect çalış                       │
│ ☐ 2 saat speaking                             │
│                                               │
│ 📖 Konular                                    │
│ 📝 Sorular                                    │
│                                               │
│                 + Blok ekle                   │
└───────────────────────────────────────────────┘
```

---

# 20. Page ve Block API ilişkisi

Backend tarafında temel endpoint yapısı şöyle olabilir:

```text
GET    /api/pages/
POST   /api/pages/
GET    /api/pages/:id/
PATCH  /api/pages/:id/
DELETE /api/pages/:id/
```

Child Page'ler:

```text
GET /api/pages/:id/children/
```

Block'lar:

```text
GET    /api/pages/:id/blocks/
POST   /api/pages/:id/blocks/
PATCH  /api/blocks/:id/
DELETE /api/blocks/:id/
```

Örneğin:

```text
GET /api/pages/1/
```

cevabı:

```json
{
  "id": 1,
  "title": "İngilizce",
  "icon": "📚",
  "parent": null
}
```

Child Page'ler:

```text
GET /api/pages/1/children/
```

```json
[
  {
    "id": 2,
    "title": "Konular",
    "icon": "📖"
  },
  {
    "id": 3,
    "title": "Sorular",
    "icon": "📝"
  }
]
```

Block'lar:

```text
GET /api/pages/1/blocks/
```

```json
[
  {
    "id": 10,
    "type": "text",
    "position": 0,
    "data": {
      "content": "C1 seviyesine ulaşmak istiyorum."
    }
  },
  {
    "id": 11,
    "type": "progress",
    "position": 1,
    "data": {
      "value": 72,
      "max": 100
    }
  }
]
```

---

# 21. Frontend'in Page'i oluşturması

Frontend bir Page'i açtığında iki farklı veri alabilir:

```text
Page
├── Child Pages
└── Blocks
```

Örneğin:

```text
GET /api/pages/1/
GET /api/pages/1/children/
GET /api/pages/1/blocks/
```

Frontend daha sonra:

```text
Page Header
      ↓
Blocks
      ↓
Child Pages
```

şeklinde render eder.

---

# 22. Block renderer

Frontend'de Block türüne göre farklı component render edilir.

Mantık:
    components/
    ├── blocks/
    │   ├── TextBlock.tsx
    │   ├── HeadingBlock.tsx
    │   ├── ChecklistBlock.tsx
    │   ├── ProgressBlock.tsx
    │   ├── NumberBlock.tsx
    │   ├── ChartBlock.tsx
    │   └── TableBlock.tsx
    │
    ├── page/
    │   ├── PageHeader.tsx
    │   ├── PageContent.tsx
    │   └── ChildPages.tsx
    │
    └── sidebar/
        ├── Sidebar.tsx
        └── PageTree.tsx

Örneğin:

```tsx
switch (block.type) {
  case "text":
    return <TextBlock data={block.data} />

  case "progress":
    return <ProgressBlock data={block.data} />

  case "chart":
    return <ChartBlock data={block.data} />

  case "checklist":
    return <ChecklistBlock data={block.data} />
}
```

Bu yapı yeni Block türleri eklemeyi kolaylaştırır.

---

# 23. İlk sürümde bulunması gereken Block'lar

İlk sürümde mümkün olduğunca az Block ile başlanmalıdır.

Önerilen:

### 1. Text

Normal yazı yazmak için.

### 2. Heading

Başlıklar için.

### 3. Checklist

Görev ve yapılacaklar için.

### 4. Progress

İlerleme göstermek için.

Örneğin:

```text
İngilizce
████████████░░░░ 72%
```

### 5. Number

Tek bir önemli değeri göstermek için.

```text
47
Toplam çalışma saati
```

### 6. Chart

Grafikler için.

İlk etapta:

```text
Line
Bar
Pie
```

yeterlidir.

### 7. Table

Kullanıcının tablo oluşturabilmesi için.

Örneğin:

```text
| Tarih | Çalışma |
|-------|---------|
| Pzt   | 2 saat  |
| Sal   | 3 saat  |
| Çar   | 1 saat  |
```

---

# 24. Grafik sistemi

Grafik Block'u uygulamanın önemli özelliklerinden biri olabilir.

Kullanıcı:

```text
+ Blok
→ Grafik
```

seçer.

Sonra:

```text
Grafik türü

○ Çizgi
○ Bar
○ Pasta
```

seçer.

Verilerini girer:

```text
Tarih       Değer

1 Ağustos    20
8 Ağustos    35
15 Ağustos   48
22 Ağustos   64
```

Uygulama grafiği otomatik oluşturur.

İleride:

```text
Line
Bar
Pie
Area
Radar
Scatter
```

gibi daha fazla grafik eklenebilir.

Ancak MVP'de 3 grafik türü yeterlidir.

---

# 25. Kullanıcı deneyiminin temel prensibi

Uygulamanın amacı:

> Kullanıcıya çok fazla seçenek vermek değil, istediği şeyi mümkün olduğunca hızlı oluşturmasını sağlamak.

Bu nedenle kullanıcı:

```text
Yeni Page
```

oluşturabilir.

Page'in içinde:

```text
Yeni Block
```

oluşturabilir.

Block türünü seçebilir.

Ve verisini girebilir.

Bunun dışında karmaşık database, relation, formula, rollup gibi özellikler ilk sürümde bulunmamalıdır.

---

# 26. Örnek kullanım senaryosu

Kullanıcı uygulamaya girer.

Yeni Page oluşturur:

```text
📚 İngilizce
```

Page içerisinde:

```text
Text:
"Bu yıl C1 seviyesine ulaşacağım."
```

ekler.

Sonra:

```text
Progress:
72%
```

ekler.

Sonra:

```text
Chart:
Haftalık çalışma
```

ekler.

Sonra:

```text
Checklist:
☑ 50 kelime
☑ Grammar
☐ Speaking
```

ekler.

Sonra `Yeni Page` diyerek:

```text
📖 Konular
```

oluşturur.

`Konular` içerisinde:

```text
Grammar
Vocabulary
```

adında iki Child Page oluşturur.

Sonuç:

```text
📚 İngilizce
│
├── Text
├── Progress
├── Chart
├── Checklist
│
└── 📖 Konular
    │
    ├── Grammar
    └── Vocabulary
```

olur.

---

# 27. Önemli mimari karar

Sistemde **Page ile Block birbirine karıştırılmamalıdır.**

Page:

```text
Bir yere gitmek için kullanılır.
```

Block:

```text
Bir şey göstermek veya düzenlemek için kullanılır.
```

Örneğin:

```text
📚 İngilizce
```

→ Page

```text
📖 Konular
```

→ Page

```text
📊 Haftalık çalışma
```

→ Block

```text
████████░░ 80%
```

→ Block

```text
"Bugün 2 saat çalıştım."
```

→ Block

Bu ayrım bütün uygulamanın temelini oluşturur.

---

# 28. Genel sistem

Sonuç olarak sistem şu yapıya sahip olacaktır:

```text
                         USER
                           │
                           ▼
                         PAGES
                           │
              ┌────────────┴────────────┐
              │                         │
              ▼                         ▼
        CHILD PAGES                  BLOCKS
              │                         │
              │              ┌──────────┼──────────┐
              │              │          │          │
              ▼              ▼          ▼          ▼
            PAGE           TEXT      CHART     PROGRESS
              │
              ├── CHILD PAGE
              └── BLOCKS
```

Daha basit şekilde:

```text
User
 │
 └── Page
      │
      ├── Page
      │    ├── Page
      │    └── Block
      │
      ├── Page
      │
      ├── Text Block
      ├── Chart Block
      ├── Progress Block
      └── Checklist Block
```

Bu yapı uygulamanın temelidir.

İlk MVP için hedef:

```text
Authentication
      ↓
Page oluşturma
      ↓
Nested Page oluşturma
      ↓
Page silme / düzenleme
      ↓
Block oluşturma
      ↓
Block düzenleme
      ↓
Block silme
      ↓
Block sıralama
      ↓
Text
Checklist
Progress
Number
Chart
Table
```

Bunlar düzgün çalıştıktan sonra uygulamaya daha gelişmiş özellikler eklenmelidir.

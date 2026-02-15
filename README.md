# Treboliños - Web estática minimalista

Web hecha solo con HTML, CSS y JavaScript puro.

No usa frameworks, librerías, bundlers ni dependencias externas.

## Abrir la web

1. Abre `index.html` con doble clic.
2. Listo.

Funciona en modo local (`file://`).

## Dónde colocar el logo

Coloca el logo en uno de estos archivos:

- `assets/logo/logo.svg` (prioridad)
- `assets/logo/logo.png` (fallback)

Si no existe ninguno, el bloque del logo no se mostrará.

## Cómo cambiar productos

Edita:

- `data/products.json`

Formato:

```json
[
  {
    "slug": "trebol-tarjeta",
    "name": "Trébol plastificado",
    "price": 7,
    "image": "assets/img/trebol1.jpg",
    "wallapopUrl": "https://es.wallapop.com/...",
    "whatsappMessage": "Hola! Me interesa el trébol plastificado."
  }
]
```

Campos:

- `slug`: identificador único
- `name`: nombre del producto
- `price`: precio (opcional)
- `image`: ruta local de imagen
- `wallapopUrl`: enlace del anuncio
- `whatsappMessage`: mensaje para WhatsApp

## Cómo cambiar número de WhatsApp

Edita en `js/main.js`:

```js
const WHATSAPP_NUMBER = '34XXXXXXXXX';
```

Pon solo números con prefijo internacional, por ejemplo:

```js
const WHATSAPP_NUMBER = '34600111222';
```

Si el número no es válido, los botones de WhatsApp se ocultan automáticamente.

## Nota sobre carga de productos en local

La web intenta cargar productos desde `data/products.json`.

Algunos navegadores bloquean `fetch` local en `file://`. Por eso hay un fallback interno en `index.html` para que el catálogo siga funcionando al abrir por doble clic.

Para mantener consistencia, cuando actualices `data/products.json`, actualiza también el bloque JSON de fallback en `index.html` (script con id `products-fallback`).

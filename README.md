# Group Mediterráneo Tarraconense S.L. — Web Corporativa

Web institucional del grupo. HTML/CSS/JS puro. Sin dependencias, sin frameworks, sin build step.

## Estructura

```
group-mediterraneo/
├── index.html          # Página principal
├── css/
│   └── style.css       # Estilos
├── js/
│   └── main.js         # Navegación mobile + scroll
├── assets/             # Imágenes y recursos (carpeta vacía, añadir aquí)
├── netlify.toml        # Configuración Netlify
└── README.md
```

## Publicar en Netlify desde GitHub

1. Sube esta carpeta a un repositorio GitHub (público o privado).
2. En [app.netlify.com](https://app.netlify.com) → **Add new site → Import an existing project**.
3. Conecta tu cuenta de GitHub y selecciona el repositorio.
4. Ajustes de build:
   - **Build command**: *(dejar vacío)*
   - **Publish directory**: `.` *(punto — raíz del repo)*
5. Haz clic en **Deploy site**.

## Conectar dominio de Hostinger

Una vez comprado el dominio en Hostinger:

1. En Netlify → **Domain settings → Add custom domain** → escribe tu dominio (ej. `groupmediterraneo.es`).
2. Netlify te dará dos nameservers, por ejemplo:
   ```
   dns1.p01.nsone.net
   dns2.p01.nsone.net
   ```
3. En Hostinger → **Mis dominios → Administrar → Nameservers** → sustituye los actuales por los de Netlify.
4. La propagación tarda entre 15 minutos y 48 horas.
5. Netlify activa HTTPS automáticamente vía Let's Encrypt en cuanto propaga.

## Personalización pendiente antes de publicar

- [ ] Reemplazar `info@groupmediterraneo.es` por el email corporativo real
- [ ] Añadir CIF de la empresa en el footer si se desea
- [ ] Actualizar URLs de cada línea de negocio cuando los dominios estén activos
- [ ] Añadir logo o favicon en `/assets/favicon.ico`
- [ ] Añadir `<meta property="og:image">` con imagen de preview para redes

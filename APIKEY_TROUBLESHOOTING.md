# Solución de Problemas - API Key Denegada

## Problema: "La API Key ha sido denegada"

Este error indica que la API Key actual no es válida, ha expirado, o ha excedido su límite de transacciones.

## Solución Rápida

Tienes **dos API Keys** disponibles:

### API Key Principal (Actualmente en uso)
```
b5064493373942c5b54dfdbc1c745f44
Límite: 50 transacciones
```

### API Key de Respaldo
```
ccbd58f8a5fa420fb0d6ef7d37c199ef
Límite: 100 transacciones
```

---

## Cómo Cambiar a la API Key de Respaldo

### Paso 1: Edita el archivo `.env`

Abre el archivo `.env` en la raíz del proyecto y cambia:

**DE:**
```env
NUFI_API_KEY=b5064493373942c5b54dfdbc1c745f44
```

**A:**
```env
NUFI_API_KEY=ccbd58f8a5fa420fb0d6ef7d37c199ef
```

### Paso 2: Reinicia el servidor

```bash
# Detén el servidor actual (Ctrl+C en la terminal)
# Luego reinicia:
npm run dev
```

---

## Verificación de Headers

El sistema ahora envía **ambos headers** requeridos por Azure API Management:

```javascript
headers: {
  'NUFI-API-KEY': 'tu_api_key',              // Header específico de NUFI
  'Ocp-Apim-Subscription-Key': 'tu_api_key'  // Header estándar de Azure APIM
}
```

---

## Diagnóstico de Errores

Si ves errores de autenticación (401/403), el servidor ahora mostrará:

```
[NUFI] Authentication Error (401):
  - API Key provided: b5064493...
  - Error details: { ... }
  - Possible causes:
    1. API Key expirada o inválida
    2. Suscripción no activa o límite de transacciones excedido
    3. API Key no tiene permisos para este endpoint
```

---

## Contacto con NUFI

Si ambas API Keys fallan, necesitarás:

1. **Verificar el estado de tu suscripción** en el portal de NUFI
2. **Solicitar una nueva API Key** con suscripción activa
3. **Confirmar los límites de transacción** de tus keys actuales

### Información de Contacto NUFI
- Consulta tu email de registro para detalles de contacto
- Portal de desarrolladores: `https://nufi.azure-api.net` (verificar URL exacta)

---

## Modo Demo (Sin API Key)

Si solo quieres probar la interfaz sin consumir transacciones reales:

Edita `.env`:
```env
NUFI_DEMO_MODE=true
```

Esto usará datos de ejemplo sin hacer llamadas a la API real.

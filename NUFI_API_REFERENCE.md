# NUFI API Reference

## Authentication

**Base URL**: `https://nufi.azure-api.net`

**Authentication Header**:
```
Ocp-Apim-Subscription-Key: your_api_key_here
```

**Request Headers**:
```
Accept: application/json
Content-Type: application/json
Ocp-Apim-Subscription-Key: {your_api_key}
NUFI-API-KEY: {your_api_key}
```

---

## Endpoint: Phone Search (Búsqueda por Teléfono)

**Endpoint**: `POST /enriquecimientoidentidades/v3/telefono`

**Request Body**:
```json
{
  "telefono": "526221069217"
}
```

### Response Codes

#### 200 - Success
```json
{
  "status": "success",
  "message": "ok!",
  "data": {
    "query": {
      "relationships": [],
      "@id": null,
      "@match": null,
      "@search_pointer": null,
      "@inferred": false,
      "names": [],
      "addresses": [],
      "phones": [
        {
          "country_code": 52,
          "number": 6221069217,
          "extension": null,
          "raw": null,
          "display": "622 106 9217",
          "display_international": "+52 622 106 9217",
          "@type": null,
          "@valid_since": null,
          "@last_seen": null,
          "@current": null,
          "@inferred": null
        }
      ],
      "emails": [],
      "jobs": [],
      "educations": [],
      "images": [],
      "usernames": [],
      "user_ids": [],
      "dob": null,
      "gender": null,
      "languages": [],
      "ethnicities": [],
      "origin_countries": [],
      "urls": [],
      "AllFields": [...]
    },
    "person": null,
    "possible_persons": null,
    "sources": null,
    "available_data": null,
    "warnings": null,
    "match_requirements": null,
    "top_match": true,
    "source_category_requirements": null,
    "@search_id": "2101180158543192006293456997514909038",
    "@persons_count": 0,
    "RawJSON": "{...}",
    "QpsAllotted": 20,
    "QpsCurrent": 1,
    "QuotaAllotted": 1250,
    "QuotaCurrent": 43,
    "QuotaReset": "2021-02-01T00:00:00+00:00",
    "QpsLiveAllotted": 10,
    "QpsLiveCurrent": 1,
    "QpsDemoAllotted": null,
    "QpsDemoCurrent": null,
    "DemoUsageAlloted": null,
    "DemoUsageCurrent": null,
    "DemoUsageExpiry": null,
    "Address": null,
    "DOB": null,
    "Education": null,
    "Email": null,
    "Ethnicitiy": null,
    "Gender": null,
    "Image": null,
    "Job": null,
    "Language": null,
    "Name": null,
    "OriginCountry": null,
    "Phone": null,
    "Url": null,
    "UserID": null,
    "Username": null,
    "Relationship": null
  },
  "code": 200
}
```

**Key Fields**:
- `status`: "success" or "error"
- `message`: Human-readable message
- `data.@persons_count`: Number of persons found
- `data.@search_id`: Unique search identifier
- `data.query.phones`: Array of phone data
- `data.person`: Primary match (if found)
- `data.possible_persons`: Array of possible matches
- `data.available_data`: **[UNDOCUMENTED]** Object containing information about additional data fields available with premium API access. Structure unknown - not documented by NUFI.
- **Quota Information**:
  - `QpsAllotted`: Queries per second allowed
  - `QpsCurrent`: Current QPS usage
  - `QuotaAllotted`: Total quota
  - `QuotaCurrent`: Current quota usage
  - `QuotaReset`: When quota resets

#### 400 - Bad Request (Invalid Format)
```json
{
  "status": "error",
  "message": "field phone invalid format.",
  "data": {
    "ClassName": "System.FormatException",
    "Message": "field phone invalid format.",
    "Data": null,
    "InnerException": null,
    "HelpURL": null,
    "StackTraceString": "EnriquecimientoIdentidades.busqueda.Run",
    "RemoteStackTraceString": null,
    "RemoteStackIndex": 0,
    "ExceptionMethod": null,
    "HResult": -2146233033,
    "Source": "EnriquecimientoIdentidades",
    "WatsonBuckets": null
  },
  "code": 100
}
```

**Common Causes**:
- Invalid phone number format
- Missing required field
- Malformed JSON

#### 401 - Unauthorized (Invalid API Key)
```json
{
  "code": 401,
  "status": "forbidden",
  "message": "La API Key ha sido denegada, asegurate de mandar una API Key valida y con una suscripción activa",
  "data": null
}
```

**Common Causes**:
- Invalid or missing NUFI-API-KEY header
- Expired API key
- Inactive subscription

#### 429 - Rate Limit Exceeded
```json
{
  "code": 429,
  "status": "too_many_request",
  "message": "La API recibió demasiadas peticiones",
  "data": null
}
```

**Common Causes**:
- Too many requests in short time period
- QPS (Queries Per Second) limit exceeded
- Check `QpsAllotted` and `QpsCurrent` in successful responses

#### 500 - Server Error
```json
{
  "status": "error",
  "message": "Object reference not set to an instance of an object.",
  "data": null,
  "code": 103
}
```

**Common Causes**:
- Internal server error
- API service temporarily unavailable
- Data processing issue

---

## Other Endpoints (Inferred from Service Structure)

### 1. General Data Enrichment
**Endpoint**: `POST /enriquecimientoidentidades/v3/enriquecimiento`

**Request Parameters**:
- `rfc`: RFC/Tax ID
- `curp`: CURP
- `nombre`: First name
- `apellidoPaterno`: Paternal surname
- `apellidoMaterno`: Maternal surname
- `fechaNacimiento`: Birth date
- `entidadNacimiento`: Birth state

### 2. International Blacklists
**Endpoint**: `POST /listainternacional/v1/busqueda`

**Request Parameters**:
- `nombre`: Name
- `apellidoPaterno`: Paternal surname
- `apellidoMaterno`: Maternal surname
- `fechaNacimiento`: Birth date
- `pais`: Country code

### 3. Email Search
**Endpoint**: `POST /enriquecimientoidentidades/v3/correo`

**Request Body**:
```json
{
  "correo": "email@example.com"
}
```

### 4. Name Search
**Endpoint**: `POST /enriquecimientoidentidades/v3/nombre`

**Request Parameters**:
- `nombre`: First name
- `apellidoPaterno`: Paternal surname
- `apellidoMaterno`: Maternal surname

### 5. Phone Profiling
**Endpoint**: `POST /perfilamiento/v1/telefono`

**Request Body**:
```json
{
  "telefono": "526221069217"
}
```

### 6. Email Profiling
**Endpoint**: `POST /perfilamiento/v1/correo`

**Request Body**:
```json
{
  "correo": "email@example.com"
}
```

### 7. CURP Name Search
**Endpoint**: `POST /curp/v1/consulta`

**Request Body**:
```json
{
  "tipo_busqueda": "datos",
  "clave_entidad": "MN",
  "dia_nacimiento": "07",
  "mes_nacimiento": "01",
  "anio_nacimiento": "1950",
  "nombres": "ALBERTO",
  "primer_apellido": "AGUILERA",
  "segundo_apellido": "VALADEZ",
  "sexo": "H"
}
```

---

## Error Handling Best Practices

1. **Check `status` field**: Always check if `status === "success"` before processing data
2. **Log `@search_id`**: Include search_id in error reports for NUFI support
3. **Monitor Quota**: Track `QuotaCurrent` vs `QuotaAllotted` to avoid hitting limits
4. **Respect Rate Limits**: Check `QpsAllotted` and implement appropriate throttling
5. **Handle 401/403**: Validate API key and subscription status
6. **Retry on 500**: Implement exponential backoff for server errors
7. **Validate Input**: Ensure phone numbers are in correct format (with country code)

---

## Phone Number Format

- **Format**: Country code + number (no spaces, no special characters)
- **Example**: `526221069217` (Mexico: 52, Number: 6221069217)
- **Display formats** returned:
  - `display`: "622 106 9217"
  - `display_international`: "+52 622 106 9217"

---

## Testing Notes

1. The application automatically falls back to mock data if API calls fail
2. Set `NUFI_API_KEY` in `.env` to test with real API
3. Monitor quota usage in response data
4. Check `@persons_count` to see if results were found
5. `top_match: true` indicates high confidence match

---

## Documentation Reference

Official NUFI Documentation: https://docs.nufi.mx/docs/api-docs-2023/

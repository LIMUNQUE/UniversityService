# Moodle local

## Variables usadas por Next.js

```env
NEXT_PUBLIC_MOODLE_BASE_URL=http://localhost:8080
MOODLE_BASE_URL=http://localhost:8080
MOODLE_WS_TOKEN=...
MOODLE_DEFAULT_CATEGORY_ID=1
MOODLE_STUDENT_ROLE_ID=5
```

## Funciones REST necesarias

El token debe pertenecer a un servicio externo que permita estas funciones:

- `core_webservice_get_site_info`
- `core_course_get_courses_by_field`
- `core_course_create_courses`
- `core_user_get_users_by_field`
- `core_user_create_users`
- `enrol_manual_enrol_users`

## Configuracion en Moodle

1. Activa servicios web: `Site administration > Advanced features > Enable web services`.
2. Activa REST: `Site administration > Plugins > Web services > Manage protocols`.
3. Crea un servicio externo: `Site administration > Server > Web services > External services`.
4. Agrega las funciones REST de la lista anterior.
5. Crea o elige un usuario tecnico para la API.
6. Permite que ese usuario use el servicio externo.
7. Genera un token para ese usuario y servicio.
8. Verifica desde la app: `/api/moodle/status`.

Si `/api/moodle/status` responde `Access control exception`, el token existe pero el servicio externo o el usuario no tienen permiso para ejecutar `core_webservice_get_site_info`.

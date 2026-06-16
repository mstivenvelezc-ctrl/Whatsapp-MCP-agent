Homework — Clase 1 (M5 BACK)
## 1. Investigación profunda: Agentes, Tool Use y MCP
### A) Definiciones comparativas (con tabla)
Tipo	Qué produce	¿Cambia el mundo?	Cómo verificás éxito	Ejemplo de pedido + evidencia esperada
Chatbot	Genera respuestas en texto a partir del prompt recibido.	No	La respuesta es correcta, coherente y útil para el usuario.	"Explicame qué es una API REST" → evidencia: explicación clara y comprensible.
Asistente (RAG)	Genera respuestas apoyándose en información recuperada desde documentos o bases de conocimiento.	No	Se verifica que la respuesta coincida con las fuentes consultadas.	"¿Qué dice este PDF sobre MCP?" → evidencia: fragmentos o citas del documento utilizado.
Agente	Ejecuta acciones mediante tools y devuelve evidencia verificable.	Sí	Se valida un cambio o artefacto externo al chat.	"Creá una issue en org/repo con label bug" → evidencia: URL de la issue, número de issue y label visible en GitHub.
### B) Agent loop (modelo mental)

La principal diferencia entre un agente y un chatbot tradicional es que el agente puede actuar sobre el mundo mediante herramientas. Cuando recibe una tarea, primero analiza qué necesita hacer, luego decide una acción, ejecuta una tool y observa el resultado obtenido. Con esa nueva información evalúa si el objetivo ya fue cumplido o si necesita realizar otro paso.

Este proceso puede repetirse varias veces hasta completar la tarea. Lo importante es que cada decisión depende de la observación del resultado anterior, permitiendo que el agente se adapte a situaciones dinámicas.

### C) Tool use / function calling (conceptual, vendor-agnostic)

Para que un modelo de lenguaje utilice herramientas correctamente necesita conocer un contrato claro sobre cada una de ellas. Ese contrato suele estar compuesto por un nombre (name), una descripción (description) y los parámetros que espera recibir (parameters).

Gracias a este contrato, el modelo puede elegir la herramienta adecuada, completar los parámetros correctamente y generar resultados verificables. Sin esta información, existe el riesgo de que el agente seleccione la herramienta incorrecta o envíe datos ambiguos.

Mini-ejemplo 1 — descripción mala

Descripción:

"Tool para administrar GitHub."

Error inducido:

La descripción es demasiado general. El modelo no sabe si la herramienta sirve para crear issues, modificar repositorios, gestionar pull requests o realizar otras acciones.

Mini-ejemplo 2 — descripción buena

Descripción:

"Crea una issue nueva en un repositorio GitHub utilizando título, descripción y labels opcionales. No modifica configuraciones del repositorio ni actualiza issues existentes."

Error evitado:

El modelo entiende exactamente cuándo utilizar la herramienta y cuáles son sus límites.

Los contratos bien definidos ayudan a producir resultados verificables como URLs, IDs o estados visibles fuera del chat.

### D) MCP: qué es, qué problema resuelve y por qué es un estándar

Si tuviera que explicarle MCP a otro desarrollador backend, diría que es un estándar abierto que permite conectar agentes y aplicaciones de IA con herramientas, datos y sistemas externos de una forma consistente. Antes de MCP, cada integración requería implementar soluciones específicas para cada proveedor o herramienta. MCP busca resolver ese problema definiendo una manera común de comunicación entre aplicaciones y herramientas externas. Por eso suele compararse con USB-C: no porque funcione igual, sino porque ofrece una forma estandarizada de conectar componentes distintos. Su principal valor está en la interoperabilidad y en evitar integraciones ad-hoc difíciles de mantener.

### E) Arquitectura Host/Client/Server
Host

Es la aplicación donde vive la experiencia de IA. Puede ser un IDE, una aplicación web o un chat que interactúa con el usuario.

Client

Es el componente encargado de implementar MCP dentro del Host y comunicarse con los servidores MCP disponibles.

Server

Es quien expone herramientas, recursos o acciones que el agente puede utilizar.

En este módulo nuestro foco está puesto en el Server MCP, que es la pieza que expone capacidades al agente. El Host es una aplicación externa donde corre el agente y donde ocurre la interacción con el usuario. Gracias al protocolo MCP, ambos pueden comunicarse de forma estandarizada.

### F) Origen y gobernanza (con citas)
¿Quién creó/lanzó MCP y cuándo?

Model Context Protocol (MCP) fue presentado por Anthropic en noviembre de 2024 como un estándar abierto diseñado para conectar modelos de IA con herramientas y fuentes de datos externas.

¿Qué cambió con Linux Foundation / AAIF y por qué importa?

Durante 2025, MCP pasó a formar parte de la gobernanza impulsada por la Linux Foundation mediante la Agentic AI Foundation (AAIF). Este cambio es importante porque convierte a MCP en un estándar más neutral y abierto, reduciendo la dependencia de una única empresa y fomentando la colaboración de toda la comunidad.

## 2. Marketplace/Ecosistema: 3 servidores MCP relevantes

Para esta investigación utilicé el Official MCP Registry y repositorios oficiales del ecosistema MCP.

Server	Link directorio + docs	Qué capacidad agrega	2 tools típicas	Requisitos	Riesgos	Mitigación
GitHub MCP Server	Registry: https://modelcontextprotocol.io · Docs: https://github.com/modelcontextprotocol/servers	Permite interactuar con repositorios, issues y pull requests desde agentes.	create_issue, list_issues	Cuenta GitHub y token con permisos adecuados.	Permisos excesivos, modificaciones no deseadas, acceso a repos privados.	Principio de mínimo privilegio, aprobación humana y auditoría de acciones.
Filesystem MCP Server	Registry: https://modelcontextprotocol.io · Docs: https://github.com/modelcontextprotocol/servers	Permite leer y escribir archivos dentro de directorios autorizados.	read_file, write_file	Acceso al sistema de archivos permitido por el administrador.	Acceso accidental a archivos sensibles o sobrescritura de información.	Directorios permitidos (allowlist), sandboxing y validación previa.
Brave Search MCP Server	Registry: https://modelcontextprotocol.io · Docs: https://github.com/modelcontextprotocol/servers	Agrega búsqueda web para investigación y recuperación de información.	web_search, search_news	API Key de Brave Search.	Prompt injection, resultados manipulados o información no confiable.	Filtrado de fuentes, validación humana y separación entre búsqueda y ejecución.
## 3. Diseño conceptual: Tool para un GitHub Agent
1) User intent

El usuario quiere crear una issue en GitHub siguiendo un formato estándar y evitando errores comunes durante el proceso de triage.

2) Name

github_create_issue

3) Description

Esta herramienta crea una issue nueva dentro de un repositorio GitHub específico.

Cuándo usarla:

Cuando se necesita registrar un bug.
Cuando se quiere crear una tarea o mejora.
Cuando el repositorio destino ya fue confirmado.

Cuándo NO usarla:

Para cerrar issues.
Para editar issues existentes.
Para modificar configuraciones del repositorio.

Límites:

No crea labels nuevos.
No asigna milestones.
No modifica permisos ni configuraciones.
4) Inputs
Parámetro	Tipo	Obligatorio	Restricciones
repo	string	Sí	Formato owner/repo
title	string	Sí	Entre 1 y 120 caracteres
body	string	Sí	Texto descriptivo en Markdown
labels	array[string]	No	Máximo 5 labels
priority	enum	No	low, medium, high
5) Output shape

La herramienta devuelve:

issue_number
issue_url
repo
labels
state

Todos estos campos son verificables directamente en GitHub.

6) Error cases
Error 1: Repositorio inexistente

Mensaje sugerido:

"No pude encontrar el repositorio indicado. Verificá el formato owner/repo."

Error 2: Label inexistente

Mensaje sugerido:

"Uno o más labels no existen dentro del repositorio seleccionado."

Error 3: Permisos insuficientes

Mensaje sugerido:

"El token utilizado no posee permisos suficientes para crear issues."

7) Verification

Para verificar que la acción ocurrió correctamente:

Abrir la URL devuelta por la herramienta.
Confirmar que exista el número de issue indicado.
Verificar que el estado sea open.
Confirmar que los labels coincidan con los solicitados.

Ejemplo:

https://github.com/owner/repo/issues/123

8) Guardrails (human-in-the-loop)

Flujo propuesto:

Proponer → Aprobar → Ejecutar → Verificar

Antes de ejecutar la acción, el agente debe mostrar:

repositorio destino,
título,
descripción,
labels.

El usuario revisa y aprueba esos datos.

Una vez creada la issue, el agente devuelve la URL y el número de issue para auditoría y verificación.

Mini-schema conceptual (ejemplo JSON)
{
  "repo": "org/proyecto",
  "title": "Bug: error al autenticar",
  "body": "Pasos para reproducir el error...",
  "labels": ["bug", "triage"],
  "priority": "high"
}
## 4. Bitácora de uso de IA (crítica y verificable)
### Interacción 1

Objetivo: Comprender las diferencias entre chatbot, asistente y agente.

Prompt exacto:

Explicame las diferencias entre chatbot, asistente RAG y agente usando ejemplos verificables.

Resumen de respuesta:

La IA explicó que un chatbot genera texto, un asistente utiliza información recuperada desde fuentes y un agente puede ejecutar acciones reales mediante herramientas.

Acepté:

La clasificación general y los ejemplos.

Rechacé:

Algunos ejemplos demasiado abstractos que no incluían evidencia verificable.

Cómo verifiqué:

Comparando la explicación con la documentación oficial de MCP.

### Interacción 2

Objetivo: Investigar MCP y su gobernanza.

Prompt exacto:

¿Quién creó MCP? ¿Cuándo fue lanzado y qué relación tiene con Linux Foundation?

Resumen de respuesta:

La IA explicó el origen en Anthropic y el posterior movimiento hacia una gobernanza más neutral.

Acepté:

La explicación conceptual.

Rechacé:

Una referencia sin fuente claramente identificable.

Cómo verifiqué:

Contrastando con documentación oficial y artículos especializados.

### Interacción 3

Objetivo: Diseñar una Tool Card para GitHub.

Prompt exacto:

Diseñá una Tool Card para crear issues en GitHub incluyendo límites, validaciones y outputs verificables.

Resumen de respuesta:

La IA propuso una herramienta especializada en creación de issues con parámetros claros y resultados verificables.

Acepté:

La estructura de inputs y outputs.

Rechacé:

Una descripción demasiado amplia que podía generar ambigüedad.

Cómo verifiqué:

Comparando el diseño con ejemplos reales de herramientas MCP.

### B) Foco: function calling / tool selection

Prompt utilizado:

Compará github_create_issue y github_update_issue_state. Detectá posibles solapamientos y sugerí mejoras.

Evaluación:

La IA entendió correctamente el concepto de contrato, identificó responsabilidades distintas para cada herramienta y propuso límites claros para evitar confusión durante la selección automática de tools.

### C) Checklist de pensamiento crítico (autoevaluación)
 ¿Citó fuentes verificables?
 ¿Diferenció MCP de un SDK o librería?
 ¿Evitó proponer implementaciones fuera de alcance?
 ¿Definió outputs verificables?
 ¿Mencionó riesgos concretos?
 ¿Propuso mínimo privilegio?
 ¿Detectó ambigüedades en inputs?
 ¿Registré una limitación o posible hallucination y cómo la corregí?
## Fuentes (bibliografía)
Anthropic (2024). Introducing the Model Context Protocol. https://www.anthropic.com/news/model-context-protocol
Model Context Protocol Documentation
Linux Foundation
Model Context Protocol Servers Repository
JSON-RPC 2.0 Specification
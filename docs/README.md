# Documentation

The documentation describes the implemented `mmo-portal` application and its deployment contract.

| Guide | Contents |
| --- | --- |
| [Project overview](../README.md) | Features, preview, quick start, configuration, verification |
| [DDD design](DDD.md) | Context ownership, ubiquitous language, ports, dependency direction, atomic scenarios |
| [Architecture](ARCHITECTURE.md) | Domain model, transaction boundary, game schema contract, extension points |
| [API](../apps/api/README.md) | Modules, authentication, endpoints, configuration, seed, unit tests |
| [Web](../apps/web/README.md) | Routes, providers, translations, assets, standalone output |
| [Deployment](../deploy/README.md) | Containers, networking, schema rollout, HTTPS, runtime operations |
| [Artwork](ARTWORK.md) | Original fantasy hero, tool provenance, and generation prompt |
| [Contributor guide](../CONTRIBUTING.md) | Development workflow and verification expectations |
| [Scripts](../scripts/README.md) | Release checks, SVG generation, preview reproduction |

## Visual references

The `assets/` directory contains original SVG diagrams for system architecture, identity flow, commerce settlement, deployment, and the domain model. Source SVGs include accessible titles/descriptions and can be displayed directly by GitHub.

Desktop and mobile PNGs show the actual application with explicitly labeled synthetic player data. Regenerate diagrams with `python3 scripts/generate-diagrams.py`; regenerate screenshots using the instructions in the scripts guide.

# Me-Admin
[English](README_EN.md) | [Simplified Chinese](README.md)
## Introduction 

Me-Admin is a free and open-source all-in-one solution for the front and back end of a web application, built with Node.js and Vue. The back end is based on Medwayjs, and the front end is constructed with Vue 3, ready to use out of the box. This project is licensed under the most permissive MIT license and uses the latest technology stack to help you quickly create enterprise-level web front and back end projects.

## Related Documentation [https://www.meadmin.cn/](https://www.meadmin.cn/)


## Key Features
- Based on TypeScript, an application-level JavaScript language
- Built on Sequelize 7, MidwayJS 3.x, Vue 3, Vite 8, Pinia, Element Plus, and Vue-Request@next
- Offers one-click generation of CRUD and menus, significantly simplifying the development process and greatly enhancing project construction efficiency
- Equipped with a comprehensive Auth permission control system, supporting unlimited parent-child groupings and free authorization. Administrators can cross groups, and the permission configuration is both flexible and strict.
- Provides out-of-the-box server-side rendering capabilities for the front-end
- Configurable themes, including theme colors and theme modes
- User-friendly internationalization solution, with the front-end supporting asynchronous loading of language packs by component
- Customizable keepAlive caching, allowing Vue keep-alive based on keys to solve the issue of unified components under different routes not being able to refresh their caches independently
- Permissions: Built-in dynamic route permission generation solution, with button-level permissions. Supports two modes: dynamic menu and interface menu acquisition
- Automatic component on-demand import: Automatically imports component definitions under the components directory, and supports custom import locations and modes, truly achieving on-demand imports
- Convenient type generation: Automatically generates TypeScript types to minimize workload
- Integrated with vxeTable: The most feature-rich open-source Vue table component by Chinese developers 

## Technology Stack - typescript
- Cache: Redis
- Database: PostgreSQL
- Backend: Node.js, Midway.js v3.x
- Frontend: Vue 3, Vite, Element Plus 

## Quick Start 

### Environment Dependencies
- PostgreSQL database
- Redis cache database
- Node.js >= 22.14.0 - pnpm
### Initialize the Project 

Run the command `pnpm create meadminjs@latest` and follow the prompts to configure the options! 

Debugging Project 

- Run `pnpm dev` in the project root directory.
- Access the backend at [http://127.0.0.1:7001/admin](http://127.0.0.1:7001/admin).
- Access the frontend at [http://127.0.0.1:7001/](http://127.0.0.1:7001/). 

### Packaging Project - pnpm build


Default Account 

## Back-end
Default account: admin
Default password: meAdmin#202507! P


## Front Desk
Default account: test
Default password: 123456789
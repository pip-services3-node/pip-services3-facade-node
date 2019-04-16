# <img src="https://github.com/pip-services/pip-services/raw/master/design/Logo.png" alt="Pip.Services Logo" style="max-width:30%"> <br/> RESTful client facade for Node.js

One of the common implementation patterns is to expose microservices via single entry point called API Gateway or Client Facade.
The responsiblity of that component is to accept calls from external consumers, enforce security rules, perform authentication and authorization
and when request is cleared it can call one or few microservices in a single transaction. Client Facades may also implement complex requests,
combine multiple datasets and return then in a single transaction, push notifications via async mechanisms like Socket.IO or WebSockets.

This framework is a part of [Pip.Services](https://github.com/pip-services/pip-services) project.
It provides reusable primitives to quickly build sophisticated client facades via composition of multiple routes and middleware components.

- **Services** - Main and partition (subpath) facade services
- **Routes** - Abstract facade route class and few generic routes
- **Errors** - Error simulation

Quick Links:

* [Downloads](https://github.com/pip-services3-node/pip-services3-facade-node/blob/master/docs/Downloads.md)
* [API Reference](https://pip-services3-node.github.io/pip-services3-facade-node/globals.html)
* [Building and Testing](https://github.com/pip-services3-node/pip-services3-facade-node/blob/master/docs/Development.md)
* [Contributing](https://github.com/pip-services3-node/pip-services3-facade-node/blob/master/docs/Development.md#contrib)

## Acknowledgements

The Node.js version of Pip.Services is created and maintained by **Sergey Seroukhov**

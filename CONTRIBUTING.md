Thanks for contributing to Pipeline!

We welcome all contributions, but please adhere to the following guidelines:

 * New feature ideas (e.g. new nodes / other features) should be discussed in Issues first. Once an issue is tagged "Planned", then we welcome Pull Requests for that feature! ***Simple*** bugs may be fixed without opening Issues, but if you have to change a lot of stuff, then it's probably a good idea to discuss that too.
 * Pipeline is client-side only - new features shouldn't be implemented on the server-side. This is for many reasons, mainly for the user's security, overall speed and also partially to keep our cost of operation down.
 * Our style guide: primarily tabs not spaces, no new lines at the end of files, etc. Generally, all code should be in a class, interface, etc; and each of these should be in its own file.
 * ES5 build target: no use of ES6+ features that can't be transpiled by TypeScript.
 * Minimal use of libraries: only use a library if there is absolutely no other way to reasonably implement a feature. Adding _any_ external library is a big decision, and if not done carefully is likely to get your Pull Request declined.

Check out the [wiki](https://github.com/oparisblue/pipeline/wiki) for an introduction to the codebase, and a "Hello, world" node example.

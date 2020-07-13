# Another Svelte Router
A basic router to manage which urls should result in which pages.
Supports named parameters and async middlewares (aka route guards).

## Install
```bash
npm install another-svelte-router
```
## How does it work?
Through the 'add' method you may define which routes there are and which component they should route to.
Routes are matched to the current url and the RouterView component will update to display the first match.

Routes may contain parameters which become accessible through the router object.

Routes may have middleware(s) containing some additional conditions or checks.
Middlewares are executed in their given order and should return true if their condition is met, otherwise false.
They may also return a promise that resolves to such a boolean, thus allowing use of async functions.

- If all middlewares return true, the route is considered a match.
- If any middleware returns false, the route is dropped and the router will try to match the next route.
- If a middleware returns no boolean at all, the routing ends. This may sometimes be desirable if for example you'd like to redirect to another route (which restarts the process).
## Usage & examples
```html
<!-- App.svelte -->
<script>
import {router, RouterView} from 'another-svelte-router';
import Home from "./routes/Home.svelte";
import About from "./routes/About.svelte";
import Blog from "./routes/Blog.svelte";

router.add('/', Home);
router.add('/about', About);
router.add('/blog', Blog);
</script>
<RouterView/>
```
### Method chaining
```javascript
router
    .add('/', Home)
    .add('/about', About)
    .add('/blog', Blog)
;
```
### Define multiple routes at once
```javascript
router.add([
    ['/', Home],
    ['/about', About],
    ['/blog', Blog]
]);
```
### Parameters
The ":username" in the path defines a parameter named "username"
```javascript
router.add('/profiles/:username/activity', ProfileActivity);
```
It's value then becomes accessible through
```javascript
router.params.username
```
### Middleware / Route Guards
```javascript
function requireIsLoggedIn(){
    return true;
}
router.add('/my-account', requireIsLoggedIn, MyAccount)
```
#### Multiple
```javascript
function requireIsLoggedIn(){
    return true;
}
function anotherConditionToBeCleared(){
    return false;
}
router.add('/my-account', requireIsLoggedIn, anotherConditionToBeCleared, MyAccount)
```
#### Async
```javascript
async function requireIsLoggedIn(){
    return !!(await checkLoginStatus());
}
router.add('/my-account', requireIsLoggedIn, MyAccount)
```
### Groups
Easily add routes with a common prefix or middlewares
```javascript
router.group('/blog')
    .add('/recent', BlogRecent) // adds "/blog/recent"
    .add('/featured', BlogFeatured); // adds "/blog/featured"

router.group('/admin', requireIsAdmin)
    .add('/articles', Articles) // adds "/admin/articles" with middleware "requireIsAdmin"
    .add('/members', Members); // adds "/admin/members" with middleware "requireIsAdmin"

router.group('', requireIsLoggedIn)
    .add('/my-account', MyAccount) // adds "/my-account" with middleware "requireIsLoggedIn"
    .add('/my-inbox', MyInbox); // adds "/my-inbox" with middleware "requireIsLoggedIn"
```
#### Nesting
```javascript
router.group('/admin', requireIsAdmin)
    .add('/articles', Articles) // adds "/admin/articles" with middleware "requireIsAdmin"
    .add('/members', Members) // adds "/admin/members" with middleware "requireIsAdmin"
    .group('/cms')
        .group('/pages')
            .add('/new', NewPage);  // adds "/admin/cms/pages/new" with middleware "requireIsAdmin"
;
```
### Programmatic navigation
```javascript
router.navigate('/login');
```
```javascript
router.navigate('/login', {type: 'internal'}); // doesn't change the URL
```
```javascript
router.navigate('/login', {type: 'push'}); // will push state to history (default)
```
```javascript
router.navigate('/login', {type: 'replace'}); // will replace state to history
```
```javascript
router.navigate('/login', {type: 'external'}); // will perform a hard redirect
```
### Link
Easily integrate a tags
```html
<script>
import {link} from 'another-svelte-router';
</script>
<div>
    <a href="/page1" use:link></a>
    <a href="/page2" use:link></a>
    <a href="/page3" use:link></a>
</div>
```
Or with links
```html
<script>
import {links} from 'another-svelte-router';
</script>
<div use:links>
    <a href="/page1"></a>
    <a href="/page2"></a>
    <a href="/page3"></a>
</div>
```
Also supports the "navigate" methods' type
```html
<script>
import {link} from 'another-svelte-router';
</script>
<div>
    <a href="/page1" use:link type="push"></a>
    <a href="/page2" use:link type="replace"></a>
    <a href="/page3" use:link type="internal"></a>
</div>
```
## Disclaimer
This is by no means a "finished product".
It is merely the result of a few hours of first-time experimentation with Svelte.

I'm publishing this in the hope that it may be of some use to whomever finds his or her way here.

There's still plenty of testing, optimizing, refactoring, expanding and documenting undocumented features to be done. Depending on my availability and the community interest I may or may not further continue development.
### License
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](https://opensource.org/licenses/MIT)


<p>
  <a href="https://github.com/seanox/aspect-js/pulls">
    <img src="https://img.shields.io/badge/development-active-green?style=for-the-badge">
  </a>
  <a href="https://github.com/seanox/aspect-js/issues">
    <img src="https://img.shields.io/badge/maintenance-active-green?style=for-the-badge">
  </a>
  <a href="http://seanox.de/contact">
    <img src="https://img.shields.io/badge/support-active-green?style=for-the-badge">
  </a>
</p>


# Description
Influenced by the good experiences from JSF (Java Server Faces) with regard to
function and an easy integration into the markup, arose a similar client-side
fullstack solution.  
Seanox aspect-js focuses on a minimalist approach to implementing
Single-Page Applications (SPAs). 
This framework takes the declarative approach of HTML and extends this with
expression language, rendering with addional attributes, object/model-binding,
Model View Controller, Resource Bundle, NoSQL datasource, test environment and
much more.


# Features
- Easy integration in markup and JavaScript (clean code)
- Lightweight implementation (requires no additional frameworks)  
  less than 64kB for all (so the plan, but there will be a few more bytes)
- Component based architecture
- Modularization (supports imports at the runtime)  
  component concept for smart/automatic loading of composite resources
- Event handling
- Expression Language  
  meta-language extension in combination with full JavaScript
- Markup rendering  
  supports: condition, custom tags, events, filter, interval, iterate,
  rendering, resources messages, validation, ...
- Markup hardening  
  hardening makes it difficult to manipulate the attributes in the markup  
  Non-visible components are removed from the DOM and only reinserted when used  
- Model View Controller  
  supports: events, virtual paths, sitemap, permission concept, ...
- Resource Bundle / Resource Messages  
  localization and internationalization (i18n) as well for the outsourcing of
  texts 
- NoSQL datasource based on XML  
  lightweight data management for aggregation / projection / transformation
- Test environment  
  something like JUnit for automated unit tests
- ... 


# Licence Agreement
Seanox Software Solutions ist ein Open-Source-Projekt, im Folgenden
Seanox Software Solutions oder kurz Seanox genannt.

Diese Software unterliegt der Version 2 der GNU General Public License.

Copyright (C) 2020 Seanox Software Solutions

This program is free software; you can redistribute it and/or modify it under
the terms of version 2 of the GNU General Public License as published by the
Free Software Foundation.

This program is distributed in the hope that it will be useful, but WITHOUT ANY
WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A
PARTICULAR PURPOSE. See the GNU General Public License for more details.

You should have received a copy of the GNU General Public License along with
this program; if not, write to the Free Software Foundation, Inc., 51 Franklin
Street, Fifth Floor, Boston, MA 02110-1301, USA.


# System Requirement
- ECMAScript 6 support or higher (normally the current browsers)  
  Engines (tested): Blink, Edge, Gecko, Goanna, WebKit, ...
- Web server for hosting  


# Downloads
[Seanox aspect-js 1.2.0](https://raw.githubusercontent.com/seanox/aspect-js/master/releases/aspect-js-1.2.0.zip)  
[Seanox aspect-js 1.2.0 Sources](https://raw.githubusercontent.com/seanox/aspect-js/master/releases/aspect-js-1.2.0-src.zip)


# Release Channels

## latest release
[https://cdn.jsdelivr.net/npm/seanox/releases/aspect-js.js](https://cdn.jsdelivr.net/npm/seanox/releases/aspect-js.js)  
[https://cdn.jsdelivr.net/npm/seanox/releases/aspect-js-min.js](https://cdn.jsdelivr.net/npm/seanox/releases/aspect-js-min.js)

## latest release of major version 1.x
[https://cdn.jsdelivr.net/npm/seanox/releases/aspect-js-1.x.js](https://cdn.jsdelivr.net/npm/seanox/releases/aspect-js-1.x.js)  
[https://cdn.jsdelivr.net/npm/seanox/releases/aspect-js-1.x-min.js](https://cdn.jsdelivr.net/npm/seanox/releases/aspect-js-1.x-min.js)

The release channels continuously provide the newest final major versions, which
are downward compatible to the major version. Seanox aspect-js is always up to
date when using the release channels.


# Manuals
- [DE Introduction](https://github.com/seanox/aspect-js/blob/master/manual/de/introduction.md)
- [DE Manual](https://github.com/seanox/aspect-js/blob/master/manual/de)  
- [EN Introduction](https://github.com/seanox/aspect-js/blob/master/manual/en/introduction.md)
- [EN Manual](https://github.com/seanox/aspect-js/blob/master/manual/en)
- [EN Tutorial](https://github.com/seanox/aspect-js-tutorial#description)


# Changes (Change Log)
## 1.2.0 20191231 (summary of the current version)  
BF: Composite: Wrapper of XMLHttpRequest.open correction for using all passed arguments  
BF: Composite Asynchron: Corection of passed arguments  
BF: Composite Events: Composite.EVENT_RENDER_END now includes the mounting of models  
BF: Composite Mount Synchronization: Correction for the input-elements: select, radio, checkbox  
BF: Composite Render Condition: Exclusive use of the placeholder  
BF: Composite Render Include: Optimization/correction of the strategy  
BF: Composite Render Include: Loading and inserting HTML content for elements  
BF: Composite Expression Parse: Correction of the detection of value- and method-expressions  
BF: Composite Lock Managment: Queue progress only after release functionality  
BF: Extension Capitalize: Correction for use with empty strings  
BF: MVC: Correction of the embedded use of SiteMap.accept(path)  
BF: MVC: Correction of initial forwarding from / to /#  
CR: Test: (Re)Move of Assert.assertEqualsTo as Assert.assertSameTo in /test/modules/common.js  
CR: Test: Enhancement of console output monitoring  
CR: Test: Optimization of console forwarding  
CR: Test: Extension of console forwarding by listeners  
CR: Test: Extension for passing events (Test + Console) to the enclosing object when using frames  
CR: Test: Extension for central catching of errors with activated Test-AP  
CR: Test: Optimization for using readonly meta objects for return values  
CR: Test Suite: Optimization of error output  
CR: Test: Omission of the method Test.configure(...), function is taken over by Test.start(...)  
CR: Composite Object Lookup: Added support now for arrays (also associative)  
CR: Composite Render: Extension with the attribute 'release' as an indicator that an element was rendered.  
CR: Composite Render: Support of expressions for all composite / render attributes (new ID and EVETNS)  
CR: Composite Render Iterate: Correction/Optimization in general  
CR: Composite Render Iterate: Optimization for using readonly meta object  
CR: Composite Render Attributes: undefined as return value of an expression deletes an attribute  
CR: Composite Scan: Omission of the intermediate step between render and mount  
CR: Composite Mount: Revision of the object/model binding  
CR: Composite Mount: Stricter use of the hierarchy of IDs in the DOM  
CR: Composite Mount Validation: Change to two-phase validation (HTML5 + model-based validation)  
CR: Composite Mount Validation: Has a direct effect on synchronization, action and default action of the browser  
CR: Composite Mount Validation: Enhancement with the attribute message for error output  
CR: Composite Mount Validation: Relocation to own method Composite.validate(selector)  
CR: Composite Mount Synchronization: Optimization  
CR: Composite Mount Action: The return value false can cancel the default action of the browser  
CR: Composite Mount Locate: Stricter use of the hierarchy of IDs in the DOM  
CR: Composite Mount Locate: Stricter use of property and qualifier (name)  
CR: Composite Mount Lookup: Stricter use of property and qualifier (name)  
CR: Composite Mount Synchronization: Extension by the detection and use of setter (object accessors)  
CR: Composite Release: Addition of the CSS rule when the page is loaded  
CR: Composite Hardening: Added optional hardening from markup  
CR: Composite Include: Modules with a condition are only reloaded if the condition is true  
CR: MVC Path: Support paths with beginning numbers  
CR: MVC SiteMap: Omission of autofocus, since the use scrollIntoView can be too individual  
CR: MVC SiteMap: Added variable paths for faces and facets  
CR: MVC SiteMap: Added the forward method  
CR: DataSource Locales: As standard marked are at the beginning  
CR: Extension Uncapitalize: Adds a uncapitalize function to the String objects  
CR: Extension: Added Math.uniqueSerialId to create serial (U)UIDs  
CR: Extension: Optimization for using readonly meta objects for return values  
CR: Extension Namespace: Optimization and extension  
CR: Messages: Update to use constant key/value pairs  
CR: Build: Optimization of target 'changes'  
CR: Build: Additional compression via javascript-minifier.com  

[Read more](https://raw.githubusercontent.com/seanox/aspect-js/master/CHANGES)


# Contact
[Issues](https://github.com/seanox/aspect-js-tutorial/issues)  
[Requests](https://github.com/seanox/aspect-js-tutorial/pulls)  
[Mail](http://seanox.de/contact)  


# Thanks!
<img src="https://raw.githubusercontent.com/seanox/seanox/master/sources/resources/images/thanks.png">

[JetBrains](https://www.jetbrains.com/?from=seanox)  
Sven Lorenz  
Andreas Mitterhofer  
[novaObjects GmbH](https://www.novaobjects.de)  
Leo Pelillo  
Gunter Pfannm&uuml;ller  
Annette und Steffen Pokel  
Edgar R&ouml;stle  
Michael S&auml;mann  
Markus Schlosneck  
[T-Systems International GmbH](https://www.t-systems.com)

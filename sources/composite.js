/**
 *  LIZENZBEDINGUNGEN - Seanox Software Solutions ist ein Open-Source-Projekt,
 *  im Folgenden Seanox Software Solutions oder kurz Seanox genannt. Diese
 *  Software unterliegt der Version 2 der GNU General Public License.
 *
 *  Seanox aspect-js, JavaScript Client Faces
 *  Copyright (C) 2018 Seanox Software Solutions
 *
 *  This program is free software; you can redistribute it and/or modify it
 *  under the terms of version 2 of the GNU General Public License as published
 *  by the Free Software Foundation.
 *
 *  This program is distributed in the hope that it will be useful, but WITHOUT
 *  ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
 *  FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for
 *  more details.
 *
 *  You should have received a copy of the GNU General Public License along
 *  with this program; if not, write to the Free Software Foundation, Inc.,
 *  51 Franklin Street, Fifth Floor, Boston, MA 02110-1301, USA.
 *  
 *  
 *      DESCRIPTION
 *      ----
 *  TODO:
 *  - Composite-Attribute sind elementar und unveränderlich, sie werden bei
 *    ersten Auftreten eines Elements gelesen und können später nicht geänert
 *    werden, da sie dann aus Element-Cache verwendet werden 
 *  - Element-Attribute sind auch dann elementar und unveränderlich, wenn diese
 *    eine Expression enthalten
 *  - Die Welt ist statisch. So auch aspect-js und alle Komponenten.
 *    Das erspart die Verwaltung und Einrichtung von Instanzen.
 *  - Rendering: Clean Code
 *    Nur fuer aspect-js verwendete Attribute werden in Meta-Objketen zu den Elementen
 *    zwischengespeichert und koennen/sollen im Markup nach Verwendung entfernt
 *    werden. An einem Element befindliche aspect-js-Attribute sind ein
 *    Kennzeichen, dass diese noch nicht verarbeitet wurden.
 *  - Object-Bindung
 *    Die Composite-ID setzt sich wie folgt zusammen: namespace:qualifier
 *        nameSpace = package + class
 *        qualifier = zusätzliche Kennzeichnung damit die ID unique ist
 *    Der Qualifier wird von Composite/Object-Bindung ignoriert.
 *  TODO: Doku:
 *        Custom-Tag, hier muss man sich um alle attribute selbt gekuemmert werden.
 *        Composite tut hier nicht, ausser dem Aufruf der Implementierung.
 *        Es kann jedes Node-Element (auch #text) als custom-tag registriert werden.
 *        Die Attribute werden durch Composite nicht manipuliert oder interpretiert.
 *        Das ueberschreiben von eigenen Tags, wie z.B. "param" ist moeglich, aber nicht empfehlenswert.
 *  TODO: Doku:
 *        If a custom selector exists, the macro is executed.
 *        Custom selector is a filter-function based on a query selector.
 *        The root of the selector is the current element.
 *        The filter therefore affects the child elements.
 *        Custom Selector wird nach Custom-Tag ausgefuehrt.
 *        Auch hier, sind die Attribute eines Elements noch unveraendert (also Stand vor dem Rendering).
 *  TODO: Hinweis zu JavaScript-Blöcken
 *        Diese werden durch das rekursive Rendering ggf. mehrfach verarbeitet.
 *        Bsp. iterate: Erst beim initialen Laden der Seite, dann beim Iterate
 *        selbst und dann beim Rescan nach Abschluss vom Iterate. Daher sollte
 *        hier besser composite/javascript verwendet werden.
 *        Der Effekt betriff alle Stellen, an denen ein Output in die Seite beim
 *        Rendern erfolgt. Diese Stellen werden nach dem Output immer gescannt ob
 *        sich hier neues Markup mit Expressions oder Markup für das Objekt-Binding
 *        ergeben hat.
 *  TODO: Check the usage of apply      
 *        
 *  Composite 1.0 20180824
 *  Copyright (C) 2018 Seanox Software Solutions
 *  Alle Rechte vorbehalten.
 *
 *  @author  Seanox Software Solutions
 *  @version 1.0 20180824
 */
if (typeof Composite === "undefined") {
    
    /**
     *  Static component for rendering and object binding.
     *  The processing runs in the background and starts automatically when a
     *  page is loaded.
     */
    Composite = {};
    
    /** Assoziative array for custom tags (key:tag, value:function) */
    Composite.macros;

    /** Assoziative array for custom selectors (key:hash, value:{selector, function}) */
    Composite.selectors;

    /** Assoziative array with events and their registered listerners */
    Composite.listeners;

    /** Constant for attribute assent */
    Composite.ATTRIBUTE_ASSENT = "assent";

    /** Constant for attribute composite */
    Composite.ATTRIBUTE_COMPOSITE = "composite";
    
    /** Constant for attribute condition */
    Composite.ATTRIBUTE_CONDITION = "condition";

    /** Constant for attribute events */
    Composite.ATTRIBUTE_EVENTS = "events"; 

    /** Constant for attribute id */
    Composite.ATTRIBUTE_ID = "id";
    
    /** Constant for attribute import */
    Composite.ATTRIBUTE_IMPORT = "import";

    /** Constant for attribute interval */
    Composite.ATTRIBUTE_INTERVAL = "interval";

    /** Constant for attribute iterate */
    Composite.ATTRIBUTE_ITERATE = "iterate";

    /** Constant for attribute mount */
    Composite.ATTRIBUTE_MOUNT = "mount";

    /** Constant for attribute name */
    Composite.ATTRIBUTE_NAME = "name";

    /** Constant for attribute output */
    Composite.ATTRIBUTE_OUTPUT = "output";

    /** Constant for attribute render */
    Composite.ATTRIBUTE_RENDER = "render";     
    
    /** Constant for attribute sequence */
    Composite.ATTRIBUTE_SEQUENCE = "sequence";

    /** Constant for attribute text */
    Composite.ATTRIBUTE_TEXT = "text";    

    /** Constant for attribute type */
    Composite.ATTRIBUTE_TYPE = "type";
    
    /** Constant for attribute validate */
    Composite.ATTRIBUTE_VALIDATE = "validate";
    
    /** Constant for attribute value */
    Composite.ATTRIBUTE_VALUE = "value";

    /**
     *  Pattern for all accepted attributes.
     *  Accepted attributes are all attributes, even without an expression that
     *  is cached in the meta object. Other attributes are only cached if they
     *  contain an expression. The attribute condition is not included in the
     *  list because it is used very specifically.
     */
    Composite.PATTERN_ATTRIBUTE_ACCEPT = /^composite|events|id|import|interval|iterate|output|sequence|render|validate$/i;   
    
    /**
     *  Pattern for all static attributes.
     *  Static attributes are not removed from the element during rendering, but
     *  are also set in the meta object like non-static attributes.
     *  These attributes are also intended for direct use in JavaScript and CSS.
     */
    Composite.PATTERN_ATTRIBUTE_STATIC = /^composite|id$/i;

    /** 
     *  Pattern to detect if a string contains an expression.
     *  Escaping characters via slash is supported.
     */
    Composite.PATTERN_EXPRESSION_CONTAINS = /\{\{((?:(?:.*?[^\\](?:\\\\)*)|(?:(?:\\\\)*))*?)\}\}/g;   
    
    /**
     *  Patterns to test whether an expression is exclusive, i.e. an expression
     *  without additional text fragments before or after.
     */
    Composite.PATTERN_EXPRESSION_EXCLUSIVE = /^\s*\{\{((?:(?:.*?[^\\](?:\\\\)*)|(?:(?:\\\\)*))*?)\}\}\s*$/;
    
    /**
     *  Patterns for expressions with variable.
     *      group 1: variable
     *      group 2: expression
     */
    Composite.PATTERN_EXPRESSION_VARIABLE = /^\s*(_*[a-z]\w*)\s*:\s*(.*?)\s*$/i;    

    /** Pattern for all to ignore (script-)elements */
    Composite.PATTERN_ELEMENT_IGNORE = "/script|style/i";

    /** Pattern for all script elements */
    Composite.PATTERN_SCRIPT = /script/i;

    /** 
     *  Pattern for all composite-script elements.
     *  These elements are not automatically executed by the browser but must be
     *  triggered by rendering. Therefore, these scripts can be combined and
     *  controlled with the condition attribute.
     */
    Composite.PATTERN_COMPOSITE_SCRIPT = /^composite\/javascript$/i;

    /** Pattern for a composite id */
    Composite.PATTERN_COMPOSITE_ID = /^([a-z](?:[\w\.]*[\w])*)(?:\:\w*)*$/i;
    
    //TODO:
    Composite.PATTERN_CUSTOMIZE_SCOPE = /^[a-z](?:(?:\w*)|([\-\w]*\w))$/i;

    /** Pattern for all accepted events */
    Composite.PATTERN_EVENT = /^([A-Z][a-z]+)+$/;
    
    /** Constants of events during rendering */
    Composite.EVENT_RENDER_START = "RenderStart";
    Composite.EVENT_RENDER_NEXT = "RenderNext";
    Composite.EVENT_RENDER_END = "RenderEnd";

    /** Constants of events during scanning */
    Composite.EVENT_SCAN_START = "ScanStart";
    Composite.EVENT_SCAN_NEXT = "ScanNext";
    Composite.EVENT_SCAN_END = "ScanEnd";
    
    /** Constants of events when using AJAX */
    Composite.EVENT_AJAX_START = "AjaxStart";
    Composite.EVENT_AJAX_RECEIVE = "AjaxReceive";
    Composite.EVENT_AJAX_SUCCESS = "AjaxSuccess";
    Composite.EVENT_AJAX_ERROR = "AjaxError";

    /** Constants of events when errors occur */
    Composite.EVENT_ERROR = "Error";
    
    /** 
     *  List of possible DOM events
     *  see also https://www.w3schools.com/jsref/dom_obj_event.asp
     */
    Composite.events = "abort after|print animation|end animation|iteration animation|start"
        + " before|print before|unload blur"
        + " can|play can|play|through change click context|menu copy cut"
        + " dbl|click drag drag|end drag|enter drag|leave drag|over drag|start drop duration|change"
        + " ended error"
        + " focus focus|in focus|out"
        + " hash|change"
        + " input invalid"
        + " key|down key|press key|up"
        + " load loaded|data loaded|meta|data load|start"
        + " message mouse|down mouse|enter mouse|leave mouse|move mouse|over mouse|out mouse|up mouse|wheel"
        + " offline online open"
        + " page|hide page|show paste pause play playing popstate progress"
        + " rate|change resize reset"
        + " scroll search seeked seeking select show stalled storage submit suspend"
        + " time|update toggle touch|cancel touch|end touch|move touch|start transition|end"
        + " unload"
        + " volume|change"
        + " waiting wheel";
    
    /** Patterns with the supported events */
    Composite.PATTERN_EVENT_FUNCTIONS = (function() {
        var pattern = Composite.events.replace(/(?:\||\b)(\w)/g, function(match, letter) {
           return letter.toUpperCase();
        });
        pattern = new RegExp("^on(" + pattern.replace(/\s+/g, "|") + ")");
        return pattern;
    })();

    /**
     *  Enhancement of the JavaScript API
     *  Adds a static counter for assigning serial IDs to the Node object.
     */    
    if (Node.indication === undefined)
        Node.indication = 0;
    
    /**
     *  Enhancement of the JavaScript API
     *  Adds a function for getting the serial ID to the Node objects.
     */ 
    if (Node.prototype.ordinal === undefined) {
        Node.prototype.ordinal = function() {
            this.serial = this.serial || Node.indication++;
            return this.serial;
        };     
    };
    
    /**
     *  Enhancement of the JavaScript API
     *  Adds a function to get and remove an attribute from an element.
     */ 
    if (Element.prototype.fetchAttribute === undefined) {
        Element.prototype.fetchAttribute = function(attribute) {
            if (!this.hasAttribute(attribute))
                return false;
            var value = this.getAttribute(attribute);
            this.removeAttribute(attribute);
            return value; 
        };     
    };    

    /**
     *  Enhancement of the JavaScript API
     *  Adds a static function to determine an object via the namespace.
     */ 
    if (Object.lookup === undefined)
        Object.lookup = function(namespace) {
            namespace = (namespace || "").trim().split(/\./);
            if (!namespace
                    || namespace.length <= 0)
                return null;
            var scope = window;
            for (var index = 0; scope && index < namespace.length; index++) {
                if (namespace[index] in scope
                        && scope[namespace[index]] instanceof Object)
                    scope = scope[namespace[index]];
                else return null;
            }
            return scope;
        };
        
    /**
     *  Enhancement of the JavaScript API
     *  Adds a static function to check whether an object exists in a namespace.
     */ 
    if (Object.exists === undefined)
        Object.exists = function(namespace) {
            return Object.lookup(namespace) != null; 
        };        

    /**
     *  Enhancement of the JavaScript API
     *  Implements an own send method for event management. The original method
     *  is reused in the background.
     */ 
    XMLHttpRequest.prototype.internalSend = XMLHttpRequest.prototype.send;
    XMLHttpRequest.prototype.send = function(body) {
        Composite.fire(Composite.EVENT_AJAX_START, this); 
        var internalOnReadyStateChange = this.onreadystatechange;
        this.onreadystatechange = function() {
            Composite.fire(Composite.EVENT_AJAX_RECEIVE, this);
            if (this.readyState == 4) {
                if (this.status == "200")
                    Composite.fire(Composite.EVENT_AJAX_SUCCESS, this);
                else Composite.fire(Composite.EVENT_AJAX_ERROR, this);
            }
            if (internalOnReadyStateChange)
                internalOnReadyStateChange.apply(this, arguments);
        };
        this.internalSend(body);
    };
    
    /**
     *  Registers a callback function for composite events.
     *  @param  event    see Composite.EVENT_***
     *  @param  callback callback function
     *  @throws An error occurs in the following cases:
     *      - event is not valid or is not supported
     *      - callback function is not implemented correctly or does not exist
     */
    Composite.listen = function(event, callback) {
        
        if (typeof event !== "string")
            throw new TypeError("Invalid event: " + typeof event);
        if (typeof callback !== "function"
                && callback !== null
                && callback !== undefined)
            throw new TypeError("Invalid callback: " + typeof callback);        
        if (!event.match(Composite.PATTERN_EVENT))
            throw new Error("Invalid event" + (event.trim() ? ": " + event : ""));
        
        event = event.toLowerCase();
        Composite.listeners = Composite.listeners || new Array();
        if (!Array.isArray(Composite.listeners[event]))
            Composite.listeners[event] = new Array();
        Composite.listeners[event].push(callback);
    };
    
    /**
     *  Triggers an event.
     *  All callback functions for this event are called.
     *  @param event    see Composite.EVENT_***
     *  @param variants up to five additional optional arguments that are passed
     *                  as arguments when the callback function is called
     */
    Composite.fire = function(event, variants) {

        event = (event || "").trim();
        if (!Composite.listeners
                || !event)
            return;
        var listeners = Composite.listeners[event.toLowerCase()];
        if (!Array.isArray(listeners))
            return;
        variants = Array.from(arguments);
        variants = variants.slice(1);
        variants.unshift(event);
        listeners.forEach(function(callback, index, array) {
            window.setTimeout(function(callback, variants) {
                callback.apply(null, variants);
            }, 0, callback, variants);
        });        
    };

    /**
     *  Asynchronous call of a function.
     *  In reality, it is a non-blocking function call, because asynchronous
     *  execution is not possible without Web Worker.
     *  @param task     function to be executed
     *  @param sequence true if the execution is to be linear/sequential
     *  @param variants up to five additional optional arguments that are passed
     *                  as arguments when the callback function is called
     */
    Composite.asynchron = function(task, sequence, variants) {
        
        var method = function(invoke, variants) {
            
            try {invoke.apply(null, variants);
            } finally {
                if (invoke == Composite.scan
                        || invoke == Composite.mount) {
                    Composite.scan.ticks--;
                    if (Composite.scan.ticks <= 0) {
                        variants.unshift(Composite.EVENT_SCAN_END);
                        Composite.fire.apply(null, variants);    
                        Composite.scan.lock = false;
                    }
                } else {
                    Composite.render.ticks--;
                    if (Composite.render.ticks <= 0) {
                        variants.unshift(Composite.EVENT_RENDER_END);
                        Composite.fire.apply(null, variants);    
                        Composite.render.lock = false;
                    }
                }
            }
        };
        
        arguments = Array.from(arguments);
        arguments = arguments.slice(2);
        
        if (task == Composite.scan
                || task == Composite.mount)
            Composite.scan.ticks++;
        else Composite.render.ticks++;
        if (sequence)
            method(task, arguments);
        else window.setTimeout(method, 0, task, arguments);
    };
    
    /**
     *  TODO:
     *  TODO: fire events render start/progress/end
     *        - jede Komponente ist statisch
     *        - Namespaces werden unterstuetzt, diese aber syntaktisch gueltig sein
     *        - Objekte in Objekten ist durch den Namespaces moeglich (als static inner Class)
     * 
     *  @throws An error occurs in the following cases:
     *    - namespace is not valid or is not supported
     *    - namespace cannot be created if it already exists as a method
     *    
     *  The object binding and synchronization assume that a model corresponding to the composite exists with the same namespace.
     *  During synchronization, the element must also exist as a property in the model.
     *  The object binding only connects what was implemented with the model. An automatic extension of the models at runtime by the renderer is not supported, but can be solved programmatically - this is a conscious decision!
     */
    Composite.mount = function(selector) {
        
        if (!selector)
            return;        
        
        Composite.mount.stack = Composite.mount.stack || new Array();
        
        if (typeof selector === "string") {
            selector = selector.trim();
            if (!selector)
                return;
            var nodes = document.querySelectorAll(selector);
            nodes.forEach(function(node, index, array) {
                Composite.asynchron(Composite.mount, false, node);
            });
            return;
        }
        
        if (!(selector instanceof Element))
            return;
        
        //There must be a corresponding model class.
        var model = Composite.mount.lookup(selector);
        if (!(model instanceof Object)
                || model instanceof Element)
            return;
        model = model.scope;
        
        //No multiple object binding
        if (Composite.mount.stack.includes(selector))
            return;
        
        //Marks the element as mounted.
        selector.setAttribute(Composite.ATTRIBUTE_MOUNT, "");
        
        //Registers all events that are implemented in the model.
        for (var entry in model)
            if (typeof model[entry] === "function"
                    && entry.match(Composite.PATTERN_EVENT_FUNCTIONS))
                selector.addEventListener(entry.substring(2).toLowerCase(), model[entry]);
    };
    
    /**
     *  Determines the object scope (namespace) for an element.
     *  The method always requires an existing model / composite in which the
     *  element is located. If the passed element uses an ID with a qualified
     *  namespace, then this is used. Otherwise, if a superordinate composite
     *  with ID exists in the DOM, this is used as base for the namespace.
     *  Returns an meta object with scope, model and field, otherwise null.
     *  @param  element element
     *  @return the created meta object, otherwise null
     */
    Composite.mount.lookup = function(element) {

        if (!(element instanceof Element))
            return null;        
        
        var composite = null;
        for (var node = element; !composite && node.parentNode; node = node.parentNode) {
            if (!node.hasAttribute(Composite.ATTRIBUTE_COMPOSITE)
                    || !node.hasAttribute(Composite.ATTRIBUTE_ID))
                continue;
            var serial = (node.getAttribute(Composite.ATTRIBUTE_ID) || "").trim();
            if (!serial.match(Composite.PATTERN_COMPOSITE_ID))
                continue;
            composite = serial.replace(/:.*$/, "").trim();
        }

        var serial = element.getAttribute(Composite.ATTRIBUTE_ID) || "";
        serial = serial.replace(/:.*$/, "").trim();
        if (!serial.match(Composite.PATTERN_COMPOSITE_ID))
            return null;
        
        var namespace = function(namespace) {
            namespace = namespace.match(/^(?:(.*)\.)*(.*)$/);
            var model = namespace[1];
            var field = namespace[2];
            if (!model || !field)
                return null;
            var scope = Object.lookup(model);
            if (scope  && scope.hasOwnProperty(field))
                return {scope:scope, model:model, field:field};
            return null;
        };

        var scope = namespace(composite ? composite + "." + serial : serial);
        if (!scope
                && composite)
            scope = namespace(serial);
        return scope;
    };
    
    /**
     *  TODO: (Re)Index new composite elements in the DOM.
     *   
     *      Queue and Lock:
     *      ----
     *  The method used a simple queue and transaction management so that the
     *  concurrent execution of scanning works sequentially in the order of the
     *  method call.
     */
    Composite.scan = function(selector, lock) {

        if (!selector)
            return;

        try {
            
            Composite.scan.queue = Composite.scan.queue || new Array();
            
            //The lock locks concurrent scan requests.
            //Concurrent scaning causes unexpected effects.
            if (Composite.scan.lock
                    && Composite.scan.lock != lock) {
                if (Composite.scan.queue.includes(selector))
                    return;
                Composite.asynchron(Composite.scan, false, selector, lock);
                return;
            }
            if (!Composite.scan.lock)
                Composite.scan.lock = new Date().getTime();
            lock = Composite.scan.lock;
            
            Composite.scan.queue = Composite.scan.queue.filter(entry => entry == selector);

            Composite.scan.ticks = Composite.scan.ticks || 0;
            var event = Composite.EVENT_SCAN_START;
            if (Composite.scan.ticks > 0)
                event = Composite.EVENT_SCAN_NEXT;
            Composite.fire(event, selector);

            if (typeof selector === "string") {
                selector = selector.trim();
                if (!selector)
                    return;
                var nodes = document.querySelectorAll(selector);
                nodes.forEach(function(node, index, array) {
                    Composite.asynchron(Composite.scan, false, node, lock);
                });
                return; 
            }

            if (!(selector instanceof Element))
                return;
    
            //Find all unmounted elements with an ID in a composite, including
            //the composite itself. Mounted elements are marked with the
            //attribute 'mount'.
            var nodes = selector.querySelectorAll("[" + Composite.ATTRIBUTE_ID + "]:not([" + Composite.ATTRIBUTE_MOUNT + "])");
            nodes = Array.from(nodes);
            if (!selector.hasAttribute(Composite.ATTRIBUTE_MOUNT))
                nodes.unshift(selector); 
            nodes.forEach(function(node, index, array) {
                var serial = (node.getAttribute(Composite.ATTRIBUTE_ID) || "").trim();
                if (serial.match(Composite.PATTERN_COMPOSITE_ID))
                    Composite.asynchron(Composite.mount, false, node);
            });
        } finally {
            if (Composite.scan.ticks <= 0)
                Composite.fire(Composite.EVENT_SCAN_END);
        }
    };
    
    /**
     *  TODO: Q: It is better to rename 'scope'?
     *  @throws An error occurs in the following cases:
     *    - namespace is not valid or is not supported
     *    - rendering function is not implemented correctly
     *  TODO: customize object binding alias -> model
     */
    Composite.customize = function(scope, rendering) {
        
        //Custom tags, here also called macro, are based on a case-insensitive
        //tag name (key) and a render function (value). In this function, the
        //tag name and the render functions are registered and a RegExp will be
        //created so that the custom tags can be found faster.
        
        if (typeof scope !== "string")
            throw new TypeError("Invalid scope: " + typeof scope);
        if (typeof rendering !== "function"
                && rendering !== null
                && rendering !== undefined)
            throw new TypeError("Invalid rendering: " + typeof rendering);
        scope = scope.trim();
        if (scope.length <= 0)
            throw new Error("Invalid scope");
            
        if (scope.match(Composite.PATTERN_CUSTOMIZE_SCOPE)) {
            Composite.macros = Composite.macros || {};
            if (rendering == null)
                delete Composite.macros[scope.toLowerCase()];
            else Composite.macros[scope.toLowerCase()] = rendering;
        } else {
            var hash = scope.toLowerCase().hashCode();
            Composite.selectors = Composite.selectors || {};
            if (rendering == null)
                delete Composite.selectors[hash];
            else Composite.selectors[hash] = {selector:scope, rendering:rendering};
        } 
    };
    
    /**
     *  Rendering involves updating and, if necessary, reconstructing an HTML
     *  element and all its children. The declarative commands for rendering
     *  (attributes) and the expression language are executed.
     *
     *      Queue and Lock:
     *      ----
     *  The method used a simple queue and transaction management so that the
     *  concurrent execution of rendering works sequentially in the order of the
     *  method call.
     *  
     *      Element Meta Object
     *      ---- 
     *  With the processed HTML elements and text nodes, simplified meta objects
     *  are created. The serial, the reference on the HTML element and the
     *  initial attributes (which are required for rendering) are stored there.
     *  
     *      Serial
     *      ----
     *  Serial is a special extension of the JavaScript API of the object and
     *  creates a unique ID for each object. This ID can be used to compare, map
     *  and reference a wide variety of objects. Composite and rendering use
     *  serial, since this cannot be changed via the markup.  
     *      
     *      Sequence
     *      ----
     *  Sequence is a very special declaration and controls the sequence of
     *  concurrent processing. Sequence defines that the processing of the
     *  children of an HTML element takes place from top to bottom and from left
     *  to right. Thus the processing of the DOM follows the serial branching:
     *      1 - 1.1 - 1.1.1 - 1.2 - 1.2.1 - 2 - ...
     *  This specification is important if rendering and/or the object binding
     *  must follow a certain logical sequence.    
     *      
     *      Text Node (simple embedded expression)
     *      ----
     *  A text node contain static and dynamic contents as well as parameters.
     *  Dynamic contents and parameters are formulated as expressions, but only
     *  the dynamic contents are output. Parameters are interpreritert, but do
     *  not generate any output. During initial processing, a text node is
     *  analyzed and, if necessary, splitted into static content, dynamic
     *  content and parameters. To do this, the original text node is replaced
     *  by new separate text nodes:
     *      e.g. "text {{expr}} + {{var:expr}}" -> ["text ", {{expr}}, " + ", {{var:expr}}]
     *  When the text nodes are split, meta objects are created for them. The
     *  meta objects are compatible with the meta objects of the rendering
     *  methods but use the additional attributes:
     *      Composite.ATTRIBUTE_TEXT, Composite.ATTRIBUTE_NAME and
     *      Composite.ATTRIBUTE_VALUE
     *  Only static content uses Composite.ATTRIBUTE_TEXT, dynamic content and
     *  parameters use Composite.ATTRIBUTE_VALUE, and only the parameters use
     *  Composite.ATTRIBUTE_NAME. The meta objects for dynamic content also have
     *  their own rendering method for generating output. Static content is
     *  ignored later during rendering because it is unchangeable.     
     *      
     *      Events + Validate + Render
     *      ----
     *  Events primarily controls the synchronization of the input values of
     *  HTML elements with the fields of a model. Means that the value in the
     *  model only changes if an event occurs for the corresponding HTML
     *  element. Synchronization is performed at a low level. Means that the
     *  fields are synchronized directly and without the use of get and set
     *  methods. For a better control a declarative validation is supported. If
     *  the attribute 'validate' exists, the value for this is ignored, the
     *  static method <Model>.validate(element, value) is  called in the
     *  corresponding model. This call must return a true value as the result,
     *  otherwise the element value is not stored into the corresponding model
     *  field. If an event occurs, synchronization is performed. After that will
     *  be checked whether the render attribute exists. All selectors listed
     *  here are then triggered for re-rendering. Re-rendering is independent of
     *  synchronization and validation and is executed immediately after an
     *  event occurs.
     *      
     *      Condition
     *      ----
     *  TODO: condition
     *  The declaration can be used with all HTML elements, but not with script
     *  and style. The condition defines whether an element is (re)rendered or
     *  not. As result of the expression true/false is expected and will be se
     *  as an absolute value for the condition attribute - only true or false.
     *  Elements are hidden with the condition attribute via CSS and only
     *  explicitly displayed with [condition=true]. JavaScript elements are
     *  executed or not.     
     *      
     *      Import
     *      ----
     *  This declation loads the content and replaces the inner HTML of an
     *  element with the content. The attribute expects as value one element or
     *  more elements as node list or array -- these are then inserted directly
     *  and behave similar to the output-attribute, or the value is considered
     *  as a remote resource with relative or absolute URL and will be loaded
     *  via the HTTP method GET.
     *  TODO: condition
     *  Loading and replacing the import function can be combined with the
     *  condition attribute and is only executed when the condition is true.
     *  If the content can be loaded successfully, the import attribute is
     *  removed. Recursive rendering is initiated via the MutationObserver.
     *  
     *      Output
     *      ----
     *  Set the value or result of an expression as the content of an element.
     *  For an expression, the result can also be an element or a node list with
     *  elements. All other data types are set as text. This output is
     *  exclusive, thus overwriting any existing content.
     *  The recursive rerendering is initiated via the MutationObserver.
     *      
     *      Interval
     *      ----
     *  Interval rendering based on a window interval.
     *  If an HTML element is declared as interval, its initial inner HTML is
     *  used as a template. During the intervals, the inner HTML is first
     *  emptied, the template is rendered individually with each interval cycle,
     *  and the result is added to the inner HTML. The interval attribute
     *  expects a value in milliseconds. An invalid value cause a console
     *  output. The interval starts automatically with the (re)rendering of the
     *  declared HTML element and is terminated and removed when:
     *    - the element no longer exists in the DOM
     *    - TODO: condition the condition attribute is false
     *    - the element or a parent is no longer visible
     *      
     *      Iterate
     *      ----
     *  Iterative rendering based on lists, enumeration and arrays.
     *  If an HTML element is declared as iterate, its initial inner HTML is
     *  used as a template. During iteration, the inner HTML is initially
     *  emptied, the template is rendered individually with each iteration cycle
     *  and the result is added to the inner HTML.
     *  The expression for the iteration is a parameter expression. The
     *  parameter is a meta object and supports access to the iteration cycle.
     *      e.g iterate={{tempA:Model.list}} -> tempA = {item, index, data}
     *             
     *      Scripting
     *      ----
     *  Embedded scripting brings some peculiarities.
     *  The default scripting is automatically executed by the browser and
     *  independent of rendering. Therefore, the scripting for rendering has
     *  been adapted and a new script type have been introduced:
     *      composite/javascript
     *  This script type use the normal JavaScript. Unlike type text/javascript,
     *  the browser does not recognize them and does not execute the JavaScript
     *  code automatically. Only the render recognizes the JavaScript code and
     *  executes it in each render cycle when the cycle includes the script
     *  element. In this way, the execution of the script element can also be
     *  combined with the attribute condition.
     *  Embedded scripts must be 'ThreadSafe'.
     *  
     *      Custom Tag (Macro):
     *      ----  
     *  TODO
     *      
     *      Custom Selectors
     *      ----
     *  TODO    
     */
    Composite.render = function(selector, sequence, lock) {
        
        if (!selector)
            return;
        
        try {

            Composite.render.queue = Composite.render.queue || new Array();
            
            //The lock locks concurrent render requests.
            //Concurrent rendering causes unexpected states due to manipulations
            //at the DOM. HTML elements that are currently being processed can
            //be omitted or replaced from the DOM. Access to parent and child
            //elements may then no longer be possible.
            if (Composite.render.lock
                    && Composite.render.lock != lock) {
                if (Composite.render.queue.includes(selector))
                    return;
                Composite.render.queue.push(selector);
                Composite.asynchron(Composite.render, sequence, selector, sequence, lock);
                return;
            }
            if (!Composite.render.lock)
                Composite.render.lock = new Date().getTime();
            lock = Composite.render.lock;
            
            Composite.render.queue = Composite.render.queue.filter(entry => entry == selector);
            
            Composite.render.ticks = Composite.render.ticks || 0;
            var event = Composite.EVENT_RENDER_START;
            if (Composite.render.ticks > 0)
                event = Composite.EVENT_RENDER_NEXT;
            Composite.fire(event, selector);

            if (typeof selector === "string") {
                selector = selector.trim();
                if (!selector)
                    return;
                var nodes = document.querySelectorAll(selector);
                nodes.forEach(function(node, index, array) {
                    Composite.asynchron(Composite.render, sequence, node, sequence, lock);
                });
                return;
            }
            
            if (!(selector instanceof Node))
                return;
            
            //If a custom tag exists, the macro is executed.
            Composite.macros = Composite.macros || {};
            var macro = Composite.macros[selector.nodeName.toLowerCase()];
            if (macro) {
                Composite.asynchron(macro, sequence, selector);
                return;
            }
            
            //If a custom selector exists, the macro is executed.
            //Custom selector is a filter-function based on a query selector.
            //The root of the selector is the current element.
            //The filter therefore affects the child elements.
            Composite.selectors = Composite.selectors || {};
            for (var macro in Composite.selectors)
                if (typeof macro === "object")
                    (function(element, macro) {
                        var nodes = element.querySelectorAll(macro.selector);
                        nodes.forEach(function(node, index, array) {
                            Composite.asynchron(macro.rendering, sequence, node);
                        });
                    })(selector, Composite.selectors[macro]);
            
            //Associative array for the element-related meta-objects, those
            //which are created during rendering: (key:serial, value:meta)
            Composite.render.meta = Composite.render.meta || new Array();
            
            //Register each analyzed node/element and minimizes multiple
            //analysis. For registration, the serial number of the node/element
            //is used. The node prototype has been enhanced with creation and a
            //get-function. During the analysis, the attributes of a element
            //(not node) containing an expression or all allowed attributes are
            //cached in the memory (Composite.render.meta).
            var serial = selector.ordinal();
            var object = Composite.render.meta[serial];
            if (!object) {
                object = {serial:serial, element:selector, attributes:{}};
                Composite.render.meta[serial] = object;
                if ((selector instanceof Element)
                        && selector.attributes) {
                    //Attribute condition is not included in the list of
                    //Composite.PATTERN_ATTRIBUTE_ACCEPT because it is used very
                    //specifically and must therefore be requested separately.
                    Array.from(selector.attributes).forEach(function(attribute, index, array) {
                        var value = (attribute.value || "").trim();
                        if (value.match(Composite.PATTERN_EXPRESSION_CONTAINS)
                                || attribute.name.match(Composite.PATTERN_ATTRIBUTE_ACCEPT)) {
                            //Remove all internal attributes but not the statics.
                            //Static attributes are still used in the markup or
                            //for the rendering.
                            if (attribute.name.match(Composite.PATTERN_ATTRIBUTE_ACCEPT)
                                    && !attribute.name.match(Composite.PATTERN_ATTRIBUTE_STATIC))
                                selector.removeAttribute(attribute.name);
                            object.attributes[attribute.name.toLowerCase()] = value;
                        }
                    });
                    
                    //The condition attribute is interpreted.
                    //If an HTML element uses the condition attribute, a text
                    //node is created for the HTML element as a placeholder
                    //For the placeholder, a meta object is created with all the
                    //details of the HTML element, the condition and the outer
                    //HTML code of the HTML element as a template. Then the HTML
                    //element in the DOM is replaced by the placeholder. The
                    //change at the DOM triggers the MutationObserver and this
                    //then takes over the processing of the placeholder.
                    var condition = (selector.fetchAttribute(Composite.ATTRIBUTE_CONDITION) || "").trim();
                    if (condition) {

                        //The meta object for the HTML element is removed,
                        //because only the new placeholder is relevant.
                        delete Composite.render.meta[serial];
                        
                        var template = document.createElement(selector.parentNode.nodeName);
                        template.innerHTML = selector.outerHTML;
                        template = Array.from(template.childNodes).shift();
                        
                        //The placeholder and its meta object are created.
                        var placeholder = document.createTextNode("");
                        object = {serial:placeholder.ordinal(), element:placeholder, attributes:{},
                                condition:{serial:placeholder.ordinal(), expression:condition, template:template}
                        };
                        
                        //The Meta object is registered.
                        Composite.render.meta[object.serial] = object;
                        
                        //The HTML element is replaced by the /placeholder. This
                        //change at the DOM triggers the MutationObserver, which
                        //then processes the placeholder.
                        selector.parentNode.replaceChild(placeholder, selector);
                        
                        return;
                    }
                }
            }
            
            //The sequence attribute is interpreted.
            //Sequence is a very special declaration and controls the sequence
            //of concurrent processing. Sequence defines that the processing of
            //the children of an HTML element takes place from top to bottom and
            //from left to right. Thus the processing of the DOM follows the
            //serial branching:
            //    1 - 1.1 - 1.1.1 - 1.2 - 1.2.1 - 2 - ...    
            sequence = sequence || object.attributes[Composite.ATTRIBUTE_SEQUENCE] != undefined;
            
            //A text node contain static and dynamic contents as well as
            //parameters. Dynamic contents and parameters are formulated as
            //expressions, but only the dynamic contents are output. Parameters
            //are interpreritert, but do not generate any output. During initial
            //processing, a text node is analyzed and, if necessary, splitted
            //into static content, dynamic content and parameters. To do this,
            //the original text node is replaced by new separate text nodes:
            //    e.g. "text {{expr}} + {{var:expr}}" ->  ["text ", {{exprl}}, " + ", {{var:expr}}]
            //When the text nodes are split, meta objects are created for them.
            //The meta objects are compatible with the meta objects of the
            //rendering methods but use the additional attributes: 
            //    Composite.ATTRIBUTE_TEXT, Composite.ATTRIBUTE_NAME and
            //    Composite.ATTRIBUTE_VALUE
            //Only static content uses Composite.ATTRIBUTE_TEXT, dynamic content
            //and parameters use Composite.ATTRIBUTE_VALUE, and only the
            //parameters use Composite.ATTRIBUTE_NAME.
            //The meta objects for dynamic content also have their own rendering
            //method for generating output. Static content is ignored later
            //during rendering because it is unchangeable.
            if (selector.nodeType == Node.TEXT_NODE
                    && !object.hasOwnProperty(Composite.ATTRIBUTE_CONDITION)) {
                
                //Ignore script and style tags, no expression is replaced here.
                if (selector.parentNode
                        && selector.parentNode.nodeName.match(Composite.PATTERN_ELEMENT_IGNORE))
                    return;
                
                //Text nodes are only analyzed once.
                //Pure text is completely ignored, only text nodes with a
                //expression as value are updated.
                if (object.attributes.hasOwnProperty(Composite.ATTRIBUTE_TEXT))
                    return;

                //New/unknown text nodes must be analyzed and prepared.
                //If the meta object for text nodes Composite.ATTRIBUTE_TEXT and
                //Composite.ATTRIBUTE_VALUE are not contained, it must be new.
                
                if (object.attributes.hasOwnProperty(Composite.ATTRIBUTE_VALUE)) {
                    object.render();
                    return;
                }   
                    
                //Step 1:
                //If the text node does not contain an expression, the content
                //is static. Static text nodes are marked with the attribute
                //Composite.ATTRIBUTE_TEXT.
                
                var content = selector.textContent;
                if (content.match(Composite.PATTERN_EXPRESSION_CONTAINS)) {
                    
                    //Step 2:
                    //All expressions are determined. A meta object is created
                    //for all expressions. In the text content from the text
                    //node, the expressions are replaced by a placeholder in the
                    //format of the expression with a serial.
                    //Empty expressions are removed / ignored.
                    
                    //All created meta objects with an expression have a special
                    //render metode for updating the text content of the text
                    //node.
                    
                    //Step 3:
                    //The format of the expression distinguishes whether it is a
                    //parameter or an output expression. Parameter expressions
                    //start with the name of the parameter and are interpreted
                    //later, but do not generate any output.
                    
                    content = content.replace(Composite.PATTERN_EXPRESSION_CONTAINS, function(match, offset, content) {
                        match = match.substring(2, match.length -2).trim();
                        if (!match)
                            return "";
                        var node = document.createTextNode("");
                        var serial = node.ordinal();
                        var object = {serial:serial, element:node, attributes:{}, render:function() {
                            if (this.attributes.hasOwnProperty(Composite.ATTRIBUTE_NAME)) {
                                var name = (this.attributes[Composite.ATTRIBUTE_NAME] || "").trim();
                                var value = (this.attributes[Composite.ATTRIBUTE_VALUE] || "").trim();
                                window[name] = Expression.eval(this.serial + ":" + Composite.ATTRIBUTE_VALUE, value);
                                word = "";
                            } else {
                                word = this.attributes[Composite.ATTRIBUTE_VALUE];
                                word = Expression.eval(this.serial + ":" + Composite.ATTRIBUTE_VALUE, word);
                            }
                            this.element.textContent = word;                                     
                        }};
                        var param = match.match(Composite.PATTERN_EXPRESSION_VARIABLE);
                        if (param) {
                            object.attributes[Composite.ATTRIBUTE_NAME] = param[1];
                            object.attributes[Composite.ATTRIBUTE_VALUE] = "{{" + param[2] + "}}";
                        } else object.attributes[Composite.ATTRIBUTE_VALUE] = "{{" + match + "}}";
                        Composite.render.meta[serial] = object; 
                        return "{{" + serial + "}}";
                    });
                    
                    //Step 4:
                    //The prepared text with expression placeholders is
                    //analyzed. All placeholders are determined and the text is
                    //split at the placeholders. The result is an array of
                    //words. Each word are new text nodes with static text or
                    //dynamic content.
                    
                    if (content.match(Composite.PATTERN_EXPRESSION_CONTAINS)) {
                        var words = content.split(/(\{\{\d+\}\})/);
                        words.forEach(function(word, index, array) {
                            if (word.match(/^\{\{\d+\}\}$/)) {
                                var serial = parseInt(word.substring(2, word.length -2).trim());
                                var object = Composite.render.meta[serial];
                                object.render();
                            } else {
                                var node = document.createTextNode(word);
                                var serial = node.ordinal();
                                var object = {serial:serial, element:node, attributes:{}};
                                object.element.textContent = word;
                                object.attributes[Composite.ATTRIBUTE_TEXT] = word;
                                Composite.render.meta[serial] = object; 
                            }
                            array[index] = object.element;
                        });
                        
                        //Step 5:
                        //The newly created text nodes are inserted before the
                        //current text node. The current text node can then be
                        //deleted, since its content is displayed using the
                        //newly created text nodes.
                        
                        //The new text nodes are inserted before the current
                        //element one.
                        words.forEach(function(node, index, array) {
                            selector.parentNode.insertBefore(node, selector);
                        });
                        
                        //The current element will be removed.
                        selector.parentNode.removeChild(selector);                        
                        
                        return;
                    }
                    
                    //If the text content contains empty expressions, these are
                    //corrected and the content is used as static.
                    selector.nodeValue = content;
                }
                
                object.attributes[Composite.ATTRIBUTE_TEXT] = content;
                
                return;
            }
            
            //condition The condition attribute is interpreted.
            //TODO: condition Doku
            if (selector.nodeType == Node.TEXT_NODE
                    && object.hasOwnProperty(Composite.ATTRIBUTE_CONDITION)) {
                var condition = object.condition;
                if (Expression.eval(serial + ":" + Composite.ATTRIBUTE_CONDITION, condition.expression) === true) {
                    if (!condition.element
                            || !document.body.contains(condition.element)) {
                        var template = condition.template.cloneNode(true);
                        Composite.render(template, true, lock);
                        condition.element = template;
                        var serial = template.ordinal();
                        var object = Composite.render.meta[serial];
                        object.condition = {serial:condition.serial};
                        object.assent = true;
                        selector.parentNode.insertBefore(template, selector);
                        return;                        
                    }
                    selector = condition.element;
                    serial = selector.ordinal();
                    object = Composite.render.meta[serial];
                    object.assent = true;
                } else {
                    if (!condition.element)
                        return;
                    selector.parentNode.removeChild(condition.element);
                    delete Composite.render.meta[condition.element.ordinal()];
                    delete condition.element;
                    return;
                }
            }
            
            if (!(selector instanceof Element))
                return;

            //Events primarily controls the synchronization of the input values
            //of HTML elements with the fields of a model. Means that the value
            //in the model only changes if an event occurs for the corresponding
            //HTML element. Synchronization is performed at a low level. Means
            //that the fields are synchronized directly and without the use of
            //get and set methods.
            //For a better control a declarative validation is supported.
            //If the attribute 'validate' exists, the value for this is ignored,
            //the static method <Model>.validate(element, value) is  called in
            //the corresponding model. This call must return a true value as the
            //result, otherwise the element value is not stored into the
            //corresponding model field.
            //If an event occurs, synchronization is performed. After that will
            //be checked whether the render attribute exists. All selectors
            //listed here are then triggered for re-rendering. Re-rendering is
            //independent of synchronization and validation and is executed
            //immediately after an event occurs.
            var events = selector.fetchAttribute(Composite.ATTRIBUTE_EVENTS);
            var render = selector.fetchAttribute(Composite.ATTRIBUTE_RENDER);
            if (events) {
                events = events.split(/\s+/);
                events.forEach(function(event, index, array) {
                    selector.addEventListener(event, function(event) {
                        var target = event.currentTarget;
                        var serial = target.ordinal();
                        var object = Composite.render.meta[serial];
                        if (!target.nodeName.match(Composite.PATTERN_ELEMENT_IGNORE)
                                && Composite.ATTRIBUTE_VALUE in target
                                && typeof target[Composite.ATTRIBUTE_VALUE] !== "function") {
                            var model = Composite.mount.lookup(target);
                            if (model) {
                                var valid = false;
                                if (object.attributes.hasOwnProperty(Composite.ATTRIBUTE_VALIDATE)
                                        && typeof model.scope[Composite.ATTRIBUTE_VALIDATE] === "function") {
                                    valid = model.scope[Composite.ATTRIBUTE_VALIDATE].call(null, target, target.value) === true;
                                } else valid = true;
                                if (valid) {
                                    if (model.scope[model.field] instanceof Object)
                                        model.scope[model.field].value = target.value;
                                    else model.scope[model.field] = target.value
                                }
                            }
                        }
                        if (render) {
                            if (render.match(Composite.PATTERN_EXPRESSION_CONTAINS)) {
                                var context = serial + ":" + Composite.ATTRIBUTE_RENDER;
                                render = Expression.eval(context, render);
                            }
                            Composite.asynchron(Composite.render, false, render, lock);
                        }
                    });                    
                });
            }
            
            //The condition attribute is interpreted.
            //TODO: condition
            if (object.hasOwnProperty(Composite.ATTRIBUTE_CONDITION)) {
                if (!object.assent) {
                    var serial = object.condition.serial;
                    var object = Composite.render.meta[serial];
                    Composite.render(object, true, lock);
                    return;
                }
            }
            
            if (object.hasOwnProperty(Composite.ATTRIBUTE_ASSENT))
                object.assent = false;
            
            //The import attribute is interpreted.
            //This declation loads the content and replaces the inner HTML of an
            //element with the content. The attribute expects as value one
            //element or more elements as node list or array -- these are then
            //inserted directly and behave similar to the output-attribute, or
            //the value is considered as a remote resource with relative or
            //absolute URL and will be loaded via the HTTP method GET.
            //Loading and replacing the import function can be combined with the
            //condition attribute and is only executed when the condition is
            //true.
            //If the content can be loaded successfully, the import attribute is
            //removed. Recursive rendering is initiated via the MutationObserver.
            //TODO: condition + import
            if (object.attributes.hasOwnProperty(Composite.ATTRIBUTE_IMPORT)) {
                var value = (object.attributes[Composite.ATTRIBUTE_IMPORT] || "").trim();
                if (value.match(Composite.PATTERN_EXPRESSION_CONTAINS)) {
                    var context = serial + ":" + Composite.ATTRIBUTE_IMPORT;
                    value = Expression.eval(context, value);
                }
                if (value) {
                    if (!(value instanceof Element
                            || value instanceof NodeList)) {
                        (function(element, url) {
                            try {
                                var request = new XMLHttpRequest();
                                request.overrideMimeType("text/plain");
                                request.open("GET", url, true);
                                request.onreadystatechange = function() {
                                    if (request.readyState == 4) {
                                        if (request.status == "200") {
                                            element.innerHTML = request.responseText;
                                            var serial = element.ordinal();
                                            var object = Composite.render.meta[element];
                                            delete object.attributes[Composite.ATTRIBUTE_IMPORT];
                                            return;
                                        }
                                        function HttpRequestError(message) {
                                            this.name = "HttpRequestError";
                                            this.message = message;
                                            this.stack = (new Error()).stack;
                                        }
                                        HttpRequestError.prototype = new Error;
                                        throw new HttpRequestError("HTTP status " + request.status + " for " + url);
                                    }
                                };
                                request.send(null);  
                            } catch (error) {
                                Composite.fire(Composite.EVENT_AJAX_ERROR, error);
                                throw error;
                            }
                        })(selector, value);
                        return;                        
                    }
                    selector.appendChild(value, true);
                }
                delete object.attributes[Composite.ATTRIBUTE_IMPORT];
            } 
            
            //The output attribute is interpreted.
            //This declaration sets the value or result of an expression as the
            //content of an element. For an expression, the result can also be
            //an element or a node list with elements. All other data types are
            //set as text. This output is exclusive, thus overwriting any
            //existing content. The recursive rerendering is initiated via the
            //MutationObserver.
            if (object.attributes.hasOwnProperty(Composite.ATTRIBUTE_OUTPUT)) {
                var value = object.attributes[Composite.ATTRIBUTE_OUTPUT];
                if ((value || "").match(Composite.PATTERN_EXPRESSION_CONTAINS)) {
                    var context = serial + ":" + Composite.ATTRIBUTE_OUTPUT;
                    var value = Expression.eval(context, value);
                    if (value instanceof Element
                            || value instanceof NodeList)
                        selector.appendChild(value, true);
                    else selector.innerHTML = String(value);
                } else selector.innerHTML = value;
            }

            //The interval attribute is interpreted.
            //Interval rendering based on a window interval.
            //If an HTML element is declared as interval, its initial inner HTML
            //is used as a template. During the intervals, the inner HTML is
            //first emptied, the template is rendered individually with each
            //interval cycle, and the result is added to the inner HTML.
            //The interval attribute expects a value in milliseconds. An invalid
            //value cause a console output.
            //The interval starts automatically with the (re)rendering of the
            //declared HTML element and is terminated and removed when:
            //  - the element no longer exists in the DOM
            //  - the condition attribute is false
            //  - the element or a parent is no longer visible
            var interval = object.attributes[Composite.ATTRIBUTE_INTERVAL];
            if (interval
                    && !object.interval) {
                interval = String(interval).trim();
                var context = serial + ":" + Composite.ATTRIBUTE_INTERVAL;
                interval = String(Expression.eval(context, interval));
                if (interval.match(/^\d+$/)) {
                    interval = parseInt(interval);
                    object.interval = {
                        object: object,
                        selector: selector,
                        task: function(interval) {
                            var interrupt = !document.body.contains(interval.selector);
                            //TODO: condition
                            if (interval.selector.hasAttribute(Composite.ATTRIBUTE_CONDITION)
                                    && (interval.selector.getAttribute(Composite.ATTRIBUTE_CONDITION) || "").trim().toLowerCase() != "true")
                                interrupt = true;
                            for (var selector = interval.selector;
                                    !interrupt && selector;
                                    selector = selector.parentNode) {
                                if (selector.style
                                        && selector.style.display
                                        && selector.style.display.trim().toLowerCase() == "none")
                                    interrupt = true;
                                if (selector == document.body)
                                    break;
                            }
                            if (interrupt) {
                                window.clearInterval(interval.serial);
                                delete interval.object.interval                         
                            } else Composite.render(interval.selector);
                        }
                    };
                    object.interval.serial = window.setInterval(object.interval.task, interval, object.interval);
                } else if (interval)
                    console.error("Invalid interval: " + interval);
            }
            
            //The iterate attribute is interpreted.
            //Iterative rendering based on lists, enumeration and arrays.
            //If an HTML element is declared iteratively, its initial inner HTML
            //is used as a template. During iteration, the inner HTML is
            //initially emptied, the template is rendered individually with each
            //iteration cycle and the result is added to the inner HTML.
            //There are two particularities to consider.
            //  1. The internal recusive rendering must be done sequentially.
            //  2. The internal rendering creates temporary composite meta
            //     objects. These meta objects contain meta information in their
            //     attributes, which can be incorrectly interpreted during
            //     rescan after the iteration. Therefore, the temporarily
            //     created meta objects must be removed.
            //  3. A global variable is required for the iteration. If this
            //     variable already exists, the existing variable is saved and
            //     restored at the end of the iteration.
            //A variable with meta information is used within the iteration:
            //     e.g iterate={{tempA:Model.list}} -> tempA = {item, index, data}   
            if (object.attributes.hasOwnProperty(Composite.ATTRIBUTE_ITERATE)) {
                if (!object.iterate) {
                    var iterate = object.attributes[Composite.ATTRIBUTE_ITERATE];
                    var content = iterate.match(Composite.PATTERN_EXPRESSION_EXCLUSIVE);
                    content = content ? content[1].match(Composite.PATTERN_EXPRESSION_VARIABLE) : null;
                    if (content)
                        object.iterate = {name:content[1].trim(),
                            expression:"{{" + content[2].trim() + "}}",
                            markup:selector.innerHTML};
                    else console.error("Invalid iterate: " + iterate);
                }
                if (object.iterate) {
                    //The internal rendering creates temporary composite meta
                    //objects. These meta objects contain meta information in
                    //their attributes
                    var elements = Array.from(Composite.render.meta);
                    //A temporary global variable is required for the iteration.
                    //If this variable already exists, the existing method is
                    //cahced and restored at the end of the iteration.
                    var variable = window[object.iterate.name];
                    try {
                        var context = serial + ":" + Composite.ATTRIBUTE_ITERATE;
                        selector.innerHTML = "";
                        iterate = Expression.eval(context, object.iterate.expression);
                        if (iterate) {
                            iterate = Array.from(iterate);
                            iterate.forEach(function(item, index, array) {
                                var temp = document.createElement(object.element.nodeName);
                                window[object.iterate.name] = {item:item, index:index, data:array};
                                temp.innerHTML = object.iterate.markup;
                                Composite.render(temp, true, lock);
                                selector.appendChild(temp.childNodes);
                            });
                        }
                    } finally {
                        //If necessary, restore the temporary variable.
                        if (variable === undefined)
                            delete window[object.iterate.name];
                        else window[object.iterate.name] = variable;
                    }
                    //Removing temporary meta objects.
                    Composite.render.meta = elements;
                }
            }
            
            //The expression in the attributes is interpreted.
            //The expression is stored in a meta object and loaded from there,
            //the attributes of the element can be overwritten in a render cycle
            //and are available (conserved) for further cycles. A special case
            //is the text element. The result is output here as textContent.
            //Script and style elements are ignored.
            if (!selector.nodeName.match(Composite.PATTERN_ELEMENT_IGNORE)) {
                var attributes = Array.from(selector.attributes || new Array());
                attributes = attributes.map(entry => entry.name);
                attributes = attributes.concat(Array.from(object.attributes));
                if (Composite.ATTRIBUTE_VALUE in selector)
                    attributes.push(Composite.ATTRIBUTE_VALUE);
                attributes = attributes.filter(function(value, index, array) {
                    return array.indexOf(value) === index;
                });
                attributes.forEach(function(attribute, index, array) {
                    //Ignore all internal attributes
                    if (attribute.match(Composite.PATTERN_ATTRIBUTE_ACCEPT)
                            && !attribute.match(Composite.PATTERN_ATTRIBUTE_STATIC))
                        return;                    
                    var value = object.attributes[attribute] || "";
                    if (!value.match(Composite.PATTERN_EXPRESSION_CONTAINS))
                        return;
                    var context = serial + ":" + attribute;
                    value = Expression.eval(context, value);
                    value = String(value).encodeHtml();
                    value = value.replace(/"/g, "&quot;");
                    //Special case attribute value, here primarily the value of
                    //the property must be set, the value of the attribute is
                    //optional. Changing the value does not trigger an event, so
                    //no unwanted recursions occur.
                    if (attribute.toLowerCase() == Composite.ATTRIBUTE_VALUE
                            && Composite.ATTRIBUTE_VALUE in selector)
                        selector.value = value;
                    selector.setAttribute(attribute, value);
                });
            }

            //Embedded scripting brings some special effects.
            //The default scripting is automatically executed by the browser and
            //independent of rendering. Therefore, the scripting for rendering
            //has been adapted and a new script type have been introduced:
            //    composite/javascript
            //This script type use the normal JavaScript. Unlike type
            //text/javascript, the browser does not recognize them and does not
            //execute the JavaScript code automatically. Only the render
            //recognizes the JavaScript code and executes it in each render
            //cycle when the cycle includes the script element. In this way, the
            //execution of the script element can also be combined with the
            //attribute condition.
            //Embedded scripts must be 'ThreadSafe'.
            if (selector.nodeName.match(Composite.PATTERN_SCRIPT)) {
                var type = (selector.getAttribute(Composite.ATTRIBUTE_TYPE) || "").trim();
                if (type.match(Composite.PATTERN_COMPOSITE_SCRIPT)) {
                    try {eval(selector.textContent);
                    } catch (exception) {
                        console.error(exception);
                    }
                }
            }

            //Follow other element children recursively.
            //Elements of type: script + style and custom tags are ignored.
            if (selector.childNodes
                    && !selector.nodeName.match(Composite.PATTERN_ELEMENT_IGNORE)) {
                Array.from(selector.childNodes).forEach(function(node, index, array) {
                    var serial = node.ordinal();
                    var object = Composite.render.meta[serial];
                    //Ignore all elements with condition, this is the markup to
                    //the placeholders. However, only the placeholders are
                    //processed and controlled.
                    if (!(object && object.hasOwnProperty(Composite.ATTRIBUTE_CONDITION)))
                        Composite.asynchron(Composite.render, sequence, node, sequence, lock);
                });
            }

        } finally {
            if (Composite.render.ticks <= 0)
                Composite.fire(Composite.EVENT_RENDER_END, selector);
        }
    };

    //Register a listener when an error occurs and trigger a matching composite-event.
    window.addEventListener("error", function(event) {
        Composite.fire(Composite.EVENT_ERROR, event);
    });

    //With the start the complete body element is rendered.
    //Register the composite (re)scan with the end of the rendering.
    window.addEventListener("load", function(event) {
        //Queue with outstanding scans.
        Composite.scan.queue = Composite.scan.queue || new Array();
        Composite.listen(Composite.EVENT_RENDER_START, function(event, node) {
            Composite.scan.queue.push(node);
        });
        //At the end of each render cycle, scanning for elements to mount is started.
        Composite.listen(Composite.EVENT_RENDER_END, function(event, node) {
            var queue = new Array();
            while (Composite.scan.queue.length > 0)
                queue.push(Composite.scan.queue.shift());
            queue.forEach(function(entry, index, array) {
                Composite.asynchron(Composite.scan, false, entry);
            });
        });
        Composite.render(document.body);
    });
    
    //A MutationObserver is established to detect changes at the DOM and
    //triggers (re)rendering and (re)scanning. Unwanted recursions are possible,
    //but these are detected and prevented in the Composize.render method.
    window.addEventListener("load", function(event) {
        (new MutationObserver(function(mutations) {
            var stack = new Array();
            mutations.forEach(function(mutation) {
                if (mutation.addedNodes) {
                    mutation.addedNodes.forEach(function(node) {
                        //Duplicates should be prevented.
                        if (stack.indexOf(node) >= 0)
                            return;                
                        stack.push(node);
                        if (mutation.target instanceof Element) {
                            var serial = mutation.target.ordinal();
                            var object = Composite.render.meta[serial];
                            //Ignore all elements with condition, this is the
                            //markup to the placeholders. However, only the
                            //placeholders are processed and controlled.
                            if (object && object.hasOwnProperty(Composite.ATTRIBUTE_CONDITION)) {
                                object.assent = false;
                                return;
                            }
                        }
                        Composite.render(node);
                    });
                }
                if (mutation.removedNodes) {
                    mutation.removedNodes.forEach(function(node) {
                        //Duplicates should be prevented.
                        if (stack.indexOf(node) >= 0)
                            return;                
                        stack.push(node);
                        //TODO: Remove meta object
                        //      Stop intervals
                    });
                }
            }); 
        })).observe(document.body, {childList:true, subtree:true});
    });       
};

if (typeof Expression === "undefined") {    
    
    /**
     *  Expression / Expression Language (EL) is mechanism that simplifies the
     *  accessibility of the data stored in JavaScrript model component and other
     *  object on the client side. There are many operators that are used in EL
     *  like arithmetic and logical operators to perform an expression.
     */
    Expression = {};

    /** Constant for element type text */
    Expression.TYPE_TEXT = 1;
    
    /** Constant for element type expression */
    Expression.TYPE_EXPRESSION = 2;
    
    /** Constant for element type literal */
    Expression.TYPE_LITERAL = 3;
    
    /** Constant for element type script */
    Expression.TYPE_SCRIPT = 4;
    
    /** Constant for element type keyword */
    Expression.TYPE_KEYWORD = 5;
    
    /** Constant for element type other */
    Expression.TYPE_OTHER = 6;
    
    /** Constant for element type method */
    Expression.TYPE_METHOD = 7;
    
    /** Constant for element type value */
    Expression.TYPE_VALUE = 8;
    
    /** Constant for element type logic */
    Expression.TYPE_LOGIC = 9;
    
    /** Cache (expression / script) */
    Expression.cache;
    
    /**
     *  Resolves a value-expression recursively if necessary.
     *  Value expressions refer to a field in a static model.
     *  The value is retrieved using a corresponding get- or is-function or, if
     *  this is not available, the value is retrieved directly from the field.
     *  For the get- and is-functions, the first character is changed from field
     *  name to uppercase and prefixed with 'get' or 'is'.
     *      e.g. {{Model.value}} -> Model.getValue()
     *           {{Model.value}} -> Model.isValue()
     *  In addition to the namespace of JavaScript, the method also supports DOM
     *  elements. To do this, the variable in the expression must begin with #
     *  and there must be a corresponding element with a matching ID in the DOM.
     *      e.g. {{#Element}} -> document.querySelector(#Element)
     *           {{#Element.value}} -> document.querySelector(#Element).value
     *  @param  context    context or expression without context
     *  @param  expression expression in combination with a context
     *  @retrun the value of the expression, otherwise false
     */
    Expression.lookup = function(context, expression) {

        try {
            if (typeof context === "string"
                    && expression === undefined) {
                if (context.match(/^#[a-zA-Z]\w*$/))
                    return document.querySelector(context);
                if (context.match(/^(#[a-zA-Z]\w*)\.(.*)*$/)) {
                    expression = context.match(/^(#[a-zA-Z]\w*)\.(.*)*$/);
                    return Expression.lookup(document.querySelector(expression[1]), expression[2]);
                }
                if (context.indexOf(".") < 0)
                    return eval(context);
                expression = context.match(/^(.*?)\.(.*)$/);
                return Expression.lookup(eval(expression[1]), expression[2]);
            }
            
            if (expression.indexOf(".") < 0)
                expression = [null, expression];
            else expression = expression.match(/^(.*?)\.(.*)$/);
            var method = "get" + expression[1].capitalize();
            if (typeof context[method] !== "function")
                method = "is" + expression[1].capitalize();
            if (typeof context[method] === "function") {
                context = (context[method])();
                if (expression.length > 2)
                    return Expression.lookup(context, expression[2]);
                return context
            }
            
            context = (context[expression[1]]);
            if (expression.length > 2)
                return Expression.lookup(context, expression[2]);
            return context
            
        } catch (exception) {
            return undefined;
        }
    };
    
    /**
     *  Analyzes and finds the components of an expression and creates a
     *  JavaScript from them. Created scripts are stored in a cache and reused
     *  as needed.
     *  @param  expression
     *  @return the created JavaScript
     */
    Expression.parse = function(expression) {
    
        //Terms:
        //An expression is an array of words.
        //A word is an elementary phrase or a partial array with more words.
        
        //Structure:
        //The words are classified in several steps and separated according to
        //their characteristics.
        
        //  +-------------------------------------------------------------+
        //  |            words (entireness of the expression)             |            
        //  +--------+----------------------------------------------------+
        //  |  text  |                     expression                     |
        //  |        +-----------+----------------------------------------+
        //  |        |  literal  |                 script                 |
        //  |        |           +-----------+----------------------------+
        //  |        |           |  keyword  |           other            |
        //  |        |           |           +---------+----------+-------+
        //  |        |           |           |  value  |  method  | logic |
        //  +--------+-----------+-----------+---------+----------+-------+
        
        //Notes:
        //Line breaks we are interpreted as blanks. Therefore, all line breaks
        //are replaced by spaces. So the characters 0x0D and 0x0A can be used
        //later as internal separator and auxiliary marker.

        //Empty expressions are interpreted like an empty string.
        if (expression === null
                || expression === undefined)
            expression = "";
        else expression = expression.trim();
        if (expression === "")
            return "";
        
        var cascade = {words:[], text:[], expression:[], literal:[], script:[], keyword:[], other:[], value:[], method:[], logic:[]};
        
        //Step 1:
        //Separation of text and expression as words.
        //Expression is always in {{...}} included, everything else before/after
        //is text. Escaping of {{ and }} is not possible and is not supported.
        //Alternatively, an expression with literals can be used.
        //    e.g. {{"{" + "{"}} / {{"}" + "}"}}
        
        //Lines breaks are ignored, they are interpreted as spaces.
        //So the start and end of expressions can be marked with line breaks.
        //After that, text and expressions can be separated.
        expression = expression.replace(/(^[\r\n]+)|([\r\n]+$)/g, "");
        expression = expression.replace(/[\r\n]/g, " ");
        expression = expression.replace(/(\{\{)/g, "\n$1");
        expression = expression.replace(/(\}\})/g, "$1\n");
        
        //Without expression it is pure text.
        if (expression.indexOf("\n") < 0)
            return "\"" + expression + "\"";
        
        expression = expression.replace(/(^\n+)|(\n+$)/g, "");

        var collate = function(word) {
            if (word.type == Expression.TYPE_TEXT)
                cascade.text.push(word);
            else if (word.type == Expression.TYPE_EXPRESSION)
                cascade.expression.push(word);
            else if (word.type == Expression.TYPE_SCRIPT)
                cascade.script.push(word);
            else if (word.type == Expression.TYPE_LITERAL)
                cascade.literal.push(word);
            else if (word.type == Expression.TYPE_KEYWORD)
                cascade.keyword.push(word);
            else if (word.type == Expression.TYPE_OTHER)
                cascade.other.push(word);
            else if (word.type == Expression.TYPE_VALUE)
                cascade.value.push(word);
            else if (word.type == Expression.TYPE_METHOD)
                cascade.method.push(word);
            else if (word.type == Expression.TYPE_LOGIC)
                cascade.logic.push(word);
        };
        
        expression.split(/\n/).forEach(function(entry, index, array) {
            var object = {type:Expression.TYPE_TEXT, data:entry};
            if (entry.match(/^\{\{.*\}\}$/)) {
                object.data = object.data.substring(2, object.data.length -2);
                object.type = Expression.TYPE_EXPRESSION;
            } else object.data = "\"" + object.data.replace(/\\/, "\\\\").replace(/"/, "\\\"") + "\"";
            collate(object);
            cascade.words.push(object);
        });
        
        //Step 2:
        //Separation of expressions in literal and script as partial words.
        //The expression objects are retained but their value changes from text
        //to array with literal and script as partial words.

        cascade.expression.forEach(function(entry, index, array) {
            var text = entry.data;
            text = text.replace(/(^|[^\\])((?:\\{2})*\\[\'])/g, "$1\n$2\n");
            text = text.replace(/(^|[^\\])((?:\\{2})*\\[\"])/g, "$1\r$2\r");
            var words = new Array();
            var pattern = /(^.*?)(([\'\"]).*?(\3|$))/m;
            while (text.match(pattern)) {
                text = text.replace(pattern, function(match, script, literal) {
                    script = script.replace(/\n/g, "\'");
                    script = script.replace(/\r/g, "\"");
                    script = {type:Expression.TYPE_SCRIPT, data:script};
                    collate(script);
                    words.push(script);
                    literal = literal.replace(/\n/g, "\'");
                    literal = literal.replace(/\r/g, "\"");
                    literal = {type:Expression.TYPE_LITERAL, data:literal};
                    collate(literal);
                    words.push(literal);
                    return "";
                });
            }
            if (text.length > 0) {
                text = text.replace(/\n/g, "\'");
                text = text.replace(/\r/g, "\"");
                text = {type:Expression.TYPE_SCRIPT, data:text};
                collate(text);
                words.push(text);
            }
            entry.data = words;
        });
        
        //Step 3:
        //Converting reserved word (keywords) into operators. 
        //supported keywords a nd mapping:
        //    and &&        empty !         div /
        //    eq  ==        ge    >=        gt  >
        //    le  <=        lt    <         mod %
        //    ne  !=        not   !         or  ||
        //additional keywords without mapping:
        //    true, false, null, instanceof, typeof, undefined
        //Separation of script in keyword and other as partial words.
        //IMPORTANT: KEYWORDS ARE CASE-INSENSITIVE
        
        var keywords = new Array("and", "&&", "or", "||", "not", "!", "eq", "==",
                "ne", "!=", "lt", "<", "gt", ">", "le", "<=", "ge", ">=", "empty", "!",
                "div", "/", "mod", "%");
        cascade.script.forEach(function(entry, index, array) {
            var text = entry.data;
            for (var loop = 0; loop < keywords.length; loop += 2) {
                var pattern = new RegExp("(^|[^\\w\\.])(" + keywords[loop] + ")(?=[^\\w\\.]|$)", "ig");
                text = text.replace(pattern, "$1\n\r" + keywords[loop +1] + "\n");
            }
            text = text.replace(/(^|[^\w\.])(true|false|null|instanceof|typeof|undefined)(?=[^\w\.]|$)/ig, function(match, script, keyword) {
                return script + "\n\r" + keyword.toLowerCase() + "\n";
            });
            var words = new Array();
            text.split(/\n/).forEach(function(entry, index, array) {
                var object = {type:Expression.TYPE_OTHER, data:entry};
                if (entry.match(/^\r/)) {
                    object.data = entry.substring(1);
                    object.type = Expression.TYPE_KEYWORD;
                }
                collate(object);
                words.push(object);
            });
            entry.data = words;
        });
        
        //Step 4:
        //Detection of value- and method-expressions
        //    method expression: (^|[^\w\.])(#{0,1}[a-zA-Z](?:[\w\.]*[\w])*)(?=\()
        //The expression is followed by a round bracket.
        //    value expression: (^|[^\w\.])(#{0,1}[a-zA-Z](?:[\w\.]*[\w])*(?=(?:[^\w\(\.]|$)))
        //The expression is followed by a non-word character or the end.
        
        cascade.other.forEach(function(entry, index, array) {
            var text =  entry.data;
            text = text.replace(/(^|[^\w\.])(#{0,1}[a-zA-Z](?:[\w\.]*[\w])*(?=(?:[^\w\(\.]|$)))/g, "$1\n\r\r$2\n");
            text = text.replace(/(^|[^\w\.])(#{0,1}[a-zA-Z](?:[\w\.]*[\w])*)(?=\()/g, "$1\n\r$2\n");
            var words = new Array();
            text.split(/\n/).forEach(function(entry, index, array) {
                var object = {type:Expression.TYPE_LOGIC, data:entry};
                if (entry.match(/^\r\r/)) {
                    object.data = "Expression.lookup(\"" + entry.substring(2) + "\")";
                    object.type = Expression.TYPE_VALUE;
                } else if (entry.match(/^\r[^\r]/)) {
                    object.data = entry.substring(1);
                    if (object.data.match(/^#[a-zA-Z]/))
                        object.data = "Expression.lookup(\"" + object.data + "\")";
                    object.type = Expression.TYPE_METHOD;
                }
                collate(object);
                words.push(object);
            });
            entry.data = words;
        });
        
        //Step 5:
        //Create a flat sequence from the cascade.
        
        var words = new Array();
        var merge = function(word) {
            if (Array.isArray(word))
                word.forEach(function(entry, index, array) {
                    merge(entry);    
                });
            else if (Array.isArray(word.data))
                word.data.forEach(function(entry, index, array) {
                    merge(entry);    
                });            
            else if (typeof word.data === "string")
                if (word.data
                        && word.data.length)
                    words.push(word);
            else
                merge(word.data);
        };    
        merge(cascade.words);
        
        //Step 6:
        //Create a script from the word sequence.
        //The possible word types: text, literal, keyword, value, method, logic
        //Text and expression are always separated by brackets.
        //    e.g. text + (expression) + text + ...
        //The line break characters are misused for marking the transitions from
        //text to expression.
        
        var script = "";
        words.forEach(function(word, index, array) {
            if (word.type == Expression.TYPE_TEXT)
                script += "\n" + word.data + "\r";
            else if (word.type == Expression.TYPE_KEYWORD)
                script += " " + word.data + " ";
            else if (word.type == Expression.TYPE_LITERAL
                    || word.type == Expression.TYPE_VALUE
                    || word.type == Expression.TYPE_METHOD
                    || word.type == Expression.TYPE_LOGIC)
                script += word.data;
        });
        script = script.replace(/(^\n)|(\r$)/g, "");
        if (script.match(/\r[^\n]*$/))
            script += ")";
        if (script.match(/^[^\r]*\n/))
            script = "(" + script; 
        script = script.replace(/(\n\r)+/g, " + ");
        script = script.replace(/\r/g, " + (");
        script = script.replace(/\n/g, ") + ");
        script = script.replace(/(^\s*\+\s*)|(\s*\+\s*$)/, "");
        
        return script;
    };
    
    /**
     *  Interprets the passed expression.
     *  In case of an error, the error is returned and no exception is thrown.
     *  A serial can be specified optionally. The serial is an alias for caching
     *  compiled expressions. Without, the expressions are always compiled. 
     *  The function uses variable parameters and has the following signatures:
     *      function(expression) 
     *      function(serial, expression)
     *  @param  serial
     *  @param  expression
     *  @return the return value of the interpreted expression or an error if a
     *          error or exception has occurred
     */
    Expression.eval = function(variants) {
        
        Expression.cache = Expression.cache || new Array();
        
        var expression = null;
        if (arguments.length > 1)
            expression = arguments[1];
        else if (arguments.length > 0)
            expression = arguments[0];

        var serial = null;
        if (arguments.length > 1)
            serial = arguments[0];
        
        var script = null;
        script = serial ? Expression.cache[serial] || null : null;
        if (!script)
            script = Expression.parse(expression);
        Expression.cache[serial] = script;
        
        try {return eval(script);
        } catch (exception) {
            exception.message += "\n\t" + script;
            console.error(exception);
            return exception.message;
        }
    };
};
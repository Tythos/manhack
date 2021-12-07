/**
 * 
 */

window.state = {
    "meta": {},
    "endpoints": [],
    "endpoint_ndx": null
};

function q(selector) {
    return window.document.querySelector(selector);
}

function qi(selector) {
    return Array.from(window.document.querySelectorAll(selector));
}

function c(tag) {
    return window.document.createElement(tag);
}

function t(obj, isHeaderHidden=false) {
    let table = c("table");

    // define header
    if (!isHeaderHidden) {
        let thead = c("thead");
        let tr = c("tr");
        {
            let th = c("th");
            th.textContent = "Key";
            tr.appendChild(th);
        } {
            let th = c("th");
            th.textContent = "Value";
            tr.appendChild(th);
        }
        thead.appendChild(tr);
        table.appendChild(thead);
    }

    // populate body
    let tbody = c("tbody");
    let keys = Object.keys(obj);
    keys.forEach(function(key) {
        let tr = c("tr");
        {
            let td = c("td");
            td.textContent = key;
            tr.appendChild(td);
        } {
            let td = c("td");
            td.textContent = obj[key];
            tr.appendChild(td);
        }
        tbody.appendChild(tr);
    });
    table.appendChild(tbody);
    return table;
}

function onMetaLoaded(meta) {
    state.meta = meta;
    let header = q(".Header");
    header.innerHTML = `
        <h1>${meta["title"]}</h1>
        <h2>Version ${meta["version"]}</h2>
        <div>${meta["description"]}</div>
    `;
}

function onEndpointsLoaded(endpoints) {
    state.endpoints = endpoints["endpoints"];
    let nav = q(".Nav");
    let ul = c("ul");
    endpoints["endpoints"].forEach(function (endpoint) {
        let li = c("li");
        li.textContent = endpoint["route"];
        li.addEventListener("click", onEndpointClick);
        ul.appendChild(li);
    });
    nav.appendChild(ul);
}

function objPop(obj, key) {
    let val = obj[key];
    delete obj[key];
    return val;
}

function renderMethod(method, docstring) {
    let wrap = c("div");
    wrap.classList.add("MethodWrapper");
    wrap.classList.add(`Method${method}`);

    // add inner "METHOD" button
    let btn = c("div");
    btn.classList.add("MethodButton");
    btn.textContent = method;
    wrap.appendChild(btn);

    // add inner route string
    let route = c("div");
    route.classList.add("MethodRoute");
    route.textContent = state["endpoints"][state["endpoint_ndx"]]["route"];
    wrap.appendChild(route);

    // add optional (expanded) full docstring
    let doc = c("div");
    doc.classList.add("MethodDocstring");
    doc.textContent = docstring;
    wrap.appendChild(doc);

    // add event listeners to populate Request inputs
    wrap.addEventListener("click", onMethodClick);
    return wrap;
}

/**
 * When a given MethodWrapper is clicked, two possible actions are taken:
 * * If it is not expanded already, it is expanded and all other MethodWrapper instances are closed
 * * If it is already expanded, it is closed
 * 
 * @param {Object} event - Event object from on-click DOM event
 */
function onMethodClick(event) {
    let mw = event.target;
    while (!mw.classList.contains("MethodWrapper")) {
        mw = mw.parentElement;
    }

    let isExpanding = !mw.classList.contains("MethodExpanded");
    if (isExpanding) {
        let Listing = mw.parentElement;
        let mwi = Listing.querySelectorAll(".MethodWrapper");
        Array.from(mwi).forEach(function(m) {
            if (m == mw) {
                m.classList.add("MethodExpanded");
            } else {
                m.classList.remove("MethodExpanded");
            }
        });

        // expanding also means we auto-populate the Request/Response fields
        let method = mw.querySelector(".MethodButton").textContent;
        setRequest(method, state["endpoints"][state["endpoint_ndx"]]["route"]);
    } else {
        mw.classList.remove("MethodExpanded");
    }
}

function setRequest(method, route) {
    // eventually we'll also want to populate arguments
    let table = q(".Request").querySelector("table");
    table.querySelector(".RequestMethod").querySelector(".Col2").textContent = method;
    table.querySelector(".RequestURL").querySelector(".Col2").textContent = route;
}

function onEndpointLoaded(endpoint) {
    let listing = q(".Listing");
    let details = Object.assign(endpoint, state["endpoints"][state["endpoint_ndx"]]);
    let h3 = c("h3");
    let h4 = c("h4");
    let methods = objPop(details, "methods");
    h3.textContent = objPop(details, "route");
    h4.textContent = objPop(details, "docstring");
    listing.innerHTML = "";
    listing.appendChild(h3);
    listing.appendChild(h4);
    listing.appendChild(t(details, true));

    // render each method; may need callback for more endpoint/method specifics (e.g., individual docstrings when MethodView is used)
    methods.sort();
    methods.forEach(function(method) {
        listing.appendChild(renderMethod(method, h4.textContent));
    });
}

function onEndpointClick(event) {
    let li = event.target;
    let route = li.textContent;
    let routes = state["endpoints"].map(function (endpoint) { return endpoint["route"]; });
    let ndx = routes.indexOf(route);
    let handler = state["endpoints"][ndx]["handler"];
    state["endpoint_ndx"] = ndx;
    fetch(`/doc/endpoint/${handler}`).then(response => response.json()).then(onEndpointLoaded);
    let lii = li.parentElement.querySelectorAll("li");
    Array.from(lii).forEach(function(li, i) {
        if (i == ndx) {
            if (!li.classList.contains("Current")) {
                li.classList.add("Current");
            }
        } else {
            if (li.classList.contains("Current")) {
                li.classList.remove("Current");
            }
        }
    });
}

function onWindowLoad(event) {
    fetch("/doc/meta").then(response => response.json()).then(onMetaLoaded);
    fetch("/doc/endpoints").then(response => response.json()).then(onEndpointsLoaded);
}

window.addEventListener("load", onWindowLoad);
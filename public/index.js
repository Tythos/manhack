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

function t(obj) {
    let table = c("table");

    // define header
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

function onEndpointLoaded(endpoint) {
    let body = q(".Body");
    let details = Object.assign(endpoint, state["endpoints"][state["endpoint_ndx"]]);
    body.innerHTML = "";
    body.appendChild(t(details));
    console.log(details);
}

function onEndpointClick(event) {
    let li = event.target;
    let route = li.textContent;
    let routes = state["endpoints"].map(function (endpoint) { return endpoint["route"]; });
    let ndx = routes.indexOf(route);
    let handler = state["endpoints"][ndx]["handler"];
    state["endpoint_ndx"] = ndx;
    fetch(`/api/v1/endpoint/${handler}`).then(response => response.json()).then(onEndpointLoaded);
}

function onWindowLoad(event) {
    fetch("/api/v1/meta").then(response => response.json()).then(onMetaLoaded);
    fetch("/api/v1/endpoints").then(response => response.json()).then(onEndpointsLoaded);
}

window.addEventListener("load", onWindowLoad);
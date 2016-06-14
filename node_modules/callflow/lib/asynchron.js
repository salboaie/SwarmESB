
if(typeof singleton_callflow_module_workaround_for_wired_node_js_caching == 'undefined') {
    singleton_callflow_module_workaround_for_wired_node_js_caching  = module;
} else {
    module.exports = singleton_callflow_module_workaround_for_wired_node_js_caching .exports;
    return;
}

exports.createFlow = require("./flow.js").create;
exports.create = exports.createFlow;
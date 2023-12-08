let wasm;

const heap = new Array(128).fill(undefined);

heap.push(undefined, null, true, false);

function getObject(idx) { return heap[idx]; }

let heap_next = heap.length;

function dropObject(idx) {
    if (idx < 132) return;
    heap[idx] = heap_next;
    heap_next = idx;
}

function takeObject(idx) {
    const ret = getObject(idx);
    dropObject(idx);
    return ret;
}

function isLikeNone(x) {
    return x === undefined || x === null;
}

let cachedFloat64Memory0 = null;

function getFloat64Memory0() {
    if (cachedFloat64Memory0 === null || cachedFloat64Memory0.byteLength === 0) {
        cachedFloat64Memory0 = new Float64Array(wasm.memory.buffer);
    }
    return cachedFloat64Memory0;
}

let cachedInt32Memory0 = null;

function getInt32Memory0() {
    if (cachedInt32Memory0 === null || cachedInt32Memory0.byteLength === 0) {
        cachedInt32Memory0 = new Int32Array(wasm.memory.buffer);
    }
    return cachedInt32Memory0;
}

function addHeapObject(obj) {
    if (heap_next === heap.length) heap.push(heap.length + 1);
    const idx = heap_next;
    heap_next = heap[idx];

    heap[idx] = obj;
    return idx;
}

const cachedTextDecoder = (typeof TextDecoder !== 'undefined' ? new TextDecoder('utf-8', { ignoreBOM: true, fatal: true }) : { decode: () => { throw Error('TextDecoder not available') } } );

if (typeof TextDecoder !== 'undefined') { cachedTextDecoder.decode(); };

let cachedUint8Memory0 = null;

function getUint8Memory0() {
    if (cachedUint8Memory0 === null || cachedUint8Memory0.byteLength === 0) {
        cachedUint8Memory0 = new Uint8Array(wasm.memory.buffer);
    }
    return cachedUint8Memory0;
}

function getStringFromWasm0(ptr, len) {
    ptr = ptr >>> 0;
    return cachedTextDecoder.decode(getUint8Memory0().subarray(ptr, ptr + len));
}

let WASM_VECTOR_LEN = 0;

const cachedTextEncoder = (typeof TextEncoder !== 'undefined' ? new TextEncoder('utf-8') : { encode: () => { throw Error('TextEncoder not available') } } );

const encodeString = (typeof cachedTextEncoder.encodeInto === 'function'
    ? function (arg, view) {
    return cachedTextEncoder.encodeInto(arg, view);
}
    : function (arg, view) {
    const buf = cachedTextEncoder.encode(arg);
    view.set(buf);
    return {
        read: arg.length,
        written: buf.length
    };
});

function passStringToWasm0(arg, malloc, realloc) {

    if (realloc === undefined) {
        const buf = cachedTextEncoder.encode(arg);
        const ptr = malloc(buf.length) >>> 0;
        getUint8Memory0().subarray(ptr, ptr + buf.length).set(buf);
        WASM_VECTOR_LEN = buf.length;
        return ptr;
    }

    let len = arg.length;
    let ptr = malloc(len) >>> 0;

    const mem = getUint8Memory0();

    let offset = 0;

    for (; offset < len; offset++) {
        const code = arg.charCodeAt(offset);
        if (code > 0x7F) break;
        mem[ptr + offset] = code;
    }

    if (offset !== len) {
        if (offset !== 0) {
            arg = arg.slice(offset);
        }
        ptr = realloc(ptr, len, len = offset + arg.length * 3) >>> 0;
        const view = getUint8Memory0().subarray(ptr + offset, ptr + len);
        const ret = encodeString(arg, view);

        offset += ret.written;
    }

    WASM_VECTOR_LEN = offset;
    return ptr;
}

function debugString(val) {
    // primitive types
    const type = typeof val;
    if (type == 'number' || type == 'boolean' || val == null) {
        return  `${val}`;
    }
    if (type == 'string') {
        return `"${val}"`;
    }
    if (type == 'symbol') {
        const description = val.description;
        if (description == null) {
            return 'Symbol';
        } else {
            return `Symbol(${description})`;
        }
    }
    if (type == 'function') {
        const name = val.name;
        if (typeof name == 'string' && name.length > 0) {
            return `Function(${name})`;
        } else {
            return 'Function';
        }
    }
    // objects
    if (Array.isArray(val)) {
        const length = val.length;
        let debug = '[';
        if (length > 0) {
            debug += debugString(val[0]);
        }
        for(let i = 1; i < length; i++) {
            debug += ', ' + debugString(val[i]);
        }
        debug += ']';
        return debug;
    }
    // Test for built-in
    const builtInMatches = /\[object ([^\]]+)\]/.exec(toString.call(val));
    let className;
    if (builtInMatches.length > 1) {
        className = builtInMatches[1];
    } else {
        // Failed to match the standard '[object ClassName]'
        return toString.call(val);
    }
    if (className == 'Object') {
        // we're a user defined class or Object
        // JSON.stringify avoids problems with cycles, and is generally much
        // easier than looping through ownProperties of `val`.
        try {
            return 'Object(' + JSON.stringify(val) + ')';
        } catch (_) {
            return 'Object';
        }
    }
    // errors
    if (val instanceof Error) {
        return `${val.name}: ${val.message}\n${val.stack}`;
    }
    // TODO we could test for more things here, like `Set`s and `Map`s.
    return className;
}

function makeMutClosure(arg0, arg1, dtor, f) {
    const state = { a: arg0, b: arg1, cnt: 1, dtor };
    const real = (...args) => {
        // First up with a closure we increment the internal reference
        // count. This ensures that the Rust closure environment won't
        // be deallocated while we're invoking it.
        state.cnt++;
        const a = state.a;
        state.a = 0;
        try {
            return f(a, state.b, ...args);
        } finally {
            if (--state.cnt === 0) {
                wasm.__wbindgen_export_2.get(state.dtor)(a, state.b);

            } else {
                state.a = a;
            }
        }
    };
    real.original = state;

    return real;
}
function __wbg_adapter_38(arg0, arg1, arg2) {
    wasm._dyn_core__ops__function__FnMut__A____Output___R_as_wasm_bindgen__closure__WasmClosure___describe__invoke__h3fc0f88e29c0c85d(arg0, arg1, addHeapObject(arg2));
}

function __wbg_adapter_41(arg0, arg1) {
    wasm._dyn_core__ops__function__FnMut_____Output___R_as_wasm_bindgen__closure__WasmClosure___describe__invoke__hf96a242ba346d3a9(arg0, arg1);
}

function makeClosure(arg0, arg1, dtor, f) {
    const state = { a: arg0, b: arg1, cnt: 1, dtor };
    const real = (...args) => {
        // First up with a closure we increment the internal reference
        // count. This ensures that the Rust closure environment won't
        // be deallocated while we're invoking it.
        state.cnt++;
        try {
            return f(state.a, state.b, ...args);
        } finally {
            if (--state.cnt === 0) {
                wasm.__wbindgen_export_2.get(state.dtor)(state.a, state.b);
                state.a = 0;

            }
        }
    };
    real.original = state;

    return real;
}
function __wbg_adapter_48(arg0, arg1, arg2) {
    wasm._dyn_core__ops__function__Fn__A____Output___R_as_wasm_bindgen__closure__WasmClosure___describe__invoke__h29e091130c8fd505(arg0, arg1, addHeapObject(arg2));
}

function __wbg_adapter_51(arg0, arg1) {
    wasm._dyn_core__ops__function__FnMut_____Output___R_as_wasm_bindgen__closure__WasmClosure___describe__invoke__hae5e7ce8c900c1d7(arg0, arg1);
}

function __wbg_adapter_54(arg0, arg1, arg2) {
    wasm._dyn_core__ops__function__FnMut__A____Output___R_as_wasm_bindgen__closure__WasmClosure___describe__invoke__h38b504e43fef04d3(arg0, arg1, addHeapObject(arg2));
}

function __wbg_adapter_57(arg0, arg1, arg2) {
    wasm.wasm_bindgen__convert__closures__invoke1_mut__h37208348c84c4070(arg0, arg1, addHeapObject(arg2));
}

function __wbg_adapter_60(arg0, arg1, arg2) {
    wasm._dyn_core__ops__function__FnMut__A____Output___R_as_wasm_bindgen__closure__WasmClosure___describe__invoke__h1744fe23ff5701f4(arg0, arg1, addHeapObject(arg2));
}

function __wbg_adapter_75(arg0, arg1) {
    wasm._dyn_core__ops__function__FnMut_____Output___R_as_wasm_bindgen__closure__WasmClosure___describe__invoke__h9b99e6c9dc51728e(arg0, arg1);
}

function __wbg_adapter_78(arg0, arg1, arg2) {
    wasm.wasm_bindgen__convert__closures__invoke1_mut__h9ed89a9058f71f78(arg0, arg1, addHeapObject(arg2));
}

function __wbg_adapter_81(arg0, arg1, arg2) {
    wasm._dyn_core__ops__function__FnMut__A____Output___R_as_wasm_bindgen__closure__WasmClosure___describe__invoke__hf21f019400821aad(arg0, arg1, addHeapObject(arg2));
}

function getCachedStringFromWasm0(ptr, len) {
    if (ptr === 0) {
        return getObject(len);
    } else {
        return getStringFromWasm0(ptr, len);
    }
}

function handleError(f, args) {
    try {
        return f.apply(this, args);
    } catch (e) {
        wasm.__wbindgen_exn_store(addHeapObject(e));
    }
}

let cachedFloat32Memory0 = null;

function getFloat32Memory0() {
    if (cachedFloat32Memory0 === null || cachedFloat32Memory0.byteLength === 0) {
        cachedFloat32Memory0 = new Float32Array(wasm.memory.buffer);
    }
    return cachedFloat32Memory0;
}

function getArrayF32FromWasm0(ptr, len) {
    ptr = ptr >>> 0;
    return getFloat32Memory0().subarray(ptr / 4, ptr / 4 + len);
}

function getArrayI32FromWasm0(ptr, len) {
    ptr = ptr >>> 0;
    return getInt32Memory0().subarray(ptr / 4, ptr / 4 + len);
}

let cachedUint32Memory0 = null;

function getUint32Memory0() {
    if (cachedUint32Memory0 === null || cachedUint32Memory0.byteLength === 0) {
        cachedUint32Memory0 = new Uint32Array(wasm.memory.buffer);
    }
    return cachedUint32Memory0;
}

function getArrayU32FromWasm0(ptr, len) {
    ptr = ptr >>> 0;
    return getUint32Memory0().subarray(ptr / 4, ptr / 4 + len);
}

async function __wbg_load(module, imports) {
    if (typeof Response === 'function' && module instanceof Response) {
        if (typeof WebAssembly.instantiateStreaming === 'function') {
            try {
                return await WebAssembly.instantiateStreaming(module, imports);

            } catch (e) {
                if (module.headers.get('Content-Type') != 'application/wasm') {
                    console.warn("`WebAssembly.instantiateStreaming` failed because your server does not serve wasm with `application/wasm` MIME type. Falling back to `WebAssembly.instantiate` which is slower. Original error:\n", e);

                } else {
                    throw e;
                }
            }
        }

        const bytes = await module.arrayBuffer();
        return await WebAssembly.instantiate(bytes, imports);

    } else {
        const instance = await WebAssembly.instantiate(module, imports);

        if (instance instanceof WebAssembly.Instance) {
            return { instance, module };

        } else {
            return instance;
        }
    }
}

function __wbg_get_imports() {
    const imports = {};
    imports.wbg = {};
    imports.wbg.__wbindgen_object_drop_ref = function(arg0) {
        takeObject(arg0);
    };
    imports.wbg.__wbindgen_number_get = function(arg0, arg1) {
        const obj = getObject(arg1);
        const ret = typeof(obj) === 'number' ? obj : undefined;
        getFloat64Memory0()[arg0 / 8 + 1] = isLikeNone(ret) ? 0 : ret;
        getInt32Memory0()[arg0 / 4 + 0] = !isLikeNone(ret);
    };
    imports.wbg.__wbindgen_object_clone_ref = function(arg0) {
        const ret = getObject(arg0);
        return addHeapObject(ret);
    };
    imports.wbg.__wbindgen_cb_drop = function(arg0) {
        const obj = takeObject(arg0).original;
        if (obj.cnt-- == 1) {
            obj.a = 0;
            return true;
        }
        const ret = false;
        return ret;
    };
    imports.wbg.__wbindgen_string_new = function(arg0, arg1) {
        const ret = getStringFromWasm0(arg0, arg1);
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_new_abda76e883ba8a5f = function() {
        const ret = new Error();
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_stack_658279fe44541cf6 = function(arg0, arg1) {
        const ret = getObject(arg1).stack;
        const ptr1 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len1 = WASM_VECTOR_LEN;
        getInt32Memory0()[arg0 / 4 + 1] = len1;
        getInt32Memory0()[arg0 / 4 + 0] = ptr1;
    };
    imports.wbg.__wbg_error_f851667af71bcfc6 = function(arg0, arg1) {
        var v0 = getCachedStringFromWasm0(arg0, arg1);
    if (arg0 !== 0) { wasm.__wbindgen_free(arg0, arg1); }
    console.error(v0);
};
imports.wbg.__wbindgen_number_new = function(arg0) {
    const ret = arg0;
    return addHeapObject(ret);
};
imports.wbg.__wbg_crypto_c48a774b022d20ac = function(arg0) {
    const ret = getObject(arg0).crypto;
    return addHeapObject(ret);
};
imports.wbg.__wbindgen_is_object = function(arg0) {
    const val = getObject(arg0);
    const ret = typeof(val) === 'object' && val !== null;
    return ret;
};
imports.wbg.__wbg_process_298734cf255a885d = function(arg0) {
    const ret = getObject(arg0).process;
    return addHeapObject(ret);
};
imports.wbg.__wbg_versions_e2e78e134e3e5d01 = function(arg0) {
    const ret = getObject(arg0).versions;
    return addHeapObject(ret);
};
imports.wbg.__wbg_node_1cd7a5d853dbea79 = function(arg0) {
    const ret = getObject(arg0).node;
    return addHeapObject(ret);
};
imports.wbg.__wbindgen_is_string = function(arg0) {
    const ret = typeof(getObject(arg0)) === 'string';
    return ret;
};
imports.wbg.__wbg_msCrypto_bcb970640f50a1e8 = function(arg0) {
    const ret = getObject(arg0).msCrypto;
    return addHeapObject(ret);
};
imports.wbg.__wbg_require_8f08ceecec0f4fee = function() { return handleError(function () {
    const ret = module.require;
    return addHeapObject(ret);
}, arguments) };
imports.wbg.__wbindgen_is_function = function(arg0) {
    const ret = typeof(getObject(arg0)) === 'function';
    return ret;
};
imports.wbg.__wbg_getRandomValues_37fa2ca9e4e07fab = function() { return handleError(function (arg0, arg1) {
    getObject(arg0).getRandomValues(getObject(arg1));
}, arguments) };
imports.wbg.__wbg_randomFillSync_dc1e9a60c158336d = function() { return handleError(function (arg0, arg1) {
    getObject(arg0).randomFillSync(takeObject(arg1));
}, arguments) };
imports.wbg.__wbindgen_is_undefined = function(arg0) {
    const ret = getObject(arg0) === undefined;
    return ret;
};
imports.wbg.__wbindgen_is_null = function(arg0) {
    const ret = getObject(arg0) === null;
    return ret;
};
imports.wbg.__wbindgen_is_falsy = function(arg0) {
    const ret = !getObject(arg0);
    return ret;
};
imports.wbg.__wbindgen_jsval_eq = function(arg0, arg1) {
    const ret = getObject(arg0) === getObject(arg1);
    return ret;
};
imports.wbg.__wbg_set_841ac57cff3d672b = function(arg0, arg1, arg2) {
    getObject(arg0)[takeObject(arg1)] = takeObject(arg2);
};
imports.wbg.__wbg_fetch_56a6919da5e4c21c = function(arg0) {
    const ret = fetch(getObject(arg0));
    return addHeapObject(ret);
};
imports.wbg.__wbindgen_string_get = function(arg0, arg1) {
    const obj = getObject(arg1);
    const ret = typeof(obj) === 'string' ? obj : undefined;
    var ptr1 = isLikeNone(ret) ? 0 : passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    var len1 = WASM_VECTOR_LEN;
    getInt32Memory0()[arg0 / 4 + 1] = len1;
    getInt32Memory0()[arg0 / 4 + 0] = ptr1;
};
imports.wbg.__wbindgen_boolean_get = function(arg0) {
    const v = getObject(arg0);
    const ret = typeof(v) === 'boolean' ? (v ? 1 : 0) : 2;
    return ret;
};
imports.wbg.__wbg_instanceof_WebGl2RenderingContext_13a2fd72e6509891 = function(arg0) {
    let result;
    try {
        result = getObject(arg0) instanceof WebGL2RenderingContext;
    } catch {
        result = false;
    }
    const ret = result;
    return ret;
};
imports.wbg.__wbg_bindVertexArray_e2c4ca703e8438da = function(arg0, arg1) {
    getObject(arg0).bindVertexArray(getObject(arg1));
};
imports.wbg.__wbg_bufferData_041b82c3bb66a1e1 = function(arg0, arg1, arg2, arg3) {
    getObject(arg0).bufferData(arg1 >>> 0, getObject(arg2), arg3 >>> 0);
};
imports.wbg.__wbg_createVertexArray_45beaa3615966663 = function(arg0) {
    const ret = getObject(arg0).createVertexArray();
    return isLikeNone(ret) ? 0 : addHeapObject(ret);
};
imports.wbg.__wbg_drawArraysInstanced_0a7af372a6ef2a77 = function(arg0, arg1, arg2, arg3, arg4) {
    getObject(arg0).drawArraysInstanced(arg1 >>> 0, arg2, arg3, arg4);
};
imports.wbg.__wbg_drawBuffers_f49105889339b34d = function(arg0, arg1) {
    getObject(arg0).drawBuffers(getObject(arg1));
};
imports.wbg.__wbg_framebufferTextureLayer_75cfc8b8a8a5b91c = function(arg0, arg1, arg2, arg3, arg4, arg5) {
    getObject(arg0).framebufferTextureLayer(arg1 >>> 0, arg2 >>> 0, getObject(arg3), arg4, arg5);
};
imports.wbg.__wbg_texStorage2D_00339ecdf65e4414 = function(arg0, arg1, arg2, arg3, arg4, arg5) {
    getObject(arg0).texStorage2D(arg1 >>> 0, arg2, arg3 >>> 0, arg4, arg5);
};
imports.wbg.__wbg_texStorage3D_48106e548ccee4c2 = function(arg0, arg1, arg2, arg3, arg4, arg5, arg6) {
    getObject(arg0).texStorage3D(arg1 >>> 0, arg2, arg3 >>> 0, arg4, arg5, arg6);
};
imports.wbg.__wbg_texSubImage2D_89223ea8cc4b1dbd = function() { return handleError(function (arg0, arg1, arg2, arg3, arg4, arg5, arg6, arg7, arg8, arg9) {
    getObject(arg0).texSubImage2D(arg1 >>> 0, arg2, arg3, arg4, arg5, arg6, arg7 >>> 0, arg8 >>> 0, getObject(arg9));
}, arguments) };
imports.wbg.__wbg_texSubImage2D_1db53138fdc3c055 = function() { return handleError(function (arg0, arg1, arg2, arg3, arg4, arg5, arg6, arg7, arg8, arg9) {
    getObject(arg0).texSubImage2D(arg1 >>> 0, arg2, arg3, arg4, arg5, arg6, arg7 >>> 0, arg8 >>> 0, arg9);
}, arguments) };
imports.wbg.__wbg_uniform1fv_3e849de9167ef8a0 = function(arg0, arg1, arg2, arg3) {
    getObject(arg0).uniform1fv(getObject(arg1), getArrayF32FromWasm0(arg2, arg3));
};
imports.wbg.__wbg_uniform1iv_fed93a5c4f5e4689 = function(arg0, arg1, arg2, arg3) {
    getObject(arg0).uniform1iv(getObject(arg1), getArrayI32FromWasm0(arg2, arg3));
};
imports.wbg.__wbg_uniform1uiv_e2fc078746c2be9b = function(arg0, arg1, arg2, arg3) {
    getObject(arg0).uniform1uiv(getObject(arg1), getArrayU32FromWasm0(arg2, arg3));
};
imports.wbg.__wbg_uniform3fv_8249e6334d9a6e6a = function(arg0, arg1, arg2, arg3) {
    getObject(arg0).uniform3fv(getObject(arg1), getArrayF32FromWasm0(arg2, arg3));
};
imports.wbg.__wbg_uniform4fv_9a8c4aa1306b42e6 = function(arg0, arg1, arg2, arg3) {
    getObject(arg0).uniform4fv(getObject(arg1), getArrayF32FromWasm0(arg2, arg3));
};
imports.wbg.__wbg_uniformMatrix3fv_c434b20d0bdfad5c = function(arg0, arg1, arg2, arg3, arg4) {
    getObject(arg0).uniformMatrix3fv(getObject(arg1), arg2 !== 0, getArrayF32FromWasm0(arg3, arg4));
};
imports.wbg.__wbg_uniformMatrix4fv_d2d25d87034b45a4 = function(arg0, arg1, arg2, arg3, arg4) {
    getObject(arg0).uniformMatrix4fv(getObject(arg1), arg2 !== 0, getArrayF32FromWasm0(arg3, arg4));
};
imports.wbg.__wbg_vertexAttribDivisor_31f3a570da280acc = function(arg0, arg1, arg2) {
    getObject(arg0).vertexAttribDivisor(arg1 >>> 0, arg2 >>> 0);
};
imports.wbg.__wbg_vertexAttribIPointer_f24f2bdd6b4fcda8 = function(arg0, arg1, arg2, arg3, arg4, arg5) {
    getObject(arg0).vertexAttribIPointer(arg1 >>> 0, arg2, arg3 >>> 0, arg4, arg5);
};
imports.wbg.__wbg_activeTexture_c9ff3267431e9844 = function(arg0, arg1) {
    getObject(arg0).activeTexture(arg1 >>> 0);
};
imports.wbg.__wbg_attachShader_856ad5064a7babed = function(arg0, arg1, arg2) {
    getObject(arg0).attachShader(getObject(arg1), getObject(arg2));
};
imports.wbg.__wbg_bindBuffer_1742b5eb64ebc6b5 = function(arg0, arg1, arg2) {
    getObject(arg0).bindBuffer(arg1 >>> 0, getObject(arg2));
};
imports.wbg.__wbg_bindFramebuffer_4619be0e1995055b = function(arg0, arg1, arg2) {
    getObject(arg0).bindFramebuffer(arg1 >>> 0, getObject(arg2));
};
imports.wbg.__wbg_bindTexture_54a3690bbe49cdeb = function(arg0, arg1, arg2) {
    getObject(arg0).bindTexture(arg1 >>> 0, getObject(arg2));
};
imports.wbg.__wbg_blendEquationSeparate_ec228d5e7f486801 = function(arg0, arg1, arg2) {
    getObject(arg0).blendEquationSeparate(arg1 >>> 0, arg2 >>> 0);
};
imports.wbg.__wbg_blendFuncSeparate_a52bfda514294104 = function(arg0, arg1, arg2, arg3, arg4) {
    getObject(arg0).blendFuncSeparate(arg1 >>> 0, arg2 >>> 0, arg3 >>> 0, arg4 >>> 0);
};
imports.wbg.__wbg_clear_bfe5cc64f66b3b94 = function(arg0, arg1) {
    getObject(arg0).clear(arg1 >>> 0);
};
imports.wbg.__wbg_clearColor_895ce91c70f40950 = function(arg0, arg1, arg2, arg3, arg4) {
    getObject(arg0).clearColor(arg1, arg2, arg3, arg4);
};
imports.wbg.__wbg_clearDepth_d4007a94d017fa80 = function(arg0, arg1) {
    getObject(arg0).clearDepth(arg1);
};
imports.wbg.__wbg_colorMask_f5248b605302afc8 = function(arg0, arg1, arg2, arg3, arg4) {
    getObject(arg0).colorMask(arg1 !== 0, arg2 !== 0, arg3 !== 0, arg4 !== 0);
};
imports.wbg.__wbg_compileShader_79c5133937cc20b8 = function(arg0, arg1) {
    getObject(arg0).compileShader(getObject(arg1));
};
imports.wbg.__wbg_createBuffer_d3a92ef12a940b59 = function(arg0) {
    const ret = getObject(arg0).createBuffer();
    return isLikeNone(ret) ? 0 : addHeapObject(ret);
};
imports.wbg.__wbg_createFramebuffer_3241f11fdc03e168 = function(arg0) {
    const ret = getObject(arg0).createFramebuffer();
    return isLikeNone(ret) ? 0 : addHeapObject(ret);
};
imports.wbg.__wbg_createProgram_09e52acfdfd65c2f = function(arg0) {
    const ret = getObject(arg0).createProgram();
    return isLikeNone(ret) ? 0 : addHeapObject(ret);
};
imports.wbg.__wbg_createShader_e31c6a5e557b0cb3 = function(arg0, arg1) {
    const ret = getObject(arg0).createShader(arg1 >>> 0);
    return isLikeNone(ret) ? 0 : addHeapObject(ret);
};
imports.wbg.__wbg_createTexture_0602453d2b8f1fb1 = function(arg0) {
    const ret = getObject(arg0).createTexture();
    return isLikeNone(ret) ? 0 : addHeapObject(ret);
};
imports.wbg.__wbg_cullFace_4299771f373e2bea = function(arg0, arg1) {
    getObject(arg0).cullFace(arg1 >>> 0);
};
imports.wbg.__wbg_deleteBuffer_cc3c83e2a10331b9 = function(arg0, arg1) {
    getObject(arg0).deleteBuffer(getObject(arg1));
};
imports.wbg.__wbg_deleteFramebuffer_2c7cf128bc349eec = function(arg0, arg1) {
    getObject(arg0).deleteFramebuffer(getObject(arg1));
};
imports.wbg.__wbg_deleteProgram_90814f4531f7ae54 = function(arg0, arg1) {
    getObject(arg0).deleteProgram(getObject(arg1));
};
imports.wbg.__wbg_deleteShader_4d1143bd9dc59139 = function(arg0, arg1) {
    getObject(arg0).deleteShader(getObject(arg1));
};
imports.wbg.__wbg_deleteTexture_01f6c1a8fb2e63f2 = function(arg0, arg1) {
    getObject(arg0).deleteTexture(getObject(arg1));
};
imports.wbg.__wbg_depthFunc_bb8bdbc4529fbc03 = function(arg0, arg1) {
    getObject(arg0).depthFunc(arg1 >>> 0);
};
imports.wbg.__wbg_depthMask_f6c96bd33808f8b2 = function(arg0, arg1) {
    getObject(arg0).depthMask(arg1 !== 0);
};
imports.wbg.__wbg_detachShader_4a04940511b1680d = function(arg0, arg1, arg2) {
    getObject(arg0).detachShader(getObject(arg1), getObject(arg2));
};
imports.wbg.__wbg_disable_56e95d736a56003e = function(arg0, arg1) {
    getObject(arg0).disable(arg1 >>> 0);
};
imports.wbg.__wbg_disableVertexAttribArray_2cf677ce2ea177cb = function(arg0, arg1) {
    getObject(arg0).disableVertexAttribArray(arg1 >>> 0);
};
imports.wbg.__wbg_drawArrays_fd4e621011c5c584 = function(arg0, arg1, arg2, arg3) {
    getObject(arg0).drawArrays(arg1 >>> 0, arg2, arg3);
};
imports.wbg.__wbg_drawElements_4d127414173984bf = function(arg0, arg1, arg2, arg3, arg4) {
    getObject(arg0).drawElements(arg1 >>> 0, arg2, arg3 >>> 0, arg4);
};
imports.wbg.__wbg_enable_045575bf10d149e5 = function(arg0, arg1) {
    getObject(arg0).enable(arg1 >>> 0);
};
imports.wbg.__wbg_enableVertexAttribArray_e612ddd3ad45c26f = function(arg0, arg1) {
    getObject(arg0).enableVertexAttribArray(arg1 >>> 0);
};
imports.wbg.__wbg_framebufferRenderbuffer_1f3ceb05e13b2104 = function(arg0, arg1, arg2, arg3, arg4) {
    getObject(arg0).framebufferRenderbuffer(arg1 >>> 0, arg2 >>> 0, arg3 >>> 0, getObject(arg4));
};
imports.wbg.__wbg_framebufferTexture2D_8235408078006004 = function(arg0, arg1, arg2, arg3, arg4, arg5) {
    getObject(arg0).framebufferTexture2D(arg1 >>> 0, arg2 >>> 0, arg3 >>> 0, getObject(arg4), arg5);
};
imports.wbg.__wbg_generateMipmap_b2ac4e2d5455ec9a = function(arg0, arg1) {
    getObject(arg0).generateMipmap(arg1 >>> 0);
};
imports.wbg.__wbg_getActiveAttrib_179be6643535fa00 = function(arg0, arg1, arg2) {
    const ret = getObject(arg0).getActiveAttrib(getObject(arg1), arg2 >>> 0);
    return isLikeNone(ret) ? 0 : addHeapObject(ret);
};
imports.wbg.__wbg_getActiveUniform_087a85135e75d5d0 = function(arg0, arg1, arg2) {
    const ret = getObject(arg0).getActiveUniform(getObject(arg1), arg2 >>> 0);
    return isLikeNone(ret) ? 0 : addHeapObject(ret);
};
imports.wbg.__wbg_getAttribLocation_ac01326d3ac10b5a = function(arg0, arg1, arg2, arg3) {
    var v0 = getCachedStringFromWasm0(arg2, arg3);
    const ret = getObject(arg0).getAttribLocation(getObject(arg1), v0);
    return ret;
};
imports.wbg.__wbg_getExtension_c72e1499523e8324 = function() { return handleError(function (arg0, arg1, arg2) {
    var v0 = getCachedStringFromWasm0(arg1, arg2);
    const ret = getObject(arg0).getExtension(v0);
    return isLikeNone(ret) ? 0 : addHeapObject(ret);
}, arguments) };
imports.wbg.__wbg_getParameter_2a3d0a319ce30e5c = function() { return handleError(function (arg0, arg1) {
    const ret = getObject(arg0).getParameter(arg1 >>> 0);
    return addHeapObject(ret);
}, arguments) };
imports.wbg.__wbg_getProgramInfoLog_d412c7162eae4d78 = function(arg0, arg1, arg2) {
    const ret = getObject(arg1).getProgramInfoLog(getObject(arg2));
    var ptr1 = isLikeNone(ret) ? 0 : passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    var len1 = WASM_VECTOR_LEN;
    getInt32Memory0()[arg0 / 4 + 1] = len1;
    getInt32Memory0()[arg0 / 4 + 0] = ptr1;
};
imports.wbg.__wbg_getProgramParameter_f37e00f0fe884347 = function(arg0, arg1, arg2) {
    const ret = getObject(arg0).getProgramParameter(getObject(arg1), arg2 >>> 0);
    return addHeapObject(ret);
};
imports.wbg.__wbg_getShaderInfoLog_2648a4977707108a = function(arg0, arg1, arg2) {
    const ret = getObject(arg1).getShaderInfoLog(getObject(arg2));
    var ptr1 = isLikeNone(ret) ? 0 : passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    var len1 = WASM_VECTOR_LEN;
    getInt32Memory0()[arg0 / 4 + 1] = len1;
    getInt32Memory0()[arg0 / 4 + 0] = ptr1;
};
imports.wbg.__wbg_getSupportedExtensions_48164dba2d88454a = function(arg0) {
    const ret = getObject(arg0).getSupportedExtensions();
    return isLikeNone(ret) ? 0 : addHeapObject(ret);
};
imports.wbg.__wbg_getUniformLocation_357d39e3b49e343f = function(arg0, arg1, arg2, arg3) {
    var v0 = getCachedStringFromWasm0(arg2, arg3);
    const ret = getObject(arg0).getUniformLocation(getObject(arg1), v0);
    return isLikeNone(ret) ? 0 : addHeapObject(ret);
};
imports.wbg.__wbg_linkProgram_8900bcc093e56b5e = function(arg0, arg1) {
    getObject(arg0).linkProgram(getObject(arg1));
};
imports.wbg.__wbg_pixelStorei_d417f51c717fd87b = function(arg0, arg1, arg2) {
    getObject(arg0).pixelStorei(arg1 >>> 0, arg2);
};
imports.wbg.__wbg_scissor_8da52a5765745bde = function(arg0, arg1, arg2, arg3, arg4) {
    getObject(arg0).scissor(arg1, arg2, arg3, arg4);
};
imports.wbg.__wbg_shaderSource_c7b77a0fc5e466be = function(arg0, arg1, arg2, arg3) {
    var v0 = getCachedStringFromWasm0(arg2, arg3);
    getObject(arg0).shaderSource(getObject(arg1), v0);
};
imports.wbg.__wbg_texParameteri_d520b2a13b1dc357 = function(arg0, arg1, arg2, arg3) {
    getObject(arg0).texParameteri(arg1 >>> 0, arg2 >>> 0, arg3);
};
imports.wbg.__wbg_useProgram_272f4ec4ef3ad678 = function(arg0, arg1) {
    getObject(arg0).useProgram(getObject(arg1));
};
imports.wbg.__wbg_vertexAttribPointer_d924595d7382f271 = function(arg0, arg1, arg2, arg3, arg4, arg5, arg6) {
    getObject(arg0).vertexAttribPointer(arg1 >>> 0, arg2, arg3 >>> 0, arg4 !== 0, arg5, arg6);
};
imports.wbg.__wbg_viewport_26f8c317d495e905 = function(arg0, arg1, arg2, arg3, arg4) {
    getObject(arg0).viewport(arg1, arg2, arg3, arg4);
};
imports.wbg.__wbg_instanceof_Window_f2bf9e8e91f1be0d = function(arg0) {
    let result;
    try {
        result = getObject(arg0) instanceof Window;
    } catch {
        result = false;
    }
    const ret = result;
    return ret;
};
imports.wbg.__wbg_document_a11e2f345af07033 = function(arg0) {
    const ret = getObject(arg0).document;
    return isLikeNone(ret) ? 0 : addHeapObject(ret);
};
imports.wbg.__wbg_location_062b76c65917b0b8 = function(arg0) {
    const ret = getObject(arg0).location;
    return addHeapObject(ret);
};
imports.wbg.__wbg_history_863d441d4c6fce3f = function() { return handleError(function (arg0) {
    const ret = getObject(arg0).history;
    return addHeapObject(ret);
}, arguments) };
imports.wbg.__wbg_innerWidth_5c3a8e1cc043fe23 = function() { return handleError(function (arg0) {
    const ret = getObject(arg0).innerWidth;
    return addHeapObject(ret);
}, arguments) };
imports.wbg.__wbg_innerHeight_a56709a60e00b4d3 = function() { return handleError(function (arg0) {
    const ret = getObject(arg0).innerHeight;
    return addHeapObject(ret);
}, arguments) };
imports.wbg.__wbg_scrollY_c760e17779444629 = function() { return handleError(function (arg0) {
    const ret = getObject(arg0).scrollY;
    return ret;
}, arguments) };
imports.wbg.__wbg_devicePixelRatio_6a3c6863df6c69eb = function(arg0) {
    const ret = getObject(arg0).devicePixelRatio;
    return ret;
};
imports.wbg.__wbg_localStorage_ace6cdbae8ddafaf = function() { return handleError(function (arg0) {
    const ret = getObject(arg0).localStorage;
    return isLikeNone(ret) ? 0 : addHeapObject(ret);
}, arguments) };
imports.wbg.__wbg_matchMedia_65feed2dff6a9d41 = function() { return handleError(function (arg0, arg1, arg2) {
    var v0 = getCachedStringFromWasm0(arg1, arg2);
    const ret = getObject(arg0).matchMedia(v0);
    return isLikeNone(ret) ? 0 : addHeapObject(ret);
}, arguments) };
imports.wbg.__wbg_get_275b7fe33126fd53 = function(arg0, arg1, arg2) {
    var v0 = getCachedStringFromWasm0(arg1, arg2);
    const ret = getObject(arg0)[v0];
    return isLikeNone(ret) ? 0 : addHeapObject(ret);
};
imports.wbg.__wbg_cancelAnimationFrame_7b826433b6b12f73 = function() { return handleError(function (arg0, arg1) {
    getObject(arg0).cancelAnimationFrame(arg1);
}, arguments) };
imports.wbg.__wbg_requestAnimationFrame_81e888f67b20c79f = function() { return handleError(function (arg0, arg1) {
    const ret = getObject(arg0).requestAnimationFrame(getObject(arg1));
    return ret;
}, arguments) };
imports.wbg.__wbg_clearTimeout_c858b1cf4a2dab60 = function(arg0, arg1) {
    getObject(arg0).clearTimeout(arg1);
};
imports.wbg.__wbg_setTimeout_250d9729242b4d13 = function() { return handleError(function (arg0, arg1, arg2) {
    const ret = getObject(arg0).setTimeout(getObject(arg1), arg2);
    return ret;
}, arguments) };
imports.wbg.__wbg_setdata_3e44388744db6676 = function(arg0, arg1, arg2) {
    var v0 = getCachedStringFromWasm0(arg1, arg2);
    getObject(arg0).data = v0;
};
imports.wbg.__wbg_before_cdfa5e2176d9a3e1 = function() { return handleError(function (arg0, arg1) {
    getObject(arg0).before(getObject(arg1));
}, arguments) };
imports.wbg.__wbg_remove_0597750efeed9901 = function(arg0) {
    getObject(arg0).remove();
};
imports.wbg.__wbg_style_490ba346de45c9a1 = function(arg0) {
    const ret = getObject(arg0).style;
    return addHeapObject(ret);
};
imports.wbg.__wbg_instanceof_IntersectionObserverEntry_bb77a4f83a574c9e = function(arg0) {
    let result;
    try {
        result = getObject(arg0) instanceof IntersectionObserverEntry;
    } catch {
        result = false;
    }
    const ret = result;
    return ret;
};
imports.wbg.__wbg_isIntersecting_8bf3d1f6013e59df = function(arg0) {
    const ret = getObject(arg0).isIntersecting;
    return ret;
};
imports.wbg.__wbg_nextNode_fbb29daef09e2043 = function() { return handleError(function (arg0) {
    const ret = getObject(arg0).nextNode();
    return isLikeNone(ret) ? 0 : addHeapObject(ret);
}, arguments) };
imports.wbg.__wbg_debug_917e579618ee56f5 = function(arg0) {
    console.debug(getObject(arg0));
};
imports.wbg.__wbg_error_ea7597dedb63d9a4 = function(arg0) {
    console.error(getObject(arg0));
};
imports.wbg.__wbg_error_1b3d7220a777aa60 = function(arg0, arg1) {
    console.error(getObject(arg0), getObject(arg1));
};
imports.wbg.__wbg_info_fc2a17f38101c41c = function(arg0) {
    console.info(getObject(arg0));
};
imports.wbg.__wbg_log_003c998d6df63565 = function(arg0) {
    console.log(getObject(arg0));
};
imports.wbg.__wbg_warn_ebfcadd0780df93a = function(arg0) {
    console.warn(getObject(arg0));
};
imports.wbg.__wbg_append_05013ad9013eb0fa = function() { return handleError(function (arg0, arg1) {
    getObject(arg0).append(getObject(arg1));
}, arguments) };
imports.wbg.__wbg_length_516aa90243ee5548 = function(arg0) {
    const ret = getObject(arg0).length;
    return ret;
};
imports.wbg.__wbg_newwithstrandinit_8e1c089763754d1e = function() { return handleError(function (arg0, arg1, arg2) {
    var v0 = getCachedStringFromWasm0(arg0, arg1);
    const ret = new Request(v0, getObject(arg2));
    return addHeapObject(ret);
}, arguments) };
imports.wbg.__wbg_bindVertexArrayOES_23dfa6fba9f2befe = function(arg0, arg1) {
    getObject(arg0).bindVertexArrayOES(getObject(arg1));
};
imports.wbg.__wbg_createVertexArrayOES_b1ae31e81967c8cf = function(arg0) {
    const ret = getObject(arg0).createVertexArrayOES();
    return isLikeNone(ret) ? 0 : addHeapObject(ret);
};
imports.wbg.__wbg_get_58f97b8bc3806bd0 = function() { return handleError(function (arg0, arg1, arg2, arg3) {
    var v0 = getCachedStringFromWasm0(arg2, arg3);
    const ret = getObject(arg1)[v0];
    var ptr2 = isLikeNone(ret) ? 0 : passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    var len2 = WASM_VECTOR_LEN;
    getInt32Memory0()[arg0 / 4 + 1] = len2;
    getInt32Memory0()[arg0 / 4 + 0] = ptr2;
}, arguments) };
imports.wbg.__wbg_set_79d79d2a064bd291 = function() { return handleError(function (arg0, arg1, arg2, arg3, arg4) {
    var v0 = getCachedStringFromWasm0(arg1, arg2);
    var v1 = getCachedStringFromWasm0(arg3, arg4);
    getObject(arg0)[v0] = v1;
}, arguments) };
imports.wbg.__wbg_URL_83b2050b2bb02635 = function() { return handleError(function (arg0, arg1) {
    const ret = getObject(arg1).URL;
    const ptr1 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len1 = WASM_VECTOR_LEN;
    getInt32Memory0()[arg0 / 4 + 1] = len1;
    getInt32Memory0()[arg0 / 4 + 0] = ptr1;
}, arguments) };
imports.wbg.__wbg_body_483afe07b0958d3b = function(arg0) {
    const ret = getObject(arg0).body;
    return isLikeNone(ret) ? 0 : addHeapObject(ret);
};
imports.wbg.__wbg_defaultView_c68cb9e2fea776f2 = function(arg0) {
    const ret = getObject(arg0).defaultView;
    return isLikeNone(ret) ? 0 : addHeapObject(ret);
};
imports.wbg.__wbg_fullscreenElement_fbdfd30c2328e325 = function(arg0) {
    const ret = getObject(arg0).fullscreenElement;
    return isLikeNone(ret) ? 0 : addHeapObject(ret);
};
imports.wbg.__wbg_setonmousemove_55b8df196d23a2d1 = function(arg0, arg1) {
    getObject(arg0).onmousemove = getObject(arg1);
};
imports.wbg.__wbg_createComment_1b79d4d03471be1f = function(arg0, arg1, arg2) {
    var v0 = getCachedStringFromWasm0(arg1, arg2);
    const ret = getObject(arg0).createComment(v0);
    return addHeapObject(ret);
};
imports.wbg.__wbg_createDocumentFragment_0f9c8646c7decb67 = function(arg0) {
    const ret = getObject(arg0).createDocumentFragment();
    return addHeapObject(ret);
};
imports.wbg.__wbg_createElement_5281e2aae74efc9d = function() { return handleError(function (arg0, arg1, arg2) {
    var v0 = getCachedStringFromWasm0(arg1, arg2);
    const ret = getObject(arg0).createElement(v0);
    return addHeapObject(ret);
}, arguments) };
imports.wbg.__wbg_createElementNS_119bddb989bf0a0f = function() { return handleError(function (arg0, arg1, arg2, arg3, arg4) {
    var v0 = getCachedStringFromWasm0(arg1, arg2);
    var v1 = getCachedStringFromWasm0(arg3, arg4);
    const ret = getObject(arg0).createElementNS(v0, v1);
    return addHeapObject(ret);
}, arguments) };
imports.wbg.__wbg_createTextNode_30215f8ff2f87080 = function(arg0, arg1, arg2) {
    var v0 = getCachedStringFromWasm0(arg1, arg2);
    const ret = getObject(arg0).createTextNode(v0);
    return addHeapObject(ret);
};
imports.wbg.__wbg_createTreeWalker_1500148dc9c2c8fe = function() { return handleError(function (arg0, arg1, arg2) {
    const ret = getObject(arg0).createTreeWalker(getObject(arg1), arg2 >>> 0);
    return addHeapObject(ret);
}, arguments) };
imports.wbg.__wbg_getElementById_0d9e5885e90e4f2a = function(arg0, arg1, arg2) {
    var v0 = getCachedStringFromWasm0(arg1, arg2);
    const ret = getObject(arg0).getElementById(v0);
    return isLikeNone(ret) ? 0 : addHeapObject(ret);
};
imports.wbg.__wbg_getElementsByTagName_543be3d5fc6f09f1 = function(arg0, arg1, arg2) {
    var v0 = getCachedStringFromWasm0(arg1, arg2);
    const ret = getObject(arg0).getElementsByTagName(v0);
    return addHeapObject(ret);
};
imports.wbg.__wbg_querySelector_d96bcd0615189348 = function() { return handleError(function (arg0, arg1, arg2) {
    var v0 = getCachedStringFromWasm0(arg1, arg2);
    const ret = getObject(arg0).querySelector(v0);
    return isLikeNone(ret) ? 0 : addHeapObject(ret);
}, arguments) };
imports.wbg.__wbg_x_f6d724bc73785ea9 = function(arg0) {
    const ret = getObject(arg0).x;
    return ret;
};
imports.wbg.__wbg_y_0f3f7e5f89d8289d = function(arg0) {
    const ret = getObject(arg0).y;
    return ret;
};
imports.wbg.__wbg_new_4d857178afd2211a = function() { return handleError(function () {
    const ret = new Headers();
    return addHeapObject(ret);
}, arguments) };
imports.wbg.__wbg_append_0df83a5c7a83dc6e = function() { return handleError(function (arg0, arg1, arg2, arg3, arg4) {
    var v0 = getCachedStringFromWasm0(arg1, arg2);
    var v1 = getCachedStringFromWasm0(arg3, arg4);
    getObject(arg0).append(v0, v1);
}, arguments) };
imports.wbg.__wbg_item_e1f4d2a1e1fdfb92 = function(arg0, arg1) {
    const ret = getObject(arg0).item(arg1 >>> 0);
    return isLikeNone(ret) ? 0 : addHeapObject(ret);
};
imports.wbg.__wbg_pointerId_110fbf1bac892eed = function(arg0) {
    const ret = getObject(arg0).pointerId;
    return ret;
};
imports.wbg.__wbg_pressure_e9c4824793381f6a = function(arg0) {
    const ret = getObject(arg0).pressure;
    return ret;
};
imports.wbg.__wbg_pointerType_83e8f5460c19d633 = function(arg0, arg1) {
    const ret = getObject(arg1).pointerType;
    const ptr1 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len1 = WASM_VECTOR_LEN;
    getInt32Memory0()[arg0 / 4 + 1] = len1;
    getInt32Memory0()[arg0 / 4 + 0] = ptr1;
};
imports.wbg.__wbg_deltaX_a2649ab8c4f09398 = function(arg0) {
    const ret = getObject(arg0).deltaX;
    return ret;
};
imports.wbg.__wbg_deltaY_98e91422e318cb8a = function(arg0) {
    const ret = getObject(arg0).deltaY;
    return ret;
};
imports.wbg.__wbg_deltaMode_90fac2815fd3b6a6 = function(arg0) {
    const ret = getObject(arg0).deltaMode;
    return ret;
};
imports.wbg.__wbg_add_6b3cffbc661954bc = function() { return handleError(function (arg0, arg1, arg2) {
    var v0 = getCachedStringFromWasm0(arg1, arg2);
    getObject(arg0).add(v0);
}, arguments) };
imports.wbg.__wbg_remove_39fc96eff9f5db6d = function() { return handleError(function (arg0, arg1, arg2) {
    var v0 = getCachedStringFromWasm0(arg1, arg2);
    getObject(arg0).remove(v0);
}, arguments) };
imports.wbg.__wbg_newwithoptions_c40f04a3bafcea4a = function() { return handleError(function (arg0, arg1) {
    const ret = new IntersectionObserver(getObject(arg0), getObject(arg1));
    return addHeapObject(ret);
}, arguments) };
imports.wbg.__wbg_observe_5961e17169c94f7e = function(arg0, arg1) {
    getObject(arg0).observe(getObject(arg1));
};
imports.wbg.__wbg_matches_564752e14ad66e2a = function(arg0) {
    const ret = getObject(arg0).matches;
    return ret;
};
imports.wbg.__wbg_bufferData_bbc05c15d8236e34 = function(arg0, arg1, arg2, arg3) {
    getObject(arg0).bufferData(arg1 >>> 0, getObject(arg2), arg3 >>> 0);
};
imports.wbg.__wbg_texSubImage2D_4900b1678c08e07a = function() { return handleError(function (arg0, arg1, arg2, arg3, arg4, arg5, arg6, arg7, arg8, arg9) {
    getObject(arg0).texSubImage2D(arg1 >>> 0, arg2, arg3, arg4, arg5, arg6, arg7 >>> 0, arg8 >>> 0, getObject(arg9));
}, arguments) };
imports.wbg.__wbg_uniform1fv_e330f5fa3f9ef673 = function(arg0, arg1, arg2, arg3) {
    getObject(arg0).uniform1fv(getObject(arg1), getArrayF32FromWasm0(arg2, arg3));
};
imports.wbg.__wbg_uniform1iv_7ee4aca7a5c2fe23 = function(arg0, arg1, arg2, arg3) {
    getObject(arg0).uniform1iv(getObject(arg1), getArrayI32FromWasm0(arg2, arg3));
};
imports.wbg.__wbg_uniform3fv_1e829a5722c7df67 = function(arg0, arg1, arg2, arg3) {
    getObject(arg0).uniform3fv(getObject(arg1), getArrayF32FromWasm0(arg2, arg3));
};
imports.wbg.__wbg_uniform4fv_22325c9220b96d27 = function(arg0, arg1, arg2, arg3) {
    getObject(arg0).uniform4fv(getObject(arg1), getArrayF32FromWasm0(arg2, arg3));
};
imports.wbg.__wbg_uniformMatrix3fv_0bcce784a9694556 = function(arg0, arg1, arg2, arg3, arg4) {
    getObject(arg0).uniformMatrix3fv(getObject(arg1), arg2 !== 0, getArrayF32FromWasm0(arg3, arg4));
};
imports.wbg.__wbg_uniformMatrix4fv_1719a4aa908e0dbd = function(arg0, arg1, arg2, arg3, arg4) {
    getObject(arg0).uniformMatrix4fv(getObject(arg1), arg2 !== 0, getArrayF32FromWasm0(arg3, arg4));
};
imports.wbg.__wbg_activeTexture_25e5b02da56055d9 = function(arg0, arg1) {
    getObject(arg0).activeTexture(arg1 >>> 0);
};
imports.wbg.__wbg_attachShader_27c83348bde9d7f8 = function(arg0, arg1, arg2) {
    getObject(arg0).attachShader(getObject(arg1), getObject(arg2));
};
imports.wbg.__wbg_bindBuffer_fa9b78a8188035be = function(arg0, arg1, arg2) {
    getObject(arg0).bindBuffer(arg1 >>> 0, getObject(arg2));
};
imports.wbg.__wbg_bindFramebuffer_9d5340bd2d656055 = function(arg0, arg1, arg2) {
    getObject(arg0).bindFramebuffer(arg1 >>> 0, getObject(arg2));
};
imports.wbg.__wbg_bindTexture_0c6c067b8de48e21 = function(arg0, arg1, arg2) {
    getObject(arg0).bindTexture(arg1 >>> 0, getObject(arg2));
};
imports.wbg.__wbg_blendEquationSeparate_8c2236c265205c64 = function(arg0, arg1, arg2) {
    getObject(arg0).blendEquationSeparate(arg1 >>> 0, arg2 >>> 0);
};
imports.wbg.__wbg_blendFuncSeparate_f9c88ee1b4fea80b = function(arg0, arg1, arg2, arg3, arg4) {
    getObject(arg0).blendFuncSeparate(arg1 >>> 0, arg2 >>> 0, arg3 >>> 0, arg4 >>> 0);
};
imports.wbg.__wbg_clear_a0edb56393616f2f = function(arg0, arg1) {
    getObject(arg0).clear(arg1 >>> 0);
};
imports.wbg.__wbg_clearColor_0e41cf1f5c727bd3 = function(arg0, arg1, arg2, arg3, arg4) {
    getObject(arg0).clearColor(arg1, arg2, arg3, arg4);
};
imports.wbg.__wbg_clearDepth_6b03161bae94d813 = function(arg0, arg1) {
    getObject(arg0).clearDepth(arg1);
};
imports.wbg.__wbg_colorMask_2450aaa2241c3087 = function(arg0, arg1, arg2, arg3, arg4) {
    getObject(arg0).colorMask(arg1 !== 0, arg2 !== 0, arg3 !== 0, arg4 !== 0);
};
imports.wbg.__wbg_compileShader_f763d6c4be740123 = function(arg0, arg1) {
    getObject(arg0).compileShader(getObject(arg1));
};
imports.wbg.__wbg_createBuffer_0628ce872a79d2cf = function(arg0) {
    const ret = getObject(arg0).createBuffer();
    return isLikeNone(ret) ? 0 : addHeapObject(ret);
};
imports.wbg.__wbg_createFramebuffer_c6a70d5aa82008f4 = function(arg0) {
    const ret = getObject(arg0).createFramebuffer();
    return isLikeNone(ret) ? 0 : addHeapObject(ret);
};
imports.wbg.__wbg_createProgram_7aede818c7f6df6e = function(arg0) {
    const ret = getObject(arg0).createProgram();
    return isLikeNone(ret) ? 0 : addHeapObject(ret);
};
imports.wbg.__wbg_createShader_173ebd230ff03521 = function(arg0, arg1) {
    const ret = getObject(arg0).createShader(arg1 >>> 0);
    return isLikeNone(ret) ? 0 : addHeapObject(ret);
};
imports.wbg.__wbg_createTexture_2bfdb7fd3ec147d0 = function(arg0) {
    const ret = getObject(arg0).createTexture();
    return isLikeNone(ret) ? 0 : addHeapObject(ret);
};
imports.wbg.__wbg_cullFace_789752f04d4210de = function(arg0, arg1) {
    getObject(arg0).cullFace(arg1 >>> 0);
};
imports.wbg.__wbg_deleteBuffer_c7b11337c6040c39 = function(arg0, arg1) {
    getObject(arg0).deleteBuffer(getObject(arg1));
};
imports.wbg.__wbg_deleteFramebuffer_d7943cb8c4190e7a = function(arg0, arg1) {
    getObject(arg0).deleteFramebuffer(getObject(arg1));
};
imports.wbg.__wbg_deleteProgram_eb6848c3a12f8047 = function(arg0, arg1) {
    getObject(arg0).deleteProgram(getObject(arg1));
};
imports.wbg.__wbg_deleteShader_c73858286febfc6c = function(arg0, arg1) {
    getObject(arg0).deleteShader(getObject(arg1));
};
imports.wbg.__wbg_deleteTexture_d68d1ab0526d8cf8 = function(arg0, arg1) {
    getObject(arg0).deleteTexture(getObject(arg1));
};
imports.wbg.__wbg_depthFunc_07f122f1ce56c723 = function(arg0, arg1) {
    getObject(arg0).depthFunc(arg1 >>> 0);
};
imports.wbg.__wbg_depthMask_b75467edeee676da = function(arg0, arg1) {
    getObject(arg0).depthMask(arg1 !== 0);
};
imports.wbg.__wbg_detachShader_abe2ef03f6609c5e = function(arg0, arg1, arg2) {
    getObject(arg0).detachShader(getObject(arg1), getObject(arg2));
};
imports.wbg.__wbg_disable_d66d46c562d916a8 = function(arg0, arg1) {
    getObject(arg0).disable(arg1 >>> 0);
};
imports.wbg.__wbg_disableVertexAttribArray_60a186ddbdedd9fb = function(arg0, arg1) {
    getObject(arg0).disableVertexAttribArray(arg1 >>> 0);
};
imports.wbg.__wbg_drawArrays_08885b3aa4e8c599 = function(arg0, arg1, arg2, arg3) {
    getObject(arg0).drawArrays(arg1 >>> 0, arg2, arg3);
};
imports.wbg.__wbg_drawElements_3c7967535c091467 = function(arg0, arg1, arg2, arg3, arg4) {
    getObject(arg0).drawElements(arg1 >>> 0, arg2, arg3 >>> 0, arg4);
};
imports.wbg.__wbg_enable_cec9b6cc193668e3 = function(arg0, arg1) {
    getObject(arg0).enable(arg1 >>> 0);
};
imports.wbg.__wbg_enableVertexAttribArray_0f49da14b1bf5368 = function(arg0, arg1) {
    getObject(arg0).enableVertexAttribArray(arg1 >>> 0);
};
imports.wbg.__wbg_framebufferRenderbuffer_502c9d86d26741d1 = function(arg0, arg1, arg2, arg3, arg4) {
    getObject(arg0).framebufferRenderbuffer(arg1 >>> 0, arg2 >>> 0, arg3 >>> 0, getObject(arg4));
};
imports.wbg.__wbg_framebufferTexture2D_d95fec9a9cba8c5a = function(arg0, arg1, arg2, arg3, arg4, arg5) {
    getObject(arg0).framebufferTexture2D(arg1 >>> 0, arg2 >>> 0, arg3 >>> 0, getObject(arg4), arg5);
};
imports.wbg.__wbg_generateMipmap_27cb19b2de4cd428 = function(arg0, arg1) {
    getObject(arg0).generateMipmap(arg1 >>> 0);
};
imports.wbg.__wbg_getActiveAttrib_36dcfa06bef10cff = function(arg0, arg1, arg2) {
    const ret = getObject(arg0).getActiveAttrib(getObject(arg1), arg2 >>> 0);
    return isLikeNone(ret) ? 0 : addHeapObject(ret);
};
imports.wbg.__wbg_getActiveUniform_694478fe71ce5669 = function(arg0, arg1, arg2) {
    const ret = getObject(arg0).getActiveUniform(getObject(arg1), arg2 >>> 0);
    return isLikeNone(ret) ? 0 : addHeapObject(ret);
};
imports.wbg.__wbg_getAttribLocation_da83707e9e542342 = function(arg0, arg1, arg2, arg3) {
    var v0 = getCachedStringFromWasm0(arg2, arg3);
    const ret = getObject(arg0).getAttribLocation(getObject(arg1), v0);
    return ret;
};
imports.wbg.__wbg_getProgramInfoLog_3f93f6740a866519 = function(arg0, arg1, arg2) {
    const ret = getObject(arg1).getProgramInfoLog(getObject(arg2));
    var ptr1 = isLikeNone(ret) ? 0 : passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    var len1 = WASM_VECTOR_LEN;
    getInt32Memory0()[arg0 / 4 + 1] = len1;
    getInt32Memory0()[arg0 / 4 + 0] = ptr1;
};
imports.wbg.__wbg_getProgramParameter_05cd4988a521d16f = function(arg0, arg1, arg2) {
    const ret = getObject(arg0).getProgramParameter(getObject(arg1), arg2 >>> 0);
    return addHeapObject(ret);
};
imports.wbg.__wbg_getShaderInfoLog_e244928c4090df86 = function(arg0, arg1, arg2) {
    const ret = getObject(arg1).getShaderInfoLog(getObject(arg2));
    var ptr1 = isLikeNone(ret) ? 0 : passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    var len1 = WASM_VECTOR_LEN;
    getInt32Memory0()[arg0 / 4 + 1] = len1;
    getInt32Memory0()[arg0 / 4 + 0] = ptr1;
};
imports.wbg.__wbg_getUniformLocation_5234f1eb12ffef3e = function(arg0, arg1, arg2, arg3) {
    var v0 = getCachedStringFromWasm0(arg2, arg3);
    const ret = getObject(arg0).getUniformLocation(getObject(arg1), v0);
    return isLikeNone(ret) ? 0 : addHeapObject(ret);
};
imports.wbg.__wbg_linkProgram_ed95a20e6edaf5c8 = function(arg0, arg1) {
    getObject(arg0).linkProgram(getObject(arg1));
};
imports.wbg.__wbg_pixelStorei_27303ed20a82eadf = function(arg0, arg1, arg2) {
    getObject(arg0).pixelStorei(arg1 >>> 0, arg2);
};
imports.wbg.__wbg_scissor_83170faff5ae77dd = function(arg0, arg1, arg2, arg3, arg4) {
    getObject(arg0).scissor(arg1, arg2, arg3, arg4);
};
imports.wbg.__wbg_shaderSource_960bb50790e2a77a = function(arg0, arg1, arg2, arg3) {
    var v0 = getCachedStringFromWasm0(arg2, arg3);
    getObject(arg0).shaderSource(getObject(arg1), v0);
};
imports.wbg.__wbg_texParameteri_af5955a742697f5c = function(arg0, arg1, arg2, arg3) {
    getObject(arg0).texParameteri(arg1 >>> 0, arg2 >>> 0, arg3);
};
imports.wbg.__wbg_useProgram_0101905edb621897 = function(arg0, arg1) {
    getObject(arg0).useProgram(getObject(arg1));
};
imports.wbg.__wbg_vertexAttribPointer_e7c525af10d339fd = function(arg0, arg1, arg2, arg3, arg4, arg5, arg6) {
    getObject(arg0).vertexAttribPointer(arg1 >>> 0, arg2, arg3 >>> 0, arg4 !== 0, arg5, arg6);
};
imports.wbg.__wbg_viewport_b9926fef03a595fd = function(arg0, arg1, arg2, arg3, arg4) {
    getObject(arg0).viewport(arg1, arg2, arg3, arg4);
};
imports.wbg.__wbg_instanceof_HtmlCanvasElement_6e58598b4e8b1586 = function(arg0) {
    let result;
    try {
        result = getObject(arg0) instanceof HTMLCanvasElement;
    } catch {
        result = false;
    }
    const ret = result;
    return ret;
};
imports.wbg.__wbg_width_3a395887a577233b = function(arg0) {
    const ret = getObject(arg0).width;
    return ret;
};
imports.wbg.__wbg_setwidth_885d5dd3c7f48f41 = function(arg0, arg1) {
    getObject(arg0).width = arg1 >>> 0;
};
imports.wbg.__wbg_height_b7046017c4148386 = function(arg0) {
    const ret = getObject(arg0).height;
    return ret;
};
imports.wbg.__wbg_setheight_0d2b445bb6a5a3f2 = function(arg0, arg1) {
    getObject(arg0).height = arg1 >>> 0;
};
imports.wbg.__wbg_getContext_cdb33634d45dc84d = function() { return handleError(function (arg0, arg1, arg2, arg3) {
    var v0 = getCachedStringFromWasm0(arg1, arg2);
    const ret = getObject(arg0).getContext(v0, getObject(arg3));
    return isLikeNone(ret) ? 0 : addHeapObject(ret);
}, arguments) };
imports.wbg.__wbg_instanceof_MouseEvent_e3bb13b9710cf58d = function(arg0) {
    let result;
    try {
        result = getObject(arg0) instanceof MouseEvent;
    } catch {
        result = false;
    }
    const ret = result;
    return ret;
};
imports.wbg.__wbg_clientX_3f85264cf22095e5 = function(arg0) {
    const ret = getObject(arg0).clientX;
    return ret;
};
imports.wbg.__wbg_clientY_89c6d33983785b4c = function(arg0) {
    const ret = getObject(arg0).clientY;
    return ret;
};
imports.wbg.__wbg_offsetX_3e4797e74d7cd119 = function(arg0) {
    const ret = getObject(arg0).offsetX;
    return ret;
};
imports.wbg.__wbg_offsetY_d0d5c8c9d982beb2 = function(arg0) {
    const ret = getObject(arg0).offsetY;
    return ret;
};
imports.wbg.__wbg_ctrlKey_1d1f76bad2b8e2a6 = function(arg0) {
    const ret = getObject(arg0).ctrlKey;
    return ret;
};
imports.wbg.__wbg_shiftKey_05c776bad5d51fc0 = function(arg0) {
    const ret = getObject(arg0).shiftKey;
    return ret;
};
imports.wbg.__wbg_altKey_260b114f54f8d2d7 = function(arg0) {
    const ret = getObject(arg0).altKey;
    return ret;
};
imports.wbg.__wbg_metaKey_52d6db1bcccab5ac = function(arg0) {
    const ret = getObject(arg0).metaKey;
    return ret;
};
imports.wbg.__wbg_button_2efa430f9add0993 = function(arg0) {
    const ret = getObject(arg0).button;
    return ret;
};
imports.wbg.__wbg_buttons_489c8b943073f8da = function(arg0) {
    const ret = getObject(arg0).buttons;
    return ret;
};
imports.wbg.__wbg_movementX_33f3d3477f4f171b = function(arg0) {
    const ret = getObject(arg0).movementX;
    return ret;
};
imports.wbg.__wbg_movementY_43f34bf2c669367a = function(arg0) {
    const ret = getObject(arg0).movementY;
    return ret;
};
imports.wbg.__wbg_instanceof_Node_a14f4f9b51b4be4b = function(arg0) {
    let result;
    try {
        result = getObject(arg0) instanceof Node;
    } catch {
        result = false;
    }
    const ret = result;
    return ret;
};
imports.wbg.__wbg_ownerDocument_2758fb6149cbb92c = function(arg0) {
    const ret = getObject(arg0).ownerDocument;
    return isLikeNone(ret) ? 0 : addHeapObject(ret);
};
imports.wbg.__wbg_parentNode_dc21739b5a2033b3 = function(arg0) {
    const ret = getObject(arg0).parentNode;
    return isLikeNone(ret) ? 0 : addHeapObject(ret);
};
imports.wbg.__wbg_childNodes_467e3b83caedfffe = function(arg0) {
    const ret = getObject(arg0).childNodes;
    return addHeapObject(ret);
};
imports.wbg.__wbg_previousSibling_07b3dc1a33d6a68d = function(arg0) {
    const ret = getObject(arg0).previousSibling;
    return isLikeNone(ret) ? 0 : addHeapObject(ret);
};
imports.wbg.__wbg_nextSibling_560b2649c19c5c20 = function(arg0) {
    const ret = getObject(arg0).nextSibling;
    return isLikeNone(ret) ? 0 : addHeapObject(ret);
};
imports.wbg.__wbg_textContent_20f9c491b823cb08 = function(arg0, arg1) {
    const ret = getObject(arg1).textContent;
    var ptr1 = isLikeNone(ret) ? 0 : passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    var len1 = WASM_VECTOR_LEN;
    getInt32Memory0()[arg0 / 4 + 1] = len1;
    getInt32Memory0()[arg0 / 4 + 0] = ptr1;
};
imports.wbg.__wbg_appendChild_173b88a25c048f2b = function() { return handleError(function (arg0, arg1) {
    const ret = getObject(arg0).appendChild(getObject(arg1));
    return addHeapObject(ret);
}, arguments) };
imports.wbg.__wbg_cloneNode_007c3ee6db6fc63e = function() { return handleError(function (arg0) {
    const ret = getObject(arg0).cloneNode();
    return addHeapObject(ret);
}, arguments) };
imports.wbg.__wbg_now_9c3c00f027cd0272 = function(arg0) {
    const ret = getObject(arg0).now();
    return ret;
};
imports.wbg.__wbg_drawBuffersWEBGL_1855fec8ab0354c0 = function(arg0, arg1) {
    getObject(arg0).drawBuffersWEBGL(getObject(arg1));
};
imports.wbg.__wbg_drawArraysInstancedANGLE_0a43d7058461f5a3 = function(arg0, arg1, arg2, arg3, arg4) {
    getObject(arg0).drawArraysInstancedANGLE(arg1 >>> 0, arg2, arg3, arg4);
};
imports.wbg.__wbg_vertexAttribDivisorANGLE_399090d217c9befd = function(arg0, arg1, arg2) {
    getObject(arg0).vertexAttribDivisorANGLE(arg1 >>> 0, arg2 >>> 0);
};
imports.wbg.__wbg_addEventListener_7759570e045ab41e = function() { return handleError(function (arg0, arg1, arg2, arg3) {
    var v0 = getCachedStringFromWasm0(arg1, arg2);
    getObject(arg0).addEventListener(v0, getObject(arg3));
}, arguments) };
imports.wbg.__wbg_addEventListener_808d915acd4d2282 = function() { return handleError(function (arg0, arg1, arg2, arg3, arg4) {
    var v0 = getCachedStringFromWasm0(arg1, arg2);
    getObject(arg0).addEventListener(v0, getObject(arg3), getObject(arg4));
}, arguments) };
imports.wbg.__wbg_removeEventListener_80accfb136fdc19b = function() { return handleError(function (arg0, arg1, arg2, arg3) {
    var v0 = getCachedStringFromWasm0(arg1, arg2);
    getObject(arg0).removeEventListener(v0, getObject(arg3));
}, arguments) };
imports.wbg.__wbg_removeEventListener_32d543a6fdf88ebf = function() { return handleError(function (arg0, arg1, arg2, arg3, arg4) {
    var v0 = getCachedStringFromWasm0(arg1, arg2);
    getObject(arg0).removeEventListener(v0, getObject(arg3), getObject(arg4));
}, arguments) };
imports.wbg.__wbg_matches_80b259c678eefdb2 = function(arg0) {
    const ret = getObject(arg0).matches;
    return ret;
};
imports.wbg.__wbg_addListener_66d938201dfd7aa7 = function() { return handleError(function (arg0, arg1) {
    getObject(arg0).addListener(getObject(arg1));
}, arguments) };
imports.wbg.__wbg_removeListener_25c7276a825f0fe0 = function() { return handleError(function (arg0, arg1) {
    getObject(arg0).removeListener(getObject(arg1));
}, arguments) };
imports.wbg.__wbg_size_b1737bf5042f412f = function(arg0) {
    const ret = getObject(arg0).size;
    return ret;
};
imports.wbg.__wbg_type_7ebb4e6e82f318a5 = function(arg0) {
    const ret = getObject(arg0).type;
    return ret;
};
imports.wbg.__wbg_name_8f8c41d4175060c5 = function(arg0, arg1) {
    const ret = getObject(arg1).name;
    const ptr1 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len1 = WASM_VECTOR_LEN;
    getInt32Memory0()[arg0 / 4 + 1] = len1;
    getInt32Memory0()[arg0 / 4 + 0] = ptr1;
};
imports.wbg.__wbg_className_a99e9ddf2e3955d3 = function(arg0, arg1) {
    const ret = getObject(arg1).className;
    const ptr1 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len1 = WASM_VECTOR_LEN;
    getInt32Memory0()[arg0 / 4 + 1] = len1;
    getInt32Memory0()[arg0 / 4 + 0] = ptr1;
};
imports.wbg.__wbg_setclassName_f97c6ecc11848fdf = function(arg0, arg1, arg2) {
    var v0 = getCachedStringFromWasm0(arg1, arg2);
    getObject(arg0).className = v0;
};
imports.wbg.__wbg_classList_2320eb93e4129a1a = function(arg0) {
    const ret = getObject(arg0).classList;
    return addHeapObject(ret);
};
imports.wbg.__wbg_setinnerHTML_39068b9492d9a4af = function(arg0, arg1, arg2) {
    var v0 = getCachedStringFromWasm0(arg1, arg2);
    getObject(arg0).innerHTML = v0;
};
imports.wbg.__wbg_getBoundingClientRect_b8fe0d836382ad77 = function(arg0) {
    const ret = getObject(arg0).getBoundingClientRect();
    return addHeapObject(ret);
};
imports.wbg.__wbg_removeAttribute_cb0c24f7c8064e7e = function() { return handleError(function (arg0, arg1, arg2) {
    var v0 = getCachedStringFromWasm0(arg1, arg2);
    getObject(arg0).removeAttribute(v0);
}, arguments) };
imports.wbg.__wbg_requestFullscreen_8dff3beb4e210efb = function() { return handleError(function (arg0) {
    getObject(arg0).requestFullscreen();
}, arguments) };
imports.wbg.__wbg_scrollIntoView_4bbaaa66758297cd = function(arg0) {
    getObject(arg0).scrollIntoView();
};
imports.wbg.__wbg_setAttribute_e8e8474a029723cb = function() { return handleError(function (arg0, arg1, arg2, arg3, arg4) {
    var v0 = getCachedStringFromWasm0(arg1, arg2);
    var v1 = getCachedStringFromWasm0(arg3, arg4);
    getObject(arg0).setAttribute(v0, v1);
}, arguments) };
imports.wbg.__wbg_setPointerCapture_cebf0079be4a17d9 = function() { return handleError(function (arg0, arg1) {
    getObject(arg0).setPointerCapture(arg1);
}, arguments) };
imports.wbg.__wbg_before_e0a0a535231ae1bf = function() { return handleError(function (arg0, arg1) {
    getObject(arg0).before(getObject(arg1));
}, arguments) };
imports.wbg.__wbg_remove_7ddd90edbf0f641a = function(arg0) {
    getObject(arg0).remove();
};
imports.wbg.__wbg_signal_f51e3a3e000309e1 = function(arg0) {
    const ret = getObject(arg0).signal;
    return addHeapObject(ret);
};
imports.wbg.__wbg_new_e63d52e7716df424 = function() { return handleError(function () {
    const ret = new AbortController();
    return addHeapObject(ret);
}, arguments) };
imports.wbg.__wbg_abort_fc21064a02fb6dad = function(arg0) {
    getObject(arg0).abort();
};
imports.wbg.__wbg_setscrollRestoration_64168eed2e6b0382 = function() { return handleError(function (arg0, arg1) {
    getObject(arg0).scrollRestoration = takeObject(arg1);
}, arguments) };
imports.wbg.__wbg_replaceState_53b36e3f8c1341c1 = function() { return handleError(function (arg0, arg1, arg2, arg3, arg4, arg5) {
    var v0 = getCachedStringFromWasm0(arg2, arg3);
    var v1 = getCachedStringFromWasm0(arg4, arg5);
    getObject(arg0).replaceState(getObject(arg1), v0, v1);
}, arguments) };
imports.wbg.__wbg_charCode_c07e50875d746a56 = function(arg0) {
    const ret = getObject(arg0).charCode;
    return ret;
};
imports.wbg.__wbg_keyCode_15ab4cf0a03d1c06 = function(arg0) {
    const ret = getObject(arg0).keyCode;
    return ret;
};
imports.wbg.__wbg_altKey_d5019155384cdb12 = function(arg0) {
    const ret = getObject(arg0).altKey;
    return ret;
};
imports.wbg.__wbg_ctrlKey_4530e4ce8b727d5b = function(arg0) {
    const ret = getObject(arg0).ctrlKey;
    return ret;
};
imports.wbg.__wbg_shiftKey_85b0f1542b5da6bd = function(arg0) {
    const ret = getObject(arg0).shiftKey;
    return ret;
};
imports.wbg.__wbg_metaKey_d33b1a7b4af847f4 = function(arg0) {
    const ret = getObject(arg0).metaKey;
    return ret;
};
imports.wbg.__wbg_key_e340e265ee020ac5 = function(arg0, arg1) {
    const ret = getObject(arg1).key;
    const ptr1 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len1 = WASM_VECTOR_LEN;
    getInt32Memory0()[arg0 / 4 + 1] = len1;
    getInt32Memory0()[arg0 / 4 + 0] = ptr1;
};
imports.wbg.__wbg_code_03601b564d0df7dc = function(arg0, arg1) {
    const ret = getObject(arg1).code;
    const ptr1 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len1 = WASM_VECTOR_LEN;
    getInt32Memory0()[arg0 / 4 + 1] = len1;
    getInt32Memory0()[arg0 / 4 + 0] = ptr1;
};
imports.wbg.__wbg_getModifierState_2a5e4174277e3153 = function(arg0, arg1, arg2) {
    var v0 = getCachedStringFromWasm0(arg1, arg2);
    const ret = getObject(arg0).getModifierState(v0);
    return ret;
};
imports.wbg.__wbg_pathname_3b11fc41e4fc97e3 = function() { return handleError(function (arg0, arg1) {
    const ret = getObject(arg1).pathname;
    const ptr1 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len1 = WASM_VECTOR_LEN;
    getInt32Memory0()[arg0 / 4 + 1] = len1;
    getInt32Memory0()[arg0 / 4 + 0] = ptr1;
}, arguments) };
imports.wbg.__wbg_instanceof_Response_b1d8fb5649a38770 = function(arg0) {
    let result;
    try {
        result = getObject(arg0) instanceof Response;
    } catch {
        result = false;
    }
    const ret = result;
    return ret;
};
imports.wbg.__wbg_url_8e528fd65523cbe8 = function(arg0, arg1) {
    const ret = getObject(arg1).url;
    const ptr1 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len1 = WASM_VECTOR_LEN;
    getInt32Memory0()[arg0 / 4 + 1] = len1;
    getInt32Memory0()[arg0 / 4 + 0] = ptr1;
};
imports.wbg.__wbg_status_27590aae3bea771c = function(arg0) {
    const ret = getObject(arg0).status;
    return ret;
};
imports.wbg.__wbg_headers_f42dee5c0830a8b9 = function(arg0) {
    const ret = getObject(arg0).headers;
    return addHeapObject(ret);
};
imports.wbg.__wbg_arrayBuffer_8b744cc30bbf8d4d = function() { return handleError(function (arg0) {
    const ret = getObject(arg0).arrayBuffer();
    return addHeapObject(ret);
}, arguments) };
imports.wbg.__wbg_setProperty_66e3a889ea358430 = function() { return handleError(function (arg0, arg1, arg2, arg3, arg4) {
    var v0 = getCachedStringFromWasm0(arg1, arg2);
    var v1 = getCachedStringFromWasm0(arg3, arg4);
    getObject(arg0).setProperty(v0, v1);
}, arguments) };
imports.wbg.__wbg_target_303861d1c3271001 = function(arg0) {
    const ret = getObject(arg0).target;
    return isLikeNone(ret) ? 0 : addHeapObject(ret);
};
imports.wbg.__wbg_cancelBubble_38e6e6bc61c2b264 = function(arg0) {
    const ret = getObject(arg0).cancelBubble;
    return ret;
};
imports.wbg.__wbg_composedPath_a4e2347389be55ec = function(arg0) {
    const ret = getObject(arg0).composedPath();
    return addHeapObject(ret);
};
imports.wbg.__wbg_preventDefault_23c6bf1d0b02c67a = function(arg0) {
    getObject(arg0).preventDefault();
};
imports.wbg.__wbg_stopPropagation_11273514fa613c05 = function(arg0) {
    getObject(arg0).stopPropagation();
};
imports.wbg.__wbg_fetch_9757442297aa6820 = function(arg0, arg1) {
    const ret = getObject(arg0).fetch(getObject(arg1));
    return addHeapObject(ret);
};
imports.wbg.__wbg_get_e52aaca45f37b337 = function(arg0, arg1) {
    const ret = getObject(arg0)[arg1 >>> 0];
    return addHeapObject(ret);
};
imports.wbg.__wbg_length_070e3265c186df02 = function(arg0) {
    const ret = getObject(arg0).length;
    return ret;
};
imports.wbg.__wbg_new_18bc2084e9a3e1ff = function() {
    const ret = new Array();
    return addHeapObject(ret);
};
imports.wbg.__wbg_newnoargs_e643855c6572a4a8 = function(arg0, arg1) {
    var v0 = getCachedStringFromWasm0(arg0, arg1);
    const ret = new Function(v0);
    return addHeapObject(ret);
};
imports.wbg.__wbg_next_3975dcca26737a22 = function(arg0) {
    const ret = getObject(arg0).next;
    return addHeapObject(ret);
};
imports.wbg.__wbg_next_5a9700550e162aa3 = function() { return handleError(function (arg0) {
    const ret = getObject(arg0).next();
    return addHeapObject(ret);
}, arguments) };
imports.wbg.__wbg_done_a184612220756243 = function(arg0) {
    const ret = getObject(arg0).done;
    return ret;
};
imports.wbg.__wbg_value_6cc144c1d9645dd5 = function(arg0) {
    const ret = getObject(arg0).value;
    return addHeapObject(ret);
};
imports.wbg.__wbg_iterator_c1677479667ea090 = function() {
    const ret = Symbol.iterator;
    return addHeapObject(ret);
};
imports.wbg.__wbg_get_363c3b466fe4896b = function() { return handleError(function (arg0, arg1) {
    const ret = Reflect.get(getObject(arg0), getObject(arg1));
    return addHeapObject(ret);
}, arguments) };
imports.wbg.__wbg_call_f96b398515635514 = function() { return handleError(function (arg0, arg1) {
    const ret = getObject(arg0).call(getObject(arg1));
    return addHeapObject(ret);
}, arguments) };
imports.wbg.__wbg_new_7befa02319b36069 = function() {
    const ret = new Object();
    return addHeapObject(ret);
};
imports.wbg.__wbg_self_b9aad7f1c618bfaf = function() { return handleError(function () {
    const ret = self.self;
    return addHeapObject(ret);
}, arguments) };
imports.wbg.__wbg_window_55e469842c98b086 = function() { return handleError(function () {
    const ret = window.window;
    return addHeapObject(ret);
}, arguments) };
imports.wbg.__wbg_globalThis_d0957e302752547e = function() { return handleError(function () {
    const ret = globalThis.globalThis;
    return addHeapObject(ret);
}, arguments) };
imports.wbg.__wbg_global_ae2f87312b8987fb = function() { return handleError(function () {
    const ret = global.global;
    return addHeapObject(ret);
}, arguments) };
imports.wbg.__wbg_isArray_07d89ced8fb14171 = function(arg0) {
    const ret = Array.isArray(getObject(arg0));
    return ret;
};
imports.wbg.__wbg_of_96c3e114c6a55f7a = function(arg0) {
    const ret = Array.of(getObject(arg0));
    return addHeapObject(ret);
};
imports.wbg.__wbg_push_4c1f8265c2fdf115 = function(arg0, arg1) {
    const ret = getObject(arg0).push(getObject(arg1));
    return ret;
};
imports.wbg.__wbg_call_35782e9a1aa5e091 = function() { return handleError(function (arg0, arg1, arg2) {
    const ret = getObject(arg0).call(getObject(arg1), getObject(arg2));
    return addHeapObject(ret);
}, arguments) };
imports.wbg.__wbg_valueOf_31af888ed6bde64d = function(arg0) {
    const ret = getObject(arg0).valueOf();
    return ret;
};
imports.wbg.__wbg_is_92a0f96fd97f04e4 = function(arg0, arg1) {
    const ret = Object.is(getObject(arg0), getObject(arg1));
    return ret;
};
imports.wbg.__wbg_resolve_f3a7b38cd2af0fa4 = function(arg0) {
    const ret = Promise.resolve(getObject(arg0));
    return addHeapObject(ret);
};
imports.wbg.__wbg_then_65c9631eb0022205 = function(arg0, arg1) {
    const ret = getObject(arg0).then(getObject(arg1));
    return addHeapObject(ret);
};
imports.wbg.__wbg_then_cde1713a812adbda = function(arg0, arg1, arg2) {
    const ret = getObject(arg0).then(getObject(arg1), getObject(arg2));
    return addHeapObject(ret);
};
imports.wbg.__wbg_buffer_fcbfb6d88b2732e9 = function(arg0) {
    const ret = getObject(arg0).buffer;
    return addHeapObject(ret);
};
imports.wbg.__wbg_newwithbyteoffsetandlength_4b9a178def6e269f = function(arg0, arg1, arg2) {
    const ret = new Int8Array(getObject(arg0), arg1 >>> 0, arg2 >>> 0);
    return addHeapObject(ret);
};
imports.wbg.__wbg_newwithbyteoffsetandlength_208c7d466d312372 = function(arg0, arg1, arg2) {
    const ret = new Int16Array(getObject(arg0), arg1 >>> 0, arg2 >>> 0);
    return addHeapObject(ret);
};
imports.wbg.__wbg_newwithbyteoffsetandlength_57e32268d8647004 = function(arg0, arg1, arg2) {
    const ret = new Int32Array(getObject(arg0), arg1 >>> 0, arg2 >>> 0);
    return addHeapObject(ret);
};
imports.wbg.__wbg_newwithbyteoffsetandlength_92c251989c485785 = function(arg0, arg1, arg2) {
    const ret = new Uint8Array(getObject(arg0), arg1 >>> 0, arg2 >>> 0);
    return addHeapObject(ret);
};
imports.wbg.__wbg_new_bc5d9aad3f9ac80e = function(arg0) {
    const ret = new Uint8Array(getObject(arg0));
    return addHeapObject(ret);
};
imports.wbg.__wbg_set_4b3aa8445ac1e91c = function(arg0, arg1, arg2) {
    getObject(arg0).set(getObject(arg1), arg2 >>> 0);
};
imports.wbg.__wbg_length_d9c4ded7e708c6a1 = function(arg0) {
    const ret = getObject(arg0).length;
    return ret;
};
imports.wbg.__wbg_newwithbyteoffsetandlength_1499d1afb70451e0 = function(arg0, arg1, arg2) {
    const ret = new Uint16Array(getObject(arg0), arg1 >>> 0, arg2 >>> 0);
    return addHeapObject(ret);
};
imports.wbg.__wbg_newwithbyteoffsetandlength_e5274b3cd02a59d1 = function(arg0, arg1, arg2) {
    const ret = new Uint32Array(getObject(arg0), arg1 >>> 0, arg2 >>> 0);
    return addHeapObject(ret);
};
imports.wbg.__wbg_newwithbyteoffsetandlength_f1c6abafdfbe8b50 = function(arg0, arg1, arg2) {
    const ret = new Float32Array(getObject(arg0), arg1 >>> 0, arg2 >>> 0);
    return addHeapObject(ret);
};
imports.wbg.__wbg_newwithlength_89eca18f2603a999 = function(arg0) {
    const ret = new Uint8Array(arg0 >>> 0);
    return addHeapObject(ret);
};
imports.wbg.__wbg_subarray_7649d027b2b141b3 = function(arg0, arg1, arg2) {
    const ret = getObject(arg0).subarray(arg1 >>> 0, arg2 >>> 0);
    return addHeapObject(ret);
};
imports.wbg.__wbg_has_99783608c80c4a1d = function() { return handleError(function (arg0, arg1) {
    const ret = Reflect.has(getObject(arg0), getObject(arg1));
    return ret;
}, arguments) };
imports.wbg.__wbg_set_bc33b7c3be9319b5 = function() { return handleError(function (arg0, arg1, arg2) {
    const ret = Reflect.set(getObject(arg0), getObject(arg1), getObject(arg2));
    return ret;
}, arguments) };
imports.wbg.__wbg_stringify_9003c389758d16d4 = function() { return handleError(function (arg0) {
    const ret = JSON.stringify(getObject(arg0));
    return addHeapObject(ret);
}, arguments) };
imports.wbg.__wbindgen_debug_string = function(arg0, arg1) {
    const ret = debugString(getObject(arg1));
    const ptr1 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len1 = WASM_VECTOR_LEN;
    getInt32Memory0()[arg0 / 4 + 1] = len1;
    getInt32Memory0()[arg0 / 4 + 0] = ptr1;
};
imports.wbg.__wbindgen_throw = function(arg0, arg1) {
    throw new Error(getStringFromWasm0(arg0, arg1));
};
imports.wbg.__wbindgen_memory = function() {
    const ret = wasm.memory;
    return addHeapObject(ret);
};
imports.wbg.__wbindgen_closure_wrapper723 = function(arg0, arg1, arg2) {
    const ret = makeMutClosure(arg0, arg1, 159, __wbg_adapter_38);
    return addHeapObject(ret);
};
imports.wbg.__wbindgen_closure_wrapper724 = function(arg0, arg1, arg2) {
    const ret = makeMutClosure(arg0, arg1, 159, __wbg_adapter_41);
    return addHeapObject(ret);
};
imports.wbg.__wbindgen_closure_wrapper725 = function(arg0, arg1, arg2) {
    const ret = makeMutClosure(arg0, arg1, 159, __wbg_adapter_38);
    return addHeapObject(ret);
};
imports.wbg.__wbindgen_closure_wrapper728 = function(arg0, arg1, arg2) {
    const ret = makeMutClosure(arg0, arg1, 159, __wbg_adapter_38);
    return addHeapObject(ret);
};
imports.wbg.__wbindgen_closure_wrapper842 = function(arg0, arg1, arg2) {
    const ret = makeClosure(arg0, arg1, 220, __wbg_adapter_48);
    return addHeapObject(ret);
};
imports.wbg.__wbindgen_closure_wrapper843 = function(arg0, arg1, arg2) {
    const ret = makeMutClosure(arg0, arg1, 220, __wbg_adapter_51);
    return addHeapObject(ret);
};
imports.wbg.__wbindgen_closure_wrapper846 = function(arg0, arg1, arg2) {
    const ret = makeMutClosure(arg0, arg1, 220, __wbg_adapter_54);
    return addHeapObject(ret);
};
imports.wbg.__wbindgen_closure_wrapper1094 = function(arg0, arg1, arg2) {
    const ret = makeMutClosure(arg0, arg1, 326, __wbg_adapter_57);
    return addHeapObject(ret);
};
imports.wbg.__wbindgen_closure_wrapper1375 = function(arg0, arg1, arg2) {
    const ret = makeMutClosure(arg0, arg1, 434, __wbg_adapter_60);
    return addHeapObject(ret);
};
imports.wbg.__wbindgen_closure_wrapper1377 = function(arg0, arg1, arg2) {
    const ret = makeMutClosure(arg0, arg1, 434, __wbg_adapter_60);
    return addHeapObject(ret);
};
imports.wbg.__wbindgen_closure_wrapper1379 = function(arg0, arg1, arg2) {
    const ret = makeMutClosure(arg0, arg1, 434, __wbg_adapter_60);
    return addHeapObject(ret);
};
imports.wbg.__wbindgen_closure_wrapper1381 = function(arg0, arg1, arg2) {
    const ret = makeMutClosure(arg0, arg1, 434, __wbg_adapter_60);
    return addHeapObject(ret);
};
imports.wbg.__wbindgen_closure_wrapper1383 = function(arg0, arg1, arg2) {
    const ret = makeMutClosure(arg0, arg1, 434, __wbg_adapter_60);
    return addHeapObject(ret);
};
imports.wbg.__wbindgen_closure_wrapper1385 = function(arg0, arg1, arg2) {
    const ret = makeMutClosure(arg0, arg1, 434, __wbg_adapter_60);
    return addHeapObject(ret);
};
imports.wbg.__wbindgen_closure_wrapper1387 = function(arg0, arg1, arg2) {
    const ret = makeMutClosure(arg0, arg1, 434, __wbg_adapter_60);
    return addHeapObject(ret);
};
imports.wbg.__wbindgen_closure_wrapper1389 = function(arg0, arg1, arg2) {
    const ret = makeMutClosure(arg0, arg1, 434, __wbg_adapter_75);
    return addHeapObject(ret);
};
imports.wbg.__wbindgen_closure_wrapper1744 = function(arg0, arg1, arg2) {
    const ret = makeMutClosure(arg0, arg1, 563, __wbg_adapter_78);
    return addHeapObject(ret);
};
imports.wbg.__wbindgen_closure_wrapper2214 = function(arg0, arg1, arg2) {
    const ret = makeMutClosure(arg0, arg1, 663, __wbg_adapter_81);
    return addHeapObject(ret);
};

return imports;
}

function __wbg_init_memory(imports, maybe_memory) {

}

function __wbg_finalize_init(instance, module) {
    wasm = instance.exports;
    __wbg_init.__wbindgen_wasm_module = module;
    cachedFloat32Memory0 = null;
    cachedFloat64Memory0 = null;
    cachedInt32Memory0 = null;
    cachedUint32Memory0 = null;
    cachedUint8Memory0 = null;

    wasm.__wbindgen_start();
    return wasm;
}

function initSync(module) {
    if (wasm !== undefined) return wasm;

    const imports = __wbg_get_imports();

    __wbg_init_memory(imports);

    if (!(module instanceof WebAssembly.Module)) {
        module = new WebAssembly.Module(module);
    }

    const instance = new WebAssembly.Instance(module, imports);

    return __wbg_finalize_init(instance, module);
}

async function __wbg_init(input) {
    if (wasm !== undefined) return wasm;

    if (typeof input === 'undefined') {
        input = new URL('portfolio-c508563ba068c84b_bg.wasm', import.meta.url);
    }
    const imports = __wbg_get_imports();

    if (typeof input === 'string' || (typeof Request === 'function' && input instanceof Request) || (typeof URL === 'function' && input instanceof URL)) {
        input = fetch(input);
    }

    __wbg_init_memory(imports);

    const { instance, module } = await __wbg_load(await input, imports);

    return __wbg_finalize_init(instance, module);
}

export { initSync }
export default __wbg_init;
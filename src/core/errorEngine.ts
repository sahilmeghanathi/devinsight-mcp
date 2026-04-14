import { RegexCache } from "./errorCache.js";

type Confidence = "high" | "medium" | "low";

type ErrorInsight = {
  type: string;
  cause: string;
  fix: string;
  example?: string;
  confidence: Confidence;
};

// Create regex cache for performance optimization
const regexCache = new RegexCache();

// Optimized regex tester with caching
function testRegex(pattern: string, text: string, flags = "i"): boolean {
  return regexCache.compile(pattern, flags).test(text);
}

type ErrorRule = {
  id: string;
  priority: number;
  match: (error: string) => boolean;
  insight: ErrorInsight;
};

const errorRules: ErrorRule[] = [
  // ===============================================================
  // SECTION 1: CORE JAVASCRIPT TYPE ERRORS (Priority 1)
  // ===============================================================

  {
    id: "undefined_map",
    priority: 1,
    match: (e) =>
      testRegex("undefined.*\\.map|\\.map.*undefined|cannot read.*map.*of undefined", e),
    insight: {
      type: "TypeError",
      cause: "Calling .map() on undefined or null value",
      fix: "Ensure the array is defined before calling map",
      example: "users?.map(user => ...) || []",
      confidence: "high",
    },
  },

  {
    id: "null_map",
    priority: 1,
    match: (e) => testRegex("null.*\\.map|\\.map.*null|cannot read.*map.*of null", e),
    insight: {
      type: "TypeError",
      cause: "Calling .map() on null value",
      fix: "Add null check before mapping",
      example: "(data ?? []).map(item => ...)",
      confidence: "high",
    },
  },

  {
    id: "map_not_function",
    priority: 1,
    match: (e) => testRegex("\\.map is not a function|map is not a function", e),
    insight: {
      type: "TypeError",
      cause:
        "Calling .map() on a non-array value (object, string, number, etc.)",
      fix: "Ensure the variable is an array before using map",
      example: "Array.isArray(data) ? data.map(...) : []",
      confidence: "high",
    },
  },

  {
    id: "not_a_function",
    priority: 1,
    match: (e) =>
      testRegex("is not a function", e) && !testRegex("map is not a function", e),
    insight: {
      type: "TypeError",
      cause: "Attempting to call a value that is not a function",
      fix: "Verify the value is a function before calling",
      example: "typeof fn === 'function' && fn()",
      confidence: "high",
    },
  },

  {
    id: "cannot_read_property_of_undefined",
    priority: 1,
    match: (e) => testRegex("cannot read propert(y|ies) .* of undefined", e),
    insight: {
      type: "TypeError",
      cause: "Accessing a property on an undefined value",
      fix: "Use optional chaining or null checks",
      example: "obj?.property?.nested",
      confidence: "high",
    },
  },

  {
    id: "cannot_read_property_of_null",
    priority: 1,
    match: (e) => testRegex("cannot read propert(y|ies) .* of null", e),
    insight: {
      type: "TypeError",
      cause: "Accessing a property on a null value",
      fix: "Add null check before accessing property",
      example: "obj?.property ?? defaultValue",
      confidence: "high",
    },
  },

  {
    id: "cannot_set_property_of_undefined",
    priority: 1,
    match: (e) => testRegex("cannot set propert(y|ies) .* of undefined", e),
    insight: {
      type: "TypeError",
      cause: "Setting a property on an undefined object",
      fix: "Initialize the object before setting properties",
      example: "obj = obj || {}; obj.prop = value;",
      confidence: "high",
    },
  },

  {
    id: "cannot_set_property_of_null",
    priority: 1,
    match: (e) => testRegex("cannot set propert(y|ies) .* of null", e),
    insight: {
      type: "TypeError",
      cause: "Setting a property on a null object",
      fix: "Ensure object is not null before assignment",
      example: "if (obj !== null) obj.prop = value;",
      confidence: "high",
    },
  },

  {
    id: "undefined_variable",
    priority: 1,
    match: (e) =>
      testRegex("(\\w+) is not defined", e) &&
      !testRegex("process is not defined|window is not defined|document is not defined|global is not defined", e),
    insight: {
      type: "ReferenceError",
      cause: "Using a variable that has not been declared",
      fix: "Declare the variable or check for typos in variable name",
      example: "let myVariable = value; // or check spelling",
      confidence: "high",
    },
  },

  {
    id: "assignment_to_constant",
    priority: 1,
    match: (e) =>
      testRegex("assignment to constant variable|cannot assign to .* because it is a constant", e),
    insight: {
      type: "TypeError",
      cause: "Attempting to reassign a const variable",
      fix: "Use let instead of const if reassignment is needed",
      example: "let count = 0; count = 1;",
      confidence: "high",
    },
  },

  {
    id: "readonly_property",
    priority: 1,
    match: (e) =>
      testRegex("cannot assign to read only property|cannot set property .* which has only a getter", e),
    insight: {
      type: "TypeError",
      cause: "Attempting to modify a read-only property",
      fix: "Create a new object with the modified property instead",
      example: "const newObj = { ...obj, prop: newValue };",
      confidence: "high",
    },
  },

  // ===============================================================
  // SECTION 2: ARRAY METHODS ERRORS
  // ===============================================================

  {
    id: "filter_not_function",
    priority: 1,
    match: (e) => /\.filter is not a function|filter is not a function/.test(e),
    insight: {
      type: "TypeError",
      cause: "Calling .filter() on a non-array value",
      fix: "Ensure the variable is an array",
      example: "Array.isArray(data) ? data.filter(...) : []",
      confidence: "high",
    },
  },

  {
    id: "reduce_not_function",
    priority: 1,
    match: (e) => /\.reduce is not a function|reduce is not a function/.test(e),
    insight: {
      type: "TypeError",
      cause: "Calling .reduce() on a non-array value",
      fix: "Ensure the variable is an array",
      example: "Array.isArray(data) ? data.reduce(...) : defaultValue",
      confidence: "high",
    },
  },

  {
    id: "reduce_empty_array",
    priority: 1,
    match: (e) => /reduce of empty array with no initial value/.test(e),
    insight: {
      type: "TypeError",
      cause: "Calling .reduce() on empty array without initial value",
      fix: "Provide an initial value as second argument",
      example: "arr.reduce((acc, item) => acc + item, 0)",
      confidence: "high",
    },
  },

  {
    id: "find_not_function",
    priority: 1,
    match: (e) => /\.find is not a function|find is not a function/.test(e),
    insight: {
      type: "TypeError",
      cause: "Calling .find() on a non-array value",
      fix: "Ensure the variable is an array",
      example: "Array.isArray(data) ? data.find(...) : undefined",
      confidence: "high",
    },
  },

  {
    id: "foreach_not_function",
    priority: 1,
    match: (e) =>
      /\.forEach is not a function|forEach is not a function/.test(e),
    insight: {
      type: "TypeError",
      cause: "Calling .forEach() on a non-array value",
      fix: "Ensure the variable is an array or iterable",
      example: "Array.isArray(data) && data.forEach(...)",
      confidence: "high",
    },
  },

  {
    id: "some_not_function",
    priority: 1,
    match: (e) => /\.some is not a function|some is not a function/.test(e),
    insight: {
      type: "TypeError",
      cause: "Calling .some() on a non-array value",
      fix: "Ensure the variable is an array",
      example: "Array.isArray(data) ? data.some(...) : false",
      confidence: "high",
    },
  },

  {
    id: "every_not_function",
    priority: 1,
    match: (e) => /\.every is not a function|every is not a function/.test(e),
    insight: {
      type: "TypeError",
      cause: "Calling .every() on a non-array value",
      fix: "Ensure the variable is an array",
      example: "Array.isArray(data) ? data.every(...) : true",
      confidence: "high",
    },
  },

  {
    id: "includes_not_function",
    priority: 1,
    match: (e) =>
      /\.includes is not a function|includes is not a function/.test(e),
    insight: {
      type: "TypeError",
      cause: "Calling .includes() on a value that doesn't support it",
      fix: "Ensure the variable is an array or string",
      example: "(arr || []).includes(value)",
      confidence: "high",
    },
  },

  {
    id: "flat_not_function",
    priority: 1,
    match: (e) => /\.flat is not a function|flat is not a function/.test(e),
    insight: {
      type: "TypeError",
      cause: "Calling .flat() on a non-array or in unsupported environment",
      fix: "Ensure the variable is an array and environment supports .flat()",
      example: "Array.isArray(data) ? data.flat() : data",
      confidence: "high",
    },
  },

  {
    id: "flatmap_not_function",
    priority: 1,
    match: (e) =>
      /\.flatMap is not a function|flatMap is not a function/.test(e),
    insight: {
      type: "TypeError",
      cause: "Calling .flatMap() on a non-array or in unsupported environment",
      fix: "Use .map().flat() as alternative or polyfill",
      example: "data.map(fn).flat()",
      confidence: "high",
    },
  },

  {
    id: "sort_not_function",
    priority: 1,
    match: (e) => /\.sort is not a function|sort is not a function/.test(e),
    insight: {
      type: "TypeError",
      cause: "Calling .sort() on a non-array value",
      fix: "Ensure the variable is an array",
      example: "Array.isArray(data) ? [...data].sort() : []",
      confidence: "high",
    },
  },

  {
    id: "splice_not_function",
    priority: 1,
    match: (e) => /\.splice is not a function|splice is not a function/.test(e),
    insight: {
      type: "TypeError",
      cause: "Calling .splice() on a non-array value",
      fix: "Ensure the variable is an array",
      example: "Array.isArray(data) && data.splice(...)",
      confidence: "high",
    },
  },

  {
    id: "push_not_function",
    priority: 1,
    match: (e) => /\.push is not a function|push is not a function/.test(e),
    insight: {
      type: "TypeError",
      cause: "Calling .push() on a non-array value",
      fix: "Ensure the variable is an array",
      example: "Array.isArray(data) && data.push(item)",
      confidence: "high",
    },
  },

  {
    id: "pop_not_function",
    priority: 1,
    match: (e) => /\.pop is not a function|pop is not a function/.test(e),
    insight: {
      type: "TypeError",
      cause: "Calling .pop() on a non-array value",
      fix: "Ensure the variable is an array",
      example: "Array.isArray(data) ? data.pop() : undefined",
      confidence: "high",
    },
  },

  {
    id: "shift_not_function",
    priority: 1,
    match: (e) => /\.shift is not a function|shift is not a function/.test(e),
    insight: {
      type: "TypeError",
      cause: "Calling .shift() on a non-array value",
      fix: "Ensure the variable is an array",
      example: "Array.isArray(data) ? data.shift() : undefined",
      confidence: "high",
    },
  },

  {
    id: "unshift_not_function",
    priority: 1,
    match: (e) =>
      /\.unshift is not a function|unshift is not a function/.test(e),
    insight: {
      type: "TypeError",
      cause: "Calling .unshift() on a non-array value",
      fix: "Ensure the variable is an array",
      example: "Array.isArray(data) && data.unshift(item)",
      confidence: "high",
    },
  },

  {
    id: "concat_not_function",
    priority: 1,
    match: (e) => /\.concat is not a function|concat is not a function/.test(e),
    insight: {
      type: "TypeError",
      cause: "Calling .concat() on a non-array value",
      fix: "Ensure the variable is an array",
      example: "(arr || []).concat(other)",
      confidence: "high",
    },
  },

  {
    id: "slice_not_function",
    priority: 1,
    match: (e) => /\.slice is not a function|slice is not a function/.test(e),
    insight: {
      type: "TypeError",
      cause: "Calling .slice() on a value that doesn't support it",
      fix: "Ensure the variable is an array or string",
      example: "(data || []).slice(0, 10)",
      confidence: "high",
    },
  },

  {
    id: "indexof_not_function",
    priority: 1,
    match: (e) =>
      /\.indexOf is not a function|indexOf is not a function/.test(e),
    insight: {
      type: "TypeError",
      cause: "Calling .indexOf() on a value that doesn't support it",
      fix: "Ensure the variable is an array or string",
      example: "(data || []).indexOf(item)",
      confidence: "high",
    },
  },

  {
    id: "join_not_function",
    priority: 1,
    match: (e) => /\.join is not a function|join is not a function/.test(e),
    insight: {
      type: "TypeError",
      cause: "Calling .join() on a non-array value",
      fix: "Ensure the variable is an array",
      example: "(arr || []).join(', ')",
      confidence: "high",
    },
  },

  {
    id: "reverse_not_function",
    priority: 1,
    match: (e) =>
      /\.reverse is not a function|reverse is not a function/.test(e),
    insight: {
      type: "TypeError",
      cause: "Calling .reverse() on a non-array value",
      fix: "Ensure the variable is an array",
      example: "[...arr].reverse()",
      confidence: "high",
    },
  },

  {
    id: "fill_not_function",
    priority: 1,
    match: (e) => /\.fill is not a function|fill is not a function/.test(e),
    insight: {
      type: "TypeError",
      cause: "Calling .fill() on a non-array value",
      fix: "Ensure the variable is an array",
      example: "new Array(10).fill(0)",
      confidence: "high",
    },
  },

  {
    id: "length_undefined",
    priority: 1,
    match: (e) =>
      /cannot read propert(y|ies) ['"]?length['"]? of (undefined|null)/.test(e),
    insight: {
      type: "TypeError",
      cause: "Accessing .length on undefined or null",
      fix: "Ensure variable exists before accessing length",
      example: "arr?.length ?? 0",
      confidence: "high",
    },
  },

  {
    id: "iterator_not_function",
    priority: 1,
    match: (e) =>
      /is not iterable|symbol\.iterator.*is not a function|cannot iterate/.test(
        e,
      ),
    insight: {
      type: "TypeError",
      cause: "Trying to iterate over a non-iterable value",
      fix: "Ensure the value is iterable (array, string, Set, Map, etc.)",
      example: "for (const item of Array.from(data)) { ... }",
      confidence: "high",
    },
  },

  {
    id: "spread_non_iterable",
    priority: 1,
    match: (e) => /spread a non-iterable|object is not iterable/.test(e),
    insight: {
      type: "TypeError",
      cause: "Using spread operator on non-iterable value",
      fix: "Ensure the value is iterable before spreading",
      example: "[...(arr || [])]",
      confidence: "high",
    },
  },

  // ===============================================================
  // SECTION 3: STRING METHODS ERRORS
  // ===============================================================

  {
    id: "split_not_function",
    priority: 1,
    match: (e) => /\.split is not a function|split is not a function/.test(e),
    insight: {
      type: "TypeError",
      cause: "Calling .split() on a non-string value",
      fix: "Ensure the variable is a string",
      example: "String(value).split(',')",
      confidence: "high",
    },
  },

  {
    id: "trim_not_function",
    priority: 1,
    match: (e) => /\.trim is not a function|trim is not a function/.test(e),
    insight: {
      type: "TypeError",
      cause: "Calling .trim() on a non-string value",
      fix: "Ensure the variable is a string",
      example: "(str || '').trim()",
      confidence: "high",
    },
  },

  {
    id: "tolowercase_not_function",
    priority: 1,
    match: (e) =>
      /\.toLowerCase is not a function|toLowerCase is not a function/.test(e),
    insight: {
      type: "TypeError",
      cause: "Calling .toLowerCase() on a non-string value",
      fix: "Ensure the variable is a string",
      example: "String(value).toLowerCase()",
      confidence: "high",
    },
  },

  {
    id: "touppercase_not_function",
    priority: 1,
    match: (e) =>
      /\.toUpperCase is not a function|toUpperCase is not a function/.test(e),
    insight: {
      type: "TypeError",
      cause: "Calling .toUpperCase() on a non-string value",
      fix: "Ensure the variable is a string",
      example: "String(value).toUpperCase()",
      confidence: "high",
    },
  },

  {
    id: "replace_not_function",
    priority: 1,
    match: (e) =>
      /\.replace is not a function|replace is not a function/.test(e),
    insight: {
      type: "TypeError",
      cause: "Calling .replace() on a non-string value",
      fix: "Ensure the variable is a string",
      example: "(str || '').replace(pattern, replacement)",
      confidence: "high",
    },
  },

  {
    id: "replaceall_not_function",
    priority: 1,
    match: (e) =>
      /\.replaceAll is not a function|replaceAll is not a function/.test(e),
    insight: {
      type: "TypeError",
      cause: "Calling .replaceAll() on non-string or unsupported environment",
      fix: "Use .replace() with global regex or polyfill",
      example: "str.replace(/pattern/g, replacement)",
      confidence: "high",
    },
  },

  {
    id: "match_not_function",
    priority: 1,
    match: (e) => /\.match is not a function/.test(e),
    insight: {
      type: "TypeError",
      cause: "Calling .match() on a non-string value",
      fix: "Ensure the variable is a string",
      example: "(str || '').match(pattern)",
      confidence: "high",
    },
  },

  {
    id: "startswith_not_function",
    priority: 1,
    match: (e) =>
      /\.startsWith is not a function|startsWith is not a function/.test(e),
    insight: {
      type: "TypeError",
      cause: "Calling .startsWith() on a non-string value",
      fix: "Ensure the variable is a string",
      example: "(str || '').startsWith(prefix)",
      confidence: "high",
    },
  },

  {
    id: "endswith_not_function",
    priority: 1,
    match: (e) =>
      /\.endsWith is not a function|endsWith is not a function/.test(e),
    insight: {
      type: "TypeError",
      cause: "Calling .endsWith() on a non-string value",
      fix: "Ensure the variable is a string",
      example: "(str || '').endsWith(suffix)",
      confidence: "high",
    },
  },

  {
    id: "padstart_not_function",
    priority: 1,
    match: (e) =>
      /\.padStart is not a function|padStart is not a function/.test(e),
    insight: {
      type: "TypeError",
      cause: "Calling .padStart() on a non-string value",
      fix: "Ensure the variable is a string",
      example: "String(value).padStart(2, '0')",
      confidence: "high",
    },
  },

  {
    id: "padend_not_function",
    priority: 1,
    match: (e) => /\.padEnd is not a function|padEnd is not a function/.test(e),
    insight: {
      type: "TypeError",
      cause: "Calling .padEnd() on a non-string value",
      fix: "Ensure the variable is a string",
      example: "String(value).padEnd(10, ' ')",
      confidence: "high",
    },
  },

  {
    id: "charat_not_function",
    priority: 1,
    match: (e) => /\.charAt is not a function|charAt is not a function/.test(e),
    insight: {
      type: "TypeError",
      cause: "Calling .charAt() on a non-string value",
      fix: "Ensure the variable is a string",
      example: "(str || '').charAt(0)",
      confidence: "high",
    },
  },

  {
    id: "charcodeat_not_function",
    priority: 1,
    match: (e) =>
      /\.charCodeAt is not a function|charCodeAt is not a function/.test(e),
    insight: {
      type: "TypeError",
      cause: "Calling .charCodeAt() on a non-string value",
      fix: "Ensure the variable is a string",
      example: "(str || '').charCodeAt(0)",
      confidence: "high",
    },
  },

  {
    id: "substring_not_function",
    priority: 1,
    match: (e) =>
      /\.substring is not a function|substring is not a function/.test(e),
    insight: {
      type: "TypeError",
      cause: "Calling .substring() on a non-string value",
      fix: "Ensure the variable is a string",
      example: "(str || '').substring(0, 10)",
      confidence: "high",
    },
  },

  {
    id: "substr_not_function",
    priority: 1,
    match: (e) => /\.substr is not a function|substr is not a function/.test(e),
    insight: {
      type: "TypeError",
      cause: "Calling .substr() on a non-string value",
      fix: "Use .slice() or .substring() instead (substr is deprecated)",
      example: "str.slice(start, start + length)",
      confidence: "high",
    },
  },

  {
    id: "normalize_not_function",
    priority: 2,
    match: (e) =>
      /\.normalize is not a function|normalize is not a function/.test(e),
    insight: {
      type: "TypeError",
      cause: "Calling .normalize() on a non-string value",
      fix: "Ensure the variable is a string",
      example: "(str || '').normalize('NFD')",
      confidence: "high",
    },
  },

  {
    id: "localecompare_not_function",
    priority: 2,
    match: (e) =>
      /\.localeCompare is not a function|localeCompare is not a function/.test(
        e,
      ),
    insight: {
      type: "TypeError",
      cause: "Calling .localeCompare() on a non-string value",
      fix: "Ensure the variable is a string",
      example: "(str || '').localeCompare(other)",
      confidence: "high",
    },
  },

  // ===============================================================
  // SECTION 4: OBJECT METHODS ERRORS
  // ===============================================================

  {
    id: "object_keys_non_object",
    priority: 1,
    match: (e) =>
      /cannot convert (undefined|null) to object|object\.keys.*null|object\.keys.*undefined/.test(
        e,
      ),
    insight: {
      type: "TypeError",
      cause: "Calling Object.keys/values/entries on null or undefined",
      fix: "Add null check before calling",
      example: "Object.keys(obj || {})",
      confidence: "high",
    },
  },

  {
    id: "object_assign_non_object",
    priority: 1,
    match: (e) =>
      /cannot convert .* to object|object\.assign.*null|target is not an object/.test(
        e,
      ),
    insight: {
      type: "TypeError",
      cause: "Object.assign target is null or undefined",
      fix: "Ensure target is an object",
      example: "Object.assign({}, source)",
      confidence: "high",
    },
  },

  {
    id: "destructure_undefined",
    priority: 1,
    match: (e) => /cannot destructure propert(y|ies)/.test(e),
    insight: {
      type: "TypeError",
      cause: "Destructuring from undefined or null",
      fix: "Provide a fallback object",
      example: "const { a, b } = obj || {}",
      confidence: "high",
    },
  },

  {
    id: "hasownproperty_not_function",
    priority: 1,
    match: (e) =>
      /\.hasOwnProperty is not a function|hasOwnProperty is not a function/.test(
        e,
      ),
    insight: {
      type: "TypeError",
      cause:
        "Calling .hasOwnProperty() on null/undefined or object without prototype",
      fix: "Use Object.prototype.hasOwnProperty.call or Object.hasOwn",
      example: "Object.hasOwn(obj, 'prop')",
      confidence: "high",
    },
  },

  {
    id: "tostring_not_function",
    priority: 2,
    match: (e) => /\.toString is not a function|cannot read.*toString/.test(e),
    insight: {
      type: "TypeError",
      cause: "Calling .toString() on null or undefined",
      fix: "Add null check or use String()",
      example: "String(value)",
      confidence: "high",
    },
  },

  {
    id: "valueof_not_function",
    priority: 2,
    match: (e) => /\.valueOf is not a function/.test(e),
    insight: {
      type: "TypeError",
      cause: "Calling .valueOf() on null or undefined",
      fix: "Add null check before calling",
      example: "value != null && value.valueOf()",
      confidence: "high",
    },
  },

  {
    id: "freeze_non_object",
    priority: 2,
    match: (e) => /object\.freeze.*is not an object/.test(e),
    insight: {
      type: "TypeError",
      cause: "Object.freeze called on non-object (in strict mode)",
      fix: "Ensure argument is an object",
      example: "Object.freeze(obj || {})",
      confidence: "high",
    },
  },

  {
    id: "seal_non_object",
    priority: 2,
    match: (e) => /object\.seal.*is not an object/.test(e),
    insight: {
      type: "TypeError",
      cause: "Object.seal called on non-object",
      fix: "Ensure argument is an object",
      example: "if (obj) Object.seal(obj)",
      confidence: "high",
    },
  },

  {
    id: "defineproperty_non_object",
    priority: 2,
    match: (e) => /object\.definepropert(y|ies).*is not an object/.test(e),
    insight: {
      type: "TypeError",
      cause: "Object.defineProperty called on non-object",
      fix: "Ensure target is an object",
      example: "if (obj && typeof obj === 'object') Object.defineProperty(...)",
      confidence: "high",
    },
  },

  {
    id: "getprototypeof_non_object",
    priority: 2,
    match: (e) => /object\.getprototypeof.*is not an object/.test(e),
    insight: {
      type: "TypeError",
      cause: "Object.getPrototypeOf called on null or undefined",
      fix: "Ensure argument is an object",
      example: "obj != null && Object.getPrototypeOf(obj)",
      confidence: "high",
    },
  },

  // ===============================================================
  // SECTION 5: NUMBER/MATH ERRORS
  // ===============================================================

  {
    id: "nan_error",
    priority: 2,
    match: (e) => /\bnan\b|not a number/.test(e),
    insight: {
      type: "TypeError",
      cause: "Invalid numeric operation resulting in NaN",
      fix: "Validate numeric inputs and handle edge cases",
      example: "Number.isNaN(value) ? 0 : value",
      confidence: "medium",
    },
  },

  {
    id: "infinity_error",
    priority: 2,
    match: (e) => /infinity|division by zero/.test(e),
    insight: {
      type: "RangeError",
      cause: "Division by zero or overflow resulting in Infinity",
      fix: "Check for zero divisor or use Number.isFinite",
      example: "divisor !== 0 ? num / divisor : 0",
      confidence: "medium",
    },
  },

  {
    id: "tofixed_not_function",
    priority: 1,
    match: (e) =>
      /\.toFixed is not a function|toFixed is not a function/.test(e),
    insight: {
      type: "TypeError",
      cause: "Calling .toFixed() on a non-number value",
      fix: "Ensure the variable is a number",
      example: "Number(value).toFixed(2)",
      confidence: "high",
    },
  },

  {
    id: "toprecision_not_function",
    priority: 1,
    match: (e) =>
      /\.toPrecision is not a function|toPrecision is not a function/.test(e),
    insight: {
      type: "TypeError",
      cause: "Calling .toPrecision() on a non-number value",
      fix: "Ensure the variable is a number",
      example: "Number(value).toPrecision(4)",
      confidence: "high",
    },
  },

  {
    id: "toexponential_not_function",
    priority: 2,
    match: (e) =>
      /\.toExponential is not a function|toExponential is not a function/.test(
        e,
      ),
    insight: {
      type: "TypeError",
      cause: "Calling .toExponential() on a non-number value",
      fix: "Ensure the variable is a number",
      example: "Number(value).toExponential()",
      confidence: "high",
    },
  },

  {
    id: "precision_range",
    priority: 2,
    match: (e) =>
      /toFixed.*digits argument|precision.*out of range|tofixed.*digits/.test(
        e,
      ),
    insight: {
      type: "RangeError",
      cause: "toFixed/toPrecision argument out of valid range (0-100)",
      fix: "Use a valid precision between 0 and 100",
      example: "num.toFixed(Math.min(Math.max(digits, 0), 100))",
      confidence: "high",
    },
  },

  {
    id: "radix_range",
    priority: 2,
    match: (e) => /radix.*out of range|tostring.*radix/.test(e),
    insight: {
      type: "RangeError",
      cause: "toString radix argument out of range (2-36)",
      fix: "Use a valid radix between 2 and 36",
      example: "num.toString(16) // valid hexadecimal",
      confidence: "high",
    },
  },

  {
    id: "invalid_array_length",
    priority: 1,
    match: (e) => /invalid array length/.test(e),
    insight: {
      type: "RangeError",
      cause: "Array created with negative or invalid length",
      fix: "Ensure array length is a non-negative integer",
      example: "new Array(Math.max(0, Math.floor(length)))",
      confidence: "high",
    },
  },

  {
    id: "invalid_string_length",
    priority: 1,
    match: (e) => /invalid string length/.test(e),
    insight: {
      type: "RangeError",
      cause: "String operation exceeds maximum length",
      fix: "Limit string operations to prevent overflow",
      example: "str.repeat(Math.min(count, 10000))",
      confidence: "high",
    },
  },

  {
    id: "bigint_conversion",
    priority: 2,
    match: (e) => /cannot convert .* to a bigint|cannot mix bigint/.test(e),
    insight: {
      type: "TypeError",
      cause: "Invalid BigInt conversion or mixing BigInt with Number",
      fix: "Convert explicitly and don't mix types",
      example: "BigInt(Math.floor(num)) + BigInt(other)",
      confidence: "high",
    },
  },

  // ===============================================================
  // SECTION 6: JSON PARSING ERRORS
  // ===============================================================

  {
    id: "json_parse_unexpected_token",
    priority: 1,
    match: (e) =>
      /(unexpected token|unexpected.*in json|json\.parse|json parse)/.test(e) &&
      /json|parse/.test(e),
    insight: {
      type: "SyntaxError",
      cause: "Invalid JSON string - unexpected character found",
      fix: "Validate JSON format before parsing",
      example: "try { JSON.parse(str) } catch (e) { /* handle */ }",
      confidence: "high",
    },
  },

  {
    id: "json_parse_unexpected_end",
    priority: 1,
    match: (e) => /unexpected end of json|unterminated string/.test(e),
    insight: {
      type: "SyntaxError",
      cause: "Incomplete or truncated JSON string",
      fix: "Ensure JSON string is complete",
      example: "Validate JSON is not truncated before parsing",
      confidence: "high",
    },
  },

  {
    id: "json_circular",
    priority: 1,
    match: (e) => /circular|cyclic|converting circular structure/.test(e),
    insight: {
      type: "TypeError",
      cause: "JSON.stringify called on object with circular references",
      fix: "Remove circular references or use a replacer function",
      example: "JSON.stringify(obj, getCircularReplacer())",
      confidence: "high",
    },
  },

  {
    id: "json_bigint",
    priority: 2,
    match: (e) => /bigint.*json|do not know how to serialize a bigint/.test(e),
    insight: {
      type: "TypeError",
      cause: "JSON.stringify cannot serialize BigInt values",
      fix: "Convert BigInt to string or number before serializing",
      example:
        "JSON.stringify(obj, (k, v) => typeof v === 'bigint' ? v.toString() : v)",
      confidence: "high",
    },
  },

  {
    id: "json_undefined",
    priority: 2,
    match: (e) => /json\.parse.*undefined|cannot read.*json.*undefined/.test(e),
    insight: {
      type: "SyntaxError",
      cause: "Attempting to parse undefined as JSON",
      fix: "Check value exists before parsing",
      example: "data ? JSON.parse(data) : defaultValue",
      confidence: "high",
    },
  },

  // ===============================================================
  // SECTION 7: DATE ERRORS
  // ===============================================================

  {
    id: "invalid_date",
    priority: 2,
    match: (e) => /invalid date|invalid time/.test(e),
    insight: {
      type: "RangeError",
      cause: "Invalid date string or date parameters",
      fix: "Validate date input before creating Date object",
      example: "const d = new Date(str); if (!isNaN(d.getTime())) { ... }",
      confidence: "high",
    },
  },

  {
    id: "date_method_not_function",
    priority: 1,
    match: (e) =>
      /\.(getTime|getDate|getMonth|getFullYear|getHours|getMinutes|getSeconds|toISOString|toDateString|toLocaleDateString) is not a function/.test(
        e,
      ),
    insight: {
      type: "TypeError",
      cause: "Calling Date method on a non-Date value",
      fix: "Ensure the variable is a valid Date object",
      example: "const date = new Date(value); if (!isNaN(date)) date.getTime()",
      confidence: "high",
    },
  },

  {
    id: "date_toisostring_invalid",
    priority: 2,
    match: (e) => /invalid date.*toisostring|toisostring.*invalid date/.test(e),
    insight: {
      type: "RangeError",
      cause: "Calling toISOString on invalid Date",
      fix: "Validate date before converting",
      example: "isNaN(date.getTime()) ? null : date.toISOString()",
      confidence: "high",
    },
  },

  // ===============================================================
  // SECTION 8: REGEX ERRORS
  // ===============================================================

  {
    id: "invalid_regex",
    priority: 1,
    match: (e) =>
      /invalid regular expression|unterminated group|invalid group|nothing to repeat/.test(
        e,
      ),
    insight: {
      type: "SyntaxError",
      cause: "Invalid regular expression pattern",
      fix: "Check regex syntax and escape special characters",
      example: "new RegExp(str.replace(/[.*+?^${}()|[\\]\\\\]/g, '\\\\$&'))",
      confidence: "high",
    },
  },

  {
    id: "regex_too_complex",
    priority: 2,
    match: (e) =>
      /regular expression too large|regex.*stack overflow|catastrophic backtracking/.test(
        e,
      ),
    insight: {
      type: "RangeError",
      cause: "Regex pattern too complex causing performance issues",
      fix: "Simplify regex pattern or split into multiple patterns",
      example: "Use atomic groups or possessive quantifiers",
      confidence: "medium",
    },
  },

  {
    id: "regex_exec_non_string",
    priority: 2,
    match: (e) => /\.exec is not a function|\.test is not a function/.test(e),
    insight: {
      type: "TypeError",
      cause: "Calling exec/test on non-RegExp value",
      fix: "Ensure variable is a RegExp",
      example: "if (pattern instanceof RegExp) pattern.test(str)",
      confidence: "high",
    },
  },

  {
    id: "regex_flags_invalid",
    priority: 2,
    match: (e) => /invalid flags|invalid regular expression flags/.test(e),
    insight: {
      type: "SyntaxError",
      cause: "Invalid regex flags provided",
      fix: "Use valid flags: g, i, m, s, u, y",
      example: "new RegExp(pattern, 'gi')",
      confidence: "high",
    },
  },

  // ===============================================================
  // SECTION 9: ASYNC/PROMISE ERRORS
  // ===============================================================

  {
    id: "promise_rejection_unhandled",
    priority: 1,
    match: (e) => /unhandled promise rejection|unhandledrejection/.test(e),
    insight: {
      type: "UnhandledPromiseRejection",
      cause: "Promise rejected without a catch handler",
      fix: "Add .catch() or try/catch with async/await",
      example: "await asyncFn().catch(err => handleError(err))",
      confidence: "high",
    },
  },

  {
    id: "await_non_async",
    priority: 1,
    match: (e) =>
      /await is only valid in async function|unexpected.*await/.test(e),
    insight: {
      type: "SyntaxError",
      cause: "Using await outside of async function",
      fix: "Wrap code in async function or use .then()",
      example: "async function fn() { await promise; }",
      confidence: "high",
    },
  },

  {
    id: "promise_already_resolved",
    priority: 2,
    match: (e) => /promise.*already.*resolved|resolve.*pending promise/.test(e),
    insight: {
      type: "TypeError",
      cause: "Attempting to resolve/reject already settled promise",
      fix: "Ensure promise is only resolved/rejected once",
      example: "Track promise state before resolving",
      confidence: "medium",
    },
  },

  {
    id: "then_not_function",
    priority: 1,
    match: (e) => /\.then is not a function|then is not a function/.test(e),
    insight: {
      type: "TypeError",
      cause: "Calling .then() on a non-Promise value",
      fix: "Ensure the value is a Promise",
      example: "Promise.resolve(value).then(...)",
      confidence: "high",
    },
  },

  {
    id: "catch_not_function",
    priority: 1,
    match: (e) => /\.catch is not a function|catch is not a function/.test(e),
    insight: {
      type: "TypeError",
      cause: "Calling .catch() on a non-Promise value",
      fix: "Ensure the value is a Promise",
      example: "Promise.resolve(value).catch(...)",
      confidence: "high",
    },
  },

  {
    id: "finally_not_function",
    priority: 2,
    match: (e) =>
      /\.finally is not a function|finally is not a function/.test(e),
    insight: {
      type: "TypeError",
      cause: "Calling .finally() on non-Promise or unsupported environment",
      fix: "Polyfill .finally() or use .then(fn, fn)",
      example: "promise.then(fn).catch(fn)",
      confidence: "high",
    },
  },

  {
    id: "promise_all_non_iterable",
    priority: 1,
    match: (e) =>
      /promise\.all.*is not iterable|argument.*is not iterable/.test(e),
    insight: {
      type: "TypeError",
      cause: "Promise.all/race/allSettled called with non-iterable",
      fix: "Pass an array of promises",
      example: "Promise.all([promise1, promise2])",
      confidence: "high",
    },
  },

  {
    id: "async_generator_error",
    priority: 2,
    match: (e) =>
      /async generator|asynciterator|for await.*of.*not async iterable/.test(e),
    insight: {
      type: "TypeError",
      cause: "Invalid async iteration or generator usage",
      fix: "Ensure target is async iterable for await...of",
      example: "for await (const item of asyncIterable) { ... }",
      confidence: "medium",
    },
  },

  // ===============================================================
  // SECTION 10: NETWORK/FETCH ERRORS
  // ===============================================================

  {
    id: "fetch_failed",
    priority: 1,
    match: (e) =>
      /failed to fetch|fetch.*failed|networkerror when attempting to fetch/.test(
        e,
      ),
    insight: {
      type: "NetworkError",
      cause: "Network request failed - server unreachable or offline",
      fix: "Check network connection, server status, and URL",
      example: "fetch(url).catch(err => handleNetworkError(err))",
      confidence: "medium",
    },
  },

  {
    id: "cors_error",
    priority: 1,
    match: (e) =>
      /cors|cross-origin|access-control-allow-origin|blocked by cors policy/.test(
        e,
      ),
    insight: {
      type: "CORSError",
      cause: "Cross-origin request blocked by browser",
      fix: "Configure CORS headers on server or use proxy",
      example: "app.use(cors()) // Express",
      confidence: "high",
    },
  },

  {
    id: "mixed_content",
    priority: 1,
    match: (e) => /mixed content|https.*http|blocked.*insecure/.test(e),
    insight: {
      type: "SecurityError",
      cause: "HTTPS page trying to load HTTP resource",
      fix: "Use HTTPS for all resources or configure CSP",
      example: "Change http:// URLs to https://",
      confidence: "high",
    },
  },

  {
    id: "timeout_error",
    priority: 2,
    match: (e) => /timeout|timed out|etimedout|esockettimedout/.test(e),
    insight: {
      type: "TimeoutError",
      cause: "Request took too long and was aborted",
      fix: "Increase timeout or optimize server response",
      example: "fetch(url, { signal: AbortSignal.timeout(5000) })",
      confidence: "medium",
    },
  },

  {
    id: "abort_error",
    priority: 2,
    match: (e) =>
      /abort|aborted|signal.*aborted|the operation was aborted/.test(e),
    insight: {
      type: "AbortError",
      cause: "Request was intentionally aborted",
      fix: "Check abort controller usage or handle abort case",
      example: "if (err.name === 'AbortError') return;",
      confidence: "high",
    },
  },

  {
    id: "url_invalid",
    priority: 1,
    match: (e) => /invalid url|failed to construct.*url|url.*not valid/.test(e),
    insight: {
      type: "TypeError",
      cause: "Invalid URL format",
      fix: "Validate URL before making request",
      example: "try { new URL(str) } catch { /* invalid */ }",
      confidence: "high",
    },
  },

  {
    id: "http_400",
    priority: 2,
    match: (e) => /400|bad request/.test(e),
    insight: {
      type: "HTTPError",
      cause: "Bad request - invalid request format or parameters",
      fix: "Check request body, headers, and parameters",
      example: "Validate request data before sending",
      confidence: "high",
    },
  },

  {
    id: "http_401",
    priority: 1,
    match: (e) => /401|unauthorized/.test(e),
    insight: {
      type: "AuthError",
      cause: "Authentication required or invalid credentials",
      fix: "Provide valid authentication token",
      example: "headers: { 'Authorization': 'Bearer ' + token }",
      confidence: "high",
    },
  },

  {
    id: "http_403",
    priority: 1,
    match: (e) => /403|forbidden/.test(e),
    insight: {
      type: "AuthError",
      cause: "Access denied - insufficient permissions",
      fix: "Check user permissions and access rights",
      example: "Verify user has required role/permission",
      confidence: "high",
    },
  },

  {
    id: "http_404",
    priority: 1,
    match: (e) => /404|not found/.test(e),
    insight: {
      type: "NotFoundError",
      cause: "Requested resource does not exist",
      fix: "Check URL path, route configuration, or resource existence",
      example: "Verify endpoint exists and path is correct",
      confidence: "high",
    },
  },

  {
    id: "http_405",
    priority: 2,
    match: (e) => /405|method not allowed/.test(e),
    insight: {
      type: "HTTPError",
      cause: "HTTP method not supported for this endpoint",
      fix: "Use correct HTTP method (GET, POST, PUT, DELETE, etc.)",
      example: "Check API documentation for allowed methods",
      confidence: "high",
    },
  },

  {
    id: "http_409",
    priority: 2,
    match: (e) => /409|conflict/.test(e),
    insight: {
      type: "HTTPError",
      cause:
        "Request conflicts with current state (duplicate, version mismatch)",
      fix: "Resolve conflict, refresh data, or use unique identifiers",
      example: "Handle duplicate entry or optimistic locking",
      confidence: "high",
    },
  },

  {
    id: "http_413",
    priority: 2,
    match: (e) => /413|payload too large|request entity too large/.test(e),
    insight: {
      type: "HTTPError",
      cause: "Request body exceeds server limit",
      fix: "Reduce payload size or increase server limit",
      example: "Compress data or upload in chunks",
      confidence: "high",
    },
  },

  {
    id: "http_415",
    priority: 2,
    match: (e) => /415|unsupported media type/.test(e),
    insight: {
      type: "HTTPError",
      cause: "Content-Type not supported by server",
      fix: "Set correct Content-Type header",
      example: "headers: { 'Content-Type': 'application/json' }",
      confidence: "high",
    },
  },

  {
    id: "http_422",
    priority: 2,
    match: (e) => /422|unprocessable entity/.test(e),
    insight: {
      type: "ValidationError",
      cause: "Request data failed validation",
      fix: "Check request data against API requirements",
      example: "Validate form data before submission",
      confidence: "high",
    },
  },

  {
    id: "http_429",
    priority: 1,
    match: (e) => /429|too many requests|rate limit/.test(e),
    insight: {
      type: "RateLimitError",
      cause: "Rate limit exceeded",
      fix: "Implement rate limiting, backoff, or caching",
      example: "Use exponential backoff: await delay(2 ** retries * 1000)",
      confidence: "high",
    },
  },

  {
    id: "http_500",
    priority: 1,
    match: (e) => /500|internal server error/.test(e),
    insight: {
      type: "ServerError",
      cause: "Server encountered an unexpected error",
      fix: "Check server logs, retry with backoff",
      example: "Implement retry logic with error boundary",
      confidence: "medium",
    },
  },

  {
    id: "http_502",
    priority: 1,
    match: (e) => /502|bad gateway/.test(e),
    insight: {
      type: "ServerError",
      cause: "Gateway/proxy received invalid response from upstream",
      fix: "Check upstream server health and configuration",
      example: "Retry request or contact server administrator",
      confidence: "medium",
    },
  },

  {
    id: "http_503",
    priority: 1,
    match: (e) => /503|service unavailable/.test(e),
    insight: {
      type: "ServerError",
      cause: "Server temporarily unavailable (overloaded/maintenance)",
      fix: "Retry later with exponential backoff",
      example: "setTimeout(() => retry(), 5000)",
      confidence: "medium",
    },
  },

  {
    id: "http_504",
    priority: 1,
    match: (e) => /504|gateway timeout/.test(e),
    insight: {
      type: "ServerError",
      cause: "Gateway/proxy timed out waiting for upstream",
      fix: "Increase timeout or optimize upstream response",
      example: "Retry with longer timeout",
      confidence: "medium",
    },
  },

  {
    id: "ssl_error",
    priority: 1,
    match: (e) =>
      /ssl|certificate|cert_|unable to verify|self.signed|expired certificate/.test(
        e,
      ),
    insight: {
      type: "SSLError",
      cause: "SSL/TLS certificate error",
      fix: "Check certificate validity, chain, and domain match",
      example: "Renew certificate or configure trust store",
      confidence: "high",
    },
  },

  {
    id: "dns_error",
    priority: 1,
    match: (e) => /enotfound|getaddrinfo|dns|hostname.*not.*found/.test(e),
    insight: {
      type: "DNSError",
      cause: "DNS lookup failed - hostname not found",
      fix: "Check hostname spelling and DNS configuration",
      example: "Verify domain exists and DNS is resolving",
      confidence: "high",
    },
  },

  {
    id: "connection_refused",
    priority: 1,
    match: (e) => /econnrefused|connection refused/.test(e),
    insight: {
      type: "ConnectionError",
      cause: "Connection refused - server not accepting connections",
      fix: "Check if server is running and listening on correct port",
      example: "Verify server is started: netstat -tlnp",
      confidence: "high",
    },
  },

  {
    id: "connection_reset",
    priority: 1,
    match: (e) => /econnreset|connection reset|socket hang up/.test(e),
    insight: {
      type: "ConnectionError",
      cause: "Connection was forcibly closed by server",
      fix: "Check server logs, retry with fresh connection",
      example: "Implement connection retry logic",
      confidence: "medium",
    },
  },

  {
    id: "socket_error",
    priority: 2,
    match: (e) => /socket|epipe|broken pipe/.test(e),
    insight: {
      type: "SocketError",
      cause: "Socket connection error",
      fix: "Check network stability and server health",
      example: "Implement reconnection logic",
      confidence: "medium",
    },
  },

  // ===============================================================
  // SECTION 11: REACT ERRORS
  // ===============================================================

  {
    id: "invalid_hook_call",
    priority: 1,
    match: (e) => /invalid hook call|hooks can only be called inside/.test(e),
    insight: {
      type: "ReactError",
      cause: "Hook called outside functional component or in wrong order",
      fix: "Use hooks only at top level of functional components",
      example: "function Component() { const [state, setState] = useState(); }",
      confidence: "high",
    },
  },

  {
    id: "too_many_rerenders",
    priority: 1,
    match: (e) => /too many re-renders|infinite loop/.test(e),
    insight: {
      type: "ReactError",
      cause: "Component re-rendering infinitely due to state update in render",
      fix: "Move state updates to useEffect or event handlers",
      example: "useEffect(() => { setState(newValue); }, [dependency]);",
      confidence: "high",
    },
  },

  {
    id: "maximum_update_depth",
    priority: 1,
    match: (e) => /maximum update depth exceeded/.test(e),
    insight: {
      type: "ReactError",
      cause: "useEffect causing infinite update loop",
      fix: "Fix dependency array or add proper conditions",
      example: "useEffect(() => { ... }, []); // Empty deps for mount only",
      confidence: "high",
    },
  },

  {
    id: "missing_key",
    priority: 2,
    match: (e) => /each child in a list should have a unique.*key/.test(e),
    insight: {
      type: "ReactWarning",
      cause: "List items missing unique key prop",
      fix: "Add unique key prop to each list item",
      example: "{items.map(item => <div key={item.id}>{item.name}</div>)}",
      confidence: "high",
    },
  },

  {
    id: "duplicate_key",
    priority: 2,
    match: (e) =>
      /encountered two children with the same key|duplicate key/.test(e),
    insight: {
      type: "ReactWarning",
      cause: "Multiple list items have the same key",
      fix: "Ensure all keys are unique within the list",
      example: "Use unique identifier, not array index for dynamic lists",
      confidence: "high",
    },
  },

  {
    id: "state_on_unmounted",
    priority: 2,
    match: (e) =>
      /can't perform a react state update on an unmounted component|update on unmounted/.test(
        e,
      ),
    insight: {
      type: "ReactWarning",
      cause: "State update attempted after component unmounted",
      fix: "Cancel async operations in useEffect cleanup",
      example:
        "useEffect(() => { let mounted = true; fetch().then(d => mounted && setState(d)); return () => { mounted = false; }; }, []);",
      confidence: "high",
    },
  },

  {
    id: "missing_dependency",
    priority: 2,
    match: (e) =>
      /react hook .* has a missing dependency|missing dependency/.test(e),
    insight: {
      type: "ReactWarning",
      cause:
        "Variable used in useEffect/useMemo/useCallback not in dependency array",
      fix: "Add missing dependencies or memoize values",
      example: "useEffect(() => { fn(value); }, [value, fn]);",
      confidence: "high",
    },
  },

  {
    id: "state_update_during_render",
    priority: 1,
    match: (e) =>
      /cannot update a component.*while rendering a different component|cannot update during.*render/.test(
        e,
      ),
    insight: {
      type: "ReactError",
      cause: "setState called during render of another component",
      fix: "Move state update to useEffect",
      example: "useEffect(() => { parentSetState(value); }, [value]);",
      confidence: "high",
    },
  },

  {
    id: "hooks_order_changed",
    priority: 1,
    match: (e) =>
      /rendered fewer hooks than expected|rendered more hooks/.test(e),
    insight: {
      type: "ReactError",
      cause: "Hooks called conditionally or in different order",
      fix: "Always call hooks in the same order, never inside conditions/loops",
      example: "Move condition inside the hook, not around it",
      confidence: "high",
    },
  },

  {
    id: "controlled_uncontrolled",
    priority: 2,
    match: (e) =>
      /changing.*from uncontrolled to controlled|changing.*from controlled to uncontrolled/.test(
        e,
      ),
    insight: {
      type: "ReactWarning",
      cause: "Input switching between controlled and uncontrolled mode",
      fix: "Initialize state with proper default value",
      example: "const [value, setValue] = useState(''); // Not undefined",
      confidence: "high",
    },
  },

  {
    id: "invalid_dom_property",
    priority: 2,
    match: (e) => /invalid dom property|did you mean|unknown prop/.test(e),
    insight: {
      type: "ReactWarning",
      cause: "Using invalid or wrong-cased DOM property in JSX",
      fix: "Use correct React property names",
      example: "className instead of class, htmlFor instead of for",
      confidence: "high",
    },
  },

  {
    id: "invalid_element_type",
    priority: 1,
    match: (e) =>
      /element type is invalid|expected.*string.*or.*class|check the render method/.test(
        e,
      ),
    insight: {
      type: "ReactError",
      cause: "Component is undefined or not a valid React component",
      fix: "Check import/export and ensure component is defined",
      example: "export default MyComponent; // Named vs default export",
      confidence: "high",
    },
  },

  {
    id: "objects_not_valid_children",
    priority: 1,
    match: (e) => /objects are not valid as a react child/.test(e),
    insight: {
      type: "ReactError",
      cause: "Trying to render an object directly as JSX child",
      fix: "Convert object to string or render specific properties",
      example: "{JSON.stringify(obj)} or {obj.name}",
      confidence: "high",
    },
  },

  {
    id: "functions_not_valid_children",
    priority: 1,
    match: (e) => /functions are not valid as a react child/.test(e),
    insight: {
      type: "ReactError",
      cause: "Function passed as child without being called",
      fix: "Call the function or use render props pattern",
      example: "{fn()} or {children(props)}",
      confidence: "high",
    },
  },

  {
    id: "cannot_find_module_react",
    priority: 1,
    match: (e) => /cannot find module.*react|module not found.*react/.test(e),
    insight: {
      type: "BuildError",
      cause: "React package not installed",
      fix: "Install React dependencies",
      example: "npm install react react-dom",
      confidence: "high",
    },
  },

  {
    id: "jsx_runtime",
    priority: 1,
    match: (e) =>
      /react\/jsx-runtime|jsx.*not defined|pragma.*cannot be set/.test(e),
    insight: {
      type: "BuildError",
      cause: "JSX runtime configuration issue",
      fix: "Update React version or configure JSX transform",
      example: "Use React 17+ or import React in each file",
      confidence: "high",
    },
  },

  {
    id: "react_minified_error",
    priority: 2,
    match: (e) => /minified react error|visit.*reactjs\.org.*error/.test(e),
    insight: {
      type: "ReactError",
      cause: "React error in production build (minified)",
      fix: "Check error decoder URL for full message",
      example: "Visit the URL in the error for details",
      confidence: "medium",
    },
  },

  {
    id: "use_state_setter_during_render",
    priority: 1,
    match: (e) =>
      /cannot update a component from inside the function body/.test(e),
    insight: {
      type: "ReactError",
      cause: "State setter called directly in render, not in effect/handler",
      fix: "Move state update to useEffect or event handler",
      example: "useEffect(() => setState(value), [value])",
      confidence: "high",
    },
  },

  {
    id: "forward_ref_render",
    priority: 2,
    match: (e) =>
      /forwardref render functions.*proptype|forwardref.*do not support/.test(
        e,
      ),
    insight: {
      type: "ReactWarning",
      cause: "forwardRef component configuration issue",
      fix: "Use correct forwardRef pattern",
      example: "const Comp = forwardRef((props, ref) => <div ref={ref} />)",
      confidence: "high",
    },
  },

  {
    id: "context_not_found",
    priority: 1,
    match: (e) =>
      /usecontext.*must be used within|context.*undefined|cannot read.*context/.test(
        e,
      ),
    insight: {
      type: "ReactError",
      cause: "useContext used outside of its Provider",
      fix: "Wrap component tree with the Context Provider",
      example: "<MyContext.Provider value={value}><App /></MyContext.Provider>",
      confidence: "high",
    },
  },

  {
    id: "suspense_missing",
    priority: 1,
    match: (e) =>
      /suspended while rendering.*wrap.*suspense|component suspended/.test(e),
    insight: {
      type: "ReactError",
      cause: "Lazy/suspending component not wrapped in Suspense",
      fix: "Wrap lazy component with Suspense boundary",
      example: "<Suspense fallback={<Loading />}><LazyComponent /></Suspense>",
      confidence: "high",
    },
  },

  {
    id: "error_boundary_needed",
    priority: 2,
    match: (e) => /consider adding an error boundary/.test(e),
    insight: {
      type: "ReactWarning",
      cause: "Unhandled error in component tree",
      fix: "Add Error Boundary to catch and handle errors",
      example: "class ErrorBoundary extends React.Component { ... }",
      confidence: "high",
    },
  },

  {
    id: "ref_string_deprecated",
    priority: 2,
    match: (e) =>
      /string refs.*deprecated|using string refs is deprecated/.test(e),
    insight: {
      type: "ReactWarning",
      cause: "Using deprecated string refs",
      fix: "Use useRef hook or createRef",
      example: "const ref = useRef(); <div ref={ref} />",
      confidence: "high",
    },
  },

  {
    id: "finddomnode_deprecated",
    priority: 2,
    match: (e) => /finddomnode is deprecated|finddomnode.*strict mode/.test(e),
    insight: {
      type: "ReactWarning",
      cause: "Using deprecated findDOMNode",
      fix: "Use ref instead of findDOMNode",
      example: "const ref = useRef(); return <div ref={ref} />;",
      confidence: "high",
    },
  },

  {
    id: "legacy_context",
    priority: 2,
    match: (e) => /legacy context api|contexttype.*deprecated/.test(e),
    insight: {
      type: "ReactWarning",
      cause: "Using deprecated Context API",
      fix: "Use createContext and useContext hook",
      example: "const Context = createContext(); useContext(Context)",
      confidence: "high",
    },
  },

  {
    id: "strict_mode_warning",
    priority: 3,
    match: (e) =>
      /strict mode.*side.effect|unsafe lifecycle|unsafe_componentwillmount/.test(
        e,
      ),
    insight: {
      type: "ReactWarning",
      cause: "Unsafe lifecycle method or side effect in StrictMode",
      fix: "Replace unsafe lifecycles with useEffect or safe alternatives",
      example: "Replace componentWillMount with useEffect",
      confidence: "high",
    },
  },

  {
    id: "act_warning",
    priority: 2,
    match: (e) => /was not wrapped in act|when testing.*wrap.*act/.test(e),
    insight: {
      type: "ReactTestingWarning",
      cause: "State update in test not wrapped in act()",
      fix: "Wrap state updates in act() or use testing-library",
      example: "await act(async () => { fireEvent.click(button); });",
      confidence: "high",
    },
  },

  // ===============================================================
  // SECTION 12: NEXT.JS ERRORS
  // ===============================================================

  {
    id: "window_undefined",
    priority: 1,
    match: (e) => /window is not defined/.test(e),
    insight: {
      type: "SSRError",
      cause: "Accessing browser-only 'window' during server-side rendering",
      fix: "Check for window before accessing or use dynamic import",
      example: "if (typeof window !== 'undefined') { ... }",
      confidence: "high",
    },
  },

  {
    id: "document_undefined",
    priority: 1,
    match: (e) => /document is not defined/.test(e),
    insight: {
      type: "SSRError",
      cause: "Accessing browser-only 'document' during server-side rendering",
      fix: "Use useEffect or dynamic import with ssr: false",
      example: "useEffect(() => { document.title = 'Hi'; }, []);",
      confidence: "high",
    },
  },

  {
    id: "localstorage_undefined",
    priority: 1,
    match: (e) =>
      /localstorage is not defined|sessionstorage is not defined/.test(e),
    insight: {
      type: "SSRError",
      cause: "Accessing browser storage during server-side rendering",
      fix: "Access storage only in useEffect or client-side code",
      example:
        "useEffect(() => { const data = localStorage.getItem('key'); }, []);",
      confidence: "high",
    },
  },

  {
    id: "navigator_undefined",
    priority: 1,
    match: (e) => /navigator is not defined/.test(e),
    insight: {
      type: "SSRError",
      cause: "Accessing browser navigator during server-side rendering",
      fix: "Check navigator exists or use in useEffect",
      example: "if (typeof navigator !== 'undefined') { ... }",
      confidence: "high",
    },
  },

  {
    id: "hydration_mismatch",
    priority: 1,
    match: (e) =>
      /hydration failed|text content does not match|hydration mismatch/.test(e),
    insight: {
      type: "HydrationError",
      cause: "Server and client HTML don't match",
      fix: "Ensure consistent rendering on server and client",
      example: "Use suppressHydrationWarning or consistent state",
      confidence: "high",
    },
  },

  {
    id: "hydration_extra_nodes",
    priority: 1,
    match: (e) => /extra.*attributes.*server|did not expect server/.test(e),
    insight: {
      type: "HydrationError",
      cause: "Server rendered different HTML structure than client expected",
      fix: "Check for browser extensions or dynamic content",
      example: "Move dynamic content to useEffect",
      confidence: "high",
    },
  },

  {
    id: "nextjs_image_error",
    priority: 2,
    match: (e) => /image.*optimization|next\/image|invalid src prop/.test(e),
    insight: {
      type: "NextJSError",
      cause: "Next.js Image component configuration error",
      fix: "Configure image domains in next.config.js",
      example: "images: { domains: ['example.com'] }",
      confidence: "high",
    },
  },

  {
    id: "nextjs_router_not_mounted",
    priority: 1,
    match: (e) =>
      /router.*not mounted|userouter.*outside|nextrouter was not mounted/.test(
        e,
      ),
    insight: {
      type: "NextJSError",
      cause: "useRouter used outside Next.js context",
      fix: "Ensure component is rendered within Next.js app",
      example: "Use router in components, not utility functions",
      confidence: "high",
    },
  },

  {
    id: "nextjs_dynamic_import",
    priority: 2,
    match: (e) => /dynamic.*ssr.*false|loadableready/.test(e),
    insight: {
      type: "NextJSError",
      cause: "Dynamic import configuration issue",
      fix: "Use next/dynamic with proper options",
      example: "dynamic(() => import('./Comp'), { ssr: false })",
      confidence: "high",
    },
  },

  {
    id: "nextjs_getstaticprops",
    priority: 1,
    match: (e) =>
      /getstaticprops.*should return|invalid.*getstaticprops/.test(e),
    insight: {
      type: "NextJSError",
      cause: "getStaticProps returned invalid data",
      fix: "Return object with props key from getStaticProps",
      example: "return { props: { data } }",
      confidence: "high",
    },
  },

  {
    id: "nextjs_getserversideprops",
    priority: 1,
    match: (e) =>
      /getserversideprops.*should return|invalid.*getserversideprops/.test(e),
    insight: {
      type: "NextJSError",
      cause: "getServerSideProps returned invalid data",
      fix: "Return object with props, redirect, or notFound",
      example: "return { props: { data } }",
      confidence: "high",
    },
  },

  {
    id: "nextjs_middleware",
    priority: 2,
    match: (e) => /middleware.*response|nextresponse\.next/.test(e),
    insight: {
      type: "NextJSError",
      cause: "Next.js middleware error",
      fix: "Return NextResponse from middleware",
      example: "return NextResponse.next()",
      confidence: "medium",
    },
  },

  {
    id: "nextjs_app_router_error",
    priority: 2,
    match: (e) =>
      /use client.*server component|server component.*client/.test(e),
    insight: {
      type: "NextJSError",
      cause: "Server/Client component boundary issue",
      fix: "Add 'use client' directive or restructure components",
      example: "'use client' at top of file for client components",
      confidence: "high",
    },
  },

  {
    id: "nextjs_server_action",
    priority: 2,
    match: (e) => /server action.*must be async|use server/.test(e),
    insight: {
      type: "NextJSError",
      cause: "Server action configuration error",
      fix: "Ensure server actions are async with 'use server'",
      example: "async function action() { 'use server'; ... }",
      confidence: "high",
    },
  },

  // ===============================================================
  // SECTION 13: NODE.JS ERRORS
  // ===============================================================

  {
    id: "process_undefined",
    priority: 1,
    match: (e) => /process is not defined/.test(e),
    insight: {
      type: "EnvironmentError",
      cause: "Node.js 'process' object accessed in browser",
      fix: "Use bundler to inject process or check environment",
      example: "process?.env?.NODE_ENV || 'development'",
      confidence: "high",
    },
  },

  {
    id: "global_undefined",
    priority: 1,
    match: (e) => /global is not defined/.test(e),
    insight: {
      type: "EnvironmentError",
      cause: "Node.js 'global' accessed in browser",
      fix: "Use globalThis or window/global conditionally",
      example: "const g = typeof global !== 'undefined' ? global : window;",
      confidence: "high",
    },
  },

  {
    id: "buffer_undefined",
    priority: 1,
    match: (e) => /buffer is not defined/.test(e),
    insight: {
      type: "EnvironmentError",
      cause: "Node.js Buffer used in browser without polyfill",
      fix: "Install buffer polyfill for browser",
      example: "npm install buffer; import { Buffer } from 'buffer'",
      confidence: "high",
    },
  },

  {
    id: "require_not_defined",
    priority: 1,
    match: (e) => /require is not defined|require is not a function/.test(e),
    insight: {
      type: "ModuleError",
      cause: "CommonJS require used in ES module context",
      fix: "Use import syntax or configure module system",
      example: "import module from 'module'",
      confidence: "high",
    },
  },

  {
    id: "module_exports_undefined",
    priority: 1,
    match: (e) => /module is not defined|exports is not defined/.test(e),
    insight: {
      type: "ModuleError",
      cause: "CommonJS exports used in ES module or browser",
      fix: "Use export syntax",
      example: "export default myFunction;",
      confidence: "high",
    },
  },

  {
    id: "dirname_undefined",
    priority: 1,
    match: (e) => /__dirname is not defined|__filename is not defined/.test(e),
    insight: {
      type: "ModuleError",
      cause: "__dirname/__filename not available in ES modules",
      fix: "Use import.meta.url to get current file path",
      example:
        "import { fileURLToPath } from 'url'; const __dirname = path.dirname(fileURLToPath(import.meta.url));",
      confidence: "high",
    },
  },

  {
    id: "fs_browser",
    priority: 1,
    match: (e) =>
      /cannot find module.*fs|fs.*browser|no such file or directory/.test(e),
    insight: {
      type: "EnvironmentError",
      cause: "Node.js fs module used in browser or file not found",
      fix: "Use fetch API in browser or check file path",
      example: "Use fetch() for browser, verify file exists for Node",
      confidence: "high",
    },
  },

  {
    id: "path_browser",
    priority: 1,
    match: (e) => /cannot find module.*path|path.*browser/.test(e),
    insight: {
      type: "EnvironmentError",
      cause: "Node.js path module used in browser",
      fix: "Use path-browserify or handle paths manually",
      example: "npm install path-browserify",
      confidence: "high",
    },
  },

  {
    id: "crypto_browser",
    priority: 1,
    match: (e) => /cannot find module.*crypto|crypto.*browser/.test(e),
    insight: {
      type: "EnvironmentError",
      cause: "Node.js crypto module used in browser",
      fix: "Use Web Crypto API or crypto-browserify",
      example: "window.crypto.subtle.digest('SHA-256', data)",
      confidence: "high",
    },
  },

  {
    id: "emfile_error",
    priority: 1,
    match: (e) => /emfile|too many open files/.test(e),
    insight: {
      type: "SystemError",
      cause: "Too many files open simultaneously",
      fix: "Close files properly, use streams, or increase ulimit",
      example: "stream.on('close', () => { ... })",
      confidence: "high",
    },
  },

  {
    id: "enomem_error",
    priority: 1,
    match: (e) =>
      /enomem|out of memory|javascript heap|allocation failed/.test(e),
    insight: {
      type: "MemoryError",
      cause: "Process ran out of memory",
      fix: "Optimize memory usage or increase Node memory limit",
      example: "node --max-old-space-size=4096 app.js",
      confidence: "high",
    },
  },

  {
    id: "eacces_error",
    priority: 1,
    match: (e) => /eacces|permission denied/.test(e),
    insight: {
      type: "PermissionError",
      cause: "Insufficient permissions to access resource",
      fix: "Check file/directory permissions or run with appropriate privileges",
      example: "chmod 755 file; or check ownership",
      confidence: "high",
    },
  },

  {
    id: "enoent_error",
    priority: 1,
    match: (e) => /enoent|no such file or directory/.test(e),
    insight: {
      type: "FileError",
      cause: "File or directory does not exist",
      fix: "Check path spelling and existence",
      example: "if (fs.existsSync(path)) { ... }",
      confidence: "high",
    },
  },

  {
    id: "eexist_error",
    priority: 2,
    match: (e) => /eexist|file already exists/.test(e),
    insight: {
      type: "FileError",
      cause: "File or directory already exists",
      fix: "Check existence before creating or use overwrite flag",
      example: "fs.writeFileSync(path, data, { flag: 'w' })",
      confidence: "high",
    },
  },

  {
    id: "eisdir_error",
    priority: 2,
    match: (e) => /eisdir|is a directory/.test(e),
    insight: {
      type: "FileError",
      cause: "Expected file but found directory",
      fix: "Check path type before operation",
      example: "fs.statSync(path).isFile()",
      confidence: "high",
    },
  },

  {
    id: "enotdir_error",
    priority: 2,
    match: (e) => /enotdir|not a directory/.test(e),
    insight: {
      type: "FileError",
      cause: "Expected directory but found file",
      fix: "Check path type before operation",
      example: "fs.statSync(path).isDirectory()",
      confidence: "high",
    },
  },

  {
    id: "port_in_use",
    priority: 1,
    match: (e) => /eaddrinuse|address already in use|port.*in use/.test(e),
    insight: {
      type: "NetworkError",
      cause: "Port is already being used by another process",
      fix: "Use different port or kill the process using it",
      example: "lsof -i :3000; kill -9 <PID>",
      confidence: "high",
    },
  },

  {
    id: "child_process_error",
    priority: 2,
    match: (e) => /spawn.*enoent|child process|execsync|command failed/.test(e),
    insight: {
      type: "ProcessError",
      cause: "Child process execution failed",
      fix: "Check command path and arguments",
      example: "Verify executable exists: which <command>",
      confidence: "high",
    },
  },

  {
    id: "stream_error",
    priority: 2,
    match: (e) => /stream.*destroyed|write after end|premature close/.test(e),
    insight: {
      type: "StreamError",
      cause: "Stream operation on closed or destroyed stream",
      fix: "Check stream state before operations",
      example: "if (!stream.destroyed) stream.write(data)",
      confidence: "high",
    },
  },

  // ===============================================================
  // SECTION 14: BUILD/BUNDLER ERRORS
  // ===============================================================

  {
    id: "module_not_found",
    priority: 1,
    match: (e) => /cannot find module|module not found|can't resolve/.test(e),
    insight: {
      type: "ModuleError",
      cause: "Required module not installed or path incorrect",
      fix: "Install the package or fix import path",
      example: "npm install <package-name>",
      confidence: "high",
    },
  },

  {
    id: "export_not_found",
    priority: 1,
    match: (e) => /does not provide an export named|export.*not found/.test(e),
    insight: {
      type: "ModuleError",
      cause: "Importing non-existent export from module",
      fix: "Check available exports from the module",
      example: "import { correctExport } from 'module'",
      confidence: "high",
    },
  },

  {
    id: "default_export_missing",
    priority: 1,
    match: (e) => /does not have a default export|no default export/.test(e),
    insight: {
      type: "ModuleError",
      cause: "Importing default from module without default export",
      fix: "Use named import or check if default exists",
      example: "import { namedExport } from 'module'",
      confidence: "high",
    },
  },

  {
    id: "esm_cjs_interop",
    priority: 1,
    match: (e) =>
      /require.*es module|esm.*require|must use import|err_require_esm/.test(e),
    insight: {
      type: "ModuleError",
      cause: "ES Module/CommonJS interoperability issue",
      fix: "Use import for ESM or configure module type",
      example: 'Change to import or set "type": "module" in package.json',
      confidence: "high",
    },
  },

  {
    id: "syntax_error_parsing",
    priority: 1,
    match: (e) =>
      /parsing error|failed to parse|unexpected token|unterminated/.test(e) &&
      !/json/.test(e),
    insight: {
      type: "SyntaxError",
      cause: "Invalid JavaScript/TypeScript syntax",
      fix: "Check for missing brackets, quotes, or invalid syntax",
      example: "Run linter: eslint --fix",
      confidence: "high",
    },
  },

  {
    id: "loader_error",
    priority: 2,
    match: (e) => /loader.*failed|no loader|you may need.*loader/.test(e),
    insight: {
      type: "BuildError",
      cause: "Webpack/bundler missing appropriate loader",
      fix: "Install and configure the required loader",
      example: "npm install css-loader style-loader",
      confidence: "high",
    },
  },

  {
    id: "babel_error",
    priority: 2,
    match: (e) =>
      /babel.*error|@babel|support.*jsx|experimental syntax/.test(e),
    insight: {
      type: "BuildError",
      cause: "Babel configuration or plugin missing",
      fix: "Install required Babel plugins/presets",
      example: "npm install @babel/preset-react",
      confidence: "high",
    },
  },

  {
    id: "typescript_error",
    priority: 1,
    match: (e) =>
      /ts\d{4,}|typescript error|cannot find name|type.*is not assignable/.test(
        e,
      ),
    insight: {
      type: "TypeScriptError",
      cause: "TypeScript type error",
      fix: "Fix type annotations or add type definitions",
      example: "npm install @types/package-name",
      confidence: "high",
    },
  },

  {
    id: "webpack_error",
    priority: 2,
    match: (e) => /webpack.*error|compilation failed|chunk.*error/.test(e),
    insight: {
      type: "BuildError",
      cause: "Webpack compilation error",
      fix: "Check webpack config and module compatibility",
      example: "Review webpack.config.js",
      confidence: "medium",
    },
  },

  {
    id: "vite_error",
    priority: 2,
    match: (e) => /vite.*error|pre-transform|vite.*failed/.test(e),
    insight: {
      type: "BuildError",
      cause: "Vite build or transform error",
      fix: "Check Vite config and plugin compatibility",
      example: "Review vite.config.js",
      confidence: "medium",
    },
  },

  {
    id: "chunk_load_failed",
    priority: 1,
    match: (e) =>
      /loading chunk.*failed|chunkloaderror|chunk.*undefined/.test(e),
    insight: {
      type: "ChunkError",
      cause: "Dynamic chunk failed to load",
      fix: "Clear cache, check CDN, or redeploy",
      example: "window.location.reload(true)",
      confidence: "medium",
    },
  },

  {
    id: "circular_dependency",
    priority: 2,
    match: (e) => /circular dependency|cycle.*detected/.test(e),
    insight: {
      type: "ModuleError",
      cause: "Modules depend on each other circularly",
      fix: "Refactor to remove circular imports",
      example: "Extract shared code to separate module",
      confidence: "high",
    },
  },

  {
    id: "postcss_error",
    priority: 2,
    match: (e) => /postcss|tailwind.*error|css.*syntax/.test(e),
    insight: {
      type: "CSSError",
      cause: "PostCSS/Tailwind processing error",
      fix: "Check CSS syntax and config",
      example: "Review postcss.config.js and tailwind.config.js",
      confidence: "medium",
    },
  },

  {
    id: "sass_error",
    priority: 2,
    match: (e) => /sass.*error|scss.*error|node-sass/.test(e),
    insight: {
      type: "CSSError",
      cause: "Sass/SCSS compilation error",
      fix: "Check Sass syntax and node-sass compatibility",
      example: "npm install sass (dart-sass)",
      confidence: "medium",
    },
  },

  {
    id: "eslint_error",
    priority: 2,
    match: (e) => /eslint.*error|parsing error.*eslint|eslint.*failed/.test(e),
    insight: {
      type: "LintError",
      cause: "ESLint rule violation or configuration error",
      fix: "Fix linting issues or update ESLint config",
      example: "eslint --fix .",
      confidence: "high",
    },
  },

  {
    id: "prettier_error",
    priority: 3,
    match: (e) => /prettier.*error|code style/.test(e),
    insight: {
      type: "FormattingError",
      cause: "Code formatting issue",
      fix: "Run Prettier to format code",
      example: "prettier --write .",
      confidence: "high",
    },
  },

  // ===============================================================
  // SECTION 15: RECURSION/STACK ERRORS
  // ===============================================================

  {
    id: "stack_overflow",
    priority: 1,
    match: (e) =>
      /maximum call stack|stack overflow|too much recursion/.test(e),
    insight: {
      type: "RangeError",
      cause: "Infinite recursion or excessively deep call stack",
      fix: "Add proper base case or convert to iteration",
      example: "function recurse(n) { if (n <= 0) return; recurse(n - 1); }",
      confidence: "high",
    },
  },

  {
    id: "deep_recursion",
    priority: 2,
    match: (e) => /recursion.*deep|call stack size/.test(e),
    insight: {
      type: "RangeError",
      cause: "Recursion too deep for call stack",
      fix: "Use tail recursion, trampolining, or iteration",
      example: "Convert to while loop or use setTimeout to break stack",
      confidence: "high",
    },
  },

  // ===============================================================
  // SECTION 16: MEMORY ERRORS
  // ===============================================================

  {
    id: "memory_leak",
    priority: 2,
    match: (e) => /memory leak|heap.*grow|detached.*leak/.test(e),
    insight: {
      type: "MemoryLeak",
      cause: "Memory not being properly released",
      fix: "Clean up event listeners, timers, and subscriptions",
      example: "useEffect(() => { ... return () => cleanup(); }, [])",
      confidence: "medium",
    },
  },

  {
    id: "arraybuffer_detached",
    priority: 2,
    match: (e) => /arraybuffer.*detached|neutered arraybuffer/.test(e),
    insight: {
      type: "TypeError",
      cause: "ArrayBuffer accessed after being transferred/detached",
      fix: "Don't access ArrayBuffer after postMessage or transfer",
      example: "Copy data before transferring: new Uint8Array(buffer.slice())",
      confidence: "high",
    },
  },

  // ===============================================================
  // SECTION 17: SECURITY ERRORS
  // ===============================================================

  {
    id: "csp_violation",
    priority: 1,
    match: (e) =>
      /content security policy|csp|refused to.*because.*violates/.test(e),
    insight: {
      type: "SecurityError",
      cause: "Content Security Policy blocking resource",
      fix: "Update CSP headers to allow resource or change resource source",
      example: "Content-Security-Policy: script-src 'self' cdn.example.com",
      confidence: "high",
    },
  },

  {
    id: "iframe_blocked",
    priority: 2,
    match: (e) =>
      /refused to display.*frame|x-frame-options|frame-ancestors/.test(e),
    insight: {
      type: "SecurityError",
      cause: "Page blocked from being embedded in iframe",
      fix: "Update X-Frame-Options or frame-ancestors CSP directive",
      example: "X-Frame-Options: SAMEORIGIN",
      confidence: "high",
    },
  },

  {
    id: "insecure_operation",
    priority: 1,
    match: (e) => /insecure operation|secure context|only works.*https/.test(e),
    insight: {
      type: "SecurityError",
      cause: "Operation requires HTTPS/secure context",
      fix: "Use HTTPS or localhost for development",
      example: "Enable HTTPS in development server",
      confidence: "high",
    },
  },

  {
    id: "cross_origin_error",
    priority: 1,
    match: (e) =>
      /cross-origin|same-origin policy|access.*blocked/.test(e) &&
      !/cors/.test(e),
    insight: {
      type: "SecurityError",
      cause: "Cross-origin access blocked",
      fix: "Use CORS headers or same-origin resources",
      example: "Access-Control-Allow-Origin: *",
      confidence: "high",
    },
  },

  {
    id: "sandbox_blocked",
    priority: 2,
    match: (e) => /sandboxed.*blocked|sandbox.*flag/.test(e),
    insight: {
      type: "SecurityError",
      cause: "Operation blocked by iframe sandbox",
      fix: "Add required sandbox permission",
      example: 'sandbox="allow-scripts allow-same-origin"',
      confidence: "high",
    },
  },

  // ===============================================================
  // SECTION 18: DOM ERRORS
  // ===============================================================

  {
    id: "element_not_found",
    priority: 1,
    match: (e) =>
      /cannot read.*null.*innerhtml|null.*appendchild|getelementbyid.*null|queryselector.*null/.test(
        e,
      ),
    insight: {
      type: "DOMError",
      cause: "DOM element not found",
      fix: "Ensure element exists before manipulating",
      example:
        "const el = document.getElementById('id'); if (el) el.innerHTML = 'text';",
      confidence: "high",
    },
  },

  {
    id: "invalid_node",
    priority: 1,
    match: (e) => /failed to execute.*node|not a node|invalid.*node/.test(e),
    insight: {
      type: "DOMError",
      cause: "Invalid DOM node operation",
      fix: "Ensure value is a valid DOM node",
      example: "if (node instanceof Node) parent.appendChild(node)",
      confidence: "high",
    },
  },

  {
    id: "not_attached",
    priority: 2,
    match: (e) => /node.*not.*attached|not.*child.*node/.test(e),
    insight: {
      type: "DOMError",
      cause: "Node not attached to DOM tree",
      fix: "Ensure node is in DOM before operation",
      example: "if (document.body.contains(node)) { ... }",
      confidence: "high",
    },
  },

  {
    id: "invalid_selector",
    priority: 1,
    match: (e) =>
      /not a valid selector|invalid selector|syntax error.*selector/.test(e),
    insight: {
      type: "SyntaxError",
      cause: "Invalid CSS selector syntax",
      fix: "Check and fix selector syntax",
      example: 'document.querySelector(".valid-class")',
      confidence: "high",
    },
  },

  {
    id: "canvas_error",
    priority: 2,
    match: (e) => /canvas|webgl.*context|getcontext.*null/.test(e),
    insight: {
      type: "DOMError",
      cause: "Canvas/WebGL context error",
      fix: "Check canvas support and context type",
      example:
        "const ctx = canvas.getContext('2d') || canvas.getContext('webgl');",
      confidence: "medium",
    },
  },

  {
    id: "mutation_observer_error",
    priority: 2,
    match: (e) => /mutationobserver|observe.*failed/.test(e),
    insight: {
      type: "DOMError",
      cause: "MutationObserver configuration error",
      fix: "Ensure valid target and options",
      example: "observer.observe(element, { childList: true })",
      confidence: "medium",
    },
  },

  {
    id: "intersection_observer_error",
    priority: 2,
    match: (e) => /intersectionobserver.*root|threshold.*must be/.test(e),
    insight: {
      type: "DOMError",
      cause: "IntersectionObserver configuration error",
      fix: "Check threshold values and root element",
      example: "new IntersectionObserver(cb, { threshold: [0, 0.5, 1] })",
      confidence: "high",
    },
  },

  {
    id: "resize_observer_error",
    priority: 2,
    match: (e) => /resizeobserver loop|resizeobserver.*limit/.test(e),
    insight: {
      type: "DOMWarning",
      cause: "ResizeObserver callback causing continuous resize",
      fix: "Debounce callback or avoid triggering layout in callback",
      example: "Use requestAnimationFrame to batch updates",
      confidence: "medium",
    },
  },

  {
    id: "clipboard_error",
    priority: 2,
    match: (e) =>
      /clipboard.*failed|clipboard.*denied|navigator\.clipboard/.test(e),
    insight: {
      type: "PermissionError",
      cause: "Clipboard access denied or failed",
      fix: "Request clipboard permission or use fallback",
      example: "navigator.clipboard.writeText(text).catch(() => fallback())",
      confidence: "high",
    },
  },

  // ===============================================================
  // SECTION 19: WEB API ERRORS
  // ===============================================================

  {
    id: "geolocation_error",
    priority: 2,
    match: (e) => /geolocation|position.*denied|position.*unavailable/.test(e),
    insight: {
      type: "PermissionError",
      cause: "Geolocation access denied or unavailable",
      fix: "Request permission and handle denial gracefully",
      example: "navigator.geolocation.getCurrentPosition(success, error)",
      confidence: "high",
    },
  },

  {
    id: "notification_error",
    priority: 2,
    match: (e) => /notification.*denied|notification.*permission/.test(e),
    insight: {
      type: "PermissionError",
      cause: "Notification permission denied",
      fix: "Request permission from user",
      example: "Notification.requestPermission().then(perm => ...)",
      confidence: "high",
    },
  },

  {
    id: "media_error",
    priority: 2,
    match: (e) =>
      /mediaerror|media.*failed|video.*error|audio.*error|aborted|network.*media/.test(
        e,
      ),
    insight: {
      type: "MediaError",
      cause: "Media playback failed",
      fix: "Check media source, format, and network",
      example: "video.onerror = (e) => handleMediaError(e)",
      confidence: "medium",
    },
  },

  {
    id: "media_not_supported",
    priority: 2,
    match: (e) =>
      /media.*not supported|format.*not supported|codec.*not supported/.test(e),
    insight: {
      type: "MediaError",
      cause: "Media format not supported by browser",
      fix: "Use widely supported formats or provide fallbacks",
      example: "Provide MP4/WebM for video, MP3/OGG for audio",
      confidence: "high",
    },
  },

  {
    id: "camera_error",
    priority: 2,
    match: (e) =>
      /getusermedia|camera.*denied|microphone.*denied|permission.*denied.*media/.test(
        e,
      ),
    insight: {
      type: "PermissionError",
      cause: "Camera/microphone access denied",
      fix: "Request media permissions",
      example: "navigator.mediaDevices.getUserMedia({ video: true })",
      confidence: "high",
    },
  },

  {
    id: "websocket_error",
    priority: 1,
    match: (e) =>
      /websocket.*failed|websocket.*error|websocket.*closed/.test(e),
    insight: {
      type: "WebSocketError",
      cause: "WebSocket connection failed",
      fix: "Check URL, server status, and implement reconnection",
      example: "ws.onerror = (e) => { setTimeout(reconnect, 1000); }",
      confidence: "medium",
    },
  },

  {
    id: "service_worker_error",
    priority: 2,
    match: (e) => /service worker|serviceworker.*failed|sw\.js/.test(e),
    insight: {
      type: "ServiceWorkerError",
      cause: "Service worker registration or operation failed",
      fix: "Check service worker file path and scope",
      example: 'navigator.serviceWorker.register("/sw.js", { scope: "/" })',
      confidence: "medium",
    },
  },

  {
    id: "indexeddb_error",
    priority: 2,
    match: (e) => /indexeddb|idbdatabase|objectstore|idb.*error/.test(e),
    insight: {
      type: "StorageError",
      cause: "IndexedDB operation failed",
      fix: "Check database schema and handle versioning",
      example: "request.onerror = (e) => handleDBError(e)",
      confidence: "medium",
    },
  },

  {
    id: "quota_exceeded",
    priority: 1,
    match: (e) => /quota.*exceeded|storage.*full|domexception.*quota/.test(e),
    insight: {
      type: "StorageError",
      cause: "Browser storage quota exceeded",
      fix: "Clear old data or request persistent storage",
      example: "localStorage.clear(); // or use IndexedDB with cleanup",
      confidence: "high",
    },
  },

  {
    id: "web_worker_error",
    priority: 2,
    match: (e) =>
      /worker.*error|importscripts.*failed|worker.*terminated/.test(e),
    insight: {
      type: "WorkerError",
      cause: "Web Worker error",
      fix: "Check worker script path and code",
      example: "worker.onerror = (e) => console.error(e)",
      confidence: "medium",
    },
  },

  {
    id: "webrtc_error",
    priority: 2,
    match: (e) => /rtc|peerconnection|ice.*failed|sdp.*error/.test(e),
    insight: {
      type: "WebRTCError",
      cause: "WebRTC connection or negotiation failed",
      fix: "Check STUN/TURN servers and network",
      example: "Implement ICE restart on failure",
      confidence: "medium",
    },
  },

  {
    id: "payment_error",
    priority: 2,
    match: (e) =>
      /paymentrequest|payment.*failed|payment.*not supported/.test(e),
    insight: {
      type: "PaymentError",
      cause: "Payment Request API error",
      fix: "Check payment method support and configuration",
      example: "if (window.PaymentRequest) { ... }",
      confidence: "medium",
    },
  },

  {
    id: "fullscreen_error",
    priority: 3,
    match: (e) => /fullscreen.*request.*denied|fullscreen.*error/.test(e),
    insight: {
      type: "DOMError",
      cause: "Fullscreen request denied",
      fix: "Request fullscreen in response to user gesture",
      example: "button.onclick = () => element.requestFullscreen()",
      confidence: "high",
    },
  },

  {
    id: "pointer_lock_error",
    priority: 3,
    match: (e) => /pointerlock.*denied|pointer lock.*failed/.test(e),
    insight: {
      type: "DOMError",
      cause: "Pointer lock request denied",
      fix: "Request pointer lock in response to user gesture",
      example: "canvas.onclick = () => canvas.requestPointerLock()",
      confidence: "high",
    },
  },

  {
    id: "wasm_error",
    priority: 2,
    match: (e) => /webassembly|wasm.*error|wasm.*compile|linkage error/.test(e),
    insight: {
      type: "WASMError",
      cause: "WebAssembly compilation or runtime error",
      fix: "Check WASM module integrity and memory limits",
      example: "WebAssembly.instantiate(buffer).catch(handleError)",
      confidence: "medium",
    },
  },

  // ===============================================================
  // SECTION 20: EVENT ERRORS
  // ===============================================================

  {
    id: "event_target_error",
    priority: 1,
    match: (e) =>
      /addeventlistener.*null|removeeventlistener.*null|event.*target.*null/.test(
        e,
      ),
    insight: {
      type: "TypeError",
      cause: "Adding/removing event listener on null element",
      fix: "Ensure element exists before adding listener",
      example: "element?.addEventListener('click', handler)",
      confidence: "high",
    },
  },

  {
    id: "passive_event_error",
    priority: 2,
    match: (e) =>
      /passive.*preventdefault|unable to preventdefault.*passive/.test(e),
    insight: {
      type: "EventError",
      cause: "preventDefault called on passive event listener",
      fix: "Use { passive: false } option when registering listener",
      example: "el.addEventListener('touchstart', fn, { passive: false })",
      confidence: "high",
    },
  },

  {
    id: "event_dispatch_error",
    priority: 2,
    match: (e) => /dispatch.*event.*failed|customevent.*error/.test(e),
    insight: {
      type: "EventError",
      cause: "Event dispatch failed",
      fix: "Ensure event is properly constructed and target is valid",
      example:
        "element.dispatchEvent(new CustomEvent('myevent', { detail: data }))",
      confidence: "medium",
    },
  },

  // ===============================================================
  // SECTION 21: FORM/INPUT ERRORS
  // ===============================================================

  {
    id: "form_validation_error",
    priority: 2,
    match: (e) => /form.*validation|validity.*state|setcustomvalidity/.test(e),
    insight: {
      type: "ValidationError",
      cause: "Form validation failed",
      fix: "Check form inputs and validation constraints",
      example:
        "input.setCustomValidity(''); if (!input.checkValidity()) { ... }",
      confidence: "high",
    },
  },

  {
    id: "file_reader_error",
    priority: 2,
    match: (e) => /filereader.*error|file.*read.*failed/.test(e),
    insight: {
      type: "FileError",
      cause: "File reading operation failed",
      fix: "Check file existence and handle errors",
      example: "reader.onerror = (e) => handleFileError(e)",
      confidence: "high",
    },
  },

  {
    id: "file_too_large",
    priority: 2,
    match: (e) => /file.*too large|size.*limit|max.*size/.test(e),
    insight: {
      type: "ValidationError",
      cause: "File exceeds size limit",
      fix: "Validate file size before upload",
      example: "if (file.size > MAX_SIZE) { showError('File too large'); }",
      confidence: "high",
    },
  },

  {
    id: "file_type_error",
    priority: 2,
    match: (e) => /file.*type.*invalid|mime.*type|accept.*type/.test(e),
    insight: {
      type: "ValidationError",
      cause: "File type not allowed",
      fix: "Validate file type before processing",
      example: "if (!allowedTypes.includes(file.type)) { showError(); }",
      confidence: "high",
    },
  },

  // ===============================================================
  // SECTION 22: TESTING ERRORS
  // ===============================================================

  {
    id: "jest_matcher_error",
    priority: 2,
    match: (e) =>
      /expect.*received|tobecalled|tomatchsnapshot|matcher.*error/.test(e),
    insight: {
      type: "TestError",
      cause: "Jest assertion/matcher failed",
      fix: "Check expected vs actual values",
      example: "expect(actual).toBe(expected)",
      confidence: "high",
    },
  },

  {
    id: "jest_mock_error",
    priority: 2,
    match: (e) => /mock.*function|jest\.fn|mockimplementation.*error/.test(e),
    insight: {
      type: "TestError",
      cause: "Jest mock configuration error",
      fix: "Check mock setup and implementation",
      example: "jest.mock('module', () => ({ fn: jest.fn() }))",
      confidence: "medium",
    },
  },

  {
    id: "jest_timeout",
    priority: 2,
    match: (e) => /exceeded timeout|async.*timeout|jest.*timeout/.test(e),
    insight: {
      type: "TestError",
      cause: "Test exceeded timeout limit",
      fix: "Increase timeout or fix slow async operations",
      example: "jest.setTimeout(10000); // or fix async code",
      confidence: "high",
    },
  },

  {
    id: "act_testing_warning",
    priority: 2,
    match: (e) => /not wrapped in act|when testing.*act\(/.test(e),
    insight: {
      type: "TestWarning",
      cause: "State update in test not wrapped in act()",
      fix: "Wrap state-changing code in act()",
      example: "await act(async () => { userEvent.click(button); })",
      confidence: "high",
    },
  },

  {
    id: "testing_library_error",
    priority: 2,
    match: (e) => /unable to find.*element|getby.*threw|queryby.*null/.test(e),
    insight: {
      type: "TestError",
      cause: "Testing Library couldn't find element",
      fix: "Check selector, wait for element, or use queryBy",
      example: "await screen.findByText('text'); // for async",
      confidence: "high",
    },
  },

  {
    id: "cypress_error",
    priority: 2,
    match: (e) => /cypress.*error|cy\.|timed out.*element/.test(e),
    insight: {
      type: "TestError",
      cause: "Cypress test error",
      fix: "Check selectors, increase timeout, or add waits",
      example: "cy.get('selector', { timeout: 10000 })",
      confidence: "medium",
    },
  },

  // ===============================================================
  // SECTION 23: DATABASE/ORM ERRORS
  // ===============================================================

  {
    id: "prisma_error",
    priority: 2,
    match: (e) =>
      /prisma.*error|p\d{4}|unique constraint|foreign key constraint/.test(e),
    insight: {
      type: "DatabaseError",
      cause: "Prisma database operation failed",
      fix: "Check model relations, constraints, and data",
      example:
        "try { await prisma.model.create(...) } catch (e) { handlePrismaError(e) }",
      confidence: "high",
    },
  },

  {
    id: "database_connection",
    priority: 1,
    match: (e) =>
      /database.*connection|connect.*database|connection.*refused.*database/.test(
        e,
      ),
    insight: {
      type: "DatabaseError",
      cause: "Failed to connect to database",
      fix: "Check database URL, credentials, and server status",
      example: "Verify DATABASE_URL environment variable",
      confidence: "high",
    },
  },

  {
    id: "query_error",
    priority: 2,
    match: (e) => /query.*failed|sql.*error|syntax error.*sql/.test(e),
    insight: {
      type: "DatabaseError",
      cause: "Database query error",
      fix: "Check SQL syntax and parameters",
      example: "Use parameterized queries to prevent errors",
      confidence: "medium",
    },
  },

  {
    id: "unique_violation",
    priority: 1,
    match: (e) => /unique.*violation|duplicate.*key|already exists/.test(e),
    insight: {
      type: "DatabaseError",
      cause: "Unique constraint violation",
      fix: "Check for existing record before insert",
      example: "Use upsert or check existence first",
      confidence: "high",
    },
  },

  {
    id: "foreign_key_violation",
    priority: 1,
    match: (e) =>
      /foreign key.*violation|referenced.*not exist|relation.*not found/.test(
        e,
      ),
    insight: {
      type: "DatabaseError",
      cause: "Foreign key constraint violation",
      fix: "Ensure referenced record exists",
      example: "Create parent record first or check existence",
      confidence: "high",
    },
  },

  {
    id: "migration_error",
    priority: 2,
    match: (e) => /migration.*failed|migrate.*error|pending migration/.test(e),
    insight: {
      type: "DatabaseError",
      cause: "Database migration failed",
      fix: "Check migration files and database state",
      example: "npx prisma migrate dev",
      confidence: "medium",
    },
  },

  // ===============================================================
  // SECTION 24: AUTHENTICATION ERRORS
  // ===============================================================

  {
    id: "jwt_expired",
    priority: 1,
    match: (e) => /jwt.*expired|token.*expired|tokenexpirederror/.test(e),
    insight: {
      type: "AuthError",
      cause: "JWT token has expired",
      fix: "Refresh the token or require re-authentication",
      example: "Implement token refresh flow",
      confidence: "high",
    },
  },

  {
    id: "jwt_invalid",
    priority: 1,
    match: (e) =>
      /jwt.*invalid|invalid.*token|jsonwebtokenerror|malformed.*token/.test(e),
    insight: {
      type: "AuthError",
      cause: "JWT token is invalid or malformed",
      fix: "Check token format and signature",
      example: "Verify token with correct secret/key",
      confidence: "high",
    },
  },

  {
    id: "jwt_signature",
    priority: 1,
    match: (e) => /signature.*verification|invalid signature/.test(e),
    insight: {
      type: "AuthError",
      cause: "JWT signature verification failed",
      fix: "Check signing secret/key matches",
      example: "Use same JWT_SECRET for sign and verify",
      confidence: "high",
    },
  },

  {
    id: "session_invalid",
    priority: 1,
    match: (e) => /session.*invalid|session.*expired|no.*session/.test(e),
    insight: {
      type: "AuthError",
      cause: "Session is invalid or expired",
      fix: "Require user to log in again",
      example: "Redirect to login page",
      confidence: "high",
    },
  },

  {
    id: "oauth_error",
    priority: 2,
    match: (e) => /oauth.*error|authorization.*failed|access_denied/.test(e),
    insight: {
      type: "AuthError",
      cause: "OAuth authentication failed",
      fix: "Check OAuth configuration and credentials",
      example: "Verify client ID, secret, and redirect URI",
      confidence: "medium",
    },
  },

  // ===============================================================
  // SECTION 25: ENVIRONMENT/CONFIG ERRORS
  // ===============================================================

  {
    id: "env_missing",
    priority: 1,
    match: (e) =>
      /environment variable.*undefined|env.*not set|missing.*env/.test(e),
    insight: {
      type: "ConfigError",
      cause: "Required environment variable not set",
      fix: "Set the environment variable in .env or system",
      example: "Add VARIABLE_NAME=value to .env file",
      confidence: "high",
    },
  },

  {
    id: "config_invalid",
    priority: 2,
    match: (e) =>
      /config.*invalid|invalid.*configuration|configuration.*error/.test(e),
    insight: {
      type: "ConfigError",
      cause: "Invalid configuration",
      fix: "Check configuration file syntax and values",
      example: "Validate config against schema",
      confidence: "medium",
    },
  },

  {
    id: "version_mismatch",
    priority: 2,
    match: (e) =>
      /version.*mismatch|incompatible.*version|requires.*version/.test(e),
    insight: {
      type: "DependencyError",
      cause: "Package version incompatibility",
      fix: "Update packages to compatible versions",
      example: "npm update or check peer dependencies",
      confidence: "high",
    },
  },

  {
    id: "peer_dependency",
    priority: 2,
    match: (e) => /peer dep|peer.*dependency|requires a peer/.test(e),
    insight: {
      type: "DependencyError",
      cause: "Missing or incompatible peer dependency",
      fix: "Install required peer dependency",
      example: "npm install peer-package@version",
      confidence: "high",
    },
  },

  // ===============================================================
  // SECTION 26: ENCODING ERRORS
  // ===============================================================

  {
    id: "encoding_error",
    priority: 2,
    match: (e) =>
      /encoding.*error|invalid.*encoding|utf-8.*error|malformed.*utf/.test(e),
    insight: {
      type: "EncodingError",
      cause: "Character encoding error",
      fix: "Ensure consistent UTF-8 encoding",
      example: "Use TextDecoder/TextEncoder for proper encoding",
      confidence: "medium",
    },
  },

  {
    id: "base64_error",
    priority: 2,
    match: (e) => /base64.*invalid|atob.*error|btoa.*error/.test(e),
    insight: {
      type: "EncodingError",
      cause: "Invalid Base64 string",
      fix: "Validate Base64 string before decoding",
      example: "try { atob(str) } catch { /* invalid */ }",
      confidence: "high",
    },
  },

  {
    id: "uri_malformed",
    priority: 2,
    match: (e) =>
      /uri.*malformed|decodeuricomponent|encodeuricomponent/.test(e),
    insight: {
      type: "URIError",
      cause: "Malformed URI component",
      fix: "Validate and properly encode URI components",
      example: "try { decodeURIComponent(str) } catch { /* malformed */ }",
      confidence: "high",
    },
  },

  // ===============================================================
  // SECTION 27: CLASS/PROTOTYPE ERRORS
  // ===============================================================

  {
    id: "class_constructor",
    priority: 1,
    match: (e) =>
      /class constructor.*cannot be invoked without.*new|must be called with new/.test(
        e,
      ),
    insight: {
      type: "TypeError",
      cause: "Class constructor called without 'new'",
      fix: "Use 'new' keyword to instantiate class",
      example: "const instance = new MyClass()",
      confidence: "high",
    },
  },

  {
    id: "super_not_called",
    priority: 1,
    match: (e) =>
      /must call super|super.*not called|this.*before.*super/.test(e),
    insight: {
      type: "ReferenceError",
      cause: "super() not called in derived class constructor",
      fix: "Call super() before using 'this'",
      example: "constructor() { super(); this.prop = value; }",
      confidence: "high",
    },
  },

  {
    id: "prototype_error",
    priority: 2,
    match: (e) => /prototype.*undefined|__proto__|object\.create.*null/.test(e),
    insight: {
      type: "TypeError",
      cause: "Prototype chain error",
      fix: "Check object prototype and inheritance",
      example: "Use Object.create(Proto.prototype)",
      confidence: "medium",
    },
  },

  // ===============================================================
  // SECTION 28: PROXY/REFLECT ERRORS
  // ===============================================================

  {
    id: "proxy_revoked",
    priority: 2,
    match: (e) => /proxy.*revoked|cannot perform.*revoked proxy/.test(e),
    insight: {
      type: "TypeError",
      cause: "Operation on revoked Proxy",
      fix: "Don't use proxy after calling revoke()",
      example: "Check proxy validity before operations",
      confidence: "high",
    },
  },

  {
    id: "proxy_trap_error",
    priority: 2,
    match: (e) => /proxy.*trap|invariant.*violated/.test(e),
    insight: {
      type: "TypeError",
      cause: "Proxy trap invariant violated",
      fix: "Ensure proxy traps follow required invariants",
      example: "Return consistent values from traps",
      confidence: "medium",
    },
  },

  // ===============================================================
  // SECTION 29: SYMBOL/ITERATOR ERRORS
  // ===============================================================

  {
    id: "symbol_description",
    priority: 3,
    match: (e) => /symbol.*description|cannot convert.*symbol/.test(e),
    insight: {
      type: "TypeError",
      cause: "Symbol conversion error",
      fix: "Use symbol.description or String(symbol)",
      example: "symbol.description // instead of String(symbol)",
      confidence: "high",
    },
  },

  {
    id: "generator_error",
    priority: 2,
    match: (e) => /generator.*already.*running|generator.*closed/.test(e),
    insight: {
      type: "TypeError",
      cause: "Generator state error",
      fix: "Don't call generator methods after completion",
      example: "Check generator.next().done before continuing",
      confidence: "high",
    },
  },

  // ===============================================================
  // SECTION 30: MISC/GENERAL ERRORS
  // ===============================================================

  {
    id: "eval_error",
    priority: 2,
    match: (e) => /eval.*error|unsafe-eval|function.*constructor/.test(e),
    insight: {
      type: "EvalError",
      cause: "Eval or dynamic code execution error",
      fix: "Avoid eval; use safer alternatives",
      example: "JSON.parse() instead of eval() for JSON",
      confidence: "high",
    },
  },

  {
    id: "script_error",
    priority: 2,
    match: (e) => /^script error\.?$/.test(e),
    insight: {
      type: "CrossOriginError",
      cause: "Error from cross-origin script (details hidden)",
      fix: "Add crossorigin attribute to script tags",
      example: '<script src="..." crossorigin="anonymous">',
      confidence: "medium",
    },
  },

  {
    id: "deprecated_warning",
    priority: 3,
    match: (e) => /deprecated|will be removed|no longer supported/.test(e),
    insight: {
      type: "DeprecationWarning",
      cause: "Using deprecated API or feature",
      fix: "Migrate to recommended alternative",
      example: "Check documentation for modern replacement",
      confidence: "high",
    },
  },

  {
    id: "experimental_warning",
    priority: 3,
    match: (e) => /experimental|unstable.*api|not stable/.test(e),
    insight: {
      type: "ExperimentalWarning",
      cause: "Using experimental/unstable feature",
      fix: "Be prepared for API changes",
      example: "Monitor for updates and breaking changes",
      confidence: "medium",
    },
  },

  {
    id: "internal_error",
    priority: 1,
    match: (e) => /internalerror|internal error|too much recursion/.test(e),
    insight: {
      type: "InternalError",
      cause: "JavaScript engine internal error",
      fix: "Reduce recursion depth or data complexity",
      example: "Convert recursion to iteration",
      confidence: "high",
    },
  },

  {
    id: "aggregateerror",
    priority: 2,
    match: (e) =>
      /aggregateerror|multiple errors|all promises.*rejected/.test(e),
    insight: {
      type: "AggregateError",
      cause: "Multiple errors occurred (e.g., Promise.any all rejected)",
      fix: "Handle individual errors in the aggregate",
      example:
        "catch (e) { if (e instanceof AggregateError) e.errors.forEach(...) }",
      confidence: "high",
    },
  },
];

// ===============================================================
// ANALYSIS FUNCTION (OPTIMIZED WITH CACHING)
// ===============================================================

export function analyzeErrorMessage(error: string): {
  error: string;
  ruleId?: string;
  type: string;
  cause: string;
  fix: string;
  example?: string;
  confidence: Confidence;
} {
  // Sort by priority (lower number = higher priority)
  const sortedRules = [...errorRules].sort((a, b) => a.priority - b.priority);

  for (const rule of sortedRules) {
    if (rule.match(error)) {
      return {
        error,
        ruleId: rule.id,
        ...rule.insight,
      };
    }
  }

  return {
    error,
    type: "Unknown",
    cause: "Could not automatically classify this error",
    fix: "Inspect the full stack trace and debug step-by-step",
    confidence: "low",
  };
}

// ===============================================================
// BATCH ANALYSIS
// ===============================================================

export function analyzeMultipleErrors(errors: string[]) {
  return errors.map(analyzeErrorMessage);
}

// ===============================================================
// ERROR CATEGORIES
// ===============================================================

export const errorCategories = {
  typeErrors: errorRules
    .filter((r) => r.insight.type === "TypeError")
    .map((r) => r.id),
  referenceErrors: errorRules
    .filter((r) => r.insight.type === "ReferenceError")
    .map((r) => r.id),
  syntaxErrors: errorRules
    .filter((r) => r.insight.type === "SyntaxError")
    .map((r) => r.id),
  networkErrors: errorRules
    .filter(
      (r) =>
        r.insight.type.includes("Network") || r.insight.type.includes("HTTP"),
    )
    .map((r) => r.id),
  reactErrors: errorRules
    .filter((r) => r.insight.type.includes("React"))
    .map((r) => r.id),
  ssrErrors: errorRules
    .filter(
      (r) =>
        r.insight.type.includes("SSR") || r.insight.type.includes("Hydration"),
    )
    .map((r) => r.id),
  buildErrors: errorRules
    .filter(
      (r) =>
        r.insight.type.includes("Build") || r.insight.type.includes("Module"),
    )
    .map((r) => r.id),
  authErrors: errorRules
    .filter((r) => r.insight.type.includes("Auth"))
    .map((r) => r.id),
  databaseErrors: errorRules
    .filter((r) => r.insight.type.includes("Database"))
    .map((r) => r.id),
  securityErrors: errorRules
    .filter(
      (r) =>
        r.insight.type.includes("Security") || r.insight.type.includes("CORS"),
    )
    .map((r) => r.id),
};

// ===============================================================
// STATS
// ===============================================================

export const errorRuleStats = {
  totalRules: errorRules.length,
  byPriority: {
    critical: errorRules.filter((r) => r.priority === 1).length,
    high: errorRules.filter((r) => r.priority === 2).length,
    medium: errorRules.filter((r) => r.priority === 3).length,
  },
  byConfidence: {
    high: errorRules.filter((r) => r.insight.confidence === "high").length,
    medium: errorRules.filter((r) => r.insight.confidence === "medium").length,
    low: errorRules.filter((r) => r.insight.confidence === "low").length,
  },
};

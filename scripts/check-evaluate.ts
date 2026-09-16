import { compareField, valuesMatch } from "../src/lib/evaluate";

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(message);
  }
}

assert(valuesMatch("17 dB", "17 dB"), "exact");
assert(valuesMatch("1.2 A", "1.20 A"), "quantity tolerance");
assert(valuesMatch("20 GHz", "20 GHz"), "freq");
assert(!valuesMatch("17 dB", "15 dB"), "mismatch");
assert(compareField("13.4 W", "6 W") === "wrong", "pdiss");
assert(compareField("nicht gefunden", null) === "both_empty", "missing tokens");
assert(compareField("17 dB", "nicht gefunden") === "missing", "pred missing");
assert(compareField(null, "12") === "extra", "extra");

console.log("evaluate checks ok");

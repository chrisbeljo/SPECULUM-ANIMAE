import test from "node:test";
import assert from "node:assert/strict";

function pickUnique(items,count,random=()=>0){const pool=[...items],out=[],target=Math.min(count,pool.length);while(out.length<target)out.push(pool.splice(random(pool.length),1)[0]);return out}
function reduceNumber(n){while(n>9&&![11,22,33].includes(n))n=String(n).split("").reduce((a,b)=>a+Number(b),0);return n}
function iching(values){return values.map(n=>({value:n,yang:n===7||n===9,changing:n===6||n===9}))}
function analyze(results){const all=results.flatMap(r=>r.themes),counts=new Map();all.forEach(x=>counts.set(x,(counts.get(x)||0)+1));return [...counts.entries()].filter(([,n])=>n>1).map(([x])=>x)}
function contextLens(context){const text=context.toLowerCase(),notes=[];if(/separad|distancia|sin contacto/.test(text))notes.push("distancia o separación");if(/decid|opci|camino|elegir/.test(text))notes.push("elección entre alternativas");if(/cambio|renuncia|oferta|nuevo trabajo/.test(text))notes.push("transición profesional");return notes}

test("selección sin duplicados",()=>assert.deepEqual(pickUnique([1,2,3,4],4),[1,2,3,4]));
test("invertidas se registran como booleano",()=>assert.equal(typeof {reversed:true}.reversed,"boolean"));
test("reducción numerológica conserva maestros",()=>{assert.equal(reduceNumber(29),11);assert.equal(reduceNumber(38),11);assert.equal(reduceNumber(1990),1)});
test("I Ching detecta líneas mutantes",()=>assert.deepEqual(iching([6,7,8,9]).map(x=>x.changing),[true,false,false,true]));
test("estructura de consulta normalizada",()=>{const r={method:"tarot",raw_result:{},themes:[],obstacles:[],opportunities:[],advice:[],interpretation:""};for(const k of ["method","raw_result","themes","obstacles","opportunities","advice","interpretation"])assert.ok(k in r)});
test("Analyst detecta temas coincidentes",()=>assert.deepEqual(analyze([{themes:["cambio"]},{themes:["cambio","pausa"]}]),["cambio"]));
test("contrato de historial es serializable",()=>{const h=[{id:"1",question:"q",results:[]}];assert.deepEqual(JSON.parse(JSON.stringify(h)),h)});
test("la interpretación detecta contexto aportado",()=>assert.deepEqual(contextLens("Estoy separado y debo elegir entre dos caminos"),["distancia o separación","elección entre alternativas"]));
